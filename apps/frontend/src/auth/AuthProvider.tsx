import { useQuery } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import type { AuthApi } from './authApi'
import { AuthContext, sessionQueryKey } from './authContext'

export type AuthProviderProps = PropsWithChildren<{
  api: AuthApi
}>

export function AuthProvider({ api, children }: AuthProviderProps) {
  const session = useQuery({
    queryKey: sessionQueryKey,
    queryFn: () => api.restoreSession(),
    retry: false,
    staleTime: 30_000,
  })

  return (
    <AuthContext.Provider
      value={{
        account: session.data ?? null,
        api,
        isLoading: session.isPending,
        error: session.error,
        retry: () => void session.refetch(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
