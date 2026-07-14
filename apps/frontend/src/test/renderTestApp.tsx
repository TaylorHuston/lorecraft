import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../app/AppRoutes'
import { AuthProvider } from '../auth/AuthProvider'
import type { Account, AuthApi } from '../auth/authApi'

type RenderTestAppOptions = {
  route: string
  session: Account | null
  api?: Partial<AuthApi>
}

export function renderTestApp({ route, session, api: overrides }: RenderTestAppOptions) {
  const api: AuthApi = {
    restoreSession: async () => session,
    signUp: async () => ({ id: 1, email: 'new@example.com' }),
    signIn: async () => ({ id: 1, email: 'account@example.com' }),
    signOut: async () => undefined,
    ...overrides,
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
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
