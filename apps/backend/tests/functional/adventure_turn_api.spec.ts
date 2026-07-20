import Location from '#models/location'
import StartingPoint from '#models/starting_point'
import User from '#models/user'
import World from '#models/world'
import AdventureCreationService from '#services/adventure_creation_service'
import { publishWorldVersion } from '#services/world_version_publication_service'
import {
  bootstrapBrowserSession,
  continueBrowserSession,
  withBrowserSession,
  type BrowserSession,
} from '#tests/helpers/browser_session'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import type { ApiClient } from '@japa/api-client'
import { test } from '@japa/runner'

const password = 'correct horse battery staple'
let signupClientSequence = 0

async function createAuthenticatedBrowser(
  client: ApiClient,
  email: string
): Promise<BrowserSession> {
  const browser = await bootstrapBrowserSession(client)
  signupClientSequence += 1
  const signup = await withBrowserSession(
    client
      .post('/api/v1/auth/signup')
      .header('x-forwarded-for', `198.51.100.${signupClientSequence}`),
    browser.session,
    { csrf: true }
  ).json({ email, password, passwordConfirmation: password })
  signup.assertCreated()
  return continueBrowserSession(signup, browser.session)
}

async function createReadyAdventure(ownerId: number, suffix: string) {
  const world = await World.create({
    authorId: ownerId,
    slug: `turn-api-${suffix}`,
    name: 'Turn API fixture',
    description: 'A focused turn API fixture.',
    visibility: 'private',
    adventureGuidance: 'Keep every turn grounded in frozen canon.',
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
    creationRequestId: crypto.randomUUID(),
    player: { name: 'Mara Venn' },
  })
  const now = new Date()
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
  return created.adventureId
}

test.group('Adventure turn API', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-003/S2/R1-S1..R1-S5: authenticated owners submit and replay private Act, Pass, and Guide turns', async ({
    client,
    assert,
  }) => {
    const ownerEmail = 'turn-api-owner@example.com'
    const browser = await createAuthenticatedBrowser(client, ownerEmail)
    const owner = await User.findByOrFail('email', ownerEmail)

    const actAdventureId = await createReadyAdventure(owner.id, 'act')
    const actPayload = {
      requestId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      trigger: 'act',
      input: 'I ask Mira why the bell rang.',
    } as const
    const act = await withBrowserSession(
      client.post(`/api/v1/adventures/${actAdventureId}/turns`),
      browser,
      { csrf: true }
    ).json(actPayload)
    const replay = await withBrowserSession(
      client.post(`/api/v1/adventures/${actAdventureId}/turns`),
      browser,
      { csrf: true }
    ).json(actPayload)
    act.assertCreated()
    replay.assertCreated()
    assert.deepEqual(replay.body(), act.body())
    act.assertBodyContains({
      data: {
        adventureId: actAdventureId,
        trigger: 'act',
        status: 'pending',
        route: `/adventures/${actAdventureId}`,
      },
    })

    const passAdventureId = await createReadyAdventure(owner.id, 'pass')
    const pass = await withBrowserSession(
      client.post(`/api/v1/adventures/${passAdventureId}/turns`),
      browser,
      { csrf: true }
    ).json({ requestId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', trigger: 'pass' })
    pass.assertCreated()
    pass.assertBodyContains({ data: { trigger: 'pass', status: 'pending' } })

    const guideAdventureId = await createReadyAdventure(owner.id, 'guide')
    const guideText = 'Privately steer Mira toward the ledger.'
    const guide = await withBrowserSession(
      client.post(`/api/v1/adventures/${guideAdventureId}/turns`),
      browser,
      { csrf: true }
    ).json({
      requestId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      trigger: 'guide',
      input: guideText,
    })
    guide.assertCreated()
    assert.notInclude(JSON.stringify(guide.body()), guideText)
    assert.deepInclude(
      await db.from('adventure_turns').where('adventure_id', guideAdventureId).firstOrFail(),
      { trigger: 'guide', input: guideText }
    )
  })

  test('LC-003/S2/R1-S4 + R1-S6: validation, CSRF, and owner boundaries reject turn creation without disclosure', async ({
    client,
    assert,
  }) => {
    const ownerEmail = 'turn-api-boundary-owner@example.com'
    const browser = await createAuthenticatedBrowser(client, ownerEmail)
    const owner = await User.findByOrFail('email', ownerEmail)
    const adventureId = await createReadyAdventure(owner.id, 'boundary')

    const invalid = await withBrowserSession(
      client.post(`/api/v1/adventures/${adventureId}/turns`),
      browser,
      { csrf: true }
    ).json({
      requestId: 'not-a-uuid',
      trigger: 'pass',
      input: 'Pass should not include text.',
    })
    invalid.assertStatus(422)
    const invalidBody = invalid.body() as unknown as { errors: Array<{ field: string }> }
    assert.includeMembers(
      invalidBody.errors.map((error) => error.field),
      ['requestId', 'input']
    )
    assert.lengthOf(await db.from('adventure_turns').where('adventure_id', adventureId), 0)

    const noCsrf = await withBrowserSession(
      client.post(`/api/v1/adventures/${adventureId}/turns`),
      browser
    ).json({ requestId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', trigger: 'pass' })
    noCsrf.assertStatus(403)

    const otherBrowser = await createAuthenticatedBrowser(
      client,
      'turn-api-boundary-other@example.com'
    )
    const other = await withBrowserSession(
      client.post(`/api/v1/adventures/${adventureId}/turns`),
      otherBrowser,
      { csrf: true }
    ).json({ requestId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', trigger: 'pass' })
    const unknown = await withBrowserSession(
      client.post('/api/v1/adventures/ffffffff-ffff-4fff-8fff-ffffffffffff/turns'),
      otherBrowser,
      { csrf: true }
    ).json({ requestId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', trigger: 'pass' })
    other.assertStatus(404)
    unknown.assertStatus(404)
    assert.deepEqual(other.body(), unknown.body())

    const anonymous = await client
      .post(`/api/v1/adventures/${adventureId}/turns`)
      .json({ requestId: 'ffffffff-ffff-4fff-8fff-ffffffffffff', trigger: 'pass' })
    anonymous.assertStatus(401)
  })

  test('LC-003/S2/R2-S5: owners retry and discard failed turns through the HTTP contract', async ({
    client,
    assert,
  }) => {
    const ownerEmail = 'turn-api-recovery-owner@example.com'
    const browser = await createAuthenticatedBrowser(client, ownerEmail)
    const owner = await User.findByOrFail('email', ownerEmail)
    const adventureId = await createReadyAdventure(owner.id, 'recovery')
    const submitted = await withBrowserSession(
      client.post(`/api/v1/adventures/${adventureId}/turns`),
      browser,
      { csrf: true }
    ).json({
      requestId: '12121212-1212-4121-8121-121212121212',
      trigger: 'act',
      input: 'I wait for the bell.',
    })
    submitted.assertCreated()
    const turnId = (submitted.body() as { data: { id: string } }).data.id
    await db.from('adventure_turns').where('id', turnId).update({ status: 'failed' })
    await db.from('adventure_jobs').where('turn_id', turnId).update({ status: 'failed' })

    const retry = await withBrowserSession(
      client.post(`/api/v1/adventures/${adventureId}/turns/${turnId}/retry`),
      browser,
      { csrf: true }
    )
    retry.assertOk()
    retry.assertBodyContains({ data: { id: turnId, status: 'pending' } })

    const otherBrowser = await createAuthenticatedBrowser(
      client,
      'turn-api-recovery-other@example.com'
    )
    const crossOwner = await withBrowserSession(
      client.delete(`/api/v1/adventures/${adventureId}/turns/${turnId}`),
      otherBrowser,
      { csrf: true }
    )
    crossOwner.assertNotFound()

    await db.from('adventure_turns').where('id', turnId).update({ status: 'failed' })
    await db.from('adventure_jobs').where('turn_id', turnId).update({ status: 'failed' })
    const discard = await withBrowserSession(
      client.delete(`/api/v1/adventures/${adventureId}/turns/${turnId}`),
      browser,
      { csrf: true }
    )
    discard.assertNoContent()
    assert.isNull(await db.from('adventure_turns').where('id', turnId).first())
    assert.lengthOf(await db.from('adventure_jobs').where('turn_id', turnId), 0)
  })
})
