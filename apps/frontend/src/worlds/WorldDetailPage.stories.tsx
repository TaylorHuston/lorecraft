import type { Meta, StoryObj } from '@storybook/react-vite'
import { Route, Routes } from 'react-router-dom'
import { expect, within } from 'storybook/test'
import { StorybookAppProviders } from '../stories/StorybookAppProviders'
import { WorldDetailPage } from './WorldDetailPage'
import { WorldApiError, type WorldApi, type WorldDetail } from './worldApi'

const detail: WorldDetail = {
  id: 1,
  slug: 'stormbound-chapel',
  name: 'Stormbound Chapel',
  description: 'A rain-lashed chapel and the people keeping its secrets.',
  visibility: 'public',
  readOnly: true,
  locations: [{ key: 'chapel', name: 'Chapel', description: 'Rain taps against warped shutters.' }],
  characters: [
    {
      key: 'mira',
      name: 'Mira',
      physicalDescription: 'A local woman with damp dark hair and watchful eyes.',
      background: 'Mira grew up around the chapel.',
      personality: 'Cautious and observant.',
      voice: 'Plain-spoken and restrained.',
      privateKnowledge: 'The bell rang at midnight.',
      location: { key: 'chapel', name: 'Chapel' },
    },
  ],
}

function render(api: WorldApi) {
  return (
    <StorybookAppProviders route="/worlds/stormbound-chapel">
      <Routes>
        <Route path="/worlds/:slug" element={<WorldDetailPage worldApi={api} />} />
      </Routes>
    </StorybookAppProviders>
  )
}

const meta = {
  title: 'Application/Worlds/Detail',
  component: WorldDetailPage,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof WorldDetailPage>
export default meta
type Story = StoryObj<typeof meta>

const loadedApi: WorldApi = { listWorlds: async () => [detail], getWorld: async () => detail }
export const Loaded: Story = {
  args: { worldApi: loadedApi },
  render: () => render(loadedApi),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByRole('heading', { name: 'Stormbound Chapel' })).resolves.toBeVisible()
    await expect(canvas.getByText('The bell rang at midnight.')).toBeVisible()
  },
}

const missingApi: WorldApi = {
  listWorlds: async () => [],
  getWorld: async () => {
    throw new WorldApiError('not-found', 'Missing')
  },
}
export const NotFound: Story = {
  args: { worldApi: missingApi },
  render: () => render(missingApi),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).findByRole('heading', { name: 'World not found' })
    ).resolves.toBeVisible()
  },
}
