import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, type PropsWithChildren } from 'react'
import type { AuthApi } from './authApi'
import { accountOwnedQueryKeyFor } from './accountQueryKeys'
import { AuthContext, sessionQueryKey } from './authContext'

export type AuthProviderProps = PropsWithChildren<{
  api: AuthApi
}>

export function AuthProvider({ api, children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const session = useQuery({
    queryKey: sessionQueryKey,
    queryFn: () => api.restoreSession(),
    // Session focus handling is explicit below so one browser return produces one request.
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30_000,
  })
  const refetchSession = session.refetch
  const previousAccountId = useRef<number | null>(null)
  const endSession = useCallback(() => {
    const accountId = session.data?.id

    void queryClient.cancelQueries({ queryKey: sessionQueryKey })
    if (accountId !== undefined) {
      queryClient.removeQueries({ queryKey: accountOwnedQueryKeyFor(accountId) })
    }
    queryClient.setQueryData(sessionQueryKey, null)
  }, [queryClient, session.data?.id])

  useEffect(() => {
    const accountId = session.data?.id ?? null
    const previousId = previousAccountId.current

    if (previousId !== null && previousId !== accountId) {
      queryClient.removeQueries({ queryKey: accountOwnedQueryKeyFor(previousId) })
    }

    previousAccountId.current = accountId
  }, [queryClient, session.data?.id])

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
        endSession,
        retry: () => void session.refetch(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
