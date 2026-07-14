import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AuthApiError } from '../auth/authApi'
import { renderTestApp } from '../test/renderTestApp'

describe('account workspace entry', () => {
  it('LC-001/S3/R1-S1 redirects an anonymous workspace visit without rendering private content', async () => {
    renderTestApp({ route: '/worlds', session: null })

    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Your Worlds' })).not.toBeInTheDocument()
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

  it('LC-001/S1/R1-S1 + R2-S1 submits a normalized account and enters Your Worlds without bearer storage', async () => {
    const user = userEvent.setup()
    const signUp = vi.fn().mockResolvedValue({ id: 7, email: 'new@example.com' })
    renderTestApp({ route: '/sign-up', session: null, api: { signUp } })

    await user.type(await screen.findByLabelText('Email'), '  NEW@Example.com  ')
    await user.type(screen.getByLabelText('Password'), 'correct horse')
    await user.type(screen.getByLabelText('Confirm password'), 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('heading', { name: 'Your Worlds' })).toBeVisible()
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

  it('LC-001/S2/R1-S1 signs in with valid credentials and opens Your Worlds', async () => {
    const user = userEvent.setup()
    const signIn = vi.fn().mockResolvedValue({ id: 4, email: 'member@example.com' })
    renderTestApp({ route: '/sign-in', session: null, api: { signIn } })

    await user.type(await screen.findByLabelText('Email'), ' MEMBER@example.com ')
    await user.type(screen.getByLabelText('Password'), 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'Your Worlds' })).toBeVisible()
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

    expect(await screen.findByRole('heading', { name: 'Your Worlds' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Sign in to Lorecraft' })).not.toBeInTheDocument()
    expect(restoreSession).toHaveBeenCalledTimes(1)
  })

  it('LC-001/S2/R2-S2 returns an authenticated account from auth routes to Your Worlds', async () => {
    renderTestApp({
      route: '/sign-up',
      session: { id: 4, email: 'member@example.com' },
    })

    expect(await screen.findByRole('heading', { name: 'Your Worlds' })).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Create your Lorecraft account' })
    ).not.toBeInTheDocument()
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
    expect(screen.queryByRole('heading', { name: 'Your Worlds' })).not.toBeInTheDocument()
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
    expect(screen.getByRole('heading', { name: 'Your Worlds' })).toBeVisible()
  })

  it('LC-001/S3/R1-S1 redirects when session restoration returns unauthenticated', async () => {
    const restoreSession = vi.fn().mockResolvedValue(null)
    renderTestApp({ route: '/worlds', session: null, api: { restoreSession } })

    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Your Worlds' })).not.toBeInTheDocument()
    expect(restoreSession).toHaveBeenCalledTimes(1)
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
          if (/Your Worlds|No Worlds yet|Private workspace|member@example\.com/.test(text)) {
            insertedPrivateContent.push(text)
          }
        }
      }
    })
    observer.observe(container, { childList: true, subtree: true })

    expect(await screen.findByRole('status')).toHaveTextContent('Checking your session...')
    expect(screen.queryByRole('heading', { name: 'Your Worlds' })).not.toBeInTheDocument()
    expect(screen.queryByText('Private workspace')).not.toBeInTheDocument()

    await act(async () => resolveSession(null))

    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Your Worlds' })).not.toBeInTheDocument()
    expect(insertedPrivateContent).toEqual([])
    observer.disconnect()
  })

  it('LC-001/S3/R3-S1 shows an intentional empty workspace without a World-creation control', async () => {
    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
    })

    expect(await screen.findByRole('heading', { name: 'Your Worlds' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'No Worlds yet' })).toBeVisible()
    expect(screen.getByText("You don't have any Worlds yet.")).toBeVisible()
    expect(screen.queryByRole('button', { name: /create.*world/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /create.*world/i })).not.toBeInTheDocument()
  })
})
