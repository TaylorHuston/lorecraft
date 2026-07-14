import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiServerUrl = env.API_SERVER_URL || 'http://localhost:3333'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiServerUrl,
          changeOrigin: true,
        },
      },
    },
    test: {
      exclude: ['e2e/**'],
      environment: 'jsdom',
      environmentOptions: {
        jsdom: {
          url: 'http://localhost:5173',
        },
      },
      setupFiles: ['./src/test/setup.ts'],
      clearMocks: true,
      restoreMocks: true,
    },
  }
})
