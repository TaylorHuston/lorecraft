import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button/Button'
import { TextField } from '../components/TextField/TextField'
import { sessionQueryKey, useAuth } from './authContext'
import { AuthApiError, type SignInInput } from './authApi'
import formStyles from './AuthForm.module.css'
import { AuthLayout } from './AuthLayout'
import { PasswordField } from './PasswordField'

type ReturnLocation = {
  from?: {
    pathname: string
    search?: string
    hash?: string
  }
}

export function SignInPage() {
  const { api } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignInInput, string>>>({})
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const signIn = useMutation({
    mutationFn: (input: SignInInput) => api.signIn(input),
    retry: false,
    onSuccess: async (account) => {
      await queryClient.cancelQueries({ queryKey: sessionQueryKey })
      queryClient.setQueryData(sessionQueryKey, account)
      const returnLocation = (location.state as ReturnLocation | null)?.from
      const destination = returnLocation
        ? `${returnLocation.pathname}${returnLocation.search ?? ''}${returnLocation.hash ?? ''}`
        : '/worlds'
      navigate(destination, { replace: true })
    },
    onError: (error) => {
      if (error instanceof AuthApiError && error.code === 'invalid-credentials') {
        setFormError('Email or password is incorrect. Try again.')
        passwordRef.current?.focus()
        return
      }

      if (error instanceof AuthApiError && error.code === 'rate-limited') {
        setFormError('Too many sign-in attempts. Wait a few minutes and try again.')
        return
      }

      if (error instanceof AuthApiError && error.code === 'csrf-expired') {
        setFormError(error.message)
        return
      }

      if (error instanceof AuthApiError && error.code === 'validation') {
        const nextFieldErrors = {
          email: error.fieldErrors.email,
          password: error.fieldErrors.password,
        }
        setFieldErrors(nextFieldErrors)
        setFormError('Check the highlighted fields and try again.')
        if (nextFieldErrors.email) emailRef.current?.focus()
        else if (nextFieldErrors.password) passwordRef.current?.focus()
        return
      }

      setFormError('We couldn’t reach Lorecraft. Check your connection and try again.')
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (signIn.isPending) return
    setFormError(null)
    setFieldErrors({})
    const data = new FormData(event.currentTarget)
    signIn.mutate({
      email: String(data.get('email')).trim().toLowerCase(),
      password: String(data.get('password')),
    })
  }

  return (
    <AuthLayout
      title="Sign in to Lorecraft"
      description="Return to your private World workspace."
      footer={
        <p>
          New to Lorecraft? <Link to="/sign-up">Create an account</Link>
        </p>
      }
    >
      <form
        className={formStyles.form}
        onSubmit={handleSubmit}
        aria-describedby={formError ? 'signin-error' : undefined}
        aria-busy={signIn.isPending}
      >
        {formError ? (
          <p className={formStyles.formError} id="signin-error" role="alert" aria-atomic="true">
            {formError}
          </p>
        ) : null}

        <TextField
          ref={emailRef}
          id="signin-email"
          label="Email"
          name="email"
          type="email"
          autoFocus
          autoComplete="email"
          required
          error={fieldErrors.email}
          pending={signIn.isPending}
        />

        <PasswordField
          ref={passwordRef}
          id="signin-password"
          label="Password"
          name="password"
          autoComplete="current-password"
          required
          error={fieldErrors.password}
          pending={signIn.isPending}
        />

        <Button pending={signIn.isPending} pendingLabel="Signing in…" size="touch" type="submit">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
