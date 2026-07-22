import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import type { AdventureApi, AdventureDetail } from '../adventures/adventureApi'
import { AdventureWorkbench } from '../adventures/AdventureWorkbench'
import { StorybookAppProviders } from '../stories/StorybookAppProviders'
import type { WorldApi } from '../worlds/worldApi'
import { WorkspacePage } from '../workspace/WorkspacePage'
import styles from './Workbench.stories.module.css'

const RuntimeError = globalThis.Error

const storyParagraphs = [
  'The chapel doors yield to the storm, and Mira looks up from the darkened aisle.',
  'Water follows Elara across the old stones in a silver trail. Brother Alden shields the lantern with one hand and studies the forbidden map with the other.',
  'The bell sounds once above them. No rope moves, but dust drifts from the rafters as though something has crossed the narrow gallery.',
  'Mira steps away from the altar. She keeps her voice low when she asks where Elara found the mark drawn in the map margin.',
  'Outside, wind presses hard against the warped shutters. The flame gutters, recovers, and throws three long shadows across the chapel wall.',
  'Elara opens the map on the nearest pew. Its coastlines are familiar, but a road now runs inland where the parchment had been blank that morning.',
  'Brother Alden names the vanished road in a language older than the chapel. Mira answers him before he can translate it.',
  'For a moment, neither local looks at Elara. Their shared silence makes plain that the storm is not the first danger to reach this place.',
  'A knock interrupts them: measured, patient, and coming from the sealed vestry door rather than the entrance behind Elara.',
  'The map ink darkens with every knock. A small circle forms around the chapel, then another around the graveyard north of the hill.',
  'Mira takes the lantern from Alden. She says the vestry has been locked since the old priest disappeared and that nobody living carries its key.',
  'Alden objects, but his hand has already moved to the iron chain at his waist. A tarnished key hangs there among the chapel seals.',
]

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
        background: 'Mira grew up around the chapel.',
        personality: 'Cautious and observant.',
        voice: 'Plain-spoken and restrained.',
        privateKnowledge: 'Mira rang the bell before the storm arrived.',
        currentLocation: { key: 'chapel', name: 'Chapel' },
        mood: 'Watchful',
        status: 'Sheltering in the chapel.',
        memory: 'She has not yet met the player.',
      },
      {
        key: 'alden',
        name: 'Brother Alden',
        physicalDescription: 'A small priest carrying a black cassock and an old iron key.',
        background: 'Alden has guarded the chapel archive for decades.',
        personality: 'Guarded and dutiful.',
        voice: 'Measured and formal.',
        privateKnowledge: 'He carries the vestry key.',
        currentLocation: { key: 'chapel', name: 'Chapel' },
        mood: 'Concerned',
        status: 'Studying the player.',
        memory: 'He has not yet spoken to the player.',
      },
    ],
  },
  activeTurn: null,
  story: [
    {
      id: 'opening',
      kind: 'narration',
      content: storyParagraphs.join('\n\n'),
    },
  ],
}

function constrainedWorkbench(layout: 'desktop' | 'mobile') {
  return (
    <div className={styles.viewport} data-testid="comparison-viewport">
      <AdventureWorkbench adventure={adventure} layout={layout} />
    </div>
  )
}

function expectViewportHeight(element: HTMLElement) {
  const view = element.ownerDocument.defaultView
  if (!view) throw new RuntimeError('Comparison viewport is not attached to a window.')
  const bounds = element.getBoundingClientRect()

  expect(Math.abs(bounds.top)).toBeLessThanOrEqual(1)
  expect(Math.abs(bounds.bottom - view.innerHeight)).toBeLessThanOrEqual(1)
  expect(Math.abs(bounds.height - view.innerHeight)).toBeLessThanOrEqual(1)
  expect(element.ownerDocument.documentElement.scrollHeight).toBeLessThanOrEqual(
    view.innerHeight + 1
  )
}

function expectInternalScroll(element: HTMLElement) {
  const ownerDocument = element.ownerDocument
  const documentScrollTop = ownerDocument.documentElement.scrollTop
  const elementScrollTop = element.scrollTop

  expect(getComputedStyle(element).overflowY).toBe('auto')
  expect(element.scrollHeight).toBeGreaterThan(element.clientHeight)
  element.scrollTop = element.scrollHeight
  expect(element.scrollTop).toBeGreaterThan(0)
  expect(ownerDocument.documentElement.scrollTop).toBe(documentScrollTop)
  element.scrollTop = elementScrollTop
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
  submitTurn: async () => {
    throw new RuntimeError('Not used in this story.')
  },
  retryTurn: async () => {
    throw new RuntimeError('Not used in this story.')
  },
  discardTurn: async () => {
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

const worldApiDefaults: Pick<WorldApi, 'createCharacter' | 'updateCharacter' | 'deleteCharacter'> = {
  createCharacter: async () => undefined,
  updateCharacter: async () => undefined,
  deleteCharacter: async () => undefined,
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
  render: () => constrainedWorkbench('desktop'),
  parameters: { viewport: { defaultViewport: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const viewport = canvas.getByTestId('comparison-viewport')
    const workbench = viewport.querySelector<HTMLElement>('[data-slot="adventure-workbench"]')
    const story = canvas.getByRole('region', { name: 'Story' })
    const player = canvas.getByRole('region', { name: 'Player' })
    const scene = canvas.getByRole('region', { name: 'Scene' })
    const storyScrollRegion = viewport.querySelector<HTMLElement>(
      '[data-slot="story-scroll-region"]'
    )

    await expect(story).toBeVisible()
    await expect(player).toBeVisible()
    await expect(scene).toBeVisible()
    await expect(workbench).not.toBeNull()
    await expect(storyScrollRegion).not.toBeNull()
    expectViewportHeight(viewport)
    expect(workbench?.getBoundingClientRect().height).toBe(viewport.getBoundingClientRect().height)
    expect(getComputedStyle(player).overflowY).toBe('auto')
    expect(getComputedStyle(scene).overflowY).toBe('auto')
    expectInternalScroll(storyScrollRegion!)
  },
}

export const Mobile: Story = {
  render: () => constrainedWorkbench('mobile'),
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const viewport = canvas.getByTestId('comparison-viewport')
    const workbench = viewport.querySelector<HTMLElement>('[data-slot="adventure-workbench"]')
    const storyScrollRegion = viewport.querySelector<HTMLElement>(
      '[data-slot="story-scroll-region"]'
    )

    await expect(canvas.getByRole('tab', { name: 'Story' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await expect(workbench).not.toBeNull()
    await expect(storyScrollRegion).not.toBeNull()
    expectViewportHeight(viewport)
    expect(workbench?.getBoundingClientRect().height).toBe(viewport.getBoundingClientRect().height)
    expectInternalScroll(storyScrollRegion!)
  },
}

export const FileBrowser: Story = {
  render: () =>
    workspace({
      ...worldApiDefaults,
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
      ...worldApiDefaults,
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
      ...worldApiDefaults,
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
