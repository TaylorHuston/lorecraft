import type { AdventureStateExtractionInput } from './adventure_state_extractor.js'

export type AdventureStateExtractionPrompt = {
  system: string
  user: string
}

/**
 * Keeps extraction separate from narration generation: it receives staged prose
 * plus current structured state, never raw action/Guide input or story history.
 */
export function assembleAdventureStateExtractionPrompt(
  input: AdventureStateExtractionInput
): AdventureStateExtractionPrompt {
  return {
    system:
      'Extract only supported Adventure state proposals. Return strict JSON with a single "proposals" array and no markdown or commentary.',
    user: JSON.stringify({
      narration: input.narration,
      currentState: input.currentState,
      allowedProposalShapes: [
        { type: 'player_location', locationKey: 'existing-location-key' },
        {
          type: 'character_state',
          characterKey: 'existing-character-key',
          locationKey: 'optional-existing-location-key',
          mood: 'optional-bounded-text',
          currentStatus: 'optional-bounded-text',
          summarizedMemory: 'optional-bounded-text',
        },
      ],
    }),
  }
}
