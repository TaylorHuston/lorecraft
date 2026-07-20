import { createTuyau } from '@tuyau/core/client'
import { registry } from '@lorecraft/backend/registry'
import type { AdventureSummary, AdventureStatus } from '../adventures/adventureApi'
import {
  WorldApiError,
  type WorldApi,
  type WorldCatalogItem,
  type WorldCharacterField,
  type WorldCharacterInput,
  type WorldCharacterUpdateInput,
  type WorldDetail,
  type WorldSummary,
} from './worldApi'

const adventureStatuses = new Set<AdventureStatus>([
  'opening_pending',
  'opening_processing',
  'opening_failed',
  'ready',
])

function statusOf(error: unknown) {
  return typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
    ? error.status
    : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isWorldSummary(value: unknown): value is WorldSummary {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.slug === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    (value.visibility === 'public' || value.visibility === 'private') &&
    typeof value.readOnly === 'boolean'
  )
}

function isWorldLocation(value: unknown): value is WorldDetail['locations'][number] {
  return (
    isRecord(value) &&
    typeof value.key === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string'
  )
}

function isWorldCharacterLocation(
  value: unknown
): value is WorldDetail['characters'][number]['location'] {
  return (
    value === null ||
    (isRecord(value) && typeof value.key === 'string' && typeof value.name === 'string')
  )
}

function isWorldCharacter(value: unknown): value is WorldDetail['characters'][number] {
  return (
    isRecord(value) &&
    typeof value.key === 'string' &&
    typeof value.name === 'string' &&
    typeof value.physicalDescription === 'string' &&
    typeof value.background === 'string' &&
    typeof value.personality === 'string' &&
    typeof value.voice === 'string' &&
    typeof value.privateKnowledge === 'string' &&
    typeof value.initialMood === 'string' &&
    typeof value.initialStatus === 'string' &&
    typeof value.initialMemory === 'string' &&
    isWorldCharacterLocation(value.location)
  )
}

function isAdventureSummary(value: unknown): value is AdventureSummary {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.playerName === 'string' &&
    typeof value.status === 'string' &&
    adventureStatuses.has(value.status as AdventureStatus) &&
    typeof value.turnCount === 'number' &&
    typeof value.lastPlayedAt === 'string' &&
    typeof value.route === 'string'
  )
}

function isWorldPlayability(value: unknown): value is WorldDetail['playability'] {
  return (
    isRecord(value) &&
    typeof value.available === 'boolean' &&
    (value.reason === null || typeof value.reason === 'string')
  )
}

function isWorldCatalogItem(value: unknown): value is WorldCatalogItem {
  if (!isRecord(value)) return false
  const playability = value.playability
  const adventures = value.adventures
  return (
    isWorldSummary(value) &&
    isWorldPlayability(playability) &&
    Array.isArray(adventures) &&
    adventures.every(isAdventureSummary)
  )
}

function isWorldCatalog(value: unknown): value is WorldCatalogItem[] {
  return Array.isArray(value) && value.every(isWorldCatalogItem)
}

function isWorldDetail(value: unknown): value is WorldDetail {
  if (!isRecord(value)) return false
  const { playability, adventures, locations, characters } = value

  return (
    isWorldSummary(value) &&
    isWorldPlayability(playability) &&
    Array.isArray(adventures) &&
    adventures.every(isAdventureSummary) &&
    Array.isArray(locations) &&
    locations.every(isWorldLocation) &&
    Array.isArray(characters) &&
    characters.every(isWorldCharacter)
  )
}

function dataOf<T>(response: unknown, isData: (value: unknown) => value is T): T {
  if (!isRecord(response) || !('data' in response) || !isData(response.data)) {
    throw new WorldApiError('network', 'Lorecraft returned an invalid World response.')
  }
  return response.data
}

type ErrorEntry = {
  code?: string
  field?: string
  message?: string
}

function errorEntriesOf(error: unknown): ErrorEntry[] {
  if (!isRecord(error) || !isRecord(error.response) || !Array.isArray(error.response.errors)) {
    return []
  }
  return error.response.errors.filter(isRecord)
}

const characterFieldMessages: Record<WorldCharacterField, string> = {
  key: 'Use a unique lowercase key with letters, numbers, and hyphens only.',
  name: 'Enter a character name using 100 characters or fewer.',
  locationKey: 'Choose a Location in this World.',
  physicalDescription: 'Use 320 characters or fewer.',
  background: 'Use 700 characters or fewer.',
  personality: 'Use 320 characters or fewer.',
  voice: 'Use 240 characters or fewer.',
  privateKnowledge: 'Use 700 characters or fewer.',
  initialMood: 'Use 120 characters or fewer.',
  initialStatus: 'Use 320 characters or fewer.',
  initialMemory: 'Use 500 characters or fewer.',
}

function characterValidationError(error: unknown) {
  const fieldErrors: Partial<Record<WorldCharacterField, string>> = {}
  for (const entry of errorEntriesOf(error)) {
    if (typeof entry.field === 'string' && entry.field in characterFieldMessages) {
      const field = entry.field as WorldCharacterField
      fieldErrors[field] = characterFieldMessages[field]
    }
  }
  return new WorldApiError('validation', 'Correct the highlighted fields.', fieldErrors)
}

function mutationError(error: unknown, notFoundMessage: string) {
  if (statusOf(error) === 401) {
    return new WorldApiError('unauthorized', 'Your Lorecraft session has ended.')
  }
  if (statusOf(error) === 404) return new WorldApiError('not-found', notFoundMessage)
  if (
    statusOf(error) === 403 &&
    errorEntriesOf(error).some((entry) => entry.code === 'INVALID_CSRF_TOKEN')
  ) {
    return new WorldApiError(
      'csrf-expired',
      'Your secure Character request expired. Refresh the page and try again.'
    )
  }
  if (statusOf(error) === 422) return characterValidationError(error)
  return null
}

export function createTuyauWorldApi(baseUrl: string): WorldApi {
  const client = createTuyau({
    registry,
    baseUrl: baseUrl.replace(/\/$/, ''),
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  return {
    async listWorlds() {
      try {
        return dataOf(await client.api.worlds.index({}), isWorldCatalog)
      } catch (error) {
        if (statusOf(error) === 401) {
          throw new WorldApiError('unauthorized', 'Your Lorecraft session has ended.')
        }
        if (error instanceof WorldApiError) throw error
        throw new WorldApiError('network', 'Lorecraft could not load Worlds.')
      }
    },
    async getWorld(slug: string) {
      try {
        return dataOf(await client.api.worlds.show({ params: { slug } }), isWorldDetail)
      } catch (error) {
        if (statusOf(error) === 401) {
          throw new WorldApiError('unauthorized', 'Your Lorecraft session has ended.')
        }
        if (statusOf(error) === 404) throw new WorldApiError('not-found', 'World not found.')
        if (error instanceof WorldApiError) throw error
        throw new WorldApiError('network', 'Lorecraft could not load this World.')
      }
    },
    async createCharacter(slug: string, input: WorldCharacterInput) {
      try {
        await client.api.auth.csrf({})
        await client.api.worlds.storeCharacter({ params: { slug }, body: input })
      } catch (error) {
        const mapped = mutationError(error, 'World not found.')
        if (mapped) throw mapped
        if (error instanceof WorldApiError) throw error
        throw new WorldApiError('network', 'Lorecraft could not create this Character.')
      }
    },
    async updateCharacter(slug: string, key: string, input: WorldCharacterUpdateInput) {
      try {
        await client.api.auth.csrf({})
        await client.api.worlds.updateCharacter({ params: { slug, key }, body: input })
      } catch (error) {
        const mapped = mutationError(error, 'Character not found.')
        if (mapped) throw mapped
        if (error instanceof WorldApiError) throw error
        throw new WorldApiError('network', 'Lorecraft could not update this Character.')
      }
    },
    async deleteCharacter(slug: string, key: string) {
      try {
        await client.api.auth.csrf({})
        await client.api.worlds.destroyCharacter({ params: { slug, key } })
      } catch (error) {
        const mapped = mutationError(error, 'Character not found.')
        if (mapped) throw mapped
        if (error instanceof WorldApiError) throw error
        throw new WorldApiError('network', 'Lorecraft could not delete this Character.')
      }
    },
  }
}
