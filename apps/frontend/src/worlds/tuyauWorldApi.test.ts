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
  it('classifies an unauthorized catalog response', async () => {
    tuyau.listWorlds.mockRejectedValue({ status: 401 })
    const api = createTuyauWorldApi('http://frontend.example.test')

    await expect(api.listWorlds()).rejects.toMatchObject({ code: 'unauthorized' })
  })

  it('classifies an unauthorized detail response', async () => {
    tuyau.getWorld.mockRejectedValue({ status: 401 })
    const api = createTuyauWorldApi('http://frontend.example.test')

    await expect(api.getWorld('stormbound-chapel')).rejects.toMatchObject({
      code: 'unauthorized',
    })
  })
})
