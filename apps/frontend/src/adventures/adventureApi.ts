import { accountOwnedQueryKeyFor } from '../auth/accountQueryKeys'

export type AdventureStatus =
  | 'opening_pending'
  | 'opening_processing'
  | 'opening_failed'
  | 'ready'

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
    }>
  }
  story: Array<{
    id: string
    kind: string
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
  resetAdventure(adventureId: string): Promise<AdventureLifecycleResult>
  deleteAdventure(adventureId: string): Promise<void>
}

export const adventureQueryKeys = {
  detail: (accountId: number, adventureId: string) =>
    [...accountOwnedQueryKeyFor(accountId), 'adventures', 'detail', adventureId] as const,
}

export type AdventureField =
  | 'creationRequestId'
  | 'player.name'
  | 'player.physicalDescription'
  | 'player.backstory'

export type AdventureApiErrorCode =
  | 'unauthorized'
  | 'not-found'
  | 'conflict'
  | 'validation'
  | 'csrf-expired'
  | 'network'

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
