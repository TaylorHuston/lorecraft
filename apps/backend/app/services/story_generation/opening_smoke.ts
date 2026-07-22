import type { OpeningStoryInput, StoryGenerator } from './story_generator.js'

/** Synthetic, bounded context for a live provider acceptance check; never uses creator data. */
export const openingSmokeInput: OpeningStoryInput = {
  platformInstructions:
    "You are Lorecraft's Game Master. Write a complete opening in two concise paragraphs, between 130 and 220 words.",
  world: {
    name: 'Smoke-Test Harbor',
    description: 'A rainbound harbor town where the lighthouse lamp has gone dark.',
    adventureGuidance: 'Keep the scene grounded, atmospheric, and immediately playable.',
  },
  startingPoint: {
    name: 'The Dark Beacon',
    openingPremise: 'The player arrives as a bell rings from the unlit lighthouse.',
  },
  player: {
    name: 'Morgan Vale',
    physicalDescription: 'A traveler in a salt-stained coat.',
    backstory: 'Morgan came to investigate a missing family signal.',
  },
  startingLocation: {
    name: 'Harbor Quay',
    description: 'Wet cobbles lead from shuttered warehouses toward the silent lighthouse.',
  },
  charactersPresent: [
    {
      key: 'harbor-master',
      name: 'Iris Vale',
      physicalDescription: 'A stern harbor master with a brass spyglass.',
      background: 'Iris has kept the harbor safe through three storms.',
      personality: 'Practical, observant, and reluctant to panic.',
      voice: 'Direct and spare, with dry humor.',
      privateKnowledge: 'Iris saw a blue light move inside the sealed lighthouse.',
      initialMood: 'Uneasy but composed.',
      initialStatus: 'Watching the water for another signal.',
      initialMemory: 'Morgan has just arrived and has not yet spoken to Iris.',
      sortOrder: 0,
    },
    {
      key: 'dockhand',
      name: 'Tomas Reed',
      physicalDescription: 'A young dockhand carrying a coil of wet rope.',
      background: 'Tomas grew up among the quay warehouses.',
      personality: 'Earnest, nervous, and eager to be useful.',
      voice: 'Quick, plainspoken, and prone to unfinished thoughts.',
      privateKnowledge: "Tomas hid the lighthouse keeper's last letter under a crate.",
      initialMood: 'Frightened and alert.',
      initialStatus: 'Pretending to finish work before the rain worsens.',
      initialMemory: 'Tomas has not met Morgan before this evening.',
      sortOrder: 1,
    },
  ],
}

export function generateOpeningSmoke(generator: StoryGenerator) {
  return generator.generateOpening(openingSmokeInput)
}
