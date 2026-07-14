import { useQuery } from '@tanstack/react-query'
import { useEffect, type PropsWithChildren } from 'react'
import type { AuthApi } from './authApi'
import { AuthContext, sessionQueryKey } from './authContext'

export type AuthProviderProps = PropsWithChildren<{
  api: AuthApi
}>

export function AuthProvider({ api, children }: AuthProviderProps) {
  const session = useQuery({
    queryKey: sessionQueryKey,
    queryFn: () => api.restoreSession(),
    refetchOnWindowFocus: 'always',
    retry: false,
    staleTime: 30_000,
  })
  const refetchSession = session.refetch

  useEffect(() => {
    const revalidateSession = () => void refetchSession()

    window.addEventListener('focus', revalidateSession)
    return () => window.removeEventListener('focus', revalidateSession)
  }, [refetchSession])

  return (
    <AuthContext.Provider
      value={{
        account: session.data ?? null,
        api,
        isInitialError: session.isError && session.data === undefined,
        isLoading: session.isPending,
        isRevalidating: session.isRefetching,
        error: session.error,
        retry: () => void session.refetch(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
