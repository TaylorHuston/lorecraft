import type { Meta, StoryObj } from '@storybook/react-vite'
import { Route, Routes } from 'react-router-dom'
import { expect, userEvent, within } from 'storybook/test'
import { StorybookAppProviders } from '../stories/StorybookAppProviders'
import type { WorldApi, WorldDetail } from '../worlds/worldApi'
import { NewAdventurePage } from './NewAdventurePage'
import type { AdventureApi } from './adventureApi'

const world: WorldDetail = {
  id: 1,
  slug: 'stormbound-chapel',
  name: 'Stormbound Chapel',
  description: 'A rain-lashed chapel and the people keeping its secrets.',
  visibility: 'public',
  readOnly: true,
  playability: { available: true, reason: null },
  adventures: [],
  locations: [],
  characters: [],
}

const adventureApi: AdventureApi = {
  createAdventure: async () => new Promise(() => undefined),
  getAdventure: async () => {
    throw new Error('Not used in this story.')
  },
  retryOpening: async () => {
    throw new Error('Not used in this story.')
  },
  submitTurn: async () => {
    throw new Error('Not used in this story.')
  },
  retryTurn: async () => {
    throw new Error('Not used in this story.')
  },
  discardTurn: async () => {
    throw new Error('Not used in this story.')
  },
  resetAdventure: async () => {
    throw new Error('Not used in this story.')
  },
  deleteAdventure: async () => undefined,
}

function renderForm(source = world) {
  const worldApi: WorldApi = {
    listWorlds: async () => [],
    getWorld: async () => source,
  }
  return (
    <StorybookAppProviders route="/worlds/stormbound-chapel/adventures/new">
      <Routes>
        <Route
          path="/worlds/:slug/adventures/new"
          element={<NewAdventurePage worldApi={worldApi} adventureApi={adventureApi} />}
        />
      </Routes>
    </StorybookAppProviders>
  )
}

const meta = {
  title: 'Application/Adventures/New',
  component: NewAdventurePage,
  args: {
    worldApi: { listWorlds: async () => [], getWorld: async () => world },
    adventureApi,
  },
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof NewAdventurePage>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: () => renderForm(),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).findByRole('heading', { name: 'Start an Adventure' })
    ).resolves.toBeVisible()
  },
}

export const Validation: Story = {
  render: () => renderForm(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Start Adventure' }))
    await expect(canvas.getByText('Enter a player name.')).toBeVisible()
  },
}

export const Submitting: Story = {
  render: () => renderForm(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(await canvas.findByLabelText('Player name (required)'), 'Elara Vance')
    await userEvent.click(canvas.getByRole('button', { name: 'Start Adventure' }))
    await expect(canvas.getByRole('button', { name: 'Starting Adventure…' })).toBeDisabled()
  },
}

export const Unplayable: Story = {
  render: () =>
    renderForm({
      ...world,
      playability: { available: false, reason: 'This World has no published starting point.' },
    }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).findByRole('alert')).resolves.toHaveTextContent(
      'not playable yet'
    )
  },
}

export const EmptyMobile: Story = {
  ...Empty,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
