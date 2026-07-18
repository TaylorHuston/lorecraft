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

export type SanitizedStoryGenerationRequest = {
  method: 'POST'
  url: string
  headers: Record<string, string>
  body: Record<string, unknown>
  timeoutMs: number
}

export type StoryGenerationEvidence = {
  provider: string
  model: string
  settings: StoryGenerationSettings
  redactedRequest: SanitizedStoryGenerationRequest
  rawResponse: string | null
}

export type StoryGenerationResult = StoryGenerationEvidence & {
  narration: string
  rawResponse: string
}

export type StoryGenerationErrorCode =
  'timeout' | 'provider_failure' | 'malformed_response' | 'empty_narration'

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
  generateOpening(input: OpeningStoryInput): Promise<StoryGenerationResult>
}
