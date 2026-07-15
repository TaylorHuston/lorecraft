import { createTuyau } from '@tuyau/core/client'
import { registry } from '@lorecraft/backend/registry'
import { WorldApiError, type WorldApi, type WorldDetail, type WorldSummary } from './worldApi'

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

function isWorldCatalog(value: unknown): value is WorldSummary[] {
  return Array.isArray(value) && value.every(isWorldSummary)
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
    isWorldCharacterLocation(value.location)
  )
}

function isWorldDetail(value: unknown): value is WorldDetail {
  if (!isRecord(value)) return false
  const { locations, characters } = value

  return (
    isWorldSummary(value) &&
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
  }
}
