import { afterEach, expect, it, vi } from 'vitest'
import { creationRequestId } from './creationRequestId'

const randomUuidDescriptor = Object.getOwnPropertyDescriptor(crypto, 'randomUUID')

afterEach(() => {
  vi.restoreAllMocks()
  if (randomUuidDescriptor) Object.defineProperty(crypto, 'randomUUID', randomUuidDescriptor)
})

it('LC-003/S1/R1-S1 creates a valid UUID v4 when randomUUID is unavailable', () => {
  Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: undefined })
  vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
    ;(array as Uint8Array).fill(0xab)
    return array
  })

  expect(creationRequestId()).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  )
})
