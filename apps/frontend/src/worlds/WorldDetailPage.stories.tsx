import type { Meta, StoryObj } from '@storybook/react-vite'
import { Route, Routes } from 'react-router-dom'
import { expect, userEvent, within } from 'storybook/test'
import type { AdventureApi } from '../adventures/adventureApi'
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
  playability: { available: true, reason: null },
  adventures: [],
  locations: [{ key: 'chapel', name: 'Chapel', description: 'Rain taps against warped shutters.' }],
  characters: [
    {
      key: 'mira',
      name: 'Mira',
      physicalDescription: 'A local woman with damp dark hair and watchful eyes.',
      background: 'Mira grew up around the chapel.',
      personality: 'Cautious and observant.',
      voice: 'Plain-spoken and restrained.',
      location: { key: 'chapel', name: 'Chapel' },
    },
  ],
}

const emptyApi: WorldApi = {
  listWorlds: async () => [],
  getWorld: async () => detail,
}

const adventureApi: AdventureApi = {
  createAdventure: async () => { throw new Error('Not used in this story.') },
  getAdventure: async () => { throw new Error('Not used in this story.') },
  retryOpening: async () => { throw new Error('Not used in this story.') },
  resetAdventure: async () => { throw new Error('Not used in this story.') },
  deleteAdventure: async () => undefined,
}

function detailApi(world: WorldDetail): WorldApi {
  return { ...emptyApi, getWorld: async () => world }
}

function renderDetail(api: WorldApi, route = '/worlds/stormbound-chapel') {
  return (
    <StorybookAppProviders route={route}>
      <Routes>
        <Route
          path="/worlds/:slug"
          element={<WorldDetailPage worldApi={api} adventureApi={adventureApi} />}
        />
      </Routes>
    </StorybookAppProviders>
  )
}

const loadedApi = detailApi(detail)
const loadingApi: WorldApi = { ...emptyApi, getWorld: () => new Promise(() => undefined) }
const missingApi: WorldApi = {
  ...emptyApi,
  getWorld: async () => {
    throw new WorldApiError('not-found', 'Missing')
  },
}
const unavailableApi: WorldApi = {
  ...emptyApi,
  getWorld: async () => {
    throw new WorldApiError('network', 'Unavailable')
  },
}
const longLocationName =
  'SanctuaryOfTheUnbrokenStormBeyondTheLastRecordedBoundaryOfTheNorthernMarches'
const longContentDetail: WorldDetail = {
  ...detail,
  characters: detail.characters.map((character) => ({
    ...character,
    location: { key: 'long-location', name: longLocationName },
  })),
}

const meta = {
  title: 'Application/Worlds/Detail',
  component: WorldDetailPage,
  args: { worldApi: loadedApi, adventureApi },
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof WorldDetailPage>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {
  args: { worldApi: loadingApi },
  render: () => renderDetail(loadingApi),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).findByRole('status')).resolves.toHaveTextContent(
      'Loading World…'
    )
  },
}

export const LoadingMobile: Story = {
  ...Loading,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const Loaded: Story = {
  args: { worldApi: loadedApi },
  render: () => renderDetail(loadedApi),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByRole('heading', { name: 'Stormbound Chapel' })).resolves.toBeVisible()
    await expect(canvas.getByText('A local woman with damp dark hair and watchful eyes.')).toBeVisible()
    await expect(canvas.getByText('Read only')).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Back to Worlds' })).toHaveAttribute(
      'href',
      '/worlds'
    )
  },
}

export const LoadedMobile: Story = {
  ...Loaded,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

const populatedAdventureDetail: WorldDetail = {
  ...detail,
  adventures: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      playerName: 'Elara Vance',
      status: 'ready',
      turnCount: 0,
      lastPlayedAt: '2026-07-16T20:30:00.000Z',
      route: '/adventures/11111111-1111-4111-8111-111111111111',
    },
  ],
}

export const AdventureList: Story = {
  args: { worldApi: detailApi(populatedAdventureDetail) },
  render: () => renderDetail(detailApi(populatedAdventureDetail)),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByText('Elara Vance')).resolves.toBeVisible()
    await expect(canvas.getByRole('link', { name: 'New Adventure' })).toBeVisible()
    const resume = canvas.getByRole('link', { name: 'Resume Adventure as Elara Vance' })
    await expect(resume).toBeVisible()
    await expect(resume).toHaveTextContent('Resume')
  },
}

export const DeleteConfirmation: Story = {
  ...AdventureList,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Delete Adventure for Elara Vance' })
    )
    await expect(
      canvas.getByRole('dialog', { name: "Delete Elara Vance's Adventure?" })
    ).toBeVisible()
  },
}

export const LongCharacterLocationMobile: Story = {
  args: { worldApi: detailApi(longContentDetail) },
  render: () => renderDetail(detailApi(longContentDetail)),
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByText(longLocationName)).resolves.toBeVisible()
    await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(
      canvasElement.ownerDocument.documentElement.clientWidth
    )
  },
}

export const EmptyLocations: Story = {
  args: { worldApi: detailApi({ ...detail, locations: [] }) },
  render: () => renderDetail(detailApi({ ...detail, locations: [] })),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.findByText('No Locations are recorded for this World.')
    ).resolves.toBeVisible()
    await expect(canvas.getByRole('heading', { name: 'Mira' })).toBeVisible()
  },
}

export const EmptyCharacters: Story = {
  args: { worldApi: detailApi({ ...detail, characters: [] }) },
  render: () => renderDetail(detailApi({ ...detail, characters: [] })),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.findByText('No Characters are recorded for this World.')
    ).resolves.toBeVisible()
    await expect(canvas.getByRole('heading', { name: 'Chapel' })).toBeVisible()
  },
}

const fullyEmptyDetail = { ...detail, locations: [], characters: [] }
export const EmptyCollections: Story = {
  args: { worldApi: detailApi(fullyEmptyDetail) },
  render: () => renderDetail(detailApi(fullyEmptyDetail)),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.findByText('No Locations are recorded for this World.')
    ).resolves.toBeVisible()
    await expect(canvas.getByText('No Characters are recorded for this World.')).toBeVisible()
  },
}

export const EmptyCollectionsMobile: Story = {
  ...EmptyCollections,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const NotFound: Story = {
  args: { worldApi: missingApi },
  render: () => renderDetail(missingApi, '/worlds/missing'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByRole('heading', { name: 'World not found' })).resolves.toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Back to Worlds' })).toBeVisible()
  },
}

export const NotFoundMobile: Story = {
  ...NotFound,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const Unavailable: Story = {
  args: { worldApi: unavailableApi },
  render: () => renderDetail(unavailableApi),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByRole('heading', { name: 'World unavailable' })).resolves.toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Try again' })).toBeEnabled()
  },
}

export const UnavailableMobile: Story = {
  args: { worldApi: unavailableApi },
  render: () => renderDetail(unavailableApi),
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByRole('heading', { name: 'World unavailable' })).resolves.toBeVisible()
    const retry = canvas.getByRole('button', { name: 'Try again' })
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
  args: { worldApi: unavailableApi },
  render: () => {
    let requests = 0
    const retryPendingApi: WorldApi = {
      ...emptyApi,
      getWorld: () => {
        requests += 1
        return requests === 1
          ? Promise.reject(new WorldApiError('network', 'Unavailable'))
          : new Promise(() => undefined)
      },
    }

    return renderDetail(retryPendingApi)
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
