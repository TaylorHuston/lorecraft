import type { Meta, StoryObj } from '@storybook/react-vite'
import { Route, Routes } from 'react-router-dom'
import { expect, userEvent, within } from 'storybook/test'
import { StorybookAppProviders } from '../stories/StorybookAppProviders'
import { AdventurePage } from './AdventurePage'
import type { AdventureApi, AdventureDetail } from './adventureApi'

const id = '11111111-1111-4111-8111-111111111111'

const readyAdventure: AdventureDetail = {
  id,
  status: 'ready',
  turnCount: 0,
  lastPlayedAt: '2026-07-16T20:30:00.000Z',
  route: `/adventures/${id}`,
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

function apiFor(adventure: AdventureDetail): AdventureApi {
  return {
    createAdventure: async () => {
      throw new Error('Not used in this story.')
    },
    getAdventure: async () => adventure,
    retryOpening: async () => ({ adventureId: id, status: 'opening_pending', generation: 2 }),
    resetAdventure: async () => ({ adventureId: id, status: 'opening_pending', generation: 2 }),
    deleteAdventure: async () => undefined,
  }
}

function renderAdventure(adventure: AdventureDetail) {
  return (
    <StorybookAppProviders route={`/adventures/${id}`}>
      <Routes>
        <Route
          path="/adventures/:id"
          element={<AdventurePage adventureApi={apiFor(adventure)} pollIntervalMs={60_000} />}
        />
      </Routes>
    </StorybookAppProviders>
  )
}

const meta = {
  title: 'Application/Adventures/Workbench',
  component: AdventurePage,
  args: { adventureApi: apiFor(readyAdventure), pollIntervalMs: 60_000 },
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof AdventurePage>

export default meta
type Story = StoryObj<typeof meta>

export const ReadyDesktop: Story = {
  render: () => renderAdventure(readyAdventure),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByText(/chapel doors yield/i)).resolves.toBeVisible()
    await expect(canvas.getByRole('region', { name: 'Player' })).toHaveTextContent('Elara Vance')
    await expect(canvas.getByRole('region', { name: 'Scene' })).toHaveTextContent('Mira')
  },
}

export const ReadyMobile: Story = {
  ...ReadyDesktop,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByRole('tab', { name: 'Story' })).resolves.toHaveAttribute(
      'aria-selected',
      'true'
    )
  },
}

export const OpeningPending: Story = {
  render: () => renderAdventure({ ...readyAdventure, status: 'opening_pending', story: [] }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).findByText('Preparing your opening')
    ).resolves.toBeVisible()
  },
}

export const OpeningFailed: Story = {
  render: () => renderAdventure({ ...readyAdventure, status: 'opening_failed', story: [] }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).findByRole('alert')).resolves.toHaveTextContent(
      "couldn't prepare your opening"
    )
  },
}

export const EmptyScene: Story = {
  render: () =>
    renderAdventure({ ...readyAdventure, scene: { ...readyAdventure.scene, npcs: [] } }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).findByText('No one else is visible here.')
    ).resolves.toBeVisible()
  },
}

export const ResetConfirmation: Story = {
  render: () => renderAdventure(readyAdventure),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(await canvas.findByRole('button', { name: 'Adventure settings' }))
    const settingsDialog = page.getByRole('dialog', { name: 'Adventure settings' })
    await userEvent.click(within(settingsDialog).getByRole('button', { name: 'Reset Adventure' }))
    await expect(page.getByRole('dialog', { name: 'Reset Adventure?' })).toBeVisible()
  },
}
