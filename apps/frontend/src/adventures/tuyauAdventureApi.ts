import { registry } from '@lorecraft/backend/registry'
import { createTuyau } from '@tuyau/core/client'
import {
  AdventureApiError,
  type AdventureApi,
  type AdventureDetail,
  type AdventureField,
  type AdventureLifecycleResult,
  type AdventureStatus,
  type AdventureSummary,
  type CreateAdventureInput,
} from './adventureApi'

const storeAdventureRoute = {
  methods: ['POST'],
  pattern: '/api/v1/worlds/:slug/adventures',
  tokens: [
    { old: '/api/v1/worlds/:slug/adventures', type: 0, val: 'api', end: '' },
    { old: '/api/v1/worlds/:slug/adventures', type: 0, val: 'v1', end: '' },
    { old: '/api/v1/worlds/:slug/adventures', type: 0, val: 'worlds', end: '' },
    { old: '/api/v1/worlds/:slug/adventures', type: 1, val: 'slug', end: '' },
    { old: '/api/v1/worlds/:slug/adventures', type: 0, val: 'adventures', end: '' },
  ],
  types: undefined,
} as const

const showAdventureRoute = {
  methods: ['GET', 'HEAD'],
  pattern: '/api/v1/adventures/:id',
  tokens: [
    { old: '/api/v1/adventures/:id', type: 0, val: 'api', end: '' },
    { old: '/api/v1/adventures/:id', type: 0, val: 'v1', end: '' },
    { old: '/api/v1/adventures/:id', type: 0, val: 'adventures', end: '' },
    { old: '/api/v1/adventures/:id', type: 1, val: 'id', end: '' },
  ],
  types: undefined,
} as const

const retryOpeningRoute = {
  methods: ['POST'],
  pattern: '/api/v1/adventures/:id/opening/retry',
  tokens: [
    { old: '/api/v1/adventures/:id/opening/retry', type: 0, val: 'api', end: '' },
    { old: '/api/v1/adventures/:id/opening/retry', type: 0, val: 'v1', end: '' },
    { old: '/api/v1/adventures/:id/opening/retry', type: 0, val: 'adventures', end: '' },
    { old: '/api/v1/adventures/:id/opening/retry', type: 1, val: 'id', end: '' },
    { old: '/api/v1/adventures/:id/opening/retry', type: 0, val: 'opening', end: '' },
    { old: '/api/v1/adventures/:id/opening/retry', type: 0, val: 'retry', end: '' },
  ],
  types: undefined,
} as const

const resetAdventureRoute = {
  methods: ['POST'],
  pattern: '/api/v1/adventures/:id/reset',
  tokens: [
    { old: '/api/v1/adventures/:id/reset', type: 0, val: 'api', end: '' },
    { old: '/api/v1/adventures/:id/reset', type: 0, val: 'v1', end: '' },
    { old: '/api/v1/adventures/:id/reset', type: 0, val: 'adventures', end: '' },
    { old: '/api/v1/adventures/:id/reset', type: 1, val: 'id', end: '' },
    { old: '/api/v1/adventures/:id/reset', type: 0, val: 'reset', end: '' },
  ],
  types: undefined,
} as const

const deleteAdventureRoute = {
  methods: ['DELETE'],
  pattern: '/api/v1/adventures/:id',
  tokens: showAdventureRoute.tokens,
  types: undefined,
} as const

const adventureRegistry = {
  ...registry,
  routes: {
    ...registry.routes,
    'adventures.store': storeAdventureRoute,
    'adventures.show': showAdventureRoute,
    'adventures.retry_opening': retryOpeningRoute,
    'adventures.reset': resetAdventureRoute,
    'adventures.destroy': deleteAdventureRoute,
  },
}

type AdventureTuyauClient = {
  api: {
    auth: {
      csrf(args: Record<string, never>): Promise<unknown>
    }
    adventures: {
      store(args: {
        params: { slug: string }
        body: CreateAdventureInput
      }): Promise<unknown>
      show(args: { params: { id: string } }): Promise<unknown>
      retryOpening(args: { params: { id: string } }): Promise<unknown>
      reset(args: { params: { id: string } }): Promise<unknown>
      destroy(args: { params: { id: string } }): Promise<unknown>
    }
  }
}

const adventureStatuses = new Set<AdventureStatus>([
  'opening_pending',
  'opening_processing',
  'opening_failed',
  'ready',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function statusOf(error: unknown) {
  return isRecord(error) && typeof error.status === 'number' ? error.status : undefined
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

const validationMessages: Record<AdventureField, string> = {
  creationRequestId: 'Start this Adventure again.',
  'player.name': 'Enter a player name using 100 characters or fewer.',
  'player.physicalDescription': 'Use 2,000 characters or fewer.',
  'player.backstory': 'Use 8,000 characters or fewer.',
}

function validationApiError(error: unknown) {
  const fieldErrors: Partial<Record<AdventureField, string>> = {}
  for (const entry of errorEntriesOf(error)) {
    if (typeof entry.field === 'string' && entry.field in validationMessages) {
      const field = entry.field as AdventureField
      fieldErrors[field] = validationMessages[field]
    }
  }
  return new AdventureApiError('validation', 'Correct the highlighted fields.', fieldErrors)
}

function sharedApiError(error: unknown, notFoundMessage: string) {
  if (statusOf(error) === 401) {
    return new AdventureApiError('unauthorized', 'Your Lorecraft session has ended.')
  }
  if (statusOf(error) === 404) {
    return new AdventureApiError('not-found', notFoundMessage)
  }
  if (
    statusOf(error) === 403 &&
    errorEntriesOf(error).some((entry) => entry.code === 'INVALID_CSRF_TOKEN')
  ) {
    return new AdventureApiError(
      'csrf-expired',
      'Your secure Adventure request expired. Refresh the page and try again.'
    )
  }
  if (statusOf(error) === 409) {
    const conflict = errorEntriesOf(error)[0]
    return new AdventureApiError(
      'conflict',
      conflict?.message ?? 'This Adventure cannot be changed in its current state.',
      {},
      conflict?.code
    )
  }
  if (statusOf(error) === 422) return validationApiError(error)
  return null
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

function isLocationIdentity(value: unknown): value is { key: string; name: string } {
  return isRecord(value) && typeof value.key === 'string' && typeof value.name === 'string'
}

function isSceneLocation(
  value: unknown
): value is { key: string; name: string; description: string } {
  return (
    isRecord(value) &&
    typeof value.key === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string'
  )
}

function isAdventureDetail(value: unknown): value is AdventureDetail {
  if (!isRecord(value)) return false
  const { sourceWorld, player, scene, story } = value

  return (
    typeof value.id === 'string' &&
    typeof value.status === 'string' &&
    adventureStatuses.has(value.status as AdventureStatus) &&
    typeof value.turnCount === 'number' &&
    typeof value.lastPlayedAt === 'string' &&
    typeof value.route === 'string' &&
    isRecord(sourceWorld) &&
    typeof sourceWorld.slug === 'string' &&
    typeof sourceWorld.name === 'string' &&
    typeof sourceWorld.worldVersionId === 'string' &&
    typeof sourceWorld.startingPointKey === 'string' &&
    typeof sourceWorld.route === 'string' &&
    isRecord(player) &&
    typeof player.name === 'string' &&
    (player.physicalDescription === null || typeof player.physicalDescription === 'string') &&
    (player.backstory === null || typeof player.backstory === 'string') &&
    typeof player.status === 'string' &&
    isLocationIdentity(player.currentLocation) &&
    isRecord(scene) &&
    isSceneLocation(scene.location) &&
    Array.isArray(scene.npcs) &&
    scene.npcs.every(
      (npc) =>
        isRecord(npc) &&
        typeof npc.key === 'string' &&
        typeof npc.name === 'string' &&
        typeof npc.physicalDescription === 'string' &&
        !('privateKnowledge' in npc)
    ) &&
    Array.isArray(story) &&
    story.every(
      (entry) =>
        isRecord(entry) &&
        typeof entry.id === 'string' &&
        typeof entry.kind === 'string' &&
        typeof entry.content === 'string'
    )
  )
}

function isAdventureLifecycleResult(value: unknown): value is AdventureLifecycleResult {
  return (
    isRecord(value) &&
    typeof value.adventureId === 'string' &&
    value.status === 'opening_pending' &&
    typeof value.generation === 'number'
  )
}

function dataOf<T>(response: unknown, isData: (value: unknown) => value is T): T {
  if (!isRecord(response) || !('data' in response) || !isData(response.data)) {
    throw new AdventureApiError('network', 'Lorecraft returned an invalid Adventure response.')
  }
  return response.data
}

export function createTuyauAdventureApi(baseUrl: string): AdventureApi {
  const client = createTuyau({
    registry: adventureRegistry as unknown as typeof registry,
    baseUrl: baseUrl.replace(/\/$/, ''),
    credentials: 'include',
    headers: { Accept: 'application/json' },
  }) as unknown as AdventureTuyauClient

  return {
    async createAdventure(worldSlug, input) {
      try {
        await client.api.auth.csrf({})
        return dataOf(
          await client.api.adventures.store({ params: { slug: worldSlug }, body: input }),
          isAdventureSummary
        )
      } catch (error) {
        const mapped = sharedApiError(error, 'World not found.')
        if (mapped) throw mapped
        if (error instanceof AdventureApiError) throw error
        throw new AdventureApiError('network', 'Lorecraft could not start this Adventure.')
      }
    },
    async getAdventure(adventureId) {
      try {
        return dataOf(
          await client.api.adventures.show({ params: { id: adventureId } }),
          isAdventureDetail
        )
      } catch (error) {
        const mapped = sharedApiError(error, 'Adventure not found.')
        if (mapped) throw mapped
        if (error instanceof AdventureApiError) throw error
        throw new AdventureApiError('network', 'Lorecraft could not load this Adventure.')
      }
    },
    async retryOpening(adventureId) {
      try {
        await client.api.auth.csrf({})
        return dataOf(
          await client.api.adventures.retryOpening({ params: { id: adventureId } }),
          isAdventureLifecycleResult
        )
      } catch (error) {
        const mapped = sharedApiError(error, 'Adventure not found.')
        if (mapped) throw mapped
        if (error instanceof AdventureApiError) throw error
        throw new AdventureApiError('network', 'Lorecraft could not retry this Adventure.')
      }
    },
    async resetAdventure(adventureId) {
      try {
        await client.api.auth.csrf({})
        return dataOf(
          await client.api.adventures.reset({ params: { id: adventureId } }),
          isAdventureLifecycleResult
        )
      } catch (error) {
        const mapped = sharedApiError(error, 'Adventure not found.')
        if (mapped) throw mapped
        if (error instanceof AdventureApiError) throw error
        throw new AdventureApiError('network', 'Lorecraft could not reset this Adventure.')
      }
    },
    async deleteAdventure(adventureId) {
      try {
        await client.api.auth.csrf({})
        await client.api.adventures.destroy({ params: { id: adventureId } })
      } catch (error) {
        const mapped = sharedApiError(error, 'Adventure not found.')
        if (mapped) throw mapped
        if (error instanceof AdventureApiError) throw error
        throw new AdventureApiError('network', 'Lorecraft could not delete this Adventure.')
      }
    },
  }
}
