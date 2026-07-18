import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ReactNode, useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { SessionError, SessionLoading, SessionRefreshError } from '../app/AppRoutes'
import type { AuthContextValue } from './authContext'
import { AuthContext } from './authContext'
import formStyles from './AuthForm.module.css'
import { AuthLayout } from './AuthLayout'

const api = {
  restoreSession: async () => null,
  signUp: async (input: { email: string }) => ({ id: 2, email: input.email }),
  signIn: async (input: { email: string }) => ({ id: 1, email: input.email }),
  signOut: async () => undefined,
}

const mobileRefreshRetry = fn()
const shortDesktopRefreshRetry = fn()

function withAuthState(children: ReactNode, overrides: Partial<AuthContextValue> = {}) {
  return (
    <AuthContext.Provider
      value={{
        account: null,
        api,
        isInitialError: false,
        isLoading: false,
        isRevalidating: false,
        error: new Error('Service unavailable'),
        endSession: fn(),
        retry: fn(),
        ...overrides,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function UnfinishedSignIn() {
  const [email, setEmail] = useState('unfinished@lorecraft.test')

  return (
    <AuthLayout
      title="Sign in to Lorecraft"
      description="Continue building your private worlds."
      footer={<p>Create an account when you are ready.</p>}
    >
      <form className={formStyles.form}>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="refresh-story-email">
            Email
          </label>
          <input
            className={formStyles.input}
            id="refresh-story-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <button className={formStyles.submit} type="button">
          Sign in
        </button>
      </form>
    </AuthLayout>
  )
}

const meta = {
  title: 'Application/Authentication/Session States',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const InitialLoading: Story = {
  render: () => <SessionLoading />,
}

export const InitialError: Story = {
  render: () => withAuthState(<SessionError />),
}

export const ProtectedRevalidationError: Story = {
  render: () => withAuthState(<SessionError focusRetry />),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Try again' })).toHaveFocus()
  },
}

export const BackgroundRefreshError: Story = {
  render: () => withAuthState(<SessionRefreshError />),
}

export const BackgroundRefreshPending: Story = {
  render: () => withAuthState(<SessionRefreshError />, { isRevalidating: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('alert')).toHaveAttribute('aria-busy', 'true')
    await expect(canvas.getByRole('button', { name: 'Trying again…' })).toBeDisabled()
  },
}

export const BackgroundRefreshErrorMobile: Story = {
  render: () =>
    withAuthState(
      <>
        <SessionRefreshError />
        <UnfinishedSignIn />
      </>,
      { retry: mobileRefreshRetry }
    ),
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = canvas.getByRole('alert')
    const retry = canvas.getByRole('button', { name: 'Try again' })
    const email = canvas.getByLabelText('Email')

    await expect(email).toHaveValue('unfinished@lorecraft.test')
    retry.focus()
    await expect(retry).toHaveFocus()

    const retryBounds = retry.getBoundingClientRect()
    await expect(retryBounds.width).toBeGreaterThanOrEqual(44)
    await expect(retryBounds.height).toBeGreaterThanOrEqual(44)
    await expect(alert.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      email.getBoundingClientRect().top
    )
    await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(
      canvasElement.ownerDocument.documentElement.clientWidth
    )

    await userEvent.keyboard('{Enter}')
    await expect(mobileRefreshRetry).toHaveBeenCalledTimes(1)
    await expect(retry).toHaveFocus()
    await expect(email).toHaveValue('unfinished@lorecraft.test')
  },
}

export const BackgroundRefreshErrorShortDesktop: Story = {
  render: () =>
    withAuthState(
      <>
        <SessionRefreshError />
        <UnfinishedSignIn />
      </>,
      { retry: shortDesktopRefreshRetry }
    ),
  parameters: {
    viewport: {
      options: {
        shortDesktop: {
          name: 'Short desktop',
          styles: { width: '800px', height: '480px' },
        },
      },
      defaultViewport: 'shortDesktop',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = canvas.getByRole('alert')
    const brand = canvas.getByText('Lorecraft')
    const email = canvas.getByLabelText('Email')

    await expect(email).toHaveValue('unfinished@lorecraft.test')
    await expect(alert.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      brand.getBoundingClientRect().top
    )
    await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(
      canvasElement.ownerDocument.documentElement.clientWidth
    )
  },
}
