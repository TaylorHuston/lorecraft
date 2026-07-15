import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { AuthApiError, type AuthApi } from '../auth/authApi'
import { StorybookAppProviders } from '../stories/StorybookAppProviders'
import type { WorldApi } from '../worlds/worldApi'
import { WorkspacePage } from './WorkspacePage'

const emptyWorldApi: WorldApi = {
  listWorlds: async () => [],
  getWorld: async () => {
    throw new Error('Not used in this story.')
  },
}

const populatedWorldApi: WorldApi = {
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

const loadingWorldApi: WorldApi = {
  ...emptyWorldApi,
  listWorlds: () => new Promise(() => undefined),
}

const failedWorldApi: WorldApi = {
  ...emptyWorldApi,
  listWorlds: async () => {
    throw new Error('Catalog unavailable')
  },
}

function renderWorkspace(worldApi: WorldApi, api?: Partial<AuthApi>) {
  return (
    <StorybookAppProviders route="/worlds" api={api}>
      <WorkspacePage worldApi={worldApi} />
    </StorybookAppProviders>
  )
}

const meta = {
  title: 'Application/Workspace/Worlds',
  component: WorkspacePage,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof WorkspacePage>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {
  args: { worldApi: loadingWorldApi },
  render: () => renderWorkspace(loadingWorldApi),
}

export const Populated: Story = {
  args: { worldApi: populatedWorldApi },
  render: () => renderWorkspace(populatedWorldApi),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByRole('link', { name: 'Stormbound Chapel' })).resolves.toBeVisible()
    await expect(canvas.getByLabelText('Signed in as keeper@lorecraft.test')).toBeVisible()
  },
}

export const PopulatedMobile: Story = {
  ...Populated,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const Empty: Story = {
  args: { worldApi: emptyWorldApi },
  render: () => renderWorkspace(emptyWorldApi),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.findByRole('heading', { name: 'No Worlds available' })
    ).resolves.toBeVisible()
    await expect(canvas.queryByRole('button', { name: /create.*world/i })).not.toBeInTheDocument()
  },
}

export const EmptyMobile: Story = {
  ...Empty,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const LoadFailure: Story = {
  args: { worldApi: failedWorldApi },
  render: () => renderWorkspace(failedWorldApi),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).findByRole('alert')).resolves.toHaveTextContent(
      'Worlds could not be loaded. Try again.'
    )
  },
}

export const LoadFailureMobile: Story = {
  ...LoadFailure,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const retry = await canvas.findByRole('button', { name: 'Try again' })
    retry.focus()
    await expect(retry).toHaveFocus()

    const bounds = retry.getBoundingClientRect()
    await expect(bounds.width).toBeGreaterThanOrEqual(44)
    await expect(bounds.height).toBeGreaterThanOrEqual(44)
    await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(
      canvasElement.ownerDocument.documentElement.clientWidth
    )
  },
}

export const RetryPending: Story = {
  args: { worldApi: failedWorldApi },
  render: () => {
    let requests = 0
    const retryPendingApi: WorldApi = {
      ...emptyWorldApi,
      listWorlds: () => {
        requests += 1
        return requests === 1
          ? Promise.reject(new Error('Catalog unavailable'))
          : new Promise(() => undefined)
      },
    }

    return renderWorkspace(retryPendingApi)
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Try again' }))
    await expect(canvas.getByRole('button', { name: 'Trying again…' })).toBeDisabled()
  },
}

export const RetryPendingMobile: Story = {
  ...RetryPending,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const SignOutPending: Story = {
  args: { worldApi: emptyWorldApi },
  render: () =>
    renderWorkspace(emptyWorldApi, {
      signOut: () => new Promise(() => undefined),
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Sign out' }))
    await expect(canvas.getByRole('button', { name: 'Signing out…' })).toBeDisabled()
  },
}

export const SignOutFailure: Story = {
  args: { worldApi: populatedWorldApi },
  render: () =>
    renderWorkspace(populatedWorldApi, {
      signOut: async () => {
        throw new AuthApiError('network', 'Network unavailable')
      },
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Sign out' }))
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'We couldn’t sign you out. Try again.'
    )
    await expect(canvas.getByRole('link', { name: 'Stormbound Chapel' })).toBeVisible()
  },
}
