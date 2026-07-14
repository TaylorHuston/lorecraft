export type Account = {
  id: number
  email: string
}

export type SignUpInput = {
  email: string
  password: string
  passwordConfirmation: string
}

export type SignInInput = Pick<SignUpInput, 'email' | 'password'>

export interface AuthApi {
  restoreSession(): Promise<Account | null>
  signUp(input: SignUpInput): Promise<Account>
  signIn(input: SignInInput): Promise<Account>
  signOut(): Promise<void>
}

export type AuthErrorCode =
  'duplicate-email' | 'invalid-credentials' | 'rate-limited' | 'validation' | 'network'

export class AuthApiError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string,
    readonly fieldErrors: Partial<Record<keyof SignUpInput, string>> = {}
  ) {
    super(message)
    this.name = 'AuthApiError'
  }
}
