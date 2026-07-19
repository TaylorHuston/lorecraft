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
  activeTurn: null,
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
    submitTurn: async () => ({
      id: '33333333-3333-4333-8333-333333333333',
      adventureId: id,
      trigger: 'act',
      status: 'pending',
      route: `/adventures/${id}`,
    }),
    retryTurn: async (turnId) => ({ id: turnId, status: 'pending' }),
    discardTurn: async () => undefined,
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

function expectNoHorizontalOverflow(canvasElement: HTMLElement) {
  const documentElement = canvasElement.ownerDocument.documentElement
  expect(documentElement.scrollWidth).toBeLessThanOrEqual(documentElement.clientWidth)
}

export const ReadyDesktop: Story = {
  render: () => renderAdventure(readyAdventure),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByText(/chapel doors yield/i)).resolves.toBeVisible()
    const player = canvas.getByRole('region', { name: 'Player' })
    const story = canvas.getByRole('region', { name: 'Story' })
    const scene = canvas.getByRole('region', { name: 'Scene' })
    await expect(player).toHaveTextContent('Elara Vance')
    await expect(scene).toHaveTextContent('Mira')
    const playerRect = player.getBoundingClientRect()
    const storyRect = story.getBoundingClientRect()
    const sceneRect = scene.getBoundingClientRect()
    expect(playerRect.left).toBeLessThan(storyRect.left)
    expect(storyRect.left).toBeLessThan(sceneRect.left)
    expect(storyRect.width).toBeGreaterThan(playerRect.width)
    expect(storyRect.width).toBeGreaterThan(sceneRect.width)
    expectNoHorizontalOverflow(canvasElement)
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
    expectNoHorizontalOverflow(canvasElement)
  },
}

export const OpeningPending: Story = {
  render: () => renderAdventure({ ...readyAdventure, status: 'opening_pending', story: [] }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByText('Preparing your opening')).resolves.toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Adventure settings' })).toBeVisible()
    expectNoHorizontalOverflow(canvasElement)
  },
}

export const OpeningPendingMobile: Story = {
  ...OpeningPending,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByText('Preparing your opening')).resolves.toBeVisible()
    await expect(canvas.getByRole('tab', { name: 'Story' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expectNoHorizontalOverflow(canvasElement)
  },
}

export const OpeningFailed: Story = {
  render: () => renderAdventure({ ...readyAdventure, status: 'opening_failed', story: [] }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = await canvas.findByRole('alert')
    await expect(alert).toHaveTextContent("couldn't prepare your opening")
    await expect(within(alert).getByRole('button', { name: 'Try again' })).toBeVisible()
    await expect(within(alert).getByRole('link', { name: 'Return to World' })).toBeVisible()
    expectNoHorizontalOverflow(canvasElement)
  },
}

export const OpeningFailedMobile: Story = {
  ...OpeningFailed,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = await canvas.findByRole('alert')
    await expect(alert).toHaveTextContent("couldn't prepare your opening")
    await expect(within(alert).getByRole('button', { name: 'Try again' })).toBeVisible()
    await expect(within(alert).getByRole('link', { name: 'Return to World' })).toBeVisible()
    expectNoHorizontalOverflow(canvasElement)
  },
}

export const ReadyToAct: Story = {
  render: () => renderAdventure(readyAdventure),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByRole('textbox', { name: 'What do you do?' })).resolves.toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Pass' })).toBeVisible()
  },
}

export const TurnPending: Story = {
  render: () =>
    renderAdventure({
      ...readyAdventure,
      activeTurn: { id: '33333333-3333-4333-8333-333333333333', trigger: 'act', status: 'pending' },
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByText('Resolving your turn')).resolves.toBeVisible()
    expect(canvas.queryByRole('textbox')).not.toBeInTheDocument()
    expectNoHorizontalOverflow(canvasElement)
  },
}

export const TurnFailed: Story = {
  render: () =>
    renderAdventure({
      ...readyAdventure,
      activeTurn: {
        id: '33333333-3333-4333-8333-333333333333',
        trigger: 'guide',
        status: 'failed',
      },
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = await canvas.findByRole('alert')
    await expect(alert).toHaveTextContent('did not change the story')
    await expect(within(alert).getByRole('button', { name: 'Retry turn' })).toBeVisible()
    await expect(within(alert).getByRole('button', { name: 'Discard' })).toBeVisible()
    expectNoHorizontalOverflow(canvasElement)
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
