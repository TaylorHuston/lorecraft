export type OpeningStoryInput = {
  platformInstructions: string
  world: {
    name: string
    description: string
    adventureGuidance: string
  }
  startingPoint: {
    name: string
    openingPremise: string
  }
  player: {
    name: string
    physicalDescription: string | null
    backstory: string | null
  }
  startingLocation: {
    name: string
    description: string
  }
  charactersPresent: Array<{
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

export type StoryGenerationSettings = {
  temperature: number
  maxTokens: number
  topP?: number
  reasoningEffort?: 'none' | 'low' | 'medium' | 'high'
}

export type StoryGenerationRequestMetadata = {
  byteCount: number
  timeoutMs: number
}

export type StoryGenerationResponseMetadata = {
  byteCount: number
  statusCode: number | null
  finishReason?: string
  promptTokens?: number
  completionTokens?: number
  retryAfterMs?: number
}

export type StoryGenerationEvidence = {
  provider: string
  model: string
  settings: StoryGenerationSettings
  request: StoryGenerationRequestMetadata
  response: StoryGenerationResponseMetadata
}

export type StoryGenerationResult = StoryGenerationEvidence & {
  narration: string
}

export type StoryGenerationErrorCode =
  'timeout' | 'provider_failure' | 'malformed_response' | 'empty_narration' | 'cancelled'

export class StoryGenerationError extends Error {
  readonly name = 'StoryGenerationError'

  constructor(
    public readonly code: StoryGenerationErrorCode,
    message: string,
    public readonly evidence: StoryGenerationEvidence,
    public readonly providerStatus?: number
  ) {
    super(message)
  }
}

export interface StoryGenerator {
  generateOpening(input: OpeningStoryInput, signal?: AbortSignal): Promise<StoryGenerationResult>
}
