import Character from '#models/character'
import Location from '#models/location'
import User from '#models/user'
import World from '#models/world'
import WorldVersion from '#models/world_version'
import {
  bootstrapBrowserSession,
  continueBrowserSession,
  withBrowserSession,
  type BrowserSession,
} from '#tests/helpers/browser_session'
import testUtils from '@adonisjs/core/services/test_utils'
import type { ApiClient } from '@japa/api-client'
import { test } from '@japa/runner'

const password = 'correct horse battery staple'

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

async function createWorld(authorId: number, slug: string) {
  const world = await World.create({
    authorId,
    slug,
    name: 'Character Authoring World',
    description: 'A World used to test Character canon changes.',
    visibility: 'private',
    adventureGuidance: 'Keep canon changes deliberate.',
  })
  const location = await Location.create({
    worldId: world.id,
    key: 'chapel',
    name: 'Chapel',
    description: 'A weathered stone chapel.',
    sortOrder: 0,
  })
  return { world, location }
}

const completeCard = {
  key: 'mira',
  name: 'Mira',
  locationKey: 'chapel',
  physicalDescription: 'A watchful woman in rain-dark clothes.',
  background: 'Mira has served the chapel through every storm.',
  personality: 'Cautious and observant.',
  voice: 'Plain and restrained.',
  privateKnowledge: 'Mira heard the bell ring before midnight.',
  initialMood: 'Uneasy.',
  initialStatus: 'Watching the chapel door.',
  initialMemory: 'The player has not spoken with Mira yet.',
}

test.group('World Character authoring API', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-002/S3/R1-S1 + R2-S1 + R5-S1: an author creates a complete card and publishes it atomically', async ({
    client,
    assert,
  }) => {
    const author = await createAuthenticatedBrowser(client, 'character-author@example.com')
    const authorAccount = await User.findByOrFail('email', 'character-author@example.com')
    const { world } = await createWorld(authorAccount.id, 'character-authoring-world')

    const response = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/characters`),
      author,
      { csrf: true }
    ).json(completeCard)

    response.assertCreated()
    response.assertBodyContains({ data: completeCard })
    const character = await Character.findByOrFail('key', completeCard.key)
    assert.equal(character.worldId, world.id)
    assert.equal(character.initialMood, completeCard.initialMood)
    assert.equal(character.initialStatus, completeCard.initialStatus)
    assert.equal(character.initialMemory, completeCard.initialMemory)
    await world.refresh()
    assert.isString(world.currentVersionId)
    const version = await WorldVersion.findByOrFail('id', world.currentVersionId!)
    assert.deepInclude(version.snapshot.characters[0], {
      key: completeCard.key,
      locationKey: completeCard.locationKey,
      initialMood: completeCard.initialMood,
      initialStatus: completeCard.initialStatus,
      initialMemory: completeCard.initialMemory,
    })
  })

  test('LC-002/S3/R3-S1 + R5-S1: an edit preserves stable key and leaves the prior immutable version unchanged', async ({
    client,
    assert,
  }) => {
    const author = await createAuthenticatedBrowser(client, 'character-edit-author@example.com')
    const account = await User.findByOrFail('email', 'character-edit-author@example.com')
    const { world } = await createWorld(account.id, 'character-edit-world')
    const created = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/characters`),
      author,
      { csrf: true }
    ).json(completeCard)
    created.assertCreated()
    await world.refresh()
    const oldVersion = await WorldVersion.findByOrFail('id', world.currentVersionId!)

    const response = await withBrowserSession(
      client.patch(`/api/v1/worlds/${world.slug}/characters/${completeCard.key}`),
      author,
      { csrf: true }
    ).json({ ...completeCard, name: 'Mira Vale', initialMood: 'Resolved.' })

    response.assertOk()
    response.assertBodyContains({
      data: { key: 'mira', name: 'Mira Vale', initialMood: 'Resolved.' },
    })
    await world.refresh()
    assert.notEqual(world.currentVersionId, oldVersion.id)
    await oldVersion.refresh()
    assert.deepInclude(oldVersion.snapshot.characters[0], {
      key: 'mira',
      name: 'Mira',
      initialMood: 'Uneasy.',
    })
  })

  test('LC-002/S3/R4-S1 + R5-S1: an author deletes current canon and publishes a new source without touching prior versions', async ({
    client,
    assert,
  }) => {
    const author = await createAuthenticatedBrowser(client, 'character-delete-author@example.com')
    const account = await User.findByOrFail('email', 'character-delete-author@example.com')
    const { world } = await createWorld(account.id, 'character-delete-world')
    const created = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/characters`),
      author,
      { csrf: true }
    ).json(completeCard)
    created.assertCreated()
    await world.refresh()
    const oldVersionId = world.currentVersionId!

    const response = await withBrowserSession(
      client.delete(`/api/v1/worlds/${world.slug}/characters/${completeCard.key}`),
      author,
      { csrf: true }
    )

    response.assertNoContent()
    assert.isNull(await Character.findBy('key', completeCard.key))
    await world.refresh()
    assert.notEqual(world.currentVersionId, oldVersionId)
    const oldVersion = await WorldVersion.findByOrFail('id', oldVersionId)
    assert.deepInclude(oldVersion.snapshot.characters[0], { key: completeCard.key })
  })

  test('LC-002/S3/R1-S2 + R2-S2: a non-author and invalid input cannot mutate or publish canon', async ({
    client,
    assert,
  }) => {
    const author = await User.create({ email: 'character-owner@example.com', password })
    const { world } = await createWorld(author.id, 'character-authorization-world')
    const other = await createAuthenticatedBrowser(client, 'character-non-author@example.com')

    const denied = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/characters`),
      other,
      { csrf: true }
    ).json(completeCard)
    denied.assertStatus(404)
    assert.deepEqual(denied.body(), {
      errors: [{ code: 'WORLD_NOT_FOUND', message: 'World not found.' }],
    })
    assert.lengthOf(await Character.query().where('worldId', world.id), 0)
    await world.refresh()
    assert.isNull(world.currentVersionId)

    const owner = await createAuthenticatedBrowser(client, 'character-validation-owner@example.com')
    const ownerAccount = await User.findByOrFail('email', 'character-validation-owner@example.com')
    const owned = await createWorld(ownerAccount.id, 'character-validation-world')
    const invalid = await withBrowserSession(
      client.post(`/api/v1/worlds/${owned.world.slug}/characters`),
      owner,
      { csrf: true }
    ).json({ ...completeCard, key: 'Not a stable key', initialMemory: ' ' })
    invalid.assertStatus(422)
    assert.lengthOf(await Character.query().where('worldId', owned.world.id), 0)
    await owned.world.refresh()
    assert.isNull(owned.world.currentVersionId)
  })
})
