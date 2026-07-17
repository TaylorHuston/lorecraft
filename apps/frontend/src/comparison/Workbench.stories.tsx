import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import type { AdventureApi, AdventureDetail } from '../adventures/adventureApi'
import { AdventureWorkbench } from '../adventures/AdventureWorkbench'
import { StorybookAppProviders } from '../stories/StorybookAppProviders'
import type { WorldApi } from '../worlds/worldApi'
import { WorkspacePage } from '../workspace/WorkspacePage'

const RuntimeError = globalThis.Error

const adventure: AdventureDetail = {
  id: '11111111-1111-4111-8111-111111111111',
  status: 'ready',
  turnCount: 3,
  lastPlayedAt: '2026-07-17T12:00:00.000Z',
  route: '/adventures/11111111-1111-4111-8111-111111111111',
  sourceWorld: {
    slug: 'stormbound-chapel',
    name: 'Stormbound Chapel',
    worldVersionId: '22222222-2222-4222-8222-222222222222',
    startingPointKey: 'chapel-arrival',
    route: '/worlds/stormbound-chapel',
  },
  player: {
    name: 'Elara Vance',
    physicalDescription: 'A scholar in a salt-stained cloak.',
    backstory: 'An archivist following a forbidden map.',
    status: 'Steady after reaching shelter.',
    currentLocation: { key: 'chapel', name: 'Chapel' },
  },
  scene: {
    location: {
      key: 'chapel',
      name: 'Chapel',
      description: 'Rain taps against warped shutters above the coast.',
    },
    npcs: [
      {
        key: 'mira',
        name: 'Mira',
        physicalDescription: 'A watchful local with rain-dark hair.',
      },
    ],
  },
  story: [
    {
      id: 'opening',
      kind: 'narration',
      content: 'The chapel doors yield to the storm, and Mira looks up from the darkened aisle.',
    },
  ],
}

const adventureApi: AdventureApi = {
  createAdventure: async () => {
    throw new RuntimeError('Not used in this story.')
  },
  getAdventure: async () => {
    throw new RuntimeError('Not used in this story.')
  },
  retryOpening: async () => {
    throw new RuntimeError('Not used in this story.')
  },
  resetAdventure: async () => {
    throw new RuntimeError('Not used in this story.')
  },
  deleteAdventure: async () => undefined,
}

const worldSummary = {
  id: 1,
  slug: 'stormbound-chapel',
  name: 'Stormbound Chapel',
  description: 'A rain-lashed chapel and the people keeping its secrets.',
  visibility: 'public' as const,
  readOnly: true,
  playability: { available: true, reason: null },
  adventures: [
    {
      id: adventure.id,
      playerName: adventure.player.name,
      status: adventure.status,
      turnCount: adventure.turnCount,
      lastPlayedAt: adventure.lastPlayedAt,
      route: adventure.route,
    },
  ],
}

function workspace(worldApi: WorldApi) {
  return (
    <StorybookAppProviders route="/worlds">
      <WorkspacePage adventureApi={adventureApi} worldApi={worldApi} />
    </StorybookAppProviders>
  )
}

const meta = {
  title: 'Comparison/Workbench',
  parameters: {
    controls: { disable: true },
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = {
  render: () => <AdventureWorkbench adventure={adventure} layout="desktop" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('region', { name: 'Story' })).toBeVisible()
    await expect(canvas.getByRole('region', { name: 'Player' })).toBeVisible()
    await expect(canvas.getByRole('region', { name: 'Scene' })).toBeVisible()
  },
}

export const Mobile: Story = {
  render: () => <AdventureWorkbench adventure={adventure} layout="mobile" />,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('tab', { name: 'Story' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  },
}

export const FileBrowser: Story = {
  render: () =>
    workspace({
      listWorlds: async () => [worldSummary],
      getWorld: async () => {
        throw new RuntimeError('Not used in this story.')
      },
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByRole('link', { name: worldSummary.name })).resolves.toBeVisible()
    await expect(canvas.getByRole('link', { name: /resume adventure/i })).toBeVisible()
  },
}

export const Empty: Story = {
  render: () =>
    workspace({
      listWorlds: async () => [],
      getWorld: async () => {
        throw new RuntimeError('Not used in this story.')
      },
    }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).findByRole('heading', { name: 'No Worlds available' })
    ).resolves.toBeVisible()
  },
}

export const Error: Story = {
  render: () =>
    workspace({
      listWorlds: async () => {
        throw new RuntimeError('Catalog unavailable')
      },
      getWorld: async () => {
        throw new RuntimeError('Not used in this story.')
      },
    }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).findByRole('alert')).resolves.toHaveTextContent(
      'Worlds could not be loaded. Try again.'
    )
  },
}
