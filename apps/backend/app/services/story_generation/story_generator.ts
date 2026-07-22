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
    initialMood: string
    initialStatus: string
    initialMemory: string
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
  npcCardCount?: number
  npcCardCharacterCount?: number
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

/** Local-only trace context. It never becomes provider evidence or persisted model-call metadata. */
export type StoryGenerationDebugContext = {
  trace: DevelopmentDebugTrace
  traceId: string
  operation: DevelopmentDebugTraceOperation
  adventureId: string
  jobId: string
  turnId?: string
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
  generateOpening(
    input: OpeningStoryInput,
    signal?: AbortSignal,
    debug?: StoryGenerationDebugContext
  ): Promise<StoryGenerationResult>
}
import type {
  DevelopmentDebugTrace,
  DevelopmentDebugTraceOperation,
} from './development_debug_trace.js'
