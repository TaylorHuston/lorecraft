import User from '#models/user'
import { publishWorldVersionInTransaction } from '#services/world_version_publication_service'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

const locations = [
  [
    'chapel',
    'Chapel',
    'Rain taps against warped shutters. A cracked lantern hangs beside a stone altar, Mira waits near the aisle, and Brother Alden stands close to the altar with a ledger under one arm.',
  ],
  [
    'vestry',
    'Vestry',
    'The vestry smells of old paper and damp wool. A narrow desk sits under shelves of hymnals.',
  ],
  [
    'graveyard',
    'Graveyard',
    'Tilted stones vanish into the rain. The chapel door glows behind you.',
  ],
  [
    'tavern',
    'Lantern & Bell Tavern',
    'Warm lamplight pools across scarred tables. Rain ticks against leaded windows, Rowan works behind the bar, and Lena sits near the hearth with a lute case under one boot.',
  ],
] as const

const characters = [
  [
    'mira',
    'Mira',
    'chapel',
    'A local woman in practical rain-dark clothes, with damp dark hair and watchful eyes.',
    'Mira grew up around Stormbound Chapel and learned its routines from older caretakers. She has seen villagers dismiss old warnings as superstition, and she still carries guilt from once ignoring a sign she should have reported.',
    'Cautious, observant, and slow to trust. Mira notices exits, strangers, and small changes before she speaks, and she tests whether someone is safe before sharing frightening truths.',
    'Plain-spoken and restrained. Mira uses short warnings, practical details, and chapel or weather imagery. She avoids grand claims unless fear breaks through.',
    'Mira knows the storm began after the chapel bell rang at midnight, but she is afraid to say that plainly.',
    'Uneasy and alert.',
    'Watching the chapel doors.',
    'Mira has not yet spoken with the player.',
  ],
  [
    'brother-alden',
    'Brother Alden',
    'chapel',
    'A small, middle-aged priest in a patched black cassock, with ink-stained fingers and a careful stoop.',
    'Brother Alden has tended Stormbound Chapel for years, keeping records, repairing small damage, and quietly helping villagers who come in from the rain.',
    'Gentle, nervous, and dutiful. Alden tries to calm frightened people before admitting how much he knows, and he dislikes open confrontation.',
    'Soft and formal, with small apologies and careful religious phrasing. He often answers indirectly before gathering courage.',
    'Alden found a torn bell-rope fiber near the altar after midnight, but he has not told Mira because he fears accusing someone without proof.',
    'Nervous but trying to appear composed.',
    'Holding the ledger close to the altar.',
    'Brother Alden has not yet spoken with the player.',
  ],
  [
    'rowan',
    'Rowan',
    'tavern',
    'A broad-shouldered tavernkeeper with rolled sleeves, gray-shot hair, and a towel tucked through his belt.',
    'Rowan has kept the Lantern & Bell open through bad weather, bad harvests, and worse rumors. He knows which villagers drink quietly and which ones talk when the rain gets loud.',
    'Practical, watchful, and protective of his regulars. Rowan is friendly enough to paying guests, but he notices trouble before he names it.',
    'Dry and plainspoken, with tavern humor and short warnings. Rowan asks direct questions and rarely wastes words.',
    'Rowan heard someone pass the tavern toward the chapel shortly before the midnight bell, but he did not see their face.',
    'Wary of the worsening storm.',
    'Keeping the Lantern & Bell open for shelter.',
    'Rowan has not yet met the player.',
  ],
  [
    'lena',
    'Lena',
    'tavern',
    'A wiry traveling minstrel in a weather-stained green cloak, with quick hands and sharper eyes than her songs suggest.',
    'Lena arrived in Stormbound two nights ago with a cracked lute, three half-finished songs, and no clear explanation for why she chose this road.',
    'Curious, evasive, and amused by danger until it becomes personal. Lena collects rumors and tests strangers with jokes before offering truth.',
    'Lyrical but sly. Lena answers with teasing images, half-rhymes, and sudden blunt admissions when cornered.',
    "Lena noticed the chapel bell's sound had two tones at midnight, as if something cracked after the first strike.",
    'Curious and quietly amused.',
    'Listening for news beside the tavern hearth.',
    'Lena has not yet met the player.',
  ],
] as const

const starterWorldSeedIdentity = 'starter-world:stormbound-chapel'

const starterWorld = {
  slug: 'stormbound-chapel',
  name: 'Stormbound Chapel',
  description:
    'A small persistent-world test set around a chapel, a tavern, a vestry, and a rain-lashed graveyard.',
  visibility: 'public',
  adventureGuidance:
    "Run Stormbound Chapel as a grounded gothic mystery. Keep the rain and isolation present, let clues emerge through exploration and conversation, preserve each character's voice and private knowledge, and never decide the player's actions.",
} as const

const startingPoints = [
  {
    key: 'chapel-midnight',
    name: 'Midnight at the Chapel',
    locationKey: 'chapel',
    openingPremise:
      'The player reaches Stormbound Chapel as a midnight storm closes the road. The chapel bell has just rung without a hand on its rope, Mira is waiting in the aisle, and Brother Alden is hiding what he found beside the altar.',
    isDefault: true,
  },
] as const

async function isExactLegacyStarterWorld(trx: TransactionClientContract, worldId: number) {
  const persistedLocations = await trx
    .from('locations')
    .where('world_id', worldId)
    .orderBy('sort_order')
    .orderBy('id')
    .select('key', 'name', 'description', 'sort_order')
  const persistedCharacters = await trx
    .from('characters as characters')
    .join('locations as locations', 'locations.id', 'characters.location_id')
    .where('characters.world_id', worldId)
    .orderBy('characters.sort_order')
    .orderBy('characters.id')
    .select(
      'characters.key',
      'characters.name',
      'locations.key as location_key',
      'characters.physical_description',
      'characters.background',
      'characters.personality',
      'characters.voice',
      'characters.private_knowledge',
      'characters.sort_order'
    )

  const expectedLocations = locations.map(([key, name, description], sortOrder) => ({
    key,
    name,
    description,
    sort_order: sortOrder,
  }))
  const expectedCharacters = characters.map(
    (
      [
        key,
        name,
        locationKey,
        physicalDescription,
        background,
        personality,
        voice,
        privateKnowledge,
      ],
      sortOrder
    ) => ({
      key,
      name,
      location_key: locationKey,
      physical_description: physicalDescription,
      background,
      personality,
      voice,
      private_knowledge: privateKnowledge,
      sort_order: sortOrder,
    })
  )

  return (
    JSON.stringify(persistedLocations) === JSON.stringify(expectedLocations) &&
    JSON.stringify(persistedCharacters) === JSON.stringify(expectedCharacters)
  )
}

export async function seedStormboundChapel(authorEmail: string | undefined) {
  if (!authorEmail)
    throw new Error('STARTER_WORLD_AUTHOR_EMAIL is required to seed the starter World.')
  const author = await User.findBy('email', authorEmail.trim().toLowerCase())
  if (!author) throw new Error('STARTER_WORLD_AUTHOR_EMAIL does not match an existing account.')

  await db.transaction(async (trx) => {
    const existingWorld = await trx
      .from('worlds')
      .select('id', 'author_id', 'seed_identity', 'name', 'description', 'visibility')
      .where('slug', starterWorld.slug)
      .first()

    if (existingWorld && String(existingWorld.author_id) !== String(author.id)) {
      throw new Error(
        `Cannot seed the starter World because the reserved slug "${starterWorld.slug}" is already in use.`
      )
    }

    if (existingWorld && existingWorld.seed_identity !== starterWorldSeedIdentity) {
      const matchesLegacySeed =
        existingWorld.seed_identity === null &&
        existingWorld.name === starterWorld.name &&
        existingWorld.description === starterWorld.description &&
        existingWorld.visibility === starterWorld.visibility &&
        (await isExactLegacyStarterWorld(trx, existingWorld.id))

      if (!matchesLegacySeed) {
        throw new Error(
          `Cannot seed the starter World because the reserved slug "${starterWorld.slug}" does not have the required seed identity.`
        )
      }

      await trx
        .from('worlds')
        .where('id', existingWorld.id)
        .update({ seed_identity: starterWorldSeedIdentity, updated_at: new Date() })
      existingWorld.seed_identity = starterWorldSeedIdentity
    }

    let worldId: number
    if (existingWorld) {
      worldId = existingWorld.id
      await trx.from('worlds').where('id', worldId).update({
        slug: starterWorld.slug,
        name: starterWorld.name,
        description: starterWorld.description,
        visibility: starterWorld.visibility,
        adventure_guidance: starterWorld.adventureGuidance,
        updated_at: new Date(),
      })
    } else {
      const [world] = await trx
        .table('worlds')
        .insert({
          author_id: author.id,
          seed_identity: starterWorldSeedIdentity,
          slug: starterWorld.slug,
          name: starterWorld.name,
          description: starterWorld.description,
          visibility: starterWorld.visibility,
          adventure_guidance: starterWorld.adventureGuidance,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('id')
      worldId = world.id
    }
    const locationIds = new Map<string, number>()
    for (const [index, [key, name, description]] of locations.entries()) {
      const [row] = await trx
        .table('locations')
        .insert({
          world_id: worldId,
          key,
          name,
          description,
          sort_order: index,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .onConflict(['world_id', 'key'])
        .merge(['name', 'description', 'sort_order', 'updated_at'])
        .returning('id')
      locationIds.set(key, row.id)
    }
    for (const [sortOrder, startingPoint] of startingPoints.entries()) {
      await trx
        .table('world_starting_points')
        .insert({
          world_id: worldId,
          location_id: locationIds.get(startingPoint.locationKey)!,
          key: startingPoint.key,
          name: startingPoint.name,
          opening_premise: startingPoint.openingPremise,
          sort_order: sortOrder,
          is_default: startingPoint.isDefault,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .onConflict(['world_id', 'key'])
        .merge(['location_id', 'name', 'opening_premise', 'sort_order', 'is_default', 'updated_at'])
    }
    for (const [
      index,
      [
        key,
        name,
        locationKey,
        physicalDescription,
        background,
        personality,
        voice,
        privateKnowledge,
        initialMood,
        initialStatus,
        initialMemory,
      ],
    ] of characters.entries()) {
      await trx
        .table('characters')
        .insert({
          world_id: worldId,
          location_id: locationIds.get(locationKey)!,
          key,
          name,
          physical_description: physicalDescription,
          background,
          personality,
          voice,
          private_knowledge: privateKnowledge,
          initial_mood: initialMood,
          initial_status: initialStatus,
          initial_memory: initialMemory,
          sort_order: index,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .onConflict(['world_id', 'key'])
        .merge([
          'location_id',
          'name',
          'physical_description',
          'background',
          'personality',
          'voice',
          'private_knowledge',
          'initial_mood',
          'initial_status',
          'initial_memory',
          'sort_order',
          'updated_at',
        ])
    }
    await trx
      .from('characters')
      .where('world_id', worldId)
      .whereNotIn(
        'key',
        characters.map(([key]) => key)
      )
      .delete()
    await trx
      .from('world_starting_points')
      .where('world_id', worldId)
      .whereNotIn(
        'key',
        startingPoints.map(({ key }) => key)
      )
      .delete()
    await trx
      .from('locations')
      .where('world_id', worldId)
      .whereNotIn(
        'key',
        locations.map(([key]) => key)
      )
      .delete()

    await publishWorldVersionInTransaction(trx, worldId)
  })
}
