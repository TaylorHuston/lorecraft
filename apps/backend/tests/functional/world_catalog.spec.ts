import World from '#models/world'
import Location from '#models/location'
import Character from '#models/character'
import StartingPoint from '#models/starting_point'
import WorldVersion from '#models/world_version'
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

  test('LC-002/S2/R1-S1: a Character location must belong to its World', async ({ assert }) => {
    const author = await User.create({
      email: 'integrity-author@example.com',
      password: 'correct horse battery staple',
    })
    const firstWorld = await World.create({
      authorId: author.id,
      slug: 'integrity-first-world',
      name: 'Integrity First World',
      description: 'The Character belongs to this World.',
      visibility: 'private',
    })
    const secondWorld = await World.create({
      authorId: author.id,
      slug: 'integrity-second-world',
      name: 'Integrity Second World',
      description: 'The Location belongs to this World.',
      visibility: 'private',
    })
    const otherWorldLocation = await Location.create({
      worldId: secondWorld.id,
      key: 'other-world-location',
      name: 'Other World Location',
      description: 'A Location that cannot contain a Character from the first World.',
      sortOrder: 0,
    })

    await assert.rejects(
      () =>
        Character.create({
          worldId: firstWorld.id,
          locationId: otherWorldLocation.id,
          key: 'misplaced-character',
          name: 'Misplaced Character',
          physicalDescription: 'A Character used to verify relational integrity.',
          background: 'This Character should never be persisted across World boundaries.',
          personality: 'Careful.',
          voice: 'Direct.',
          privateKnowledge: 'None.',
          sortOrder: 0,
        }),
      /characters_world_id_location_id_foreign/
    )
  })

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
    await World.create({
      authorId: author.id,
      slug: 'private-author-world',
      name: 'Private Author World',
      description: 'A private World that must not be disclosed to another account.',
      visibility: 'private',
    })
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
    const inaccessible = await withBrowserSession(
      client.get('/api/v1/worlds/private-author-world'),
      viewer
    )
    inaccessible.assertStatus(404)
    inaccessible.assertBody({ errors: [{ code: 'WORLD_NOT_FOUND', message: 'World not found.' }] })
    assert.deepEqual(inaccessible.body(), missing.body())
    assert.notInclude(JSON.stringify(inaccessible.body()), author.email)
  })

  test('LC-002/S2/R1-S3: repeated starter seed reconciles one exact graph', async ({ assert }) => {
    const author = await User.create({
      email: 'seed-author@example.com',
      password: 'correct horse battery staple',
    })
    await seedStormboundChapel(author.email)
    const world = await World.findByOrFail('slug', 'stormbound-chapel')
    const initialVersionId = world.currentVersionId
    const staleLocation = await Location.create({
      worldId: world.id,
      key: 'stale-location',
      name: 'Stale Location',
      description: 'This Location is not part of the configured starter World.',
      sortOrder: 99,
    })
    await StartingPoint.create({
      worldId: world.id,
      locationId: staleLocation.id,
      key: 'stale-start',
      name: 'Stale Start',
      openingPremise: 'This Starting Point is not part of the configured starter World.',
      sortOrder: 99,
      isDefault: false,
    })
    await Character.create({
      worldId: world.id,
      locationId: staleLocation.id,
      key: 'stale-character',
      name: 'Stale Character',
      physicalDescription: 'This Character is not part of the configured starter World.',
      background: 'Created to verify stale graph reconciliation.',
      personality: 'Temporary.',
      voice: 'Temporary.',
      privateKnowledge: 'Temporary.',
      sortOrder: 99,
    })
    await World.query().where('id', world.id).update({
      name: 'Drifted World',
      description: 'Drifted World metadata.',
      visibility: 'private',
    })
    await Location.query()
      .where('worldId', world.id)
      .where('key', 'chapel')
      .update({ description: 'Drifted' })
    await Character.query()
      .where('worldId', world.id)
      .where('key', 'mira')
      .update({ voice: 'Drifted' })

    await seedStormboundChapel(author.email)

    const worlds = await World.query().where('slug', 'stormbound-chapel')
    assert.lengthOf(worlds, 1)
    const seededWorld = worlds[0]
    await seededWorld.load('locations', (query) => query.orderBy('sortOrder').orderBy('id'))
    await seededWorld.load('characters', (query) =>
      query.orderBy('sortOrder').orderBy('id').preload('location')
    )

    assert.deepEqual(
      {
        authorId: seededWorld.authorId,
        seedIdentity: seededWorld.seedIdentity,
        slug: seededWorld.slug,
        name: seededWorld.name,
        description: seededWorld.description,
        visibility: seededWorld.visibility,
      },
      {
        authorId: author.id,
        seedIdentity: 'starter-world:stormbound-chapel',
        slug: 'stormbound-chapel',
        name: 'Stormbound Chapel',
        description:
          'A small persistent-world test set around a chapel, a tavern, a vestry, and a rain-lashed graveyard.',
        visibility: 'public',
      }
    )
    assert.deepEqual(
      seededWorld.locations.map((location) => ({
        key: location.key,
        name: location.name,
        description: location.description,
        sortOrder: location.sortOrder,
      })),
      [
        {
          key: 'chapel',
          name: 'Chapel',
          description:
            'Rain taps against warped shutters. A cracked lantern hangs beside a stone altar, Mira waits near the aisle, and Brother Alden stands close to the altar with a ledger under one arm.',
          sortOrder: 0,
        },
        {
          key: 'vestry',
          name: 'Vestry',
          description:
            'The vestry smells of old paper and damp wool. A narrow desk sits under shelves of hymnals.',
          sortOrder: 1,
        },
        {
          key: 'graveyard',
          name: 'Graveyard',
          description: 'Tilted stones vanish into the rain. The chapel door glows behind you.',
          sortOrder: 2,
        },
        {
          key: 'tavern',
          name: 'Lantern & Bell Tavern',
          description:
            'Warm lamplight pools across scarred tables. Rain ticks against leaded windows, Rowan works behind the bar, and Lena sits near the hearth with a lute case under one boot.',
          sortOrder: 3,
        },
      ]
    )
    assert.deepEqual(
      seededWorld.characters.map((character) => ({
        key: character.key,
        name: character.name,
        locationKey: character.location.key,
        physicalDescription: character.physicalDescription,
        background: character.background,
        personality: character.personality,
        voice: character.voice,
        privateKnowledge: character.privateKnowledge,
        sortOrder: character.sortOrder,
      })),
      [
        {
          key: 'mira',
          name: 'Mira',
          locationKey: 'chapel',
          physicalDescription:
            'A local woman in practical rain-dark clothes, with damp dark hair and watchful eyes.',
          background:
            'Mira grew up around Stormbound Chapel and learned its routines from older caretakers. She has seen villagers dismiss old warnings as superstition, and she still carries guilt from once ignoring a sign she should have reported.',
          personality:
            'Cautious, observant, and slow to trust. Mira notices exits, strangers, and small changes before she speaks, and she tests whether someone is safe before sharing frightening truths.',
          voice:
            'Plain-spoken and restrained. Mira uses short warnings, practical details, and chapel or weather imagery. She avoids grand claims unless fear breaks through.',
          privateKnowledge:
            'Mira knows the storm began after the chapel bell rang at midnight, but she is afraid to say that plainly.',
          sortOrder: 0,
        },
        {
          key: 'brother-alden',
          name: 'Brother Alden',
          locationKey: 'chapel',
          physicalDescription:
            'A small, middle-aged priest in a patched black cassock, with ink-stained fingers and a careful stoop.',
          background:
            'Brother Alden has tended Stormbound Chapel for years, keeping records, repairing small damage, and quietly helping villagers who come in from the rain.',
          personality:
            'Gentle, nervous, and dutiful. Alden tries to calm frightened people before admitting how much he knows, and he dislikes open confrontation.',
          voice:
            'Soft and formal, with small apologies and careful religious phrasing. He often answers indirectly before gathering courage.',
          privateKnowledge:
            'Alden found a torn bell-rope fiber near the altar after midnight, but he has not told Mira because he fears accusing someone without proof.',
          sortOrder: 1,
        },
        {
          key: 'rowan',
          name: 'Rowan',
          locationKey: 'tavern',
          physicalDescription:
            'A broad-shouldered tavernkeeper with rolled sleeves, gray-shot hair, and a towel tucked through his belt.',
          background:
            'Rowan has kept the Lantern & Bell open through bad weather, bad harvests, and worse rumors. He knows which villagers drink quietly and which ones talk when the rain gets loud.',
          personality:
            'Practical, watchful, and protective of his regulars. Rowan is friendly enough to paying guests, but he notices trouble before he names it.',
          voice:
            'Dry and plainspoken, with tavern humor and short warnings. Rowan asks direct questions and rarely wastes words.',
          privateKnowledge:
            'Rowan heard someone pass the tavern toward the chapel shortly before the midnight bell, but he did not see their face.',
          sortOrder: 2,
        },
        {
          key: 'lena',
          name: 'Lena',
          locationKey: 'tavern',
          physicalDescription:
            'A wiry traveling minstrel in a weather-stained green cloak, with quick hands and sharper eyes than her songs suggest.',
          background:
            'Lena arrived in Stormbound two nights ago with a cracked lute, three half-finished songs, and no clear explanation for why she chose this road.',
          personality:
            'Curious, evasive, and amused by danger until it becomes personal. Lena collects rumors and tests strangers with jokes before offering truth.',
          voice:
            'Lyrical but sly. Lena answers with teasing images, half-rhymes, and sudden blunt admissions when cornered.',
          privateKnowledge:
            "Lena noticed the chapel bell's sound had two tones at midnight, as if something cracked after the first strike.",
          sortOrder: 3,
        },
      ]
    )
    assert.isNull(
      await Location.query().where('worldId', seededWorld.id).where('key', 'stale-location').first()
    )
    assert.isNull(
      await Character.query()
        .where('worldId', seededWorld.id)
        .where('key', 'stale-character')
        .first()
    )
    assert.isNull(
      await StartingPoint.query()
        .where('worldId', seededWorld.id)
        .where('key', 'stale-start')
        .first()
    )
    assert.equal(seededWorld.currentVersionId, initialVersionId)
    assert.lengthOf(await WorldVersion.query().where('worldId', seededWorld.id), 1)
  })

  test('LC-003/S1/R2-S1: starter seed publishes canonical Adventure guidance and a default Chapel Starting Point', async ({
    assert,
  }) => {
    const author = await User.create({
      email: 'playable-seed-author@example.com',
      password: 'correct horse battery staple',
    })

    await seedStormboundChapel(author.email)

    const world = await World.findByOrFail('slug', 'stormbound-chapel')
    const startingPoints = await StartingPoint.query()
      .where('worldId', world.id)
      .orderBy('sortOrder')
      .preload('location')
    const version = await WorldVersion.findOrFail(world.currentVersionId!)

    assert.equal(
      world.adventureGuidance,
      "Run Stormbound Chapel as a grounded gothic mystery. Keep the rain and isolation present, let clues emerge through exploration and conversation, preserve each character's voice and private knowledge, and never decide the player's actions."
    )
    assert.deepEqual(
      startingPoints.map((startingPoint) => ({
        key: startingPoint.key,
        name: startingPoint.name,
        locationKey: startingPoint.location.key,
        openingPremise: startingPoint.openingPremise,
        sortOrder: startingPoint.sortOrder,
        isDefault: startingPoint.isDefault,
      })),
      [
        {
          key: 'chapel-midnight',
          name: 'Midnight at the Chapel',
          locationKey: 'chapel',
          openingPremise:
            'The player reaches Stormbound Chapel as a midnight storm closes the road. The chapel bell has just rung without a hand on its rope, Mira is waiting in the aisle, and Brother Alden is hiding what he found beside the altar.',
          sortOrder: 0,
          isDefault: true,
        },
      ]
    )
    assert.equal(version.snapshot.world.adventureGuidance, world.adventureGuidance)
    assert.deepEqual(version.snapshot.startingPoints, [
      {
        key: 'chapel-midnight',
        name: 'Midnight at the Chapel',
        locationKey: 'chapel',
        openingPremise:
          'The player reaches Stormbound Chapel as a midnight storm closes the road. The chapel bell has just rung without a hand on its rope, Mira is waiting in the aisle, and Brother Alden is hiding what he found beside the altar.',
        sortOrder: 0,
        isDefault: true,
      },
    ])
  })

  test('LC-002/S2/R1-S3: an exact legacy starter graph receives immutable provenance', async ({
    assert,
  }) => {
    const author = await User.create({
      email: 'legacy-seed-author@example.com',
      password: 'correct horse battery staple',
    })
    await seedStormboundChapel(author.email)
    const world = await World.findByOrFail('slug', 'stormbound-chapel')
    await World.query().where('id', world.id).update({ seedIdentity: null })

    await seedStormboundChapel(author.email)

    await world.refresh()
    assert.equal(world.seedIdentity, 'starter-world:stormbound-chapel')
  })

  test('LC-002/S2/R1-S3: starter seed rejects a same-author unmarked lookalike', async ({
    assert,
  }) => {
    const author = await User.create({
      email: 'lookalike-author@example.com',
      password: 'correct horse battery staple',
    })
    const lookalike = await World.create({
      authorId: author.id,
      slug: 'stormbound-chapel',
      name: 'Stormbound Chapel',
      description:
        'A small persistent-world test set around a chapel, a tavern, a vestry, and a rain-lashed graveyard.',
      visibility: 'public',
    })
    const existingLocation = await Location.create({
      worldId: lookalike.id,
      key: 'existing-location',
      name: 'Existing Location',
      description: 'This Location belongs to the unmarked World and must remain untouched.',
      sortOrder: 0,
    })

    await assert.rejects(
      () => seedStormboundChapel(author.email),
      /reserved slug "stormbound-chapel" does not have the required seed identity/
    )

    await lookalike.refresh()
    assert.isNull(lookalike.seedIdentity)
    assert.equal(lookalike.name, 'Stormbound Chapel')
    assert.isNotNull(await Location.find(existingLocation.id))
    assert.lengthOf(await Character.query().where('worldId', lookalike.id), 0)
  })

  test('LC-002/S2/R1-S3: starter seed rejects an unrelated reserved-slug World', async ({
    assert,
  }) => {
    const existingAuthor = await User.create({
      email: 'existing-world-author@example.com',
      password: 'correct horse battery staple',
    })
    const seedAuthor = await User.create({
      email: 'different-seed-author@example.com',
      password: 'correct horse battery staple',
    })
    const existingWorld = await World.create({
      authorId: existingAuthor.id,
      slug: 'stormbound-chapel',
      name: 'An Unrelated World',
      description: 'Content that the starter seed must not replace.',
      visibility: 'private',
    })
    const existingLocation = await Location.create({
      worldId: existingWorld.id,
      key: 'existing-location',
      name: 'Existing Location',
      description: 'This Location must survive the rejected seed.',
      sortOrder: 0,
    })

    await assert.rejects(
      () => seedStormboundChapel(seedAuthor.email),
      /reserved slug "stormbound-chapel" is already in use/
    )

    await existingWorld.refresh()
    assert.equal(existingWorld.authorId, existingAuthor.id)
    assert.equal(existingWorld.name, 'An Unrelated World')
    assert.equal(existingWorld.description, 'Content that the starter seed must not replace.')
    assert.equal(existingWorld.visibility, 'private')
    assert.isNotNull(await Location.find(existingLocation.id))
    assert.lengthOf(await Character.query().where('worldId', existingWorld.id), 0)
  })
})
