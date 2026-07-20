import Character from '#models/character'
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
const validNpcState = {
  name: 'Mira of the Vestry',
  currentLocationKey: 'vestry',
  physicalDescription: 'A soot-streaked caretaker with a brass lantern.',
  background: 'She keeps the chapel ledgers hidden from the bell-ringers.',
  personality: 'Focused, guarded, and observant.',
  voice: 'Low and clipped, with a careful pause before each answer.',
  privateKnowledge: 'The missing ledger is sealed inside the vestry wall.',
  mood: 'Focused.',
  status: 'Searching for the missing ledger.',
  memory: 'Elara asked about the bell before Mira left the chapel.',
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
    slug: 'npc-debug-state-world',
    name: 'NPC Debug State World',
    description: 'A private source used to prove Adventure-only debug edits.',
    visibility: 'private',
    adventureGuidance: 'Keep state changes bounded and source canon frozen.',
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
  const character = await Character.create({
    worldId: world.id,
    locationId: chapel.id,
    key: 'mira',
    name: 'Mira',
    physicalDescription: 'A watchful keeper in rain-dark clothes.',
    background: 'Mira has served the chapel through every storm.',
    personality: 'Cautious and observant.',
    voice: 'Plain and restrained.',
    privateKnowledge: 'Mira heard the bell before midnight.',
    initialMood: 'Uneasy.',
    initialStatus: 'Watching the chapel door.',
    initialMemory: 'The player has not spoken with Mira yet.',
    sortOrder: 0,
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
    creationRequestId: '11111111-1111-4111-8111-111111111111',
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

  return { adventureId: created.adventureId, character, version }
}

test.group('Adventure NPC Debug state API', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-003/S3/R3-S1: autosaves bounded NPC card overrides without changing frozen canon or seed Character', async ({
    client,
    assert,
  }) => {
    const browser = await createAuthenticatedBrowser(client, 'npc-debug-owner@example.com')
    const owner = await User.findByOrFail('email', 'npc-debug-owner@example.com')
    const { adventureId, character, version } = await createReadyAdventure(owner.id)

    const response = await withBrowserSession(
      client.patch(`/api/v1/adventures/${adventureId}/npcs/mira/debug-state`),
      browser,
      { csrf: true }
    ).json(validNpcState)

    response.assertOk()
    response.assertBodyContains({ data: { scene: { npcs: [] } } })
    assert.deepInclude(
      await db
        .from('adventure_character_states')
        .where('adventure_id', adventureId)
        .where('character_key', 'mira')
        .firstOrFail(),
      {
        name: 'Mira of the Vestry',
        current_location_key: 'vestry',
        physical_description: 'A soot-streaked caretaker with a brass lantern.',
        background: 'She keeps the chapel ledgers hidden from the bell-ringers.',
        personality: 'Focused, guarded, and observant.',
        voice: 'Low and clipped, with a careful pause before each answer.',
        private_knowledge: 'The missing ledger is sealed inside the vestry wall.',
        mood: 'Focused.',
        status: 'Searching for the missing ledger.',
        memory: 'Elara asked about the bell before Mira left the chapel.',
      }
    )
    await character.refresh()
    await version.refresh()
    assert.deepInclude(character.serialize(), {
      initialMood: 'Uneasy.',
      initialStatus: 'Watching the chapel door.',
      initialMemory: 'The player has not spoken with Mira yet.',
    })
    assert.deepInclude(version.snapshot.characters, {
      key: 'mira',
      locationKey: 'chapel',
      initialMood: 'Uneasy.',
      initialStatus: 'Watching the chapel door.',
      initialMemory: 'The player has not spoken with Mira yet.',
    })
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

  test('LC-003/S3/R3-S4: hides Debug editing from a different Adventure owner', async ({
    client,
  }) => {
    const ownerBrowser = await createAuthenticatedBrowser(client, 'npc-debug-owner-two@example.com')
    const owner = await User.findByOrFail('email', 'npc-debug-owner-two@example.com')
    const { adventureId } = await createReadyAdventure(owner.id)
    const otherBrowser = await createAuthenticatedBrowser(client, 'npc-debug-other@example.com')

    const response = await withBrowserSession(
      client.patch(`/api/v1/adventures/${adventureId}/npcs/mira/debug-state`),
      otherBrowser,
      { csrf: true }
    ).json(validNpcState)
    response.assertNotFound()
    response.assertBodyContains({ errors: [{ code: 'ADVENTURE_NOT_FOUND' }] })

    const ownerResponse = await withBrowserSession(
      client.patch(`/api/v1/adventures/${adventureId}/npcs/mira/debug-state`),
      ownerBrowser,
      { csrf: true }
    ).json(validNpcState)
    ownerResponse.assertOk()
  })

  test('LC-003/S3/R3-S4: rejects invalid frozen Locations and edits while a turn is active', async ({
    client,
  }) => {
    const browser = await createAuthenticatedBrowser(client, 'npc-debug-bounds@example.com')
    const owner = await User.findByOrFail('email', 'npc-debug-bounds@example.com')
    const { adventureId } = await createReadyAdventure(owner.id)

    const invalidLocation = await withBrowserSession(
      client.patch(`/api/v1/adventures/${adventureId}/npcs/mira/debug-state`),
      browser,
      { csrf: true }
    ).json({ ...validNpcState, currentLocationKey: 'not-in-frozen-world' })
    invalidLocation.assertUnprocessableEntity()
    invalidLocation.assertBodyContains({ errors: [{ code: 'INVALID_NPC_STATE' }] })

    const now = new Date()
    await db.table('adventure_turns').insert({
      adventure_id: adventureId,
      request_id: '11111111-1111-4111-8111-111111111112',
      trigger: 'act',
      input: 'Ask Mira about the bell.',
      status: 'pending',
      attempt_count: 0,
      created_at: now,
      updated_at: now,
    })
    const busy = await withBrowserSession(
      client.patch(`/api/v1/adventures/${adventureId}/npcs/mira/debug-state`),
      browser,
      { csrf: true }
    ).json(validNpcState)
    busy.assertConflict()
    busy.assertBodyContains({ errors: [{ code: 'ADVENTURE_BUSY' }] })
  })
})
