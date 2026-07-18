import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiServerUrl = env.API_SERVER_URL || 'http://localhost:4311'

  return {
    plugins: [react()],
    server: {
      host: 'localhost',
      port: 4310,
      strictPort: true,
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
          url: 'http://localhost:4310',
        },
      },
      setupFiles: ['./src/test/setup.ts'],
      clearMocks: true,
      restoreMocks: true,
    },
  }
})
