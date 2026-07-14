import { createTuyau } from '@tuyau/core/client'
import { registry } from '@lorecraft/backend/registry'
import {
  AuthApiError,
  type Account,
  type AuthApi,
  type SignInInput,
  type SignUpInput,
} from './authApi'

type ErrorEntry = {
  code?: string
  field?: string
  message?: string
}

function readErrorEntries(error: unknown): ErrorEntry[] {
  if (typeof error !== 'object' || error === null || !('response' in error)) return []
  const response = error.response
  if (typeof response !== 'object' || response === null || !('errors' in response)) return []
  return Array.isArray(response.errors) ? (response.errors as ErrorEntry[]) : []
}

function readStatus(error: unknown) {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined
  return typeof error.status === 'number' ? error.status : undefined
}

const rateLimitMessages = {
  signUp: 'Too many account creation attempts. Wait a few minutes and try again.',
  signIn: 'Too many sign-in attempts. Wait a few minutes and try again.',
  signOut: 'Too many sign-out attempts. Wait a few minutes and try again.',
} as const

function rateLimitError(error: unknown, operation: keyof typeof rateLimitMessages) {
  return readStatus(error) === 429
    ? new AuthApiError('rate-limited', rateLimitMessages[operation])
    : null
}

function accountFromResponse(response: unknown): Account {
  const wrapped =
    typeof response === 'object' && response !== null && 'data' in response
      ? response.data
      : response
  const accountLike =
    typeof wrapped === 'object' && wrapped !== null && 'user' in wrapped ? wrapped.user : wrapped

  if (
    typeof accountLike !== 'object' ||
    accountLike === null ||
    !('id' in accountLike) ||
    !('email' in accountLike) ||
    typeof accountLike.id !== 'number' ||
    typeof accountLike.email !== 'string'
  ) {
    throw new AuthApiError('network', 'Lorecraft returned an invalid account response.')
  }

  return { id: accountLike.id, email: accountLike.email }
}

function validationError(error: unknown) {
  const fieldErrors: Partial<Record<keyof SignUpInput, string>> = {}

  for (const entry of readErrorEntries(error)) {
    if (entry.field === 'email') fieldErrors.email = 'Enter a valid email address.'
    if (entry.field === 'password') fieldErrors.password = 'Use 12 to 128 characters.'
    if (entry.field === 'passwordConfirmation') {
      fieldErrors.passwordConfirmation = 'Passwords must match.'
    }
  }

  return new AuthApiError('validation', 'Correct the highlighted fields.', fieldErrors)
}

export function createTuyauAuthApi(baseUrl: string): AuthApi {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const client = createTuyau({
    registry,
    baseUrl: normalizedBaseUrl,
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  async function ensureCsrfCookie() {
    await client.api.auth.csrf({})
  }

  return {
    async restoreSession() {
      try {
        const response = await client.api.account.profile.show({})
        return accountFromResponse(response)
      } catch (error) {
        if (readStatus(error) === 401) return null
        if (error instanceof AuthApiError) throw error
        throw new AuthApiError('network', 'Lorecraft could not check the current session.')
      }
    },

    async signUp(input: SignUpInput) {
      try {
        await ensureCsrfCookie()
        const response = await client.api.auth.newAccount.store({
          body: input,
        })
        return accountFromResponse(response)
      } catch (error) {
        const throttled = rateLimitError(error, 'signUp')
        if (throttled) throw throttled
        const entries = readErrorEntries(error)
        if (
          readStatus(error) === 409 ||
          entries.some((entry) => entry.code === 'ACCOUNT_ALREADY_EXISTS')
        ) {
          throw new AuthApiError('duplicate-email', 'An account with this email already exists.')
        }
        if (readStatus(error) === 422) throw validationError(error)
        if (error instanceof AuthApiError) throw error
        throw new AuthApiError('network', 'Lorecraft could not create the account.')
      }
    },

    async signIn(input: SignInInput) {
      try {
        await ensureCsrfCookie()
        const response = await client.api.auth.sessions.store({
          body: input,
        })
        return accountFromResponse(response)
      } catch (error) {
        const throttled = rateLimitError(error, 'signIn')
        if (throttled) throw throttled
        if (readStatus(error) === 401) {
          throw new AuthApiError('invalid-credentials', 'Invalid email or password.')
        }
        if (readStatus(error) === 422) throw validationError(error)
        if (error instanceof AuthApiError) throw error
        throw new AuthApiError('network', 'Lorecraft could not sign in.')
      }
    },

    async signOut() {
      try {
        await ensureCsrfCookie()
        await client.api.account.sessions.destroy({})
      } catch (error) {
        const throttled = rateLimitError(error, 'signOut')
        if (throttled) throw throttled
        if (readStatus(error) === 401) return
        if (error instanceof AuthApiError) throw error
        throw new AuthApiError('network', 'Lorecraft could not sign out.')
      }
    },
  }
}
