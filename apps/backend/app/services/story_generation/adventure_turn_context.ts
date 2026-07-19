import type { AdventureTurnTrigger } from '#models/adventure_turn'

const maximumHistoryEntries = 12
const maximumNarrationCharacters = 4_000

export type TurnFrozenCanon = {
  world: {
    name: string
    description: string
    adventureGuidance: string
  }
  locations: Array<{
    key: string
    name: string
    description: string
    sortOrder: number
  }>
  characters: Array<{
    key: string
    name: string
    physicalDescription: string
    background: string
    personality: string
    voice: string
    privateKnowledge: string
    sortOrder: number
  }>
}

export type AdventureTurnState = {
  player: {
    name: string
    physicalDescription: string | null
    backstory: string | null
    currentLocationKey: string
  }
  characters: Array<{
    characterKey: string
    currentLocationKey: string
    mood: string | null
    currentStatus: string | null
    summarizedMemory: string | null
  }>
}

export type StoryVisibleHistoryEntry = {
  sequence: number
  narration: string
}

export type AdventureTurnContextInput = {
  frozenCanon: TurnFrozenCanon
  currentState: AdventureTurnState
  trigger: AdventureTurnTrigger
  input: string | null
  storyHistory: ReadonlyArray<StoryVisibleHistoryEntry>
}

export type AdventureTurnContext = {
  frozenCanon: TurnFrozenCanon
  currentState: AdventureTurnState
  trigger: AdventureTurnTrigger
  input: string | null
  storyHistory: Array<StoryVisibleHistoryEntry>
}

function boundedNarration(narration: string): string {
  return narration.slice(0, maximumNarrationCharacters)
}

/**
 * Builds the provider-facing context from explicitly story-visible material only.
 * Raw prior Act/Guide inputs, Pass markers, model evidence, mutation diagnostics,
 * and operational lifecycle records are deliberately absent from the input shape.
 */
export function assembleAdventureTurnContext(
  input: AdventureTurnContextInput
): AdventureTurnContext {
  const storyHistory = [...input.storyHistory]
    .sort((left, right) => left.sequence - right.sequence)
    .slice(-maximumHistoryEntries)
    .map((entry) => ({
      sequence: entry.sequence,
      narration: boundedNarration(entry.narration),
    }))

  return {
    frozenCanon: {
      world: { ...input.frozenCanon.world },
      locations: [...input.frozenCanon.locations]
        .sort(
          (left, right) => left.sortOrder - right.sortOrder || left.key.localeCompare(right.key)
        )
        .map((location) => ({ ...location })),
      characters: [...input.frozenCanon.characters]
        .sort(
          (left, right) => left.sortOrder - right.sortOrder || left.key.localeCompare(right.key)
        )
        .map((character) => ({ ...character })),
    },
    currentState: {
      player: { ...input.currentState.player },
      characters: [...input.currentState.characters]
        .sort((left, right) => left.characterKey.localeCompare(right.characterKey))
        .map((character) => ({ ...character })),
    },
    trigger: input.trigger,
    input: input.trigger === 'pass' ? null : input.input,
    storyHistory,
  }
}

export const adventureTurnContextLimits = {
  maximumHistoryEntries,
  maximumNarrationCharacters,
} as const
