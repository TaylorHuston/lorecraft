import { describe, expect, it, vi } from 'vitest'
import { createTuyauWorldApi } from './tuyauWorldApi'

const tuyau = vi.hoisted(() => ({
  listWorlds: vi.fn(),
  getWorld: vi.fn(),
}))

vi.mock('@tuyau/core/client', () => ({
  createTuyau: () => ({
    api: {
      worlds: {
        index: tuyau.listWorlds,
        show: tuyau.getWorld,
      },
    },
  }),
}))

describe('Tuyau World adapter', () => {
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
})
