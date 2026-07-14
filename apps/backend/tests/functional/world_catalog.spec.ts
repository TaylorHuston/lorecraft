import World from '#models/world'
import Location from '#models/location'
import Character from '#models/character'
import { seedStormboundChapel } from '#services/stormbound_chapel_seed'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import {
  bootstrapBrowserSession,
  continueBrowserSession,
  withBrowserSession,
} from '#tests/helpers/browser_session'
import type { ApiClient } from '@japa/api-client'

async function createAuthenticatedBrowser(client: ApiClient, email: string) {
  const browser = await bootstrapBrowserSession(client)
  const signup = await withBrowserSession(client.post('/api/v1/auth/signup'), browser.session, {
    csrf: true,
  }).json({
    email,
    password: 'correct horse battery staple',
    passwordConfirmation: 'correct horse battery staple',
  })

  signup.assertCreated()
  return continueBrowserSession(signup, browser.session)
}

test.group('World catalog API', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-002/S1/R1-S1: another signed-in account can list a public World', async ({ client }) => {
    const author = await User.create({
      email: 'world-author@example.com',
      password: 'correct horse battery staple',
    })
    await World.create({
      authorId: author.id,
      slug: 'stormbound-chapel',
      name: 'Stormbound Chapel',
      description: 'A rain-lashed chapel and its nearby village haunts.',
      visibility: 'public',
    })
    const viewer = await createAuthenticatedBrowser(client, 'world-viewer@example.com')

    const response = await withBrowserSession(client.get('/api/v1/worlds'), viewer)

    response.assertOk()
    response.assertBodyContains({
      data: [
        {
          slug: 'stormbound-chapel',
          name: 'Stormbound Chapel',
          description: 'A rain-lashed chapel and its nearby village haunts.',
          visibility: 'public',
          readOnly: true,
        },
      ],
    })
  })

  test('LC-002/S1/R1-S2: anonymous catalog access is denied without World data', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/worlds')
    response.assertStatus(401)
    response.assertBodyNotContains({ name: 'Stormbound Chapel' })
  })

  test('LC-002/S2/R1-S1 + R1-S2: detail is structured, minimized, and safely missing', async ({
    client,
    assert,
  }) => {
    const author = await User.create({
      email: 'detail-author@example.com',
      password: 'correct horse battery staple',
    })
    await seedStormboundChapel(author.email)
    const viewer = await createAuthenticatedBrowser(client, 'detail-viewer@example.com')
    const response = await withBrowserSession(
      client.get('/api/v1/worlds/stormbound-chapel'),
      viewer
    )
    response.assertOk()
    response.assertBodyContains({
      data: {
        name: 'Stormbound Chapel',
        locations: [{ key: 'chapel', name: 'Chapel' }],
        characters: [
          {
            key: 'mira',
            name: 'Mira',
            privateKnowledge:
              'Mira knows the storm began after the chapel bell rang at midnight, but she is afraid to say that plainly.',
            location: { key: 'chapel', name: 'Chapel' },
          },
        ],
      },
    })
    assert.notProperty(response.body().data, 'authorId')
    assert.notProperty(response.body().data, 'author')
    assert.notInclude(JSON.stringify(response.body()), author.email)
    const missing = await withBrowserSession(client.get('/api/v1/worlds/unknown-world'), viewer)
    missing.assertStatus(404)
    missing.assertBody({ errors: [{ code: 'WORLD_NOT_FOUND', message: 'World not found.' }] })
  })

  test('LC-002/S2/R1-S3: repeated starter seed reconciles one exact graph', async ({ assert }) => {
    const author = await User.create({
      email: 'seed-author@example.com',
      password: 'correct horse battery staple',
    })
    await seedStormboundChapel(author.email)
    await Location.query().where('key', 'chapel').update({ description: 'Drifted' })
    await Character.query().where('key', 'mira').update({ voice: 'Drifted' })
    await seedStormboundChapel(author.email)
    assert.equal(
      await World.query()
        .where('slug', 'stormbound-chapel')
        .count('* as total')
        .firstOrFail()
        .then((row) => Number(row.$extras.total)),
      1
    )
    assert.lengthOf(
      await Location.query().whereHas('world', (query) => query.where('slug', 'stormbound-chapel')),
      4
    )
    assert.lengthOf(
      await Character.query().whereHas('world', (query) =>
        query.where('slug', 'stormbound-chapel')
      ),
      4
    )
    const chapel = await Location.findByOrFail('key', 'chapel')
    const mira = await Character.findByOrFail('key', 'mira')
    assert.match(chapel.description, /Rain taps/)
    assert.match(mira.voice, /Plain-spoken/)
  })
})
