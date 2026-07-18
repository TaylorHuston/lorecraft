import Character from '#models/character'
import Location from '#models/location'
import User from '#models/user'
import World from '#models/world'
import { publishWorldVersion } from '#services/world_version_publication_service'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { createHash } from 'node:crypto'

test.group('WorldVersion publication', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-003/S1/R2-S1: publication creates a deterministic ordered snapshot and content hash', async ({
    assert,
  }) => {
    const author = await User.create({
      email: 'world-version-ordering@example.com',
      password: 'correct horse battery staple',
    })
    const world = await World.create({
      authorId: author.id,
      slug: 'ordered-world',
      name: 'Ordered World',
      description: 'Canon inserted out of order.',
      visibility: 'private',
      adventureGuidance: 'Keep the rain ominous and the clues grounded.',
    })
    const laterLocation = await Location.create({
      worldId: world.id,
      key: 'later-location',
      name: 'Later Location',
      description: 'This location sorts second.',
      sortOrder: 20,
    })
    const firstLocation = await Location.create({
      worldId: world.id,
      key: 'first-location',
      name: 'First Location',
      description: 'This location sorts first.',
      sortOrder: 10,
    })
    await Character.create({
      worldId: world.id,
      locationId: laterLocation.id,
      key: 'later-character',
      name: 'Later Character',
      physicalDescription: 'Second in the ordered snapshot.',
      background: 'Later background.',
      personality: 'Patient.',
      voice: 'Measured.',
      privateKnowledge: 'Later secret.',
      sortOrder: 20,
    })
    await Character.create({
      worldId: world.id,
      locationId: firstLocation.id,
      key: 'first-character',
      name: 'First Character',
      physicalDescription: 'First in the ordered snapshot.',
      background: 'First background.',
      personality: 'Alert.',
      voice: 'Direct.',
      privateKnowledge: 'First secret.',
      sortOrder: 10,
    })
    await db.table('world_starting_points').multiInsert([
      {
        world_id: world.id,
        location_id: laterLocation.id,
        key: 'later-start',
        name: 'Later Start',
        opening_premise: 'Begin later.',
        sort_order: 20,
        is_default: false,
        created_at: new Date(),
      },
      {
        world_id: world.id,
        location_id: firstLocation.id,
        key: 'first-start',
        name: 'First Start',
        opening_premise: 'Begin first.',
        sort_order: 10,
        is_default: true,
        created_at: new Date(),
      },
    ])

    const version = await publishWorldVersion(world.id)
    const expectedSnapshot = {
      schemaVersion: 1,
      world: {
        slug: 'ordered-world',
        name: 'Ordered World',
        description: 'Canon inserted out of order.',
        visibility: 'private',
        adventureGuidance: 'Keep the rain ominous and the clues grounded.',
      },
      locations: [
        {
          key: 'first-location',
          name: 'First Location',
          description: 'This location sorts first.',
          sortOrder: 10,
        },
        {
          key: 'later-location',
          name: 'Later Location',
          description: 'This location sorts second.',
          sortOrder: 20,
        },
      ],
      characters: [
        {
          key: 'first-character',
          name: 'First Character',
          locationKey: 'first-location',
          physicalDescription: 'First in the ordered snapshot.',
          background: 'First background.',
          personality: 'Alert.',
          voice: 'Direct.',
          privateKnowledge: 'First secret.',
          sortOrder: 10,
        },
        {
          key: 'later-character',
          name: 'Later Character',
          locationKey: 'later-location',
          physicalDescription: 'Second in the ordered snapshot.',
          background: 'Later background.',
          personality: 'Patient.',
          voice: 'Measured.',
          privateKnowledge: 'Later secret.',
          sortOrder: 20,
        },
      ],
      startingPoints: [
        {
          key: 'first-start',
          name: 'First Start',
          locationKey: 'first-location',
          openingPremise: 'Begin first.',
          sortOrder: 10,
          isDefault: true,
        },
        {
          key: 'later-start',
          name: 'Later Start',
          locationKey: 'later-location',
          openingPremise: 'Begin later.',
          sortOrder: 20,
          isDefault: false,
        },
      ],
    } as const
    const expectedSerialization = JSON.stringify(expectedSnapshot)

    assert.deepEqual(version.snapshot, expectedSnapshot)
    assert.equal(
      version.contentHash,
      createHash('sha256').update(expectedSerialization).digest('hex')
    )
    assert.equal(version.ordinal, 1)
    await world.refresh()
    assert.equal(world.currentVersionId, version.id)
  })

  test('LC-003/S1/R2-S1: publication rejects invalid stable keys before inserting a version', async ({
    assert,
  }) => {
    const author = await User.create({
      email: 'world-version-invalid-key@example.com',
      password: 'correct horse battery staple',
    })
    const world = await World.create({
      authorId: author.id,
      slug: 'invalid-key-world',
      name: 'Invalid Key World',
      description: 'Contains a malformed source key.',
      visibility: 'private',
      adventureGuidance: 'Reject malformed stable identity.',
    })
    await Location.create({
      worldId: world.id,
      key: 'Not A Stable Key',
      name: 'Malformed Location',
      description: 'This key must not enter an immutable snapshot.',
      sortOrder: 0,
    })

    await assert.rejects(
      () => publishWorldVersion(world.id),
      /Location stable key "Not A Stable Key" is invalid/
    )
    assert.lengthOf(await db.from('world_versions').where('world_id', world.id), 0)
    await world.refresh()
    assert.isNull(world.currentVersionId)
  })

  test('LC-003/S1/R2-S1: identical content reuses the existing immutable version', async ({
    assert,
  }) => {
    const author = await User.create({
      email: 'world-version-reuse@example.com',
      password: 'correct horse battery staple',
    })
    const world = await World.create({
      authorId: author.id,
      slug: 'reused-world',
      name: 'Reused World',
      description: 'Unchanged canon reuses content identity.',
      visibility: 'private',
      adventureGuidance: 'Preserve the source exactly.',
    })

    const firstPublication = await publishWorldVersion(world.id)
    const secondPublication = await publishWorldVersion(world.id)

    assert.equal(secondPublication.id, firstPublication.id)
    assert.equal(secondPublication.ordinal, 1)
    assert.lengthOf(await db.from('world_versions').where('world_id', world.id), 1)
  })

  test('LC-003/S1/R2-S2: changed content creates the next ordinal without changing the old snapshot', async ({
    assert,
  }) => {
    const author = await User.create({
      email: 'world-version-change@example.com',
      password: 'correct horse battery staple',
    })
    const world = await World.create({
      authorId: author.id,
      slug: 'changing-world',
      name: 'Changing World',
      description: 'Original canon.',
      visibility: 'private',
      adventureGuidance: 'Original guidance.',
    })
    const firstPublication = await publishWorldVersion(world.id)
    const originalRow = await db
      .from('world_versions')
      .where('id', firstPublication.id)
      .select(db.raw('snapshot::text as snapshot_text'))
      .firstOrFail()

    await World.query().where('id', world.id).update({ description: 'Corrected canon.' })
    const secondPublication = await publishWorldVersion(world.id)
    const preservedRow = await db
      .from('world_versions')
      .where('id', firstPublication.id)
      .select(db.raw('snapshot::text as snapshot_text'))
      .firstOrFail()

    assert.notEqual(secondPublication.id, firstPublication.id)
    assert.equal(secondPublication.ordinal, 2)
    assert.equal(secondPublication.snapshot.world.description, 'Corrected canon.')
    assert.equal(preservedRow.snapshot_text, originalRow.snapshot_text)
    assert.lengthOf(await db.from('world_versions').where('world_id', world.id), 2)
  })
})
