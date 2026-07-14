import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { StorybookAppProviders } from '../stories/StorybookAppProviders'
import { AuthApiError } from '../auth/authApi'
import { WorkspacePage } from './WorkspacePage'

const meta = {
  title: 'Application/Workspace/Worlds',
  component: WorkspacePage,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof WorkspacePage>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: () => (
    <StorybookAppProviders route="/worlds">
      <WorkspacePage />
    </StorybookAppProviders>
  ),
}

export const SignOutFailure: Story = {
  render: () => (
    <StorybookAppProviders
      route="/worlds"
      api={{
        signOut: async () => {
          throw new AuthApiError('network', 'Network unavailable')
        },
      }}
    >
      <WorkspacePage />
    </StorybookAppProviders>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Sign out' }))
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'We couldn’t sign you out. Try again.'
    )
  },
}
