import { accountOwnedQueryKeyFor } from '../auth/accountQueryKeys'

export type AdventureStatus = 'opening_pending' | 'opening_processing' | 'opening_failed' | 'ready'

export type AdventureTurnTrigger = 'act' | 'pass' | 'guide'

export type AdventureTurnStatus = 'pending' | 'processing' | 'failed'

export type SubmitAdventureTurnInput = {
  requestId: string
  trigger: AdventureTurnTrigger
  input?: string
}

export type UpdateAdventureNpcStateInput = {
  name: string
  currentLocationKey: string
  physicalDescription: string
  background: string
  personality: string
  voice: string
  privateKnowledge: string
  mood: string
  status: string
  memory: string
}

export type UpdateAdventurePlayerStateInput = {
  name: string
  currentLocationKey: string
  physicalDescription: string
  backstory: string
  status: string
}

export type AdventureTurnSubmission = {
  id: string
  adventureId: string
  trigger: AdventureTurnTrigger
  status: AdventureTurnStatus | 'succeeded'
  route: string
}

export type AdventureTurnLifecycleResult = {
  id: string
  status: 'pending'
}

export type AdventureSummary = {
  id: string
  playerName: string
  status: AdventureStatus
  turnCount: number
  lastPlayedAt: string
  route: string
}

export type CreateAdventureInput = {
  creationRequestId: string
  player: {
    name: string
    physicalDescription?: string
    backstory?: string
  }
}

export type AdventureDetail = Omit<AdventureSummary, 'playerName'> & {
  sourceWorld: {
    slug: string
    name: string
    worldVersionId: string
    startingPointKey: string
    route: string
  }
  player: {
    name: string
    physicalDescription: string | null
    backstory: string | null
    status: string
    currentLocation: {
      key: string
      name: string
    }
  }
  scene: {
    location: {
      key: string
      name: string
      description: string
    }
    npcs: Array<{
      key: string
      name: string
      physicalDescription: string
      background: string
      personality: string
      voice: string
      privateKnowledge: string
      currentLocation: { key: string; name: string }
      mood: string
      status: string
      memory: string
    }>
  }
  activeTurn: {
    id: string
    trigger: AdventureTurnTrigger
    status: AdventureTurnStatus
    content: string | null
  } | null
  story: Array<{
    id: string
    kind: 'narration' | 'act' | 'pass' | 'guide'
    content: string
  }>
}

export type AdventureLifecycleResult = {
  adventureId: string
  status: 'opening_pending'
  generation: number
}

export interface AdventureApi {
  createAdventure(worldSlug: string, input: CreateAdventureInput): Promise<AdventureSummary>
  getAdventure(adventureId: string): Promise<AdventureDetail>
  retryOpening(adventureId: string): Promise<AdventureLifecycleResult>
  submitTurn(adventureId: string, input: SubmitAdventureTurnInput): Promise<AdventureTurnSubmission>
  retryTurn(adventureId: string, turnId: string): Promise<AdventureTurnLifecycleResult>
  discardTurn(adventureId: string, turnId: string): Promise<void>
  updateNpcState?(
    adventureId: string,
    characterKey: string,
    input: UpdateAdventureNpcStateInput
  ): Promise<AdventureDetail>
  updatePlayerState?(
    adventureId: string,
    input: UpdateAdventurePlayerStateInput
  ): Promise<AdventureDetail>
  resetAdventure(adventureId: string): Promise<AdventureLifecycleResult>
  deleteAdventure(adventureId: string): Promise<void>
}

export const adventureQueryKeys = {
  detail: (accountId: number, adventureId: string) =>
    [...accountOwnedQueryKeyFor(accountId), 'adventures', 'detail', adventureId] as const,
}

export type AdventureField =
  | 'creationRequestId'
  | 'requestId'
  | 'input'
  | 'name'
  | 'currentLocationKey'
  | 'physicalDescription'
  | 'background'
  | 'personality'
  | 'voice'
  | 'privateKnowledge'
  | 'mood'
  | 'status'
  | 'memory'
  | 'backstory'
  | 'player.name'
  | 'player.physicalDescription'
  | 'player.backstory'

export type AdventureApiErrorCode =
  'unauthorized' | 'not-found' | 'conflict' | 'validation' | 'csrf-expired' | 'network'

export class AdventureApiError extends Error {
  constructor(
    readonly code: AdventureApiErrorCode,
    message: string,
    readonly fieldErrors: Partial<Record<AdventureField, string>> = {},
    readonly reason?: string
  ) {
    super(message)
    this.name = 'AdventureApiError'
  }
}
