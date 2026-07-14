import { createContext, useContext } from 'react'
import type { Account, AuthApi } from './authApi'

export const sessionQueryKey = ['account-session'] as const

export type AuthContextValue = {
  account: Account | null
  api: AuthApi
  isLoading: boolean
  error: Error | null
  retry(): void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
