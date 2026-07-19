import type { AdventureTurnState } from './adventure_turn_context.js'
import type { StoryGenerationEvidence } from './story_generator.js'

const maximumExtractionBytes = 100_000
const maximumProposals = 24
const maximumMoodCharacters = 160
const maximumStatusCharacters = 500
const maximumMemoryCharacters = 2_000

export type PlayerLocationProposal = {
  type: 'player_location'
  locationKey: string
}

export type CharacterStateProposal = {
  type: 'character_state'
  characterKey: string
  locationKey?: string
  mood?: string
  currentStatus?: string
  summarizedMemory?: string
}

export type AdventureStateProposal = PlayerLocationProposal | CharacterStateProposal

export type AdventureStateExtraction = {
  proposals: AdventureStateProposal[]
}

export type AdventureStateExtractionInput = {
  narration: string
  currentState: AdventureTurnState
}

export type AdventureStateExtractionResult = StoryGenerationEvidence & {
  extraction: AdventureStateExtraction
}

export type AdventureStateExtractionErrorCode =
  'malformed_response' | 'cancelled' | 'timeout' | 'provider_failure'

/** Never contains raw provider output or private Adventure context. */
export class AdventureStateExtractionError extends Error {
  readonly name = 'AdventureStateExtractionError'

  constructor(
    public readonly code: AdventureStateExtractionErrorCode,
    message: string,
    public readonly evidence?: StoryGenerationEvidence,
    public readonly providerStatus?: number
  ) {
    super(message)
  }
}

/** Extracts untrusted, allowlisted state proposals; application policy decides whether they are accepted. */
export interface AdventureStateExtractor {
  extract(
    input: AdventureStateExtractionInput,
    signal?: AbortSignal
  ): Promise<AdventureStateExtractionResult>
}

function malformedResponse(): never {
  throw new AdventureStateExtractionError(
    'malformed_response',
    'Adventure state extractor returned a malformed response'
  )
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key))
}

function requiredNonBlankString(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) malformedResponse()
  return value.trim()
}

function optionalBoundedString(value: unknown, maximumCharacters: number): string | undefined {
  if (value === undefined) return undefined
  const normalized = requiredNonBlankString(value)
  if (normalized.length > maximumCharacters) malformedResponse()
  return normalized
}

function parseProposal(value: unknown): AdventureStateProposal {
  if (!isPlainObject(value) || typeof value.type !== 'string') malformedResponse()

  if (value.type === 'player_location') {
    if (!hasOnlyKeys(value, ['type', 'locationKey'])) malformedResponse()
    return { type: 'player_location', locationKey: requiredNonBlankString(value.locationKey) }
  }

  if (value.type === 'character_state') {
    if (
      !hasOnlyKeys(value, [
        'type',
        'characterKey',
        'locationKey',
        'mood',
        'currentStatus',
        'summarizedMemory',
      ])
    ) {
      malformedResponse()
    }

    const proposal: CharacterStateProposal = {
      type: 'character_state',
      characterKey: requiredNonBlankString(value.characterKey),
    }
    const locationKey = optionalBoundedString(value.locationKey, 160)
    const mood = optionalBoundedString(value.mood, maximumMoodCharacters)
    const currentStatus = optionalBoundedString(value.currentStatus, maximumStatusCharacters)
    const summarizedMemory = optionalBoundedString(value.summarizedMemory, maximumMemoryCharacters)
    if (!locationKey && !mood && !currentStatus && !summarizedMemory) malformedResponse()
    return {
      ...proposal,
      ...(locationKey === undefined ? {} : { locationKey }),
      ...(mood === undefined ? {} : { mood }),
      ...(currentStatus === undefined ? {} : { currentStatus }),
      ...(summarizedMemory === undefined ? {} : { summarizedMemory }),
    }
  }

  return malformedResponse()
}

/**
 * Validates only the extractor's narrow wire format. Referential checks, source
 * isolation, and field policy remain application responsibilities before any write.
 */
export function parseAdventureStateExtraction(raw: string): AdventureStateExtraction {
  if (Buffer.byteLength(raw, 'utf8') > maximumExtractionBytes) malformedResponse()

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return malformedResponse()
  }

  if (
    !isPlainObject(parsed) ||
    !hasOnlyKeys(parsed, ['proposals']) ||
    !Array.isArray(parsed.proposals)
  ) {
    return malformedResponse()
  }
  if (parsed.proposals.length > maximumProposals) malformedResponse()

  return { proposals: parsed.proposals.map(parseProposal) }
}

export const adventureStateExtractionLimits = {
  maximumExtractionBytes,
  maximumProposals,
  maximumMoodCharacters,
  maximumStatusCharacters,
  maximumMemoryCharacters,
} as const
