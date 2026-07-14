import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AuthApiError } from '../auth/authApi'
import { renderTestApp } from '../test/renderTestApp'

describe('account workspace entry', () => {
  it('LC-001/S3/R1-S1 redirects an anonymous workspace visit without rendering private content', async () => {
    renderTestApp({ route: '/worlds', session: null })

    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Worlds' })).not.toBeInTheDocument()
  })

  it('LC-001/S1/R1-S2 identifies invalid signup fields without submitting sensitive values', async () => {
    const user = userEvent.setup()
    const signUp = vi.fn()
    renderTestApp({ route: '/sign-up', session: null, api: { signUp } })

    expect(
      await screen.findByText(
        'Email verification and recovery are not enabled yet. For local testing, any valid-looking email address will work.'
      )
    ).toBeVisible()
    await user.type(await screen.findByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.type(screen.getByLabelText('Confirm password'), 'different')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByText('Enter a valid email address.')).toBeVisible()
    expect(screen.getByText('Use at least 12 characters.')).toBeVisible()
    expect(screen.getByText('Passwords must match.')).toBeVisible()
    expect(screen.getByLabelText('Email')).toHaveFocus()
    expect(signUp).not.toHaveBeenCalled()
  })

  it('LC-001/S1/R1-S1 + R2-S1 submits a normalized account and enters Worlds without bearer storage', async () => {
    const user = userEvent.setup()
    const signUp = vi.fn().mockResolvedValue({ id: 7, email: 'new@example.com' })
    renderTestApp({ route: '/sign-up', session: null, api: { signUp } })

    await user.type(await screen.findByLabelText('Email'), '  NEW@Example.com  ')
    await user.type(screen.getByLabelText('Password'), 'correct horse')
    await user.type(screen.getByLabelText('Confirm password'), 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('heading', { name: 'Worlds' })).toBeVisible()
    expect(signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'correct horse',
      passwordConfirmation: 'correct horse',
    })
    expect(window.localStorage).toHaveLength(0)
    expect(window.sessionStorage).toHaveLength(0)
  })

  it('LC-001/S1/R1-S3 presents an actionable duplicate-account response', async () => {
    const user = userEvent.setup()
    const signUp = vi
      .fn()
      .mockRejectedValue(new AuthApiError('duplicate-email', 'Account already exists'))
    renderTestApp({ route: '/sign-up', session: null, api: { signUp } })

    await user.type(await screen.findByLabelText('Email'), 'member@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct horse')
    await user.type(screen.getByLabelText('Confirm password'), 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('An account with this email already exists.')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Sign in instead' })).toHaveAttribute(
      'href',
      '/sign-in'
    )
    expect(screen.getByLabelText('Email')).toHaveFocus()
  })

  it('LC-001/S1/R1-S3 gives actionable recovery guidance when signup is throttled', async () => {
    const user = userEvent.setup()
    const signUp = vi
      .fn()
      .mockRejectedValue(
        new AuthApiError(
          'rate-limited',
          'Too many account creation attempts. Wait a few minutes and try again.'
        )
      )
    renderTestApp({ route: '/sign-up', session: null, api: { signUp } })

    await user.type(await screen.findByLabelText('Email'), 'member@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct horse')
    await user.type(screen.getByLabelText('Confirm password'), 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many account creation attempts. Wait a few minutes and try again.'
    )
    expect(screen.queryByText(/check your connection/i)).not.toBeInTheDocument()
  })

  it('LC-001/S1/R2-S1 gives actionable recovery guidance when signup CSRF expires', async () => {
    const user = userEvent.setup()
    const signUp = vi
      .fn()
      .mockRejectedValue(
        new AuthApiError(
          'csrf-expired',
          'Your secure signup form expired. Refresh the page and try again.'
        )
      )
    renderTestApp({ route: '/sign-up', session: null, api: { signUp } })

    await user.type(await screen.findByLabelText('Email'), 'member@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct horse')
    await user.type(screen.getByLabelText('Confirm password'), 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your secure signup form expired. Refresh the page and try again.'
    )
    expect(screen.queryByText(/check your connection/i)).not.toBeInTheDocument()
  })

  it('LC-001/S1/R1-S2 presents backend-only signup validation on the affected field', async () => {
    const user = userEvent.setup()
    const password = 'x'.repeat(129)
    const signUp = vi.fn().mockRejectedValue(
      new AuthApiError('validation', 'Correct the highlighted fields.', {
        password: 'Use 12 to 128 characters.',
      })
    )
    renderTestApp({ route: '/sign-up', session: null, api: { signUp } })

    await user.type(await screen.findByLabelText('Email'), 'member@example.com')
    await user.type(screen.getByLabelText('Password'), password)
    await user.type(screen.getByLabelText('Confirm password'), password)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('Use 12 to 128 characters.')).toBeVisible()
    expect(screen.getByLabelText('Password')).toHaveFocus()
    expect(screen.queryByText(/check your connection/i)).not.toBeInTheDocument()
    expect(signUp).toHaveBeenCalledWith({
      email: 'member@example.com',
      password,
      passwordConfirmation: password,
    })
  })

  it('LC-001/S2/R1-S1 signs in with valid credentials and opens Worlds', async () => {
    const user = userEvent.setup()
    const signIn = vi.fn().mockResolvedValue({ id: 4, email: 'member@example.com' })
    renderTestApp({ route: '/sign-in', session: null, api: { signIn } })

    await user.type(await screen.findByLabelText('Email'), ' MEMBER@example.com ')
    await user.type(screen.getByLabelText('Password'), 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'Worlds' })).toBeVisible()
    expect(signIn).toHaveBeenCalledWith({
      email: 'member@example.com',
      password: 'correct horse',
    })
  })

  it('LC-001/S2/R1-S2 uses one generic response for invalid credentials', async () => {
    const user = userEvent.setup()
    const signIn = vi
      .fn()
      .mockRejectedValue(new AuthApiError('invalid-credentials', 'Email was not found'))
    renderTestApp({ route: '/sign-in', session: null, api: { signIn } })

    await user.type(await screen.findByLabelText('Email'), 'unknown@example.com')
    await user.type(screen.getByLabelText('Password'), 'incorrect')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email or password is incorrect. Try again.'
    )
    expect(screen.queryByText('Email was not found')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveFocus()
  })

  it('LC-001/S2/R1-S2 gives actionable recovery guidance when sign-in is throttled', async () => {
    const user = userEvent.setup()
    const signIn = vi
      .fn()
      .mockRejectedValue(
        new AuthApiError(
          'rate-limited',
          'Too many sign-in attempts. Wait a few minutes and try again.'
        )
      )
    renderTestApp({ route: '/sign-in', session: null, api: { signIn } })

    await user.type(await screen.findByLabelText('Email'), 'member@example.com')
    await user.type(screen.getByLabelText('Password'), 'incorrect')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many sign-in attempts. Wait a few minutes and try again.'
    )
    expect(screen.queryByText(/check your connection/i)).not.toBeInTheDocument()
  })

  it('LC-001/S2/R1-S1 gives actionable recovery guidance when sign-in CSRF expires', async () => {
    const user = userEvent.setup()
    const signIn = vi
      .fn()
      .mockRejectedValue(
        new AuthApiError(
          'csrf-expired',
          'Your secure sign-in form expired. Refresh the page and try again.'
        )
      )
    renderTestApp({ route: '/sign-in', session: null, api: { signIn } })

    await user.type(await screen.findByLabelText('Email'), 'member@example.com')
    await user.type(screen.getByLabelText('Password'), 'incorrect')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your secure sign-in form expired. Refresh the page and try again.'
    )
    expect(screen.queryByText(/check your connection/i)).not.toBeInTheDocument()
  })

  it('LC-001/S2/R1-S2 presents server sign-in validation on the affected fields', async () => {
    const user = userEvent.setup()
    const signIn = vi.fn().mockRejectedValue(
      new AuthApiError('validation', 'Correct the highlighted fields.', {
        email: 'Enter a valid email address.',
      })
    )
    renderTestApp({ route: '/sign-in', session: null, api: { signIn } })

    await user.type(await screen.findByLabelText('Email'), 'invalid@example')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Check the highlighted fields and try again.')).toBeVisible()
    expect(screen.getByText('Enter a valid email address.')).toBeVisible()
    expect(screen.getByLabelText('Email')).toHaveFocus()
    expect(screen.queryByText(/check your connection/i)).not.toBeInTheDocument()
  })

  it('LC-001/S2/R2-S1 restores a valid session when the workspace loads', async () => {
    const restoreSession = vi.fn().mockResolvedValue({ id: 4, email: 'member@example.com' })
    renderTestApp({ route: '/worlds', session: null, api: { restoreSession } })

    expect(await screen.findByRole('heading', { name: 'Worlds' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Sign in to Lorecraft' })).not.toBeInTheDocument()
    expect(restoreSession).toHaveBeenCalledTimes(1)
  })

  it('LC-001/S2/R2-S2 returns an authenticated account from auth routes to Worlds', async () => {
    renderTestApp({
      route: '/sign-up',
      session: { id: 4, email: 'member@example.com' },
    })

    expect(await screen.findByRole('heading', { name: 'Worlds' })).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Create your Lorecraft account' })
    ).not.toBeInTheDocument()
  })

  it.each([
    ['/sign-up', 'Create your Lorecraft account'],
    ['/sign-in', 'Sign in to Lorecraft'],
  ])(
    'LC-001/S2/R2-S3 preserves an unfinished %s draft during anonymous focus revalidation',
    async (route, heading) => {
      const user = userEvent.setup()
      let resolveRevalidation: (account: null) => void = () => undefined
      const restoreSession = vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockImplementationOnce(
          () =>
            new Promise<null>((resolve) => {
              resolveRevalidation = resolve
            })
        )
      renderTestApp({ route, session: null, api: { restoreSession } })

      await user.type(await screen.findByLabelText('Email'), 'draft@example.com')
      await act(async () => window.dispatchEvent(new Event('focus')))
      await waitFor(() => expect(restoreSession).toHaveBeenCalledTimes(2))

      expect(screen.getByRole('heading', { name: heading })).toBeVisible()
      expect(screen.getByLabelText('Email')).toHaveValue('draft@example.com')

      await act(async () => resolveRevalidation(null))

      expect(screen.getByRole('heading', { name: heading })).toBeVisible()
      expect(screen.getByLabelText('Email')).toHaveValue('draft@example.com')
      expect(restoreSession).toHaveBeenCalledTimes(2)
    }
  )

  it('LC-001/S2/R2-S3 coalesces tab visibility and window focus into one session check', async () => {
    let resolveRevalidation: (account: null) => void = () => undefined
    const restoreSession = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockImplementationOnce(
        () =>
          new Promise<null>((resolve) => {
            resolveRevalidation = resolve
          })
      )
    renderTestApp({ route: '/sign-in', session: null, api: { restoreSession } })

    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    await act(async () => document.dispatchEvent(new Event('visibilitychange')))
    await act(async () => window.dispatchEvent(new Event('focus')))
    await waitFor(() => expect(restoreSession).toHaveBeenCalledTimes(2))

    await act(async () => resolveRevalidation(null))
    expect(restoreSession).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['/sign-up', 'Create your Lorecraft account'],
    ['/sign-in', 'Sign in to Lorecraft'],
  ])(
    'LC-001/S2/R2-S3 preserves an unfinished %s draft when anonymous focus revalidation fails',
    async (route, heading) => {
      const user = userEvent.setup()
      let rejectRevalidation: (error: Error) => void = () => undefined
      const restoreSession = vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockImplementationOnce(
          () =>
            new Promise<null>((_resolve, reject) => {
              rejectRevalidation = reject
            })
        )
      renderTestApp({ route, session: null, api: { restoreSession } })

      await user.type(await screen.findByLabelText('Email'), 'draft@example.com')
      await act(async () => window.dispatchEvent(new Event('focus')))
      await waitFor(() => expect(restoreSession).toHaveBeenCalledTimes(2))
      await act(async () => rejectRevalidation(new Error('network unavailable')))

      expect(await screen.findByRole('alert')).toHaveTextContent(
        "We couldn't refresh your session."
      )
      expect(screen.getByRole('heading', { name: heading })).toBeVisible()
      expect(screen.getByLabelText('Email')).toHaveValue('draft@example.com')
    }
  )

  it('LC-001/S2/R2-S3 keeps the public draft while retry is pending and prevents repeat retries', async () => {
    const user = userEvent.setup()
    let rejectRevalidation: (error: Error) => void = () => undefined
    let resolveRetry: (account: null) => void = () => undefined
    const restoreSession = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockImplementationOnce(
        () =>
          new Promise<null>((_resolve, reject) => {
            rejectRevalidation = reject
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise<null>((resolve) => {
            resolveRetry = resolve
          })
      )
    renderTestApp({ route: '/sign-in', session: null, api: { restoreSession } })

    await user.type(await screen.findByLabelText('Email'), 'draft@example.com')
    await act(async () => window.dispatchEvent(new Event('focus')))
    await act(async () => rejectRevalidation(new Error('network unavailable')))

    const retry = await screen.findByRole('button', { name: 'Try again' })
    await user.click(retry)

    expect(screen.getByRole('button', { name: 'Trying again...' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByLabelText('Email')).toHaveValue('draft@example.com')
    expect(restoreSession).toHaveBeenCalledTimes(3)

    await user.click(screen.getByRole('button', { name: 'Trying again...' }))
    expect(restoreSession).toHaveBeenCalledTimes(3)

    await act(async () => resolveRetry(null))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(screen.getByLabelText('Email')).toHaveValue('draft@example.com')
  })

  it('LC-001/S1/R2-S1 keeps successful signup authoritative over an older anonymous revalidation', async () => {
    const user = userEvent.setup()
    let resolveRevalidation: (account: null) => void = () => undefined
    const restoreSession = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockImplementationOnce(
        () =>
          new Promise<null>((resolve) => {
            resolveRevalidation = resolve
          })
      )
    const signUp = vi.fn().mockResolvedValue({ id: 7, email: 'new@example.com' })
    renderTestApp({ route: '/sign-up', session: null, api: { restoreSession, signUp } })

    await user.type(await screen.findByLabelText('Email'), 'new@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct horse')
    await user.type(screen.getByLabelText('Confirm password'), 'correct horse')
    await act(async () => window.dispatchEvent(new Event('focus')))
    await waitFor(() => expect(restoreSession).toHaveBeenCalledTimes(2))
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('heading', { name: 'Worlds' })).toBeVisible()
    await act(async () => resolveRevalidation(null))
    expect(screen.getByRole('heading', { name: 'Worlds' })).toBeVisible()
  })

  it('LC-001/S2/R1-S1 keeps successful sign-in authoritative over an older anonymous revalidation', async () => {
    const user = userEvent.setup()
    let resolveRevalidation: (account: null) => void = () => undefined
    const restoreSession = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockImplementationOnce(
        () =>
          new Promise<null>((resolve) => {
            resolveRevalidation = resolve
          })
      )
    const signIn = vi.fn().mockResolvedValue({ id: 4, email: 'member@example.com' })
    renderTestApp({ route: '/sign-in', session: null, api: { restoreSession, signIn } })

    await user.type(await screen.findByLabelText('Email'), 'member@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct horse')
    await act(async () => window.dispatchEvent(new Event('focus')))
    await waitFor(() => expect(restoreSession).toHaveBeenCalledTimes(2))
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'Worlds' })).toBeVisible()
    await act(async () => resolveRevalidation(null))
    expect(screen.getByRole('heading', { name: 'Worlds' })).toBeVisible()
  })

  it('LC-001/S3/R2-S1 signs out and returns the account to sign in', async () => {
    const user = userEvent.setup()
    const signOut = vi.fn().mockResolvedValue(undefined)
    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      api: { signOut },
    })

    await user.click(await screen.findByRole('button', { name: 'Sign out' }))

    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    expect(signOut).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('heading', { name: 'Worlds' })).not.toBeInTheDocument()
  })

  it('LC-001/S3/R2-S1 gives actionable recovery guidance when sign-out is throttled', async () => {
    const user = userEvent.setup()
    const signOut = vi
      .fn()
      .mockRejectedValue(
        new AuthApiError(
          'rate-limited',
          'Too many sign-out attempts. Wait a few minutes and try again.'
        )
      )
    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      api: { signOut },
    })

    await user.click(await screen.findByRole('button', { name: 'Sign out' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many sign-out attempts. Wait a few minutes and try again.'
    )
    expect(screen.queryByText('We couldn’t sign you out. Try again.')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Worlds' })).toBeVisible()
  })

  it('LC-001/S3/R2-S1 gives actionable recovery guidance when sign-out CSRF expires', async () => {
    const user = userEvent.setup()
    const signOut = vi
      .fn()
      .mockRejectedValue(
        new AuthApiError(
          'csrf-expired',
          'Your secure session could not be verified. Refresh the page and try again.'
        )
      )
    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      api: { signOut },
    })

    await user.click(await screen.findByRole('button', { name: 'Sign out' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your secure session could not be verified. Refresh the page and try again.'
    )
    expect(screen.getByRole('heading', { name: 'Worlds' })).toBeVisible()
  })

  it('LC-001/S3/R1-S1 redirects when session restoration returns unauthenticated', async () => {
    const restoreSession = vi.fn().mockResolvedValue(null)
    renderTestApp({ route: '/worlds', session: null, api: { restoreSession } })

    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Worlds' })).not.toBeInTheDocument()
    expect(restoreSession).toHaveBeenCalledTimes(1)
  })

  it('LC-001/S3/R1-S3 returns an open workspace to sign in when its session ends', async () => {
    let resolveRevalidation: (account: null) => void = () => undefined
    const restoreSession = vi
      .fn()
      .mockResolvedValueOnce({ id: 4, email: 'member@example.com' })
      .mockImplementationOnce(
        () =>
          new Promise<null>((resolve) => {
            resolveRevalidation = resolve
          })
      )
    renderTestApp({ route: '/worlds', session: null, api: { restoreSession } })

    expect(await screen.findByRole('heading', { name: 'Worlds' })).toBeVisible()

    screen.getByRole('button', { name: 'Sign out' }).focus()
    expect(screen.getByRole('button', { name: 'Sign out' })).toHaveFocus()

    await act(async () => window.dispatchEvent(new Event('focus')))

    expect(
      (await screen.findByText('Checking your session...')).closest('[role="status"]')
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Worlds' })).not.toBeInTheDocument()
    expect(screen.queryByText('member@example.com')).not.toBeInTheDocument()

    await act(async () => resolveRevalidation(null))

    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Worlds' })).not.toBeInTheDocument()
    expect(screen.queryByText('member@example.com')).not.toBeInTheDocument()
    expect(restoreSession).toHaveBeenCalledTimes(2)
    expect(screen.getByLabelText('Email')).toHaveFocus()
  })

  it('LC-001/S3/R1-S3 restores workspace focus after a successful session revalidation', async () => {
    const account = { id: 4, email: 'member@example.com' }
    let resolveRevalidation: (resolvedAccount: { id: number; email: string }) => void = () =>
      undefined
    const restoreSession = vi
      .fn()
      .mockResolvedValueOnce(account)
      .mockImplementationOnce(
        () =>
          new Promise<typeof account>((resolve) => {
            resolveRevalidation = resolve
          })
      )
    renderTestApp({ route: '/worlds', session: null, api: { restoreSession } })

    const signOutButton = await screen.findByRole('button', { name: 'Sign out' })
    signOutButton.focus()
    expect(signOutButton).toHaveFocus()
    await act(async () => window.dispatchEvent(new Event('focus')))
    expect(
      (await screen.findByText('Checking your session...')).closest('[role="status"]')
    ).toBeInTheDocument()

    await act(async () => resolveRevalidation(account))

    expect(await screen.findByRole('heading', { name: 'Worlds' })).toBeVisible()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign out' })).toHaveFocus())
  })

  it('LC-001/S3/R1-S3 focuses retry after an authenticated session revalidation fails', async () => {
    const account = { id: 4, email: 'member@example.com' }
    let rejectRevalidation: (error: Error) => void = () => undefined
    const restoreSession = vi
      .fn()
      .mockResolvedValueOnce(account)
      .mockImplementationOnce(
        () =>
          new Promise<typeof account>((_resolve, reject) => {
            rejectRevalidation = reject
          })
      )
    renderTestApp({ route: '/worlds', session: null, api: { restoreSession } })

    const signOutButton = await screen.findByRole('button', { name: 'Sign out' })
    signOutButton.focus()
    expect(signOutButton).toHaveFocus()
    await act(async () => window.dispatchEvent(new Event('focus')))
    expect(
      (await screen.findByText('Checking your session...')).closest('[role="status"]')
    ).toBeInTheDocument()

    await act(async () => rejectRevalidation(new Error('Service unavailable')))

    expect(
      await screen.findByRole('heading', { name: "We couldn't reach Lorecraft" })
    ).toBeVisible()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Try again' })).toHaveFocus())
  })

  it('LC-001/S3/R2-S1 ignores a late focus revalidation after sign-out succeeds', async () => {
    const user = userEvent.setup()
    let resolveRevalidation: (account: { id: number; email: string }) => void = () => undefined
    let resolveSignOut: () => void = () => undefined
    const restoreSession = vi
      .fn()
      .mockResolvedValueOnce({ id: 4, email: 'member@example.com' })
      .mockImplementationOnce(
        () =>
          new Promise<{ id: number; email: string }>((resolve) => {
            resolveRevalidation = resolve
          })
      )
    const signOut = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSignOut = resolve
        })
    )
    renderTestApp({
      route: '/worlds',
      session: null,
      api: { restoreSession, signOut },
    })

    await user.click(await screen.findByRole('button', { name: 'Sign out' }))
    await act(async () => window.dispatchEvent(new Event('focus')))
    expect(restoreSession).toHaveBeenCalledTimes(2)

    await act(async () => resolveSignOut())
    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()

    await act(async () => resolveRevalidation({ id: 4, email: 'member@example.com' }))

    expect(screen.getByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Worlds' })).not.toBeInTheDocument()
  })

  it('LC-001/S3/R1-S1 never inserts private workspace content while session restoration is pending or redirecting', async () => {
    let resolveSession: (account: null) => void = () => undefined
    const restoreSession = vi.fn(
      () =>
        new Promise<null>((resolve) => {
          resolveSession = resolve
        })
    )
    const { container } = renderTestApp({
      route: '/worlds',
      session: null,
      api: { restoreSession },
    })
    const insertedPrivateContent: string[] = []
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          const text = node.textContent ?? ''
          if (/No Worlds available|World library|member@example\.com/.test(text)) {
            insertedPrivateContent.push(text)
          }
        }
      }
    })
    observer.observe(container, { childList: true, subtree: true })

    expect(
      (await screen.findByText('Checking your session...')).closest('[role="status"]')
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Worlds' })).not.toBeInTheDocument()
    expect(screen.queryByText('World library')).not.toBeInTheDocument()

    await act(async () => resolveSession(null))

    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Worlds' })).not.toBeInTheDocument()
    expect(insertedPrivateContent).toEqual([])
    observer.disconnect()
  })

  it('LC-001/S3/R3-S1 shows an intentional empty workspace without a World-creation control', async () => {
    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
    })

    expect(await screen.findByRole('heading', { name: 'Worlds' })).toBeVisible()
    expect(await screen.findByRole('heading', { name: 'No Worlds available' })).toBeVisible()
    expect(screen.getByText('There are no Worlds available to this account yet.')).toBeVisible()
    expect(screen.queryByRole('button', { name: /create.*world/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /create.*world/i })).not.toBeInTheDocument()
  })
})
