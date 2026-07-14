import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../app/AppRoutes'
import { AuthProvider } from '../auth/AuthProvider'
import type { Account, AuthApi } from '../auth/authApi'
import type { WorldApi } from '../worlds/worldApi'

type RenderTestAppOptions = {
  route: string
  session: Account | null
  api?: Partial<AuthApi>
  worldApi?: Partial<WorldApi>
}

export function renderTestApp({
  route,
  session,
  api: overrides,
  worldApi: worldApiOverrides,
}: RenderTestAppOptions) {
  const api: AuthApi = {
    restoreSession: async () => session,
    signUp: async () => ({ id: 1, email: 'new@example.com' }),
    signIn: async () => ({ id: 1, email: 'account@example.com' }),
    signOut: async () => undefined,
    ...overrides,
  }
  const worldApi: WorldApi = {
    listWorlds: async () => [],
    getWorld: async () => {
      throw new Error('World detail was not configured for this test.')
    },
    ...worldApiOverrides,
  }
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false, retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider api={api}>
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes worldApi={worldApi} />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
