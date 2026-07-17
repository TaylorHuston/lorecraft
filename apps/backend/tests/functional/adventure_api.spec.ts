import Character from '#models/character'
import Location from '#models/location'
import StartingPoint from '#models/starting_point'
import User from '#models/user'
import World, { type WorldVisibility } from '#models/world'
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
    {
      csrf: true,
    }
  ).json({ email, password, passwordConfirmation: password })

  signup.assertCreated()
  return continueBrowserSession(signup, browser.session)
}

async function createWorld({
  authorId,
  slug,
  visibility = 'private',
  publish = true,
}: {
  authorId: number
  slug: string
  visibility?: WorldVisibility
  publish?: boolean
}) {
  const world = await World.create({
    authorId,
    slug,
    name: 'Adventure API World',
    description: 'A focused Adventure API fixture.',
    visibility,
    adventureGuidance: 'Keep the opening grounded in frozen canon.',
  })
  const location = await Location.create({
    worldId: world.id,
    key: 'chapel-threshold',
    name: 'Chapel Threshold',
    description: 'Rain runs down the locked chapel doors.',
    sortOrder: 0,
  })
  await Character.create({
    worldId: world.id,
    locationId: location.id,
    key: 'warden-hale',
    name: 'Warden Hale',
    physicalDescription: 'A weathered keeper in a salt-stained coat.',
    background: 'He has guarded the chapel for decades.',
    personality: 'Reserved and watchful.',
    voice: 'Low and deliberate.',
    privateKnowledge: 'He knows who rang the bell.',
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
  const version = publish ? await publishWorldVersion(world.id) : null

  return { world, version }
}

test.group('Adventure API', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-003/S1/R1-S1: an authenticated account creates a pending Adventure', async ({
    client,
  }) => {
    const author = await User.create({ email: 'api-author@example.com', password })
    const { world } = await createWorld({
      authorId: author.id,
      slug: 'adventure-api-world',
      visibility: 'public',
    })
    const browser = await createAuthenticatedBrowser(client, 'api-player@example.com')

    const response = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      browser,
      { csrf: true }
    ).json({
      creationRequestId: '11111111-1111-4111-8111-111111111111',
      player: {
        name: '  Mara Venn  ',
        physicalDescription: '  A rain-dark coat.  ',
        backstory: '  Mara came to the chapel looking for her brother.  ',
      },
    })

    response.assertCreated()
    response.assertBodyContains({
      data: {
        playerName: 'Mara Venn',
        status: 'opening_pending',
        turnCount: 0,
      },
    })
  })

  test('LC-003/S1/R2-S3 + R4-S1: World detail exposes playability and only owner Adventure summaries', async ({
    client,
    assert,
  }) => {
    const author = await User.create({ email: 'world-detail-author@example.com', password })
    const { world, version } = await createWorld({
      authorId: author.id,
      slug: 'world-detail-adventures',
      visibility: 'public',
    })
    const owner = await createAuthenticatedBrowser(client, 'world-detail-owner@example.com')
    const otherOwner = await createAuthenticatedBrowser(
      client,
      'world-detail-other-owner@example.com'
    )

    const owned = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      owner,
      { csrf: true }
    ).json({
      creationRequestId: '22222222-2222-4222-8222-222222222222',
      player: { name: 'Mara Venn' },
    })
    await withBrowserSession(client.post(`/api/v1/worlds/${world.slug}/adventures`), otherOwner, {
      csrf: true,
    }).json({
      creationRequestId: '33333333-3333-4333-8333-333333333333',
      player: { name: 'Someone Else' },
    })

    const response = await withBrowserSession(client.get(`/api/v1/worlds/${world.slug}`), owner)

    response.assertOk()
    response.assertBodyContains({
      data: {
        playability: { available: true, reason: null },
        adventures: [
          {
            id: (owned.body() as { data: { id: string } }).data.id,
            playerName: 'Mara Venn',
            status: 'opening_pending',
            turnCount: 0,
          },
        ],
      },
    })
    const serialized = JSON.stringify(response.body())
    assert.notInclude(serialized, 'Someone Else')
    assert.notInclude(serialized, author.email)
    assert.notInclude(serialized, version!.id)
    assert.notInclude(serialized, 'snapshot')
    assert.notInclude(serialized, 'adventureGuidance')
  })

  test('LC-003/S1/R2-S2 + R4-S1: an owner reads the minimized frozen Adventure projection', async ({
    client,
    assert,
  }) => {
    const author = await User.create({ email: 'api-read-author@example.com', password })
    const { world, version } = await createWorld({
      authorId: author.id,
      slug: 'api-read-world',
      visibility: 'public',
    })
    const browser = await createAuthenticatedBrowser(client, 'api-read-owner@example.com')
    const created = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      browser,
      { csrf: true }
    ).json({
      creationRequestId: '44444444-4444-4444-8444-444444444444',
      player: {
        name: 'Mara Venn',
        physicalDescription: 'A rain-dark coat.',
        backstory: 'Mara is looking for her brother.',
      },
    })
    const adventureId = (created.body() as { data: { id: string } }).data.id

    const response = await withBrowserSession(
      client.get(`/api/v1/adventures/${adventureId}`),
      browser
    )

    response.assertOk()
    response.assertBodyContains({
      data: {
        id: adventureId,
        status: 'opening_pending',
        sourceWorld: {
          slug: world.slug,
          name: world.name,
          worldVersionId: version!.id,
          startingPointKey: 'chapel-arrival',
        },
        player: {
          name: 'Mara Venn',
          currentLocation: { key: 'chapel-threshold', name: 'Chapel Threshold' },
        },
        scene: {
          location: { key: 'chapel-threshold', name: 'Chapel Threshold' },
          npcs: [{ key: 'warden-hale', name: 'Warden Hale' }],
        },
        story: [],
      },
    })
    const serialized = JSON.stringify(response.body())
    assert.notInclude(serialized, 'He knows who rang the bell.')
    assert.notInclude(serialized, 'privateKnowledge')
    assert.notInclude(serialized, 'snapshot')
    assert.notInclude(serialized, 'adventureGuidance')
  })

  test('LC-003/S1/R3-S3: an owner retries a terminal opening failure', async ({ client }) => {
    const ownerEmail = 'api-retry-owner@example.com'
    const browser = await createAuthenticatedBrowser(client, ownerEmail)
    const owner = await User.findByOrFail('email', ownerEmail)
    const { world } = await createWorld({ authorId: owner.id, slug: 'api-retry-world' })
    const created = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      browser,
      { csrf: true }
    ).json({
      creationRequestId: '55555555-5555-4555-8555-555555555555',
      player: { name: 'Mara Venn' },
    })
    const adventureId = (created.body() as { data: { id: string } }).data.id
    await db.from('adventure_jobs').where('adventure_id', adventureId).update({
      status: 'failed',
      attempt_count: 2,
      failure_code: 'provider_failure',
      failure_message: 'Opening generation failed.',
      updated_at: new Date(),
    })
    await db
      .from('adventures')
      .where('id', adventureId)
      .update({ status: 'opening_failed', updated_at: new Date() })

    const response = await withBrowserSession(
      client.post(`/api/v1/adventures/${adventureId}/opening/retry`),
      browser,
      { csrf: true }
    )

    response.assertOk()
    response.assertBody({
      data: { adventureId, status: 'opening_pending', generation: 1 },
    })
  })

  test('LC-003/S1/R4-S2: an owner resets a settled Adventure to a new opening generation', async ({
    client,
  }) => {
    const ownerEmail = 'api-reset-owner@example.com'
    const browser = await createAuthenticatedBrowser(client, ownerEmail)
    const owner = await User.findByOrFail('email', ownerEmail)
    const { world } = await createWorld({ authorId: owner.id, slug: 'api-reset-world' })
    const created = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      browser,
      { csrf: true }
    ).json({
      creationRequestId: '66666666-6666-4666-8666-666666666666',
      player: { name: 'Mara Venn' },
    })
    const adventureId = (created.body() as { data: { id: string } }).data.id
    await db
      .from('adventure_jobs')
      .where('adventure_id', adventureId)
      .update({ status: 'succeeded', updated_at: new Date() })
    await db
      .from('adventures')
      .where('id', adventureId)
      .update({ status: 'ready', updated_at: new Date() })

    const response = await withBrowserSession(
      client.post(`/api/v1/adventures/${adventureId}/reset`),
      browser,
      { csrf: true }
    )

    response.assertOk()
    response.assertBody({
      data: { adventureId, status: 'opening_pending', generation: 2 },
    })
  })

  test('LC-003/S1/R4-S3: an owner deletes only the selected Adventure', async ({ client }) => {
    const ownerEmail = 'api-delete-owner@example.com'
    const browser = await createAuthenticatedBrowser(client, ownerEmail)
    const owner = await User.findByOrFail('email', ownerEmail)
    const { world } = await createWorld({ authorId: owner.id, slug: 'api-delete-world' })
    const created = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      browser,
      { csrf: true }
    ).json({
      creationRequestId: '77777777-7777-4777-8777-777777777777',
      player: { name: 'Mara Venn' },
    })
    const adventureId = (created.body() as { data: { id: string } }).data.id

    const deleted = await withBrowserSession(
      client.delete(`/api/v1/adventures/${adventureId}`),
      browser,
      { csrf: true }
    )

    deleted.assertNoContent()
    const missing = await withBrowserSession(
      client.get(`/api/v1/adventures/${adventureId}`),
      browser
    )
    missing.assertStatus(404)
    const source = await withBrowserSession(client.get(`/api/v1/worlds/${world.slug}`), browser)
    source.assertOk()
    source.assertBodyContains({ data: { adventures: [] } })
  })

  test('LC-003/S1/R1-S3: anonymous Adventure API requests are denied without private data', async ({
    client,
    assert,
  }) => {
    const adventureId = '88888888-8888-4888-8888-888888888888'
    const responses = [
      await client.post('/api/v1/worlds/anonymous-world/adventures').json({
        creationRequestId: '99999999-9999-4999-8999-999999999999',
        player: { name: 'Mara Venn' },
      }),
      await client.get(`/api/v1/adventures/${adventureId}`),
      await client.post(`/api/v1/adventures/${adventureId}/opening/retry`),
      await client.post(`/api/v1/adventures/${adventureId}/reset`),
      await client.delete(`/api/v1/adventures/${adventureId}`),
    ]

    for (const response of responses) {
      response.assertStatus(401)
      assert.notProperty(response.body(), 'data')
    }
  })

  test('LC-003/S1/R1-S3: another account receives the same not-found response for every Adventure operation', async ({
    client,
    assert,
  }) => {
    const ownerEmail = 'api-private-owner@example.com'
    const ownerBrowser = await createAuthenticatedBrowser(client, ownerEmail)
    const owner = await User.findByOrFail('email', ownerEmail)
    const { world } = await createWorld({ authorId: owner.id, slug: 'api-private-world' })
    const created = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      ownerBrowser,
      { csrf: true }
    ).json({
      creationRequestId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      player: {
        name: 'Secret Player',
        backstory: 'This private history must never cross the account boundary.',
      },
    })
    const adventureId = (created.body() as { data: { id: string } }).data.id
    const otherBrowser = await createAuthenticatedBrowser(client, 'api-private-other@example.com')
    const unknownId = 'ffffffff-ffff-4fff-8fff-ffffffffffff'

    const inaccessible = [
      await withBrowserSession(client.get(`/api/v1/adventures/${adventureId}`), otherBrowser),
      await withBrowserSession(
        client.post(`/api/v1/adventures/${adventureId}/opening/retry`),
        otherBrowser,
        { csrf: true }
      ),
      await withBrowserSession(
        client.post(`/api/v1/adventures/${adventureId}/reset`),
        otherBrowser,
        { csrf: true }
      ),
      await withBrowserSession(client.delete(`/api/v1/adventures/${adventureId}`), otherBrowser, {
        csrf: true,
      }),
    ]
    const unknown = [
      await withBrowserSession(client.get(`/api/v1/adventures/${unknownId}`), otherBrowser),
      await withBrowserSession(
        client.post(`/api/v1/adventures/${unknownId}/opening/retry`),
        otherBrowser,
        { csrf: true }
      ),
      await withBrowserSession(client.post(`/api/v1/adventures/${unknownId}/reset`), otherBrowser, {
        csrf: true,
      }),
      await withBrowserSession(client.delete(`/api/v1/adventures/${unknownId}`), otherBrowser, {
        csrf: true,
      }),
    ]

    for (const [index, response] of inaccessible.entries()) {
      response.assertStatus(404)
      unknown[index].assertStatus(404)
      assert.deepEqual(response.body(), unknown[index].body())
      assert.notInclude(JSON.stringify(response.body()), 'Secret Player')
      assert.notInclude(JSON.stringify(response.body()), 'private history')
    }
    assert.isNotNull(await db.from('adventures').where('id', adventureId).first())
  })

  test('LC-003/S1/R1-S3 + R4: every authenticated Adventure mutation requires browser CSRF', async ({
    client,
    assert,
  }) => {
    const ownerEmail = 'api-csrf-owner@example.com'
    const browser = await createAuthenticatedBrowser(client, ownerEmail)
    const owner = await User.findByOrFail('email', ownerEmail)
    const { world } = await createWorld({ authorId: owner.id, slug: 'api-csrf-world' })
    const created = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      browser,
      { csrf: true }
    ).json({
      creationRequestId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      player: { name: 'Mara Venn' },
    })
    const adventureId = (created.body() as { data: { id: string } }).data.id

    const responses = [
      await withBrowserSession(
        client.post(`/api/v1/worlds/${world.slug}/adventures`),
        browser
      ).json({
        creationRequestId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        player: { name: 'No CSRF' },
      }),
      await withBrowserSession(
        client.post(`/api/v1/adventures/${adventureId}/opening/retry`),
        browser
      ),
      await withBrowserSession(client.post(`/api/v1/adventures/${adventureId}/reset`), browser),
      await withBrowserSession(client.delete(`/api/v1/adventures/${adventureId}`), browser),
    ]

    for (const response of responses) {
      response.assertStatus(403)
      assert.deepEqual(response.body(), {
        errors: [
          {
            code: 'INVALID_CSRF_TOKEN',
            message: 'Invalid or expired CSRF token.',
          },
        ],
      })
    }
  })

  test('LC-003/S1/R1-S2: Vine rejects invalid creation identity and bounded player fields before writes', async ({
    client,
    assert,
  }) => {
    const ownerEmail = 'api-validation-owner@example.com'
    const browser = await createAuthenticatedBrowser(client, ownerEmail)
    const owner = await User.findByOrFail('email', ownerEmail)
    const { world } = await createWorld({ authorId: owner.id, slug: 'api-validation-world' })

    const response = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      browser,
      { csrf: true }
    ).json({
      creationRequestId: 'not-a-uuid',
      player: {
        name: '   ',
        physicalDescription: 'p'.repeat(2_001),
        backstory: 'b'.repeat(8_001),
      },
    })

    response.assertStatus(422)
    const body = response.body() as unknown as { errors: Array<{ field: string }> }
    assert.includeMembers(
      body.errors.map((error) => error.field),
      ['creationRequestId', 'player.name', 'player.physicalDescription', 'player.backstory']
    )
    assert.lengthOf(await db.from('adventures').where('owner_id', owner.id), 0)
  })

  test('LC-003/S1/R1-S2: creation replay is stable and returns the original Adventure', async ({
    client,
    assert,
  }) => {
    const ownerEmail = 'api-idempotency-owner@example.com'
    const browser = await createAuthenticatedBrowser(client, ownerEmail)
    const owner = await User.findByOrFail('email', ownerEmail)
    const { world } = await createWorld({ authorId: owner.id, slug: 'api-idempotency-world' })
    const payload = {
      creationRequestId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      player: { name: 'Mara Venn' },
    }

    const first = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      browser,
      { csrf: true }
    ).json(payload)
    const replay = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      browser,
      { csrf: true }
    ).json(payload)

    first.assertCreated()
    replay.assertCreated()
    assert.deepEqual(replay.body(), first.body())
    const detail = await withBrowserSession(client.get(`/api/v1/worlds/${world.slug}`), browser)
    detail.assertOk()
    assert.lengthOf((detail.body() as { data: { adventures: unknown[] } }).data.adventures, 1)
  })

  test('LC-003/S1/R2-S3: an unplayable World remains inspectable and creation returns conflict', async ({
    client,
    assert,
  }) => {
    const ownerEmail = 'api-unplayable-owner@example.com'
    const browser = await createAuthenticatedBrowser(client, ownerEmail)
    const owner = await User.findByOrFail('email', ownerEmail)
    const { world } = await createWorld({
      authorId: owner.id,
      slug: 'api-unplayable-world',
      publish: false,
    })

    const detail = await withBrowserSession(client.get(`/api/v1/worlds/${world.slug}`), browser)
    detail.assertOk()
    detail.assertBodyContains({
      data: {
        playability: {
          available: false,
          reason: 'This World does not have a playable published version.',
        },
        adventures: [],
      },
    })

    const response = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      browser,
      { csrf: true }
    ).json({
      creationRequestId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      player: { name: 'Mara Venn' },
    })
    response.assertStatus(409)
    assert.deepEqual(response.body() as unknown, {
      errors: [
        {
          code: 'WORLD_NOT_PLAYABLE',
          message: 'This World is not currently playable.',
        },
      ],
    })
  })

  test('LC-003/S1/R4-S2: pending opening work returns stable lifecycle conflicts', async ({
    client,
    assert,
  }) => {
    const ownerEmail = 'api-busy-owner@example.com'
    const browser = await createAuthenticatedBrowser(client, ownerEmail)
    const owner = await User.findByOrFail('email', ownerEmail)
    const { world } = await createWorld({ authorId: owner.id, slug: 'api-busy-world' })
    const created = await withBrowserSession(
      client.post(`/api/v1/worlds/${world.slug}/adventures`),
      browser,
      { csrf: true }
    ).json({
      creationRequestId: '12121212-1212-4212-8212-121212121212',
      player: { name: 'Mara Venn' },
    })
    const adventureId = (created.body() as { data: { id: string } }).data.id

    const reset = await withBrowserSession(
      client.post(`/api/v1/adventures/${adventureId}/reset`),
      browser,
      { csrf: true }
    )
    const retry = await withBrowserSession(
      client.post(`/api/v1/adventures/${adventureId}/opening/retry`),
      browser,
      { csrf: true }
    )

    reset.assertStatus(409)
    assert.deepEqual(reset.body() as unknown, {
      errors: [
        {
          code: 'ADVENTURE_BUSY',
          message: 'Adventure cannot be reset while opening work is active.',
        },
      ],
    })
    retry.assertStatus(409)
    assert.deepEqual(retry.body() as unknown, {
      errors: [
        {
          code: 'ADVENTURE_NOT_RETRYABLE',
          message: 'Adventure opening is not ready to retry.',
        },
      ],
    })
  })

  test('LC-003/S1/R1-S3: malformed Adventure identities are non-disclosing not-found results', async ({
    client,
    assert,
  }) => {
    const browser = await createAuthenticatedBrowser(client, 'api-malformed-owner@example.com')
    const responses = [
      await withBrowserSession(client.get('/api/v1/adventures/not-a-uuid'), browser),
      await withBrowserSession(
        client.post('/api/v1/adventures/not-a-uuid/opening/retry'),
        browser,
        { csrf: true }
      ),
      await withBrowserSession(client.post('/api/v1/adventures/not-a-uuid/reset'), browser, {
        csrf: true,
      }),
      await withBrowserSession(client.delete('/api/v1/adventures/not-a-uuid'), browser, {
        csrf: true,
      }),
    ]

    for (const response of responses) {
      response.assertStatus(404)
      assert.deepEqual(response.body(), {
        errors: [{ code: 'ADVENTURE_NOT_FOUND', message: 'Adventure not found.' }],
      })
    }
  })
})
