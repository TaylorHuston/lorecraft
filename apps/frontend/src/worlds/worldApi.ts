import { accountOwnedQueryKeyFor } from '../auth/accountQueryKeys'
import type { AdventureSummary } from '../adventures/adventureApi'

export type WorldVisibility = 'public' | 'private'

export type WorldSummary = {
  id: number
  slug: string
  name: string
  description: string
  visibility: WorldVisibility
  readOnly: boolean
}

export type WorldCatalogItem = WorldSummary & {
  playability: WorldPlayability
  adventures: AdventureSummary[]
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
  location: Pick<WorldLocation, 'key' | 'name'> | null
}

export type WorldPlayability = {
  available: boolean
  reason: string | null
}

export type WorldDetail = WorldSummary & {
  playability: WorldPlayability
  adventures: AdventureSummary[]
  locations: WorldLocation[]
  characters: WorldCharacter[]
}

export interface WorldApi {
  listWorlds(): Promise<WorldCatalogItem[]>
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
