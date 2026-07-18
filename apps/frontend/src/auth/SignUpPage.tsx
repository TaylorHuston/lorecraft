import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button/Button'
import { TextField } from '../components/TextField/TextField'
import { sessionQueryKey, useAuth } from './authContext'
import { AuthApiError, type SignUpInput } from './authApi'
import formStyles from './AuthForm.module.css'
import { AuthLayout } from './AuthLayout'
import { PasswordField } from './PasswordField'

type SignUpField = 'email' | 'password' | 'passwordConfirmation'
type SignUpErrors = Partial<Record<SignUpField, string>>

function validateSignUp(form: HTMLFormElement): SignUpErrors {
  const data = new FormData(form)
  const email = String(data.get('email') ?? '').trim()
  const password = String(data.get('password') ?? '')
  const passwordConfirmation = String(data.get('passwordConfirmation') ?? '')
  const errors: SignUpErrors = {}

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (password.length < 12) {
    errors.password = 'Use at least 12 characters.'
  }
  if (password !== passwordConfirmation) {
    errors.passwordConfirmation = 'Passwords must match.'
  }

  return errors
}

export function SignUpPage() {
  const { api } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<SignUpErrors>({})
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmationRef = useRef<HTMLInputElement>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const signUp = useMutation({
    mutationFn: (input: SignUpInput) => api.signUp(input),
    retry: false,
    onSuccess: async (account) => {
      await queryClient.cancelQueries({ queryKey: sessionQueryKey })
      queryClient.setQueryData(sessionQueryKey, account)
      navigate('/worlds', { replace: true })
    },
    onError: (error) => {
      if (error instanceof AuthApiError && error.code === 'duplicate-email') {
        setErrors({ email: 'An account with this email already exists.' })
        emailRef.current?.focus()
        return
      }

      if (error instanceof AuthApiError && error.code === 'rate-limited') {
        setFormError(error.message)
        return
      }

      if (error instanceof AuthApiError && error.code === 'csrf-expired') {
        setFormError(error.message)
        return
      }

      if (error instanceof AuthApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors)
        const firstField = Object.keys(error.fieldErrors)[0] as SignUpField
        const refs = {
          email: emailRef,
          password: passwordRef,
          passwordConfirmation: confirmationRef,
        }
        refs[firstField]?.current?.focus()
        return
      }

      setFormError('We couldn’t create your account. Check your connection and try again.')
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (signUp.isPending) return
    setFormError(null)
    const nextErrors = validateSignUp(event.currentTarget)
    setErrors(nextErrors)

    const firstInvalidField = (Object.keys(nextErrors) as SignUpField[])[0]
    const fieldRefs = {
      email: emailRef,
      password: passwordRef,
      passwordConfirmation: confirmationRef,
    }
    fieldRefs[firstInvalidField]?.current?.focus()

    if (firstInvalidField) return

    const data = new FormData(event.currentTarget)
    signUp.mutate({
      email: String(data.get('email')).trim().toLowerCase(),
      password: String(data.get('password')),
      passwordConfirmation: String(data.get('passwordConfirmation')),
    })
  }

  return (
    <AuthLayout
      title="Create your Lorecraft account"
      description="Use an email and password to open your private workspace."
      footer={
        <p>
          Already have an account? <Link to="/sign-in">Sign in instead</Link>
        </p>
      }
    >
      <form
        className={formStyles.form}
        noValidate
        onSubmit={handleSubmit}
        aria-describedby={formError ? 'signup-error' : undefined}
        aria-busy={signUp.isPending}
      >
        {formError ? (
          <p className={formStyles.formError} id="signup-error" role="alert" aria-atomic="true">
            {formError}
          </p>
        ) : null}
        <TextField
          ref={emailRef}
          id="signup-email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={errors.email}
          pending={signUp.isPending}
          supportingText="Email verification and recovery are not enabled yet. For local testing, any valid-looking email address will work."
        />

        <PasswordField
          ref={passwordRef}
          id="signup-password"
          label="Password"
          name="password"
          autoComplete="new-password"
          required
          error={errors.password}
          pending={signUp.isPending}
          supportingText={errors.password ? undefined : '12–128 characters.'}
        />

        <PasswordField
          ref={confirmationRef}
          id="signup-confirmation"
          label="Confirm password"
          name="passwordConfirmation"
          autoComplete="new-password"
          required
          error={errors.passwordConfirmation}
          pending={signUp.isPending}
        />

        <Button
          pending={signUp.isPending}
          pendingLabel="Creating account…"
          size="touch"
          type="submit"
        >
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
