import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../auth/authContext'
import type { Account, AuthApi } from '../auth/authApi'

const defaultAccount: Account = {
  id: 1,
  email: 'keeper@lorecraft.test',
}

const defaultApi: AuthApi = {
  restoreSession: async () => defaultAccount,
  signUp: async (input) => ({ id: 2, email: input.email }),
  signIn: async (input) => ({ id: 1, email: input.email }),
  signOut: async () => undefined,
}

type StorybookAppProvidersProps = {
  children: ReactNode
  account?: Account | null
  api?: Partial<AuthApi>
  route?: string
}

export function StorybookAppProviders({
  children,
  account = defaultAccount,
  api: apiOverrides,
  route = '/',
}: StorybookAppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: false },
          mutations: { retry: false },
        },
      })
  )
  const api = { ...defaultApi, ...apiOverrides }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          account,
          api,
          isInitialError: false,
          isLoading: false,
          isRevalidating: false,
          error: null,
          retry: () => undefined,
        }}
      >
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}
