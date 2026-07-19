import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../app/AppRoutes'
import { AuthProvider } from '../auth/AuthProvider'
import type { Account, AuthApi } from '../auth/authApi'
import type { AdventureApi } from '../adventures/adventureApi'
import type { WorldApi } from '../worlds/worldApi'

type RenderTestAppOptions = {
  route: string
  session: Account | null
  api?: Partial<AuthApi>
  worldApi?: Partial<WorldApi>
  adventureApi?: Partial<AdventureApi>
  adventurePollIntervalMs?: number
}

export function renderTestApp({
  route,
  session,
  api: overrides,
  worldApi: worldApiOverrides,
  adventureApi: adventureApiOverrides,
  adventurePollIntervalMs,
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
  const adventureApi: AdventureApi = {
    createAdventure: async () => {
      throw new Error('Adventure creation was not configured for this test.')
    },
    getAdventure: async () => {
      throw new Error('Adventure detail was not configured for this test.')
    },
    retryOpening: async () => {
      throw new Error('Adventure retry was not configured for this test.')
    },
    submitTurn: async () => {
      throw new Error('Adventure turn submission was not configured for this test.')
    },
    retryTurn: async () => {
      throw new Error('Adventure turn retry was not configured for this test.')
    },
    discardTurn: async () => {
      throw new Error('Adventure turn discard was not configured for this test.')
    },
    resetAdventure: async () => {
      throw new Error('Adventure reset was not configured for this test.')
    },
    deleteAdventure: async () => {
      throw new Error('Adventure deletion was not configured for this test.')
    },
    ...adventureApiOverrides,
  }

  const result = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider api={api}>
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes
            worldApi={worldApi}
            adventureApi={adventureApi}
            adventurePollIntervalMs={adventurePollIntervalMs}
          />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )

  return { ...result, queryClient }
}
