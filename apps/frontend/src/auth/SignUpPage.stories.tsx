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
  },
}
