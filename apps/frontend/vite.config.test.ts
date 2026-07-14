import { afterEach, describe, expect, it } from 'vitest'
import { resolveConfig } from 'vite'

const originalApiServerUrl = process.env.API_SERVER_URL

afterEach(() => {
  if (originalApiServerUrl === undefined) {
    delete process.env.API_SERVER_URL
  } else {
    process.env.API_SERVER_URL = originalApiServerUrl
  }
})

describe('development browser topology', () => {
  it('proxies same-origin API requests without exposing the backend address to browser code', async () => {
    process.env.API_SERVER_URL = 'http://backend.internal:3333'

    const config = await resolveConfig({ mode: 'test' }, 'serve')

    expect(config.server.proxy).toMatchObject({
      '/api': {
        target: 'http://backend.internal:3333',
      },
    })
    expect(config.env).not.toHaveProperty('API_SERVER_URL')
  })
})
