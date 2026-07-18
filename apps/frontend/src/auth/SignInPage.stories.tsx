import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { StorybookAppProviders } from '../stories/StorybookAppProviders'
import { AuthApiError } from './authApi'
import { SignInPage } from './SignInPage'

const meta = {
  title: 'Application/Authentication/Sign In',
  component: SignInPage,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof SignInPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <StorybookAppProviders account={null} route="/sign-in">
      <SignInPage />
    </StorybookAppProviders>
  ),
}

export const Mobile: Story = {
  ...Default,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const PasswordDisclosure: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const password = canvas.getByLabelText('Password')
    await userEvent.type(password, 'correct horse')
    await userEvent.click(canvas.getByRole('button', { name: 'Show Password' }))
    await expect(password).toHaveAttribute('type', 'text')
    await expect(password).toHaveValue('correct horse')
    await expect(canvas.getByRole('button', { name: 'Hide Password' })).toHaveFocus()
  },
}

export const InvalidCredentials: Story = {
  render: () => (
    <StorybookAppProviders
      account={null}
      route="/sign-in"
      api={{
        signIn: async () => {
          throw new AuthApiError('invalid-credentials', 'Invalid credentials')
        },
      }}
    >
      <SignInPage />
    </StorybookAppProviders>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Email'), 'keeper@lorecraft.test')
    await userEvent.type(canvas.getByLabelText('Password'), 'incorrect password')
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }))
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Email or password is incorrect. Try again.'
    )
  },
}

export const Pending: Story = {
  render: () => (
    <StorybookAppProviders
      account={null}
      route="/sign-in"
      api={{ signIn: () => new Promise(() => undefined) }}
    >
      <SignInPage />
    </StorybookAppProviders>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Email'), 'keeper@lorecraft.test')
    await userEvent.type(canvas.getByLabelText('Password'), 'correct horse')
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }))
    await expect(canvas.getByRole('button', { name: 'Signing in…' })).toBeDisabled()
    await expect(canvasElement.querySelector('form')).toHaveAttribute('aria-busy', 'true')
  },
}
