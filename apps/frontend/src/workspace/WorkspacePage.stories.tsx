import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { StorybookAppProviders } from '../stories/StorybookAppProviders'
import { AuthApiError } from '../auth/authApi'
import { WorkspacePage } from './WorkspacePage'
import type { WorldApi } from '../worlds/worldApi'

const emptyWorldApi: WorldApi = {
  listWorlds: async () => [],
  getWorld: async () => {
    throw new Error('Not used in this story.')
  },
}
const loadedWorldApi: WorldApi = {
  ...emptyWorldApi,
  listWorlds: async () => [
    {
      id: 1,
      slug: 'stormbound-chapel',
      name: 'Stormbound Chapel',
      description: 'A rain-lashed chapel and the people keeping its secrets.',
      visibility: 'public',
      readOnly: true,
    },
  ],
}

const meta = {
  title: 'Application/Workspace/Worlds',
  component: WorkspacePage,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof WorkspacePage>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: { worldApi: emptyWorldApi },
  render: () => (
    <StorybookAppProviders route="/worlds">
      <WorkspacePage worldApi={emptyWorldApi} />
    </StorybookAppProviders>
  ),
}

export const Loaded: Story = {
  args: { worldApi: loadedWorldApi },
  render: () => (
    <StorybookAppProviders route="/worlds">
      <WorkspacePage worldApi={loadedWorldApi} />
    </StorybookAppProviders>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).findByRole('link', { name: 'Stormbound Chapel' })
    ).resolves.toBeVisible()
  },
}

export const SignOutFailure: Story = {
  args: { worldApi: emptyWorldApi },
  render: () => (
    <StorybookAppProviders
      route="/worlds"
      api={{
        signOut: async () => {
          throw new AuthApiError('network', 'Network unavailable')
        },
      }}
    >
      <WorkspacePage worldApi={emptyWorldApi} />
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
