import type { StoryGenerationResult } from './story_generator.js'
import type { AdventureTurnContext } from './adventure_turn_context.js'

export type TurnStoryInput = {
  platformInstructions: string
  context: AdventureTurnContext
}

/** Generates staged narration only; it cannot propose or apply Adventure state changes. */
export interface TurnStoryGenerator {
  generateTurn(input: TurnStoryInput, signal?: AbortSignal): Promise<StoryGenerationResult>
}
