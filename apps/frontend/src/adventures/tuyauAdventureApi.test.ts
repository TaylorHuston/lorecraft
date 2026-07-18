import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTuyauAdventureApi } from './tuyauAdventureApi'

const tuyau = vi.hoisted(() => ({
  csrf: vi.fn(),
  createAdventure: vi.fn(),
  getAdventure: vi.fn(),
  retryOpening: vi.fn(),
  resetAdventure: vi.fn(),
  deleteAdventure: vi.fn(),
}))

vi.mock('@tuyau/core/client', () => ({
  createTuyau: () => ({
    api: {
      auth: { csrf: tuyau.csrf },
      adventures: {
        store: tuyau.createAdventure,
        show: tuyau.getAdventure,
        retryOpening: tuyau.retryOpening,
        reset: tuyau.resetAdventure,
        destroy: tuyau.deleteAdventure,
      },
    },
  }),
}))

const summary = {
  id: '11111111-1111-4111-8111-111111111111',
  playerName: 'Mara Venn',
  status: 'opening_pending' as const,
  turnCount: 0,
  lastPlayedAt: '2026-07-16T18:30:00.000Z',
  route: '/adventures/11111111-1111-4111-8111-111111111111',
}

describe('Tuyau Adventure adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    tuyau.csrf.mockResolvedValue(undefined)
  })

  it('creates an Adventure through the reusable API contract', async () => {
    tuyau.createAdventure.mockResolvedValue({ data: summary })
    const api = createTuyauAdventureApi('http://frontend.example.test')
    const input = {
      creationRequestId: '22222222-2222-4222-8222-222222222222',
      player: {
        name: 'Mara Venn',
        physicalDescription: 'A rain-dark coat.',
        backstory: 'Mara is looking for her brother.',
      },
    }

    await expect(api.createAdventure('stormbound-chapel', input)).resolves.toEqual(summary)
    expect(tuyau.csrf).toHaveBeenCalledWith({})
    expect(tuyau.createAdventure).toHaveBeenCalledWith({
      params: { slug: 'stormbound-chapel' },
      body: input,
    })
  })

  it('reads the owner-safe Adventure projection', async () => {
    const detail = {
      id: summary.id,
      status: 'ready' as const,
      turnCount: 0,
      lastPlayedAt: summary.lastPlayedAt,
      route: summary.route,
      sourceWorld: {
        slug: 'stormbound-chapel',
        name: 'Stormbound Chapel',
        worldVersionId: '33333333-3333-4333-8333-333333333333',
        startingPointKey: 'chapel-arrival',
        route: '/worlds/stormbound-chapel',
      },
      player: {
        name: 'Mara Venn',
        physicalDescription: 'A rain-dark coat.',
        backstory: null,
        status: '',
        currentLocation: { key: 'chapel', name: 'Chapel' },
      },
      scene: {
        location: {
          key: 'chapel',
          name: 'Chapel',
          description: 'Rain taps at the windows.',
        },
        npcs: [
          {
            key: 'mira',
            name: 'Mira',
            physicalDescription: 'A local woman with watchful eyes.',
          },
        ],
      },
      story: [
        {
          id: '44444444-4444-4444-8444-444444444444',
          kind: 'opening',
          content: 'Thunder rolls over the chapel.',
        },
      ],
    }
    tuyau.getAdventure.mockResolvedValue({ data: detail })
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(api.getAdventure(summary.id)).resolves.toEqual(detail)
    expect(tuyau.getAdventure).toHaveBeenCalledWith({ params: { id: summary.id } })
    expect(tuyau.csrf).not.toHaveBeenCalled()
  })

  it('retries a failed opening through the lifecycle contract', async () => {
    const result = {
      adventureId: summary.id,
      status: 'opening_pending' as const,
      generation: 1,
    }
    tuyau.retryOpening.mockResolvedValue({ data: result })
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(api.retryOpening(summary.id)).resolves.toEqual(result)
    expect(tuyau.csrf).toHaveBeenCalledWith({})
    expect(tuyau.retryOpening).toHaveBeenCalledWith({ params: { id: summary.id } })
  })

  it('resets an Adventure through the lifecycle contract', async () => {
    const result = {
      adventureId: summary.id,
      status: 'opening_pending' as const,
      generation: 2,
    }
    tuyau.resetAdventure.mockResolvedValue({ data: result })
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(api.resetAdventure(summary.id)).resolves.toEqual(result)
    expect(tuyau.csrf).toHaveBeenCalledWith({})
    expect(tuyau.resetAdventure).toHaveBeenCalledWith({ params: { id: summary.id } })
  })

  it('deletes an Adventure through the lifecycle contract', async () => {
    tuyau.deleteAdventure.mockResolvedValue(undefined)
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(api.deleteAdventure(summary.id)).resolves.toBeUndefined()
    expect(tuyau.csrf).toHaveBeenCalledWith({})
    expect(tuyau.deleteAdventure).toHaveBeenCalledWith({ params: { id: summary.id } })
  })

  it('maps authentication failures to a stable unauthorized error', async () => {
    tuyau.getAdventure.mockRejectedValue({ status: 401 })
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(api.getAdventure(summary.id)).rejects.toMatchObject({
      code: 'unauthorized',
      message: 'Your Lorecraft session has ended.',
    })
  })

  it('maps non-disclosing missing Adventure responses to not found', async () => {
    tuyau.getAdventure.mockRejectedValue({ status: 404 })
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(api.getAdventure(summary.id)).rejects.toMatchObject({
      code: 'not-found',
      message: 'Adventure not found.',
    })
  })

  it('preserves stable lifecycle conflict reasons', async () => {
    tuyau.resetAdventure.mockRejectedValue({
      status: 409,
      response: {
        errors: [
          {
            code: 'ADVENTURE_BUSY',
            message: 'Adventure cannot be reset while opening work is active.',
          },
        ],
      },
    })
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(api.resetAdventure(summary.id)).rejects.toMatchObject({
      code: 'conflict',
      reason: 'ADVENTURE_BUSY',
      message: 'Adventure cannot be reset while opening work is active.',
    })
  })

  it('maps creation validation to stable field guidance', async () => {
    tuyau.createAdventure.mockRejectedValue({
      status: 422,
      response: {
        errors: [
          { field: 'creationRequestId' },
          { field: 'player.name' },
          { field: 'player.physicalDescription' },
          { field: 'player.backstory' },
        ],
      },
    })
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(
      api.createAdventure('stormbound-chapel', {
        creationRequestId: 'invalid',
        player: { name: '' },
      })
    ).rejects.toMatchObject({
      code: 'validation',
      message: 'Correct the highlighted fields.',
      fieldErrors: {
        creationRequestId: 'Start this Adventure again.',
        'player.name': 'Enter a player name using 100 characters or fewer.',
        'player.physicalDescription': 'Use 2,000 characters or fewer.',
        'player.backstory': 'Use 8,000 characters or fewer.',
      },
    })
  })

  it('maps rejected mutation CSRF to actionable recovery', async () => {
    tuyau.deleteAdventure.mockRejectedValue({
      status: 403,
      response: { errors: [{ code: 'INVALID_CSRF_TOKEN' }] },
    })
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(api.deleteAdventure(summary.id)).rejects.toMatchObject({
      code: 'csrf-expired',
      message: 'Your secure Adventure request expired. Refresh the page and try again.',
    })
  })

  it('maps transport failures to a stable network error', async () => {
    tuyau.getAdventure.mockRejectedValue(new Error('offline'))
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(api.getAdventure(summary.id)).rejects.toMatchObject({
      code: 'network',
      message: 'Lorecraft could not load this Adventure.',
    })
  })

  it('rejects malformed successful creation responses', async () => {
    tuyau.createAdventure.mockResolvedValue({
      data: { ...summary, status: 'deleted' },
    })
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(
      api.createAdventure('stormbound-chapel', {
        creationRequestId: '22222222-2222-4222-8222-222222222222',
        player: { name: 'Mara Venn' },
      })
    ).rejects.toMatchObject({
      code: 'network',
      message: 'Lorecraft returned an invalid Adventure response.',
    })
  })

  it('rejects malformed successful detail responses', async () => {
    tuyau.getAdventure.mockResolvedValue({ data: summary })
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(api.getAdventure(summary.id)).rejects.toMatchObject({
      code: 'network',
      message: 'Lorecraft returned an invalid Adventure response.',
    })
  })

  it('rejects malformed successful lifecycle responses', async () => {
    tuyau.retryOpening.mockResolvedValue({
      data: { adventureId: summary.id, status: 'ready', generation: 1 },
    })
    const api = createTuyauAdventureApi('http://frontend.example.test')

    await expect(api.retryOpening(summary.id)).rejects.toMatchObject({
      code: 'network',
      message: 'Lorecraft returned an invalid Adventure response.',
    })
  })
})
