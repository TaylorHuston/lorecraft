import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { AppRoutes } from '../app/AppRoutes'
import { AuthProvider } from '../auth/AuthProvider'
import { StorybookAppProviders } from '../stories/StorybookAppProviders'
import { WorldApiError, type WorldApi, type WorldDetail } from '../worlds/worldApi'
import { NewAdventurePage } from './NewAdventurePage'
import { AdventureApiError, type AdventureApi } from './adventureApi'

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

const worldApiDefaults: Pick<WorldApi, 'createCharacter' | 'updateCharacter' | 'deleteCharacter'> = {
  createCharacter: async () => undefined,
  updateCharacter: async () => undefined,
  deleteCharacter: async () => undefined,
}

function renderForm(source = world) {
  const worldApi: WorldApi = {
    ...worldApiDefaults,
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

function renderRoutedSessionLoss({
  worldApi,
  adventureApi,
}: {
  worldApi: WorldApi
  adventureApi: AdventureApi
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false, retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        api={{
          restoreSession: async () => ({ id: 1, email: 'keeper@lorecraft.test' }),
          signUp: async (input) => ({ id: 2, email: input.email }),
          signIn: async (input) => ({ id: 1, email: input.email }),
          signOut: async () => undefined,
        }}
      >
        <MemoryRouter initialEntries={['/worlds/stormbound-chapel/adventures/new']}>
          <AppRoutes worldApi={worldApi} adventureApi={adventureApi} />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

const meta = {
  title: 'Application/Adventures/New',
  component: NewAdventurePage,
  args: {
    worldApi: { ...worldApiDefaults, listWorlds: async () => [], getWorld: async () => world },
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

export const WorldLoadSessionLoss: Story = {
  render: () =>
    renderRoutedSessionLoss({
      worldApi: {
        ...worldApiDefaults,
        listWorlds: async () => [],
        getWorld: async () => {
          throw new WorldApiError('unauthorized', 'Session ended')
        },
      },
      adventureApi,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.findByRole('heading', { name: 'Sign in to Lorecraft' })
    ).resolves.toBeVisible()
    await expect(canvas.queryByRole('heading', { name: 'Start an Adventure' })).not.toBeInTheDocument()
    await waitFor(() => expect(canvasElement.ownerDocument.title).toBe('Sign in | Lorecraft'))
  },
}

export const CreationSessionLoss: Story = {
  render: () =>
    renderRoutedSessionLoss({
      worldApi: {
        ...worldApiDefaults,
        listWorlds: async () => [],
        getWorld: async () => world,
      },
      adventureApi: {
        ...adventureApi,
        createAdventure: async () => {
          throw new AdventureApiError('unauthorized', 'Session ended')
        },
      },
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      await canvas.findByLabelText('Player name (required)'),
      'Elara Vance'
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Start Adventure' }))

    await expect(
      canvas.findByRole('heading', { name: 'Sign in to Lorecraft' })
    ).resolves.toBeVisible()
    await expect(canvas.queryByRole('heading', { name: 'Start an Adventure' })).not.toBeInTheDocument()
    await waitFor(() => expect(canvasElement.ownerDocument.title).toBe('Sign in | Lorecraft'))
  },
}
