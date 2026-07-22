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
    initialMood?: string
    initialStatus?: string
    initialMemory?: string
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
    name?: string | null
    currentLocationKey: string
    physicalDescription?: string | null
    background?: string | null
    personality?: string | null
    voice?: string | null
    privateKnowledge?: string | null
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

  const characterStateByKey = new Map(
    input.currentState.characters.map((character) => [character.characterKey, character])
  )
  const presentCharacterKeys = new Set(
    input.currentState.characters
      .filter(
        (character) => character.currentLocationKey === input.currentState.player.currentLocationKey
      )
      .map((character) => character.characterKey)
  )

  return {
    frozenCanon: {
      world: { ...input.frozenCanon.world },
      locations: [...input.frozenCanon.locations]
        .sort(
          (left, right) => left.sortOrder - right.sortOrder || left.key.localeCompare(right.key)
        )
        .map((location) => ({ ...location })),
      characters: input.frozenCanon.characters
        .filter((character) => presentCharacterKeys.has(character.key))
        .map((character) => {
          const state = characterStateByKey.get(character.key)
          return {
            ...character,
            name: state?.name ?? character.name,
            physicalDescription: state?.physicalDescription ?? character.physicalDescription,
            background: state?.background ?? character.background,
            personality: state?.personality ?? character.personality,
            voice: state?.voice ?? character.voice,
            privateKnowledge: state?.privateKnowledge ?? character.privateKnowledge,
            initialMood: character.initialMood ?? '',
            initialStatus: character.initialStatus ?? '',
            initialMemory: character.initialMemory ?? '',
          }
        })
        .sort(
          (left, right) => left.sortOrder - right.sortOrder || left.key.localeCompare(right.key)
        ),
    },
    currentState: {
      player: { ...input.currentState.player },
      characters: [...characterStateByKey.values()]
        .filter((character) => presentCharacterKeys.has(character.characterKey))
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
