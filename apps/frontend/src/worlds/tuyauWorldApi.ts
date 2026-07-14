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

function dataOf<T>(response: unknown): T {
  if (typeof response !== 'object' || response === null || !('data' in response)) {
    throw new WorldApiError('network', 'Lorecraft returned an invalid World response.')
  }
  return response.data as T
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
        return dataOf<WorldSummary[]>(await client.api.worlds.index({}))
      } catch (error) {
        if (error instanceof WorldApiError) throw error
        throw new WorldApiError('network', 'Lorecraft could not load Worlds.')
      }
    },
    async getWorld(slug: string) {
      try {
        return dataOf<WorldDetail>(await client.api.worlds.show({ params: { slug } }))
      } catch (error) {
        if (statusOf(error) === 404) throw new WorldApiError('not-found', 'World not found.')
        if (error instanceof WorldApiError) throw error
        throw new WorldApiError('network', 'Lorecraft could not load this World.')
      }
    },
  }
}
