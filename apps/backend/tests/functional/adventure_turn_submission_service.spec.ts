import Location from '#models/location'
import StartingPoint from '#models/starting_point'
import User from '#models/user'
import World from '#models/world'
import AdventureCreationService from '#services/adventure_creation_service'
import AdventureTurnSubmissionService, {
  AdventureTurnSubmissionError,
} from '#services/adventure_turn_submission_service'
import { publishWorldVersion } from '#services/world_version_publication_service'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

const password = 'correct horse battery staple'

async function createReadyAdventure(ownerId: number, requestId: string) {
  const world = await World.create({
    authorId: ownerId,
    slug: `turn-submission-${requestId.slice(0, 8)}`,
    name: 'Turn submission fixture',
    description: 'A focused durable turn submission fixture.',
    visibility: 'private',
    adventureGuidance: 'Keep every turn grounded in the frozen source.',
  })
  const location = await Location.create({
    worldId: world.id,
    key: 'chapel-threshold',
    name: 'Chapel Threshold',
    description: 'Rain runs down the locked chapel doors.',
    sortOrder: 0,
  })
  await StartingPoint.create({
    worldId: world.id,
    locationId: location.id,
    key: 'chapel-arrival',
    name: 'Chapel Arrival',
    openingPremise: 'The chapel bell rings although no one is inside.',
    sortOrder: 0,
    isDefault: true,
  })
  await publishWorldVersion(world.id)

  const created = await new AdventureCreationService().create({
    ownerId,
    worldSlug: world.slug,
    creationRequestId: requestId,
    player: { name: 'Mara Venn' },
  })
  const now = new Date()
  const [revision] = await db
    .table('adventure_revisions')
    .insert({
      adventure_id: created.adventureId,
      sequence: 0,
      kind: 'opening',
      parent_revision_id: null,
      created_at: now,
    })
    .returning(['id'])
  await db.from('adventure_jobs').where('adventure_id', created.adventureId).update({
    status: 'succeeded',
    updated_at: now,
  })
  await db.from('adventures').where('id', created.adventureId).update({
    status: 'ready',
    head_revision_id: revision.id,
    updated_at: now,
  })

  return { adventureId: created.adventureId, revisionId: revision.id }
}

async function captureError(action: () => Promise<unknown>) {
  try {
    await action()
  } catch (error) {
    return error
  }
  throw new Error('Expected turn submission to fail.')
}

test.group('AdventureTurnSubmissionService', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-003/S2/R1-S1 + R1-S2 + R1-S3 + R1-S5: stores Act, Pass, and Guide privately with replay-safe identities', async ({
    assert,
  }) => {
    const owner = await User.create({ email: 'turn-submission-owner@example.com', password })
    const service = new AdventureTurnSubmissionService()

    const actAdventure = await createReadyAdventure(
      owner.id,
      '11111111-1111-4111-8111-111111111111'
    )
    const act = await service.submit({
      ownerId: owner.id,
      adventureId: actAdventure.adventureId,
      requestId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      trigger: 'act',
      input: '  I ask Mira why the bell rang.  ',
    })
    const actReplay = await service.submit({
      ownerId: owner.id,
      adventureId: actAdventure.adventureId,
      requestId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      trigger: 'act',
      input: 'I ask Mira why the bell rang.',
    })

    assert.deepEqual(actReplay, act)
    assert.deepInclude(await db.from('adventure_turns').where('id', act.id).firstOrFail(), {
      adventure_id: actAdventure.adventureId,
      request_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      trigger: 'act',
      input: 'I ask Mira why the bell rang.',
      status: 'pending',
      source_revision_id: actAdventure.revisionId,
      result_revision_id: null,
    })
    assert.deepInclude(await db.from('adventure_jobs').where('turn_id', act.id).firstOrFail(), {
      adventure_id: actAdventure.adventureId,
      turn_id: act.id,
      type: 'turn',
      status: 'pending',
    })

    const passAdventure = await createReadyAdventure(
      owner.id,
      '22222222-2222-4222-8222-222222222222'
    )
    const pass = await service.submit({
      ownerId: owner.id,
      adventureId: passAdventure.adventureId,
      requestId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      trigger: 'pass',
    })
    assert.deepInclude(await db.from('adventure_turns').where('id', pass.id).firstOrFail(), {
      trigger: 'pass',
      input: null,
      status: 'pending',
    })

    const guideAdventure = await createReadyAdventure(
      owner.id,
      '33333333-3333-4333-8333-333333333333'
    )
    const guide = await service.submit({
      ownerId: owner.id,
      adventureId: guideAdventure.adventureId,
      requestId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      trigger: 'guide',
      input: '  Privately steer Mira toward the ledger.  ',
    })
    assert.deepInclude(await db.from('adventure_turns').where('id', guide.id).firstOrFail(), {
      trigger: 'guide',
      input: 'Privately steer Mira toward the ledger.',
      status: 'pending',
    })
  })

  test('LC-003/S2/R1-S4 + R1-S5: rejects invalid or conflicting turn input without writes', async ({
    assert,
  }) => {
    const owner = await User.create({ email: 'turn-submission-invalid@example.com', password })
    const { adventureId } = await createReadyAdventure(
      owner.id,
      '44444444-4444-4444-8444-444444444444'
    )
    const service = new AdventureTurnSubmissionService()

    for (const input of [
      { trigger: 'act' as const, input: '   ' },
      { trigger: 'guide' as const, input: 'g'.repeat(1_201) },
      { trigger: 'pass' as const, input: 'Do not send this.' },
    ]) {
      const error = await captureError(() =>
        service.submit({
          ownerId: owner.id,
          adventureId,
          requestId: crypto.randomUUID(),
          ...input,
        })
      )
      assert.instanceOf(error, AdventureTurnSubmissionError)
      assert.equal((error as AdventureTurnSubmissionError).code, 'INVALID_TURN_INPUT')
    }
    assert.lengthOf(await db.from('adventure_turns').where('adventure_id', adventureId), 0)

    await service.submit({
      ownerId: owner.id,
      adventureId,
      requestId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      trigger: 'act',
      input: 'I listen at the door.',
    })
    const conflict = await captureError(() =>
      service.submit({
        ownerId: owner.id,
        adventureId,
        requestId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        trigger: 'guide',
        input: 'Steer the scene elsewhere.',
      })
    )
    assert.instanceOf(conflict, AdventureTurnSubmissionError)
    assert.equal((conflict as AdventureTurnSubmissionError).code, 'TURN_REQUEST_CONFLICT')
    assert.lengthOf(await db.from('adventure_turns').where('adventure_id', adventureId), 1)
  })

  test('LC-003/S2/R1-S5 + R2-S3 + R1-S6: only the owner can create one active turn', async ({
    assert,
  }) => {
    const owner = await User.create({ email: 'turn-submission-busy-owner@example.com', password })
    const otherOwner = await User.create({
      email: 'turn-submission-busy-other@example.com',
      password,
    })
    const { adventureId } = await createReadyAdventure(
      owner.id,
      '55555555-5555-4555-8555-555555555555'
    )
    const service = new AdventureTurnSubmissionService()

    await service.submit({
      ownerId: owner.id,
      adventureId,
      requestId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      trigger: 'pass',
    })
    const busy = await captureError(() =>
      service.submit({
        ownerId: owner.id,
        adventureId,
        requestId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
        trigger: 'act',
        input: 'I wait for the rain to stop.',
      })
    )
    const inaccessible = await captureError(() =>
      service.submit({
        ownerId: otherOwner.id,
        adventureId,
        requestId: '12121212-1212-4212-8212-121212121212',
        trigger: 'pass',
      })
    )

    assert.instanceOf(busy, AdventureTurnSubmissionError)
    assert.equal((busy as AdventureTurnSubmissionError).code, 'ADVENTURE_BUSY')
    assert.instanceOf(inaccessible, AdventureTurnSubmissionError)
    assert.equal((inaccessible as AdventureTurnSubmissionError).code, 'ADVENTURE_NOT_FOUND')
  })
})
