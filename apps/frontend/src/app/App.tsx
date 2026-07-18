import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import type { AuthApi } from '../auth/authApi'
import type { AdventureApi } from '../adventures/adventureApi'
import type { WorldApi } from '../worlds/worldApi'
import { AppRoutes } from './AppRoutes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
})

export type AppProps = {
  api: AuthApi
  worldApi: WorldApi
  adventureApi?: AdventureApi
}

const missingAdventureApi: AdventureApi = {
  createAdventure: async () => {
    throw new Error('Adventure API is not configured.')
  },
  getAdventure: async () => {
    throw new Error('Adventure API is not configured.')
  },
  retryOpening: async () => {
    throw new Error('Adventure API is not configured.')
  },
  resetAdventure: async () => {
    throw new Error('Adventure API is not configured.')
  },
  deleteAdventure: async () => {
    throw new Error('Adventure API is not configured.')
  },
}

export function App({ api, worldApi, adventureApi = missingAdventureApi }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider api={api}>
        <BrowserRouter>
          <AppRoutes worldApi={worldApi} adventureApi={adventureApi} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
