import { accountOwnedQueryKeyFor } from '../auth/accountQueryKeys'

export type WorldVisibility = 'public' | 'private'

export type WorldSummary = {
  id: number
  slug: string
  name: string
  description: string
  visibility: WorldVisibility
  readOnly: boolean
}

export type WorldLocation = {
  key: string
  name: string
  description: string
}

export type WorldCharacter = {
  key: string
  name: string
  physicalDescription: string
  background: string
  personality: string
  voice: string
  privateKnowledge: string
  location: Pick<WorldLocation, 'key' | 'name'> | null
}

export type WorldDetail = WorldSummary & {
  locations: WorldLocation[]
  characters: WorldCharacter[]
}

export interface WorldApi {
  listWorlds(): Promise<WorldSummary[]>
  getWorld(slug: string): Promise<WorldDetail>
}

export const worldQueryKeys = {
  catalog: (accountId: number) =>
    [...accountOwnedQueryKeyFor(accountId), 'worlds', 'catalog'] as const,
  detail: (accountId: number, slug: string) =>
    [...accountOwnedQueryKeyFor(accountId), 'worlds', 'detail', slug] as const,
}

export type WorldApiErrorCode = 'not-found' | 'unauthorized' | 'network'

export class WorldApiError extends Error {
  constructor(
    readonly code: WorldApiErrorCode,
    message: string
  ) {
    super(message)
    this.name = 'WorldApiError'
  }
}
