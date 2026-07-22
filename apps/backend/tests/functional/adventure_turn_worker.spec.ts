import AdventureTurnLifecycleService from '#services/adventure_turn_lifecycle_service'
import Character from '#models/character'
import AdventureTurnWorker, {
  type AdventureTurnCompletion,
  type AdventureTurnCompletionPort,
  type ClaimedAdventureTurn,
  type TurnFinalizationContext,
} from '#services/adventure_turn_worker'
import Location from '#models/location'
import StartingPoint from '#models/starting_point'
import User from '#models/user'
import World from '#models/world'
import AdventureCreationService from '#services/adventure_creation_service'
import AdventureTurnSubmissionService from '#services/adventure_turn_submission_service'
import AdventureTurnProductionCompletionPort from '#services/adventure_turn_production_completion_port'
import type { AdventureStateExtractor } from '#services/story_generation/adventure_state_extractor'
import type { TurnStoryGenerator } from '#services/story_generation/turn_story_generator'
import { publishWorldVersion } from '#services/world_version_publication_service'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

const now = new Date('2099-07-19T12:00:00.000Z')

async function createReadyAdventure(suffix: string) {
  const owner = await User.create({
    email: `turn-worker-${suffix}@example.com`,
    password: 'correct horse battery staple',
  })
  const world = await World.create({
    authorId: owner.id,
    slug: `turn-worker-${suffix}`,
    name: 'Turn worker fixture',
    description: 'A focused durable turn-worker fixture.',
    visibility: 'private',
    adventureGuidance: 'Keep every response grounded in the frozen source.',
  })
  const location = await Location.create({
    worldId: world.id,
    key: 'chapel-threshold',
    name: 'Chapel Threshold',
    description: 'Rain runs down the locked chapel doors.',
    sortOrder: 0,
  })
  await Location.create({
    worldId: world.id,
    key: 'chapel-crypt',
    name: 'Chapel Crypt',
    description: 'A narrow stair drops into the crypt beneath the altar.',
    sortOrder: 1,
  })
  await Character.create({
    worldId: world.id,
    locationId: location.id,
    key: 'mira',
    name: 'Mira',
    physicalDescription: 'A rain-dark local with watchful eyes.',
    background: 'Mira has lived beside the chapel all her life.',
    personality: 'Cautious and observant.',
    voice: 'Quiet and deliberate.',
    privateKnowledge: 'The bell has no rope.',
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
    ownerId: owner.id,
    worldSlug: world.slug,
    creationRequestId: crypto.randomUUID(),
    player: { name: 'Mara Venn' },
  })
  const [opening] = await db
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
    head_revision_id: opening.id,
    updated_at: now,
  })
  return { owner, adventureId: created.adventureId, openingRevisionId: opening.id }
}

async function submitTurn(
  ownerId: number,
  adventureId: string,
  requestId = crypto.randomUUID(),
  trigger: 'act' | 'guide' = 'act',
  input = 'I ask Mira why the bell rang.'
) {
  return new AdventureTurnSubmissionService().submit({
    ownerId,
    adventureId,
    requestId,
    trigger,
    input,
  })
}

class DeferredCompletionPort implements AdventureTurnCompletionPort {
  calls: ClaimedAdventureTurn[] = []

  constructor(private readonly completion: AdventureTurnCompletion) {}

  async resolve(claim: ClaimedAdventureTurn) {
    this.calls.push(claim)
    return this.completion
  }
}

function successfulCompletion(): AdventureTurnCompletion {
  return {
    async commit({ trx, adventure, turn, completedAt }: TurnFinalizationContext) {
      const [revision] = await trx
        .table('adventure_revisions')
        .insert({
          adventure_id: adventure.id,
          sequence: adventure.turn_count + 1,
          kind: 'turn',
          parent_revision_id: turn.source_revision_id,
          created_at: completedAt,
        })
        .returning(['id'])
      await trx.table('adventure_story_entries').insert({
        adventure_id: adventure.id,
        revision_id: revision.id,
        sequence: 0,
        kind: 'narration',
        content: 'The bell answers from below the chapel floor.',
        created_at: completedAt,
      })
      await trx
        .from('adventures')
        .where('id', adventure.id)
        .update({
          head_revision_id: revision.id,
          turn_count: adventure.turn_count + 1,
          last_played_at: completedAt,
          updated_at: completedAt,
        })
      return { resultRevisionId: revision.id }
    },
  }
}

test.group('AdventureTurnWorker', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-003/S2/R2-S1 + R2-S2 + R2-S4: claims a persisted turn and atomically publishes an injected completed outcome once', async ({
    assert,
  }) => {
    const fixture = await createReadyAdventure('completion')
    const turn = await submitTurn(fixture.owner.id, fixture.adventureId)
    const completion = new DeferredCompletionPort(successfulCompletion())
    const worker = new AdventureTurnWorker({
      completion,
      workerId: 'turn-worker-completion',
      now: () => new Date(now),
    })

    assert.deepInclude(await worker.runOnce(), {
      status: 'succeeded',
      adventureId: fixture.adventureId,
      turnId: turn.id,
      attempt: 1,
    })
    assert.deepEqual(await worker.runOnce(), { status: 'idle' })
    assert.lengthOf(completion.calls, 1)

    const adventure = await db.from('adventures').where('id', fixture.adventureId).firstOrFail()
    const persistedTurn = await db.from('adventure_turns').where('id', turn.id).firstOrFail()
    const job = await db.from('adventure_jobs').where('turn_id', turn.id).firstOrFail()
    const revision = await db
      .from('adventure_revisions')
      .where('id', persistedTurn.result_revision_id)
      .firstOrFail()
    assert.deepInclude(persistedTurn, {
      status: 'succeeded',
      source_revision_id: fixture.openingRevisionId,
    })
    assert.deepInclude(job, { status: 'succeeded', attempt_count: 1 })
    assert.equal(adventure.head_revision_id, revision.id)
    assert.equal(adventure.turn_count, 1)
    assert.deepInclude(revision, { kind: 'turn', parent_revision_id: fixture.openingRevisionId })
  })

  test('LC-003/S2/R3-S1 + R3-S3 + R4-S1 + R4-S4: production completion stages separate narration and extraction, then atomically persists accepted state and metadata-only evidence', async ({
    assert,
  }) => {
    const fixture = await createReadyAdventure('production-completion')
    const turn = await submitTurn(fixture.owner.id, fixture.adventureId)
    const generator: TurnStoryGenerator = {
      async generateTurn(input) {
        assert.equal(input.context.trigger, 'act')
        assert.equal(input.context.currentState.player.currentLocationKey, 'chapel-threshold')
        return {
          narration: 'Mira beckons from the stair, and you descend into the crypt.',
          provider: 'test-provider',
          model: 'test-model',
          settings: { temperature: 0, maxTokens: 10 },
          request: { byteCount: 10, timeoutMs: 1 },
          response: { byteCount: 10, statusCode: 200 },
        }
      },
    }
    const extractor: AdventureStateExtractor = {
      async extract(input) {
        assert.include(input.narration, 'crypt')
        return {
          extraction: { proposals: [{ type: 'player_location', locationKey: 'chapel-crypt' }] },
          provider: 'test-provider',
          model: 'test-model',
          settings: { temperature: 0, maxTokens: 10 },
          request: { byteCount: 10, timeoutMs: 1 },
          response: { byteCount: 10, statusCode: 200 },
        }
      },
    }
    const worker = new AdventureTurnWorker({
      completion: new AdventureTurnProductionCompletionPort({
        storyGenerator: generator,
        stateExtractor: extractor,
      }),
      workerId: 'turn-worker-production-completion',
      now: () => new Date(now),
    })

    assert.deepInclude(await worker.runOnce(), { status: 'succeeded', turnId: turn.id })
    const persistedTurn = await db.from('adventure_turns').where('id', turn.id).firstOrFail()
    const mutation = await db
      .from('adventure_revision_mutations')
      .where('revision_id', persistedTurn.result_revision_id)
      .firstOrFail()
    assert.deepInclude(mutation, {
      accepted: true,
      actor_type: 'player',
      actor_key: null,
      field: 'current_location_key',
      previous_value: 'chapel-threshold',
      resulting_value: 'chapel-crypt',
    })
    assert.deepInclude(
      await db.from('adventure_players').where('adventure_id', fixture.adventureId).firstOrFail(),
      { current_location_key: 'chapel-crypt' }
    )
    const turnJob = await db.from('adventure_jobs').where('turn_id', turn.id).firstOrFail()
    const calls = await db
      .from('model_calls')
      .where('adventure_id', fixture.adventureId)
      .where('job_id', turnJob.id)
      .orderBy('operation')
    assert.sameMembers(
      calls.map((call) => call.operation),
      ['turn_narration_generation', 'turn_state_extraction']
    )
    assert.notInclude(JSON.stringify(calls), 'Mira beckons')
  })

  test('LC-003/S2/R1-S3 + R3-S4: publishes ordinary narration containing a concise Guide as a larger word', async ({
    assert,
  }) => {
    const fixture = await createReadyAdventure('guide-substring')
    const turn = await submitTurn(
      fixture.owner.id,
      fixture.adventureId,
      crypto.randomUUID(),
      'guide',
      'OK'
    )
    let extractorCalled = false
    const worker = new AdventureTurnWorker({
      completion: new AdventureTurnProductionCompletionPort({
        storyGenerator: {
          async generateTurn(input) {
            assert.equal(input.context.trigger, 'guide')
            assert.equal(input.context.input, 'OK')
            return {
              narration: 'The lookout waves from the archway.',
              provider: 'test-provider',
              model: 'test-model',
              settings: { temperature: 0, maxTokens: 10 },
              request: { byteCount: 10, timeoutMs: 1 },
              response: { byteCount: 10, statusCode: 200 },
            }
          },
        },
        stateExtractor: {
          async extract(input) {
            extractorCalled = true
            assert.equal(input.narration, 'The lookout waves from the archway.')
            return {
              extraction: { proposals: [] },
              provider: 'test-provider',
              model: 'test-model',
              settings: { temperature: 0, maxTokens: 10 },
              request: { byteCount: 10, timeoutMs: 1 },
              response: { byteCount: 10, statusCode: 200 },
            }
          },
        },
      }),
      workerId: 'turn-worker-guide-substring',
      now: () => new Date(now),
    })

    assert.deepInclude(await worker.runOnce(), { status: 'succeeded', turnId: turn.id })
    assert.isTrue(extractorCalled)
    assert.deepInclude(await db.from('adventure_turns').where('id', turn.id).firstOrFail(), {
      status: 'succeeded',
    })
    assert.deepInclude(
      await db
        .from('adventure_story_entries')
        .where('adventure_id', fixture.adventureId)
        .where('kind', 'narration')
        .firstOrFail(),
      { content: 'The lookout waves from the archway.' }
    )
  })

  test('LC-003/S2/R1-S3 + R3-S4: rejects even short reflected Guide text before narration publication', async ({
    assert,
  }) => {
    const fixture = await createReadyAdventure('private-narration')
    const turn = await submitTurn(
      fixture.owner.id,
      fixture.adventureId,
      crypto.randomUUID(),
      'guide',
      'OK'
    )
    let extractorCalled = false
    const generator: TurnStoryGenerator = {
      async generateTurn(input) {
        assert.equal(input.context.trigger, 'guide')
        assert.equal(input.context.input, 'OK')
        return {
          narration: 'OK.',
          provider: 'test-provider',
          model: 'test-model',
          settings: { temperature: 0, maxTokens: 10 },
          request: { byteCount: 10, timeoutMs: 1 },
          response: { byteCount: 10, statusCode: 200 },
        }
      },
    }
    const extractor: AdventureStateExtractor = {
      async extract() {
        extractorCalled = true
        throw new Error('The extractor must not receive rejected narration.')
      },
    }
    const worker = new AdventureTurnWorker({
      completion: new AdventureTurnProductionCompletionPort({
        storyGenerator: generator,
        stateExtractor: extractor,
      }),
      workerId: 'turn-worker-private-narration',
      now: () => new Date(now),
    })

    assert.deepInclude(await worker.runOnce(), { status: 'retry_scheduled', turnId: turn.id })
    assert.deepInclude(await worker.runOnce(), { status: 'failed', turnId: turn.id, attempt: 2 })
    assert.isFalse(extractorCalled)
    assert.deepInclude(await db.from('adventure_turns').where('id', turn.id).firstOrFail(), {
      status: 'failed',
      result_revision_id: null,
    })
    assert.lengthOf(
      await db.from('adventure_story_entries').where('adventure_id', fixture.adventureId),
      0
    )
    assert.lengthOf(
      await db.from('adventure_revisions').where('adventure_id', fixture.adventureId),
      1
    )
    const calls = await db
      .from('model_calls')
      .where('adventure_id', fixture.adventureId)
      .where('operation', 'turn_narration_generation')
    assert.lengthOf(calls, 2)
    assert.notInclude(JSON.stringify(calls), 'OK')
  })

  test('LC-003/S2/R2-S2 + R2-S5: an expired claim is reclaimed, terminal failure is retryable by the owner, and discard removes only uncommitted work', async ({
    assert,
  }) => {
    const fixture = await createReadyAdventure('recovery')
    const turn = await submitTurn(fixture.owner.id, fixture.adventureId)
    await db
      .from('adventure_jobs')
      .where('turn_id', turn.id)
      .update({
        status: 'processing',
        attempt_count: 1,
        lease_owner: 'lost-worker:lease',
        lease_expires_at: new Date(now.getTime() - 1),
        updated_at: new Date(now.getTime() - 60_000),
      })
    await db.from('adventure_turns').where('id', turn.id).update({ status: 'processing' })

    const failedWorker = new AdventureTurnWorker({
      completion: {
        async resolve() {
          throw new Error('the staged resolver is unavailable')
        },
      },
      workerId: 'turn-worker-recovery',
      now: () => new Date(now),
    })
    assert.deepInclude(await failedWorker.runOnce(), {
      status: 'failed',
      adventureId: fixture.adventureId,
      turnId: turn.id,
      attempt: 2,
    })
    assert.deepInclude(await db.from('adventure_turns').where('id', turn.id).firstOrFail(), {
      status: 'failed',
      result_revision_id: null,
    })
    assert.deepInclude(await db.from('adventure_jobs').where('turn_id', turn.id).firstOrFail(), {
      status: 'failed',
      attempt_count: 2,
    })

    const lifecycle = new AdventureTurnLifecycleService()
    assert.deepInclude(
      await lifecycle.retry({
        ownerId: fixture.owner.id,
        adventureId: fixture.adventureId,
        turnId: turn.id,
      }),
      { id: turn.id, status: 'pending' }
    )
    assert.deepInclude(
      await db
        .from('adventure_jobs')
        .where('turn_id', turn.id)
        .orderBy('created_at', 'desc')
        .firstOrFail(),
      {
        status: 'pending',
        attempt_count: 0,
      }
    )
    await lifecycle.discard({
      ownerId: fixture.owner.id,
      adventureId: fixture.adventureId,
      turnId: turn.id,
    })
    assert.isNull(await db.from('adventure_turns').where('id', turn.id).first())
    assert.lengthOf(await db.from('adventure_jobs').where('turn_id', turn.id), 0)
    assert.deepInclude(await db.from('adventures').where('id', fixture.adventureId).firstOrFail(), {
      head_revision_id: fixture.openingRevisionId,
      turn_count: 0,
    })
  })

  test('LC-003/S2/R2-S6: an expired final attempt becomes recoverably failed without publication', async ({
    assert,
  }) => {
    const fixture = await createReadyAdventure('exhausted-lease')
    const turn = await submitTurn(fixture.owner.id, fixture.adventureId)
    await db
      .from('adventure_jobs')
      .where('turn_id', turn.id)
      .update({
        status: 'processing',
        attempt_count: 2,
        lease_owner: 'lost-worker:final-lease',
        lease_expires_at: new Date(now.getTime() - 1),
        updated_at: new Date(now.getTime() - 60_000),
      })
    await db.from('adventure_turns').where('id', turn.id).update({ status: 'processing' })
    const worker = new AdventureTurnWorker({
      completion: {
        async resolve() {
          throw new Error('must not resolve an exhausted lease')
        },
      },
      workerId: 'turn-worker-exhausted-lease',
      now: () => new Date(now),
    })

    assert.deepInclude(await worker.runOnce(), { status: 'failed', turnId: turn.id, attempt: 2 })
    assert.deepInclude(await db.from('adventure_turns').where('id', turn.id).firstOrFail(), {
      status: 'failed',
      result_revision_id: null,
    })
    assert.deepInclude(await db.from('adventure_jobs').where('turn_id', turn.id).firstOrFail(), {
      status: 'failed',
      failure_code: 'lease_expired',
    })
    assert.deepInclude(await db.from('adventures').where('id', fixture.adventureId).firstOrFail(), {
      head_revision_id: fixture.openingRevisionId,
      turn_count: 0,
    })
  })

  test('LC-003/S2/R2-S4 + R2-S5 + R2-S6: a stale head terminally fails its exact claim, and a throwing staged commit cannot publish a partial result', async ({
    assert,
  }) => {
    const staleFixture = await createReadyAdventure('stale')
    const staleTurn = await submitTurn(staleFixture.owner.id, staleFixture.adventureId)
    let staleGeneratorCalled = false
    let staleExtractorCalled = false
    const staleWorker = new AdventureTurnWorker({
      completion: new AdventureTurnProductionCompletionPort({
        storyGenerator: {
          async generateTurn() {
            staleGeneratorCalled = true
            throw new Error('A stale head must fail before narration generation.')
          },
        },
        stateExtractor: {
          async extract() {
            staleExtractorCalled = true
            throw new Error('A stale head must fail before state extraction.')
          },
        },
      }),
      workerId: 'turn-worker-stale',
      now: () => new Date(now),
    })
    const claim = await staleWorker.claimOneForTest()
    assert.isDefined(claim)
    const [replacementHead] = await db
      .table('adventure_revisions')
      .insert({
        adventure_id: staleFixture.adventureId,
        sequence: 1,
        kind: 'turn',
        parent_revision_id: staleFixture.openingRevisionId,
        created_at: now,
      })
      .returning(['id'])
    await db.from('adventures').where('id', staleFixture.adventureId).update({
      head_revision_id: replacementHead.id,
      turn_count: 1,
    })
    assert.deepInclude(await staleWorker.finishClaimForTest(claim!), {
      status: 'failed',
      turnId: staleTurn.id,
      attempt: 1,
    })
    assert.isFalse(staleGeneratorCalled)
    assert.isFalse(staleExtractorCalled)
    assert.deepInclude(await db.from('adventure_turns').where('id', staleTurn.id).firstOrFail(), {
      status: 'failed',
      result_revision_id: null,
    })
    assert.deepInclude(
      await db.from('adventure_jobs').where('turn_id', staleTurn.id).firstOrFail(),
      {
        status: 'failed',
        failure_code: 'stale_turn_claim',
        lease_owner: null,
        lease_expires_at: null,
      }
    )
    const lifecycle = new AdventureTurnLifecycleService()
    try {
      await lifecycle.retry({
        ownerId: staleFixture.owner.id,
        adventureId: staleFixture.adventureId,
        turnId: staleTurn.id,
      })
      assert.fail('Stale source claims must not become retryable work.')
    } catch (error) {
      assert.equal((error as { code?: string }).code, 'TURN_NOT_RETRYABLE')
    }
    await lifecycle.discard({
      ownerId: staleFixture.owner.id,
      adventureId: staleFixture.adventureId,
      turnId: staleTurn.id,
    })
    assert.isNull(await db.from('adventure_turns').where('id', staleTurn.id).first())

    const atomicFixture = await createReadyAdventure('atomic')
    const atomicTurn = await submitTurn(atomicFixture.owner.id, atomicFixture.adventureId)
    const atomicWorker = new AdventureTurnWorker({
      completion: {
        async resolve() {
          return {
            async commit({ trx, adventure, turn, completedAt }: TurnFinalizationContext) {
              const [revision] = await trx
                .table('adventure_revisions')
                .insert({
                  adventure_id: adventure.id,
                  sequence: 1,
                  kind: 'turn',
                  parent_revision_id: turn.source_revision_id,
                  created_at: completedAt,
                })
                .returning(['id'])
              await trx.table('adventure_story_entries').insert({
                adventure_id: adventure.id,
                revision_id: revision.id,
                sequence: 0,
                kind: 'narration',
                content: 'This must roll back.',
                created_at: completedAt,
              })
              throw new Error('later mutation validation failed')
            },
          }
        },
      },
      workerId: 'turn-worker-atomic',
      now: () => new Date(now),
    })
    assert.deepInclude(await atomicWorker.runOnce(), {
      status: 'retry_scheduled',
      turnId: atomicTurn.id,
      attempt: 1,
    })
    assert.lengthOf(
      await db.from('adventure_revisions').where('adventure_id', atomicFixture.adventureId),
      1
    )
    assert.lengthOf(
      await db.from('adventure_story_entries').where('adventure_id', atomicFixture.adventureId),
      0
    )
    assert.deepInclude(
      await db.from('adventures').where('id', atomicFixture.adventureId).firstOrFail(),
      {
        head_revision_id: atomicFixture.openingRevisionId,
        turn_count: 0,
      }
    )
    assert.deepInclude(await atomicWorker.runOnce(), {
      status: 'failed',
      turnId: atomicTurn.id,
      attempt: 2,
    })
    assert.deepInclude(await db.from('adventure_turns').where('id', atomicTurn.id).firstOrFail(), {
      status: 'failed',
      result_revision_id: null,
    })
  })
})
