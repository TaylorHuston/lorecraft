import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import type { AuthApi } from '../auth/authApi'
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
}

export function App({ api, worldApi }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider api={api}>
        <BrowserRouter>
          <AppRoutes worldApi={worldApi} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
