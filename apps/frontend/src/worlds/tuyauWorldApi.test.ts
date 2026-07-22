import { describe, expect, it, vi } from 'vitest'
import { createTuyauWorldApi } from './tuyauWorldApi'

const tuyau = vi.hoisted(() => ({
  csrf: vi.fn(),
  listWorlds: vi.fn(),
  getWorld: vi.fn(),
  createCharacter: vi.fn(),
  updateCharacter: vi.fn(),
  deleteCharacter: vi.fn(),
}))

vi.mock('@tuyau/core/client', () => ({
  createTuyau: () => ({
    api: {
      auth: { csrf: tuyau.csrf },
      worlds: {
        index: tuyau.listWorlds,
        show: tuyau.getWorld,
        storeCharacter: tuyau.createCharacter,
        updateCharacter: tuyau.updateCharacter,
        destroyCharacter: tuyau.deleteCharacter,
      },
    },
  }),
}))

describe('Tuyau World adapter', () => {
  it('returns catalog playability and owner Adventure summaries', async () => {
    tuyau.listWorlds.mockResolvedValue({
      data: [
        {
          id: 1,
          slug: 'stormbound-chapel',
          name: 'Stormbound Chapel',
          description: 'A storm-battered sanctuary.',
          visibility: 'public',
          readOnly: true,
          playability: { available: true, reason: null },
          adventures: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              playerName: 'Mara Venn',
              status: 'ready',
              turnCount: 3,
              lastPlayedAt: '2026-07-16T19:00:00.000Z',
              route: '/adventures/11111111-1111-4111-8111-111111111111',
            },
          ],
        },
      ],
    })
    const api = createTuyauWorldApi('http://frontend.example.test')

    await expect(api.listWorlds()).resolves.toMatchObject([
      {
        playability: { available: true },
        adventures: [{ playerName: 'Mara Venn', status: 'ready' }],
      },
    ])
  })

  it('rejects a malformed successful catalog response as a recoverable World API error', async () => {
    tuyau.listWorlds.mockResolvedValue({
      data: [
        {
          id: 1,
          slug: 'stormbound-chapel',
          name: 'Stormbound Chapel',
          description: 'A storm-battered sanctuary.',
          visibility: 'public',
          readOnly: 'yes',
        },
      ],
    })
    const api = createTuyauWorldApi('http://frontend.example.test')

    await expect(api.listWorlds()).rejects.toMatchObject({
      code: 'network',
      message: 'Lorecraft returned an invalid World response.',
    })
  })

  it('classifies an unauthorized catalog response', async () => {
    tuyau.listWorlds.mockRejectedValue({ status: 401 })
    const api = createTuyauWorldApi('http://frontend.example.test')

    await expect(api.listWorlds()).rejects.toMatchObject({ code: 'unauthorized' })
  })

  it('returns playable World detail with complete debug Character Cards and owner Adventures', async () => {
    tuyau.getWorld.mockResolvedValue({
      data: {
        id: 1,
        slug: 'stormbound-chapel',
        name: 'Stormbound Chapel',
        description: 'A storm-battered sanctuary.',
        visibility: 'public',
        readOnly: true,
        playability: { available: true, reason: null },
        adventures: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            playerName: 'Mara Venn',
            status: 'opening_pending',
            turnCount: 0,
            lastPlayedAt: '2026-07-16T18:30:00.000Z',
            route: '/adventures/11111111-1111-4111-8111-111111111111',
          },
        ],
        locations: [{ key: 'chapel', name: 'Chapel', description: 'Rain taps at the windows.' }],
        characters: [
          {
            key: 'mira',
            name: 'Mira',
            physicalDescription: 'A local woman with watchful eyes.',
            background: 'Mira grew up around the chapel.',
            personality: 'Cautious and observant.',
            voice: 'Plain-spoken and restrained.',
            privateKnowledge: 'Mira rang the bell before the storm arrived.',
            initialMood: 'Watchful',
            initialStatus: 'Sheltering in the chapel.',
            initialMemory: 'She has not yet met the player.',
            location: { key: 'chapel', name: 'Chapel' },
          },
        ],
      },
    })
    const api = createTuyauWorldApi('http://frontend.example.test')

    await expect(api.getWorld('stormbound-chapel')).resolves.toMatchObject({
      playability: { available: true, reason: null },
      adventures: [{ playerName: 'Mara Venn', status: 'opening_pending' }],
      characters: [{ name: 'Mira' }],
    })
  })

  it('accepts the complete private debug Character Card', async () => {
    tuyau.getWorld.mockResolvedValue({
      data: {
        id: 1,
        slug: 'stormbound-chapel',
        name: 'Stormbound Chapel',
        description: 'A storm-battered sanctuary.',
        visibility: 'public',
        readOnly: true,
        playability: { available: true, reason: null },
        adventures: [],
        locations: [{ key: 'chapel', name: 'Chapel', description: 'Rain taps at the windows.' }],
        characters: [
          {
            key: 'mira',
            name: 'Mira',
            physicalDescription: 'A local woman with watchful eyes.',
            background: 'Mira grew up around the chapel.',
            personality: 'Cautious and observant.',
            voice: 'Plain-spoken and restrained.',
            privateKnowledge: 'Mira rang the bell.',
            initialMood: 'Watchful',
            initialStatus: 'Sheltering in the chapel.',
            initialMemory: 'She has not yet met the player.',
            location: { key: 'chapel', name: 'Chapel' },
          },
        ],
      },
    })
    const api = createTuyauWorldApi('http://frontend.example.test')

    await expect(api.getWorld('stormbound-chapel')).resolves.toMatchObject({
      characters: [{ privateKnowledge: 'Mira rang the bell.' }],
    })
  })

  it('rejects a malformed successful detail response as a recoverable World API error', async () => {
    tuyau.getWorld.mockResolvedValue({
      data: {
        id: 1,
        slug: 'stormbound-chapel',
        name: 'Stormbound Chapel',
        description: 'A storm-battered sanctuary.',
        visibility: 'public',
        readOnly: true,
        locations: [{ key: 'chapel', name: 'Chapel', description: 'Rain taps at the windows.' }],
        characters: [
          {
            key: 'mira',
            name: 'Mira',
            physicalDescription: 'A local woman with watchful eyes.',
            background: 'Mira grew up around the chapel.',
            personality: 'Cautious and observant.',
            voice: 'Plain-spoken and restrained.',
            privateKnowledge: null,
            location: { key: 'chapel', name: 'Chapel' },
          },
        ],
      },
    })
    const api = createTuyauWorldApi('http://frontend.example.test')

    await expect(api.getWorld('stormbound-chapel')).rejects.toMatchObject({
      code: 'network',
      message: 'Lorecraft returned an invalid World response.',
    })
  })

  it('classifies an unauthorized detail response', async () => {
    tuyau.getWorld.mockRejectedValue({ status: 401 })
    const api = createTuyauWorldApi('http://frontend.example.test')

    await expect(api.getWorld('stormbound-chapel')).rejects.toMatchObject({
      code: 'unauthorized',
    })
  })

  it('requires every complete Character Card field in World detail', async () => {
    tuyau.getWorld.mockResolvedValue({
      data: {
        id: 1,
        slug: 'stormbound-chapel',
        name: 'Stormbound Chapel',
        description: 'A storm-battered sanctuary.',
        visibility: 'public',
        readOnly: true,
        playability: { available: true, reason: null },
        adventures: [],
        locations: [{ key: 'chapel', name: 'Chapel', description: 'Rain taps at the windows.' }],
        characters: [
          {
            key: 'mira',
            name: 'Mira',
            physicalDescription: 'A local woman with watchful eyes.',
            background: 'Mira grew up around the chapel.',
            personality: 'Cautious and observant.',
            voice: 'Plain-spoken and restrained.',
            privateKnowledge: 'Mira rang the bell.',
            initialMood: 'Watchful',
            initialStatus: 'Sheltering in the chapel.',
            location: { key: 'chapel', name: 'Chapel' },
          },
        ],
      },
    })

    await expect(
      createTuyauWorldApi('http://frontend.example.test').getWorld('stormbound-chapel')
    ).rejects.toMatchObject({
      code: 'network',
    })
  })

  it('uses CSRF-protected Character create, edit, and delete routes', async () => {
    tuyau.csrf.mockResolvedValue(undefined)
    tuyau.createCharacter.mockResolvedValue({ data: {} })
    tuyau.updateCharacter.mockResolvedValue({ data: {} })
    tuyau.deleteCharacter.mockResolvedValue(undefined)
    const api = createTuyauWorldApi('http://frontend.example.test')
    const input = {
      key: 'mira',
      name: 'Mira',
      locationKey: 'chapel',
      physicalDescription: 'A local woman with watchful eyes.',
      background: 'Mira grew up around the chapel.',
      personality: 'Cautious and observant.',
      voice: 'Plain-spoken and restrained.',
      privateKnowledge: 'Mira rang the bell.',
      initialMood: 'Watchful',
      initialStatus: 'Sheltering in the chapel.',
      initialMemory: 'She has not yet met the player.',
    }

    await api.createCharacter('stormbound-chapel', input)
    const { key, ...update } = input
    await api.updateCharacter('stormbound-chapel', key, update)
    await api.deleteCharacter('stormbound-chapel', key)

    expect(tuyau.csrf).toHaveBeenCalledTimes(3)
    expect(tuyau.createCharacter).toHaveBeenCalledWith({
      params: { slug: 'stormbound-chapel' },
      body: input,
    })
    expect(tuyau.updateCharacter).toHaveBeenCalledWith({
      params: { slug: 'stormbound-chapel', key },
      body: update,
    })
    expect(tuyau.deleteCharacter).toHaveBeenCalledWith({
      params: { slug: 'stormbound-chapel', key },
    })
  })

  it('LC-002/S3/R2-S2 maps a structured Character validation response to its exact editor field', async () => {
    tuyau.csrf.mockResolvedValue(undefined)
    tuyau.createCharacter.mockRejectedValue({
      status: 422,
      response: {
        errors: [
          {
            code: 'CHARACTER_VALIDATION_ERROR',
            field: 'key',
            message: 'Character key is already used in this World.',
          },
        ],
      },
    })
    const api = createTuyauWorldApi('http://frontend.example.test')

    await expect(
      api.createCharacter('stormbound-chapel', {
        key: 'mira',
        name: 'Mira',
        locationKey: 'chapel',
        physicalDescription: 'A local woman with watchful eyes.',
        background: 'Mira grew up around the chapel.',
        personality: 'Cautious and observant.',
        voice: 'Plain-spoken and restrained.',
        privateKnowledge: 'Mira rang the bell.',
        initialMood: 'Watchful',
        initialStatus: 'Sheltering in the chapel.',
        initialMemory: 'She has not yet met the player.',
      })
    ).rejects.toMatchObject({
      code: 'validation',
      fieldErrors: { key: 'Use a unique lowercase key with letters, numbers, and hyphens only.' },
    })
  })
})
