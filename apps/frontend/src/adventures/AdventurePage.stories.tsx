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
        background: 'Mira grew up around the chapel.',
        personality: 'Cautious and observant.',
        voice: 'Plain-spoken and restrained.',
        privateKnowledge: 'Mira rang the bell before the storm arrived.',
        currentLocation: { key: 'chapel', name: 'Chapel' },
        mood: 'Watchful',
        status: 'Sheltering in the chapel.',
        memory: 'She has not yet met the player.',
      },
    ],
  },
  activeTurn: null,
  story: [
    {
      id: 'opening',
      kind: 'narration',
      content:
        'The chapel doors yield to the storm, and Mira looks up from the darkened aisle.\n\nRain gathers around the ruined pews as the bell goes quiet.',
    },
    {
      id: 'act-1',
      kind: 'act',
      content: 'I ask Mira why the bell rang.',
    },
    {
      id: 'narration-1',
      kind: 'narration',
      content: 'Mira lowers her gaze and gestures toward the vestry.',
    },
    {
      id: 'pass-1',
      kind: 'pass',
      content: 'Pass',
    },
    {
      id: 'narration-2',
      kind: 'narration',
      content: 'The chapel settles into an uneasy silence.',
    },
    {
      id: 'guide-1',
      kind: 'guide',
      content: 'Keep Mira guarded until the player earns her trust.',
    },
    {
      id: 'narration-3',
      kind: 'narration',
      content: 'Mira turns the candle flame away from the vestry door.',
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
    updateNpcState: async () => adventure,
    updatePlayerState: async () => adventure,
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
    expect(
      within(story).getByRole('heading', { name: 'Stormbound Chapel', level: 1 })
    ).toBeVisible()
    expect(
      within(story)
        .getByRole('heading', { name: 'Stormbound Chapel', level: 1 })
        .closest('[data-slot="story-title"]')
    ).not.toBeNull()
    expect(within(player).getByRole('link', { name: 'Return to Worlds' })).toHaveAttribute(
      'href',
      '/worlds'
    )
    expect(within(player).getByRole('button', { name: 'Adventure settings' })).toBeVisible()
    expect(canvasElement.querySelector('main > header')).not.toBeInTheDocument()
    expect(within(story).getAllByRole('article', { name: 'Player message' })).toHaveLength(3)
    expect(within(story).getAllByRole('article', { name: 'Game Master message' })).toHaveLength(4)
    expect(within(story).getByText('Action')).toBeVisible()
    expect(within(story).getAllByText('Pass')[0]).toBeVisible()
    expect(within(story).getAllByText('Guide')[0]).toBeVisible()
    expect(
      within(story).getByText('Keep Mira guarded until the player earns her trust.').tagName
    ).toBe('EM')
    await expect(player).toHaveTextContent('Elara Vance')
    await expect(scene).toHaveTextContent('Mira')
    const playerRect = player.getBoundingClientRect()
    const storyRect = story.getBoundingClientRect()
    const sceneRect = scene.getBoundingClientRect()
    expect(playerRect.left).toBeLessThan(storyRect.left)
    expect(storyRect.left).toBeLessThan(sceneRect.left)
    expect(storyRect.width).toBeGreaterThan(playerRect.width)
    expect(storyRect.width).toBeGreaterThan(sceneRect.width)
    story.focus()
    expect(story).toHaveFocus()
    expect(story.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(story).outlineColor).toBe('rgb(98, 93, 88)')
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
    await userEvent.click(canvas.getByRole('tab', { name: 'Player' }))
    await expect(canvas.findByRole('link', { name: 'Return to Worlds' })).resolves.toBeVisible()
    await expect(canvas.findByRole('button', { name: 'Adventure settings' })).resolves.toBeVisible()
    expectNoHorizontalOverflow(canvasElement)
  },
}

export const DebugNpcEditor: Story = {
  render: () => renderAdventure(readyAdventure),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(await canvas.findByRole('button', { name: 'Adventure settings' }))
    const settingsDialog = page.getByRole('dialog', { name: 'Adventure settings' })
    await userEvent.click(within(settingsDialog).getByRole('tab', { name: 'NPCs' }))
    await userEvent.click(within(settingsDialog).getByRole('button', { name: 'Edit Mira' }))
    await expect(within(settingsDialog).getByLabelText('Name')).toHaveValue('Mira')
    await expect(within(settingsDialog).getByLabelText('Mood')).toHaveValue('Watchful')
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
    await expect(alert).toHaveTextContent('Opening failed')
    await expect(alert).toHaveTextContent("couldn't prepare your opening")
    await expect(within(alert).getByRole('button', { name: 'Try again' })).toBeVisible()
    await expect(within(alert).getByRole('link', { name: 'Return to Worlds' })).toBeVisible()
    expectNoHorizontalOverflow(canvasElement)
  },
}

export const OpeningFailedMobile: Story = {
  ...OpeningFailed,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = await canvas.findByRole('alert')
    await expect(alert).toHaveTextContent('Opening failed')
    await expect(alert).toHaveTextContent("couldn't prepare your opening")
    await expect(within(alert).getByRole('button', { name: 'Try again' })).toBeVisible()
    await expect(within(alert).getByRole('link', { name: 'Return to Worlds' })).toBeVisible()
    expectNoHorizontalOverflow(canvasElement)
  },
}

export const ReadyToAct: Story = {
  render: () => renderAdventure(readyAdventure),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.findByRole('textbox', { name: 'What would you like to do?' })
    ).resolves.toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Pass' })).toBeVisible()
    await expect(
      canvas.queryByText(
        "Your turn and relevant Adventure and World context will be processed by Lorecraft's configured AI provider."
      )
    ).not.toBeInTheDocument()
  },
}

export const TurnPending: Story = {
  render: () =>
    renderAdventure({
      ...readyAdventure,
      activeTurn: {
        id: '33333333-3333-4333-8333-333333333333',
        trigger: 'act',
        status: 'pending',
        content: 'I follow Mira into the vestry.',
      },
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.findByRole('status', { name: 'Resolving your turn' })
    ).resolves.toBeVisible()
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
        content: null,
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
    await expect(
      within(settingsDialog).getByRole('tablist', { name: 'Adventure settings sections' })
    ).toBeVisible()
    await expect(
      within(settingsDialog).getByRole('tab', { name: 'Adventure Settings' })
    ).toHaveAttribute('aria-selected', 'true')
    await expect(within(settingsDialog).getByRole('tab', { name: 'Player' })).toBeVisible()
    await expect(within(settingsDialog).getByRole('tab', { name: 'NPCs' })).toBeVisible()
    await expect(within(settingsDialog).getByRole('tab', { name: 'Locations' })).toBeVisible()
    await userEvent.click(within(settingsDialog).getByRole('tab', { name: 'Player' }))
    await expect(within(settingsDialog).getByLabelText('Name')).toHaveValue('Elara Vance')
    await expect(within(settingsDialog).getByLabelText('Status')).toBeVisible()
    await expect(within(settingsDialog).getByLabelText('Status')).not.toBeDisabled()
    await userEvent.click(within(settingsDialog).getByRole('tab', { name: 'Adventure Settings' }))
    await userEvent.click(within(settingsDialog).getByRole('button', { name: 'Reset Adventure' }))
    await expect(page.getByRole('dialog', { name: 'Reset Adventure?' })).toBeVisible()
  },
}

export const NpcSettings: Story = {
  render: () =>
    renderAdventure({
      ...readyAdventure,
      scene: {
        ...readyAdventure.scene,
        npcs: [
          ...readyAdventure.scene.npcs,
          {
            key: 'samira',
            name: 'Samira Vale',
            physicalDescription: 'A courier with wind-tangled hair.',
            background: 'Samira carries messages between the coast and the city.',
            personality: 'Quick-witted and guarded.',
            voice: 'Warm but measured.',
            privateKnowledge: 'She saw Mira at the bell tower before the storm.',
            currentLocation: { key: 'chapel', name: 'Chapel' },
            mood: 'Alert',
            status: 'Waiting out the storm.',
            memory: 'She has not spoken with the player yet.',
          },
        ],
      },
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(await canvas.findByRole('button', { name: 'Adventure settings' }))
    const settingsDialog = page.getByRole('dialog', { name: 'Adventure settings' })
    await userEvent.click(within(settingsDialog).getByRole('tab', { name: 'NPCs' }))
    await expect(within(settingsDialog).getByRole('button', { name: 'Edit Mira' })).toBeVisible()
    await expect(
      within(settingsDialog).getByRole('button', { name: 'Edit Samira Vale' })
    ).toBeVisible()
    await userEvent.click(within(settingsDialog).getByRole('button', { name: 'Edit Mira' }))
    await expect(within(settingsDialog).getByRole('textbox', { name: 'Name' })).toBeVisible()
    await expect(
      within(settingsDialog).getByRole('textbox', { name: 'Private knowledge' })
    ).toBeVisible()
  },
}
