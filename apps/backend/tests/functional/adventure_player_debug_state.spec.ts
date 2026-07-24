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
const validPlayerState = {
  name: 'Elara Vance',
  currentLocationKey: 'vestry',
  physicalDescription: 'A scholar in a salt-stained cloak with a brass compass.',
  backstory: 'She followed a fragment of the forbidden map into the chapel.',
  status: 'Listening beside the vestry door.',
}

async function createAuthenticatedBrowser(
  client: ApiClient,
  email: string
): Promise<BrowserSession> {
  const browser = await bootstrapBrowserSession(client)
  const signup = await withBrowserSession(client.post('/api/v1/auth/signup'), browser.session, {
    csrf: true,
  }).json({ email, password, passwordConfirmation: password })
  signup.assertCreated()
  return continueBrowserSession(signup, browser.session)
}

async function createReadyAdventure(ownerId: number) {
  const world = await World.create({
    authorId: ownerId,
    slug: 'player-debug-state-world',
    name: 'Player Debug State World',
    description: 'A private source used to prove Adventure-only Player debug edits.',
    visibility: 'private',
    adventureGuidance: 'Keep player state local and frozen canon unchanged.',
  })
  const chapel = await Location.create({
    worldId: world.id,
    key: 'chapel',
    name: 'Chapel',
    description: 'A cold stone chapel.',
    sortOrder: 0,
  })
  await Location.create({
    worldId: world.id,
    key: 'vestry',
    name: 'Vestry',
    description: 'A narrow room behind the altar.',
    sortOrder: 1,
  })
  await StartingPoint.create({
    worldId: world.id,
    locationId: chapel.id,
    key: 'arrival',
    name: 'Arrival',
    openingPremise: 'A bell rings through the rain.',
    sortOrder: 0,
    isDefault: true,
  })
  const version = await publishWorldVersion(world.id)
  const created = await new AdventureCreationService().create({
    ownerId,
    worldSlug: world.slug,
    creationRequestId: '21111111-1111-4111-8111-111111111111',
    player: { name: 'Elara Vance' },
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

  return { adventureId: created.adventureId, openingRevisionId: opening.id, version }
}

test.group('Adventure Player Debug state API', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-003/S1/R5-S7: autosaves owner Player state without changing frozen canon, revisions, or turns', async ({
    client,
    assert,
  }) => {
    const browser = await createAuthenticatedBrowser(client, 'player-debug-owner@example.com')
    const owner = await User.findByOrFail('email', 'player-debug-owner@example.com')
    const { adventureId, version } = await createReadyAdventure(owner.id)

    const response = await withBrowserSession(
      client.patch(`/api/v1/adventures/${adventureId}/player/debug-state`),
      browser,
      { csrf: true }
    ).json(validPlayerState)

    response.assertOk()
    response.assertBodyContains({
      data: {
        player: {
          name: validPlayerState.name,
          currentLocation: { key: validPlayerState.currentLocationKey, name: 'Vestry' },
          physicalDescription: validPlayerState.physicalDescription,
          backstory: validPlayerState.backstory,
          status: validPlayerState.status,
        },
      },
    })
    assert.deepInclude(
      await db.from('adventure_players').where('adventure_id', adventureId).firstOrFail(),
      {
        name: validPlayerState.name,
        current_location_key: validPlayerState.currentLocationKey,
        physical_description: validPlayerState.physicalDescription,
        backstory: validPlayerState.backstory,
        status: validPlayerState.status,
      }
    )
    await version.refresh()
    assert.equal(
      version.snapshot.locations.some((location) => location.key === 'vestry'),
      true
    )
    const revisionCount = await db
      .from('adventure_revisions')
      .where('adventure_id', adventureId)
      .count('* as total')
      .firstOrFail()
    const adventure = await db
      .from('adventures')
      .where('id', adventureId)
      .select('turn_count')
      .firstOrFail()
    assert.equal(Number(revisionCount.total), 1)
    assert.equal(adventure.turn_count, 0)
  })

  test('LC-003/S1/R5-S7: rejects missing CSRF without changing Adventure Player state', async ({
    client,
    assert,
  }) => {
    const browser = await createAuthenticatedBrowser(client, 'player-debug-csrf@example.com')
    const owner = await User.findByOrFail('email', 'player-debug-csrf@example.com')
    const { adventureId } = await createReadyAdventure(owner.id)
    const playerBeforeDeniedWrite = await db
      .from('adventure_players')
      .where('adventure_id', adventureId)
      .select('name', 'current_location_key', 'physical_description', 'backstory', 'status')
      .firstOrFail()

    const response = await withBrowserSession(
      client.patch(`/api/v1/adventures/${adventureId}/player/debug-state`),
      browser
    ).json(validPlayerState)

    response.assertForbidden()
    assert.deepEqual(
      await db
        .from('adventure_players')
        .where('adventure_id', adventureId)
        .select('name', 'current_location_key', 'physical_description', 'backstory', 'status')
        .firstOrFail(),
      playerBeforeDeniedWrite
    )
  })

  test('LC-003/S1/R5-S7: hides Player Debug editing from another Adventure owner', async ({
    client,
    assert,
  }) => {
    const ownerBrowser = await createAuthenticatedBrowser(
      client,
      'player-debug-owner-two@example.com'
    )
    const owner = await User.findByOrFail('email', 'player-debug-owner-two@example.com')
    const { adventureId } = await createReadyAdventure(owner.id)
    const otherBrowser = await createAuthenticatedBrowser(client, 'player-debug-other@example.com')
    const playerBeforeDeniedWrite = await db
      .from('adventure_players')
      .where('adventure_id', adventureId)
      .select('name', 'current_location_key', 'physical_description', 'backstory', 'status')
      .firstOrFail()

    const response = await withBrowserSession(
      client.patch(`/api/v1/adventures/${adventureId}/player/debug-state`),
      otherBrowser,
      { csrf: true }
    ).json(validPlayerState)
    response.assertNotFound()
    response.assertBodyContains({ errors: [{ code: 'ADVENTURE_NOT_FOUND' }] })
    assert.deepEqual(
      await db
        .from('adventure_players')
        .where('adventure_id', adventureId)
        .select('name', 'current_location_key', 'physical_description', 'backstory', 'status')
        .firstOrFail(),
      playerBeforeDeniedWrite
    )

    const ownerResponse = await withBrowserSession(
      client.patch(`/api/v1/adventures/${adventureId}/player/debug-state`),
      ownerBrowser,
      { csrf: true }
    ).json(validPlayerState)
    ownerResponse.assertOk()
  })

  test('LC-003/S1/R5-S7: rejects Player Debug editing before an Adventure is ready', async ({
    client,
    assert,
  }) => {
    const browser = await createAuthenticatedBrowser(client, 'player-debug-not-ready@example.com')
    const owner = await User.findByOrFail('email', 'player-debug-not-ready@example.com')
    const { adventureId } = await createReadyAdventure(owner.id)
    const playerBeforeDeniedWrite = await db
      .from('adventure_players')
      .where('adventure_id', adventureId)
      .select('name', 'current_location_key', 'physical_description', 'backstory', 'status')
      .firstOrFail()
    await db.from('adventures').where('id', adventureId).update({ status: 'opening_pending' })

    const response = await withBrowserSession(
      client.patch(`/api/v1/adventures/${adventureId}/player/debug-state`),
      browser,
      { csrf: true }
    ).json(validPlayerState)

    response.assertConflict()
    response.assertBodyContains({ errors: [{ code: 'ADVENTURE_NOT_READY' }] })
    assert.deepEqual(
      await db
        .from('adventure_players')
        .where('adventure_id', adventureId)
        .select('name', 'current_location_key', 'physical_description', 'backstory', 'status')
        .firstOrFail(),
      playerBeforeDeniedWrite
    )
  })

  test('LC-003/S1/R5-S7: rejects invalid frozen Locations and edits while a turn is active', async ({
    client,
  }) => {
    const browser = await createAuthenticatedBrowser(client, 'player-debug-bounds@example.com')
    const owner = await User.findByOrFail('email', 'player-debug-bounds@example.com')
    const { adventureId, openingRevisionId } = await createReadyAdventure(owner.id)

    const invalidLocation = await withBrowserSession(
      client.patch(`/api/v1/adventures/${adventureId}/player/debug-state`),
      browser,
      { csrf: true }
    ).json({ ...validPlayerState, currentLocationKey: 'not-in-frozen-world' })
    invalidLocation.assertUnprocessableEntity()
    invalidLocation.assertBodyContains({ errors: [{ code: 'INVALID_PLAYER_STATE' }] })

    const now = new Date()
    await db.table('adventure_turns').insert({
      adventure_id: adventureId,
      request_id: '21111111-1111-4111-8111-111111111112',
      trigger: 'act',
      input: 'Ask Mira about the bell.',
      status: 'pending',
      source_revision_id: openingRevisionId,
      created_at: now,
      updated_at: now,
    })
    const busy = await withBrowserSession(
      client.patch(`/api/v1/adventures/${adventureId}/player/debug-state`),
      browser,
      { csrf: true }
    ).json(validPlayerState)
    busy.assertConflict()
    busy.assertBodyContains({ errors: [{ code: 'ADVENTURE_BUSY' }] })
  })
})
