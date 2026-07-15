import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { StorybookAppProviders } from '../stories/StorybookAppProviders'
import { SignUpPage } from './SignUpPage'

const meta = {
  title: 'Application/Authentication/Sign Up',
  component: SignUpPage,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof SignUpPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <StorybookAppProviders account={null} route="/sign-up">
      <SignUpPage />
    </StorybookAppProviders>
  ),
}

export const Mobile: Story = {
  ...Default,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const ValidationErrors: Story = {
  render: () => (
    <StorybookAppProviders account={null} route="/sign-up">
      <SignUpPage />
    </StorybookAppProviders>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Email'), 'not-an-email')
    await userEvent.type(canvas.getByLabelText('Password'), 'short')
    await userEvent.type(canvas.getByLabelText('Confirm password'), 'different')
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }))
    await expect(canvas.getByText('Enter a valid email address.')).toBeVisible()
    await expect(canvas.getByText('Use at least 12 characters.')).toBeVisible()
    await expect(canvas.getByText('Passwords must match.')).toBeVisible()
    await expect(canvas.getByLabelText('Email')).toHaveValue('not-an-email')
    await expect(canvas.getByLabelText('Password')).toHaveValue('short')
    await expect(canvas.getByLabelText('Confirm password')).toHaveValue('different')
    await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(
      canvasElement.ownerDocument.documentElement.clientWidth
    )
  },
}

export const ValidationErrorsMobile: Story = {
  ...ValidationErrors,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const Pending: Story = {
  render: () => (
    <StorybookAppProviders
      account={null}
      route="/sign-up"
      api={{ signUp: () => new Promise(() => undefined) }}
    >
      <SignUpPage />
    </StorybookAppProviders>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Email'), 'keeper@lorecraft.test')
    await userEvent.type(canvas.getByLabelText('Password'), 'correct horse')
    await userEvent.type(canvas.getByLabelText('Confirm password'), 'correct horse')
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }))
    await expect(canvas.getByRole('button', { name: 'Creating account…' })).toBeDisabled()
    await expect(canvasElement.querySelector('form')).toHaveAttribute('aria-busy', 'true')
    await expect(canvas.getByLabelText('Email')).toHaveValue('keeper@lorecraft.test')
    await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(
      canvasElement.ownerDocument.documentElement.clientWidth
    )
  },
}

export const PendingMobile: Story = {
  ...Pending,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
