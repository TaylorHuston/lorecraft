import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderTestApp } from '../test/renderTestApp'
import type { WorldDetail } from '../worlds/worldApi'
import {
  AdventureApiError,
  adventureQueryKeys,
  type AdventureDetail,
} from './adventureApi'

const playableWorld: WorldDetail = {
  id: 1,
  slug: 'stormbound-chapel',
  name: 'Stormbound Chapel',
  description: 'A storm-battered sanctuary where old vows still shape the living.',
  visibility: 'public',
  readOnly: true,
  playability: { available: true, reason: null },
  adventures: [],
  locations: [],
  characters: [],
}

const pendingAdventure: AdventureDetail = {
  id: '11111111-1111-4111-8111-111111111111',
  status: 'opening_pending',
  turnCount: 0,
  lastPlayedAt: '2026-07-16T20:30:00.000Z',
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
    currentLocation: { key: 'chapel', name: 'Stormbound Chapel' },
  },
  scene: {
    location: {
      key: 'chapel',
      name: 'Stormbound Chapel',
      description: 'A ruined sanctuary above the coast.',
    },
    npcs: [
      {
        key: 'mira',
        name: 'Mira the Restless',
        physicalDescription: 'A spectral figure carrying a dying candle.',
      },
    ],
  },
  story: [],
}

describe('Adventure routes', () => {
  it('LC-003/S1/R1-S2 presents associated creation validation and preserves World navigation', async () => {
    const user = userEvent.setup()
    const createAdventure = vi.fn()
    renderTestApp({
      route: '/worlds/stormbound-chapel/adventures/new',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { getWorld: async () => playableWorld },
      adventureApi: { createAdventure },
    })

    expect(await screen.findByRole('heading', { name: 'Start an Adventure' })).toBeVisible()
    expect(screen.getByText('Stormbound Chapel')).toBeVisible()
    expect(screen.getByLabelText('Player name (required)')).toBeRequired()
    expect(screen.getByLabelText('Physical description (optional)')).not.toBeRequired()
    expect(screen.getByLabelText('Backstory (optional)')).not.toBeRequired()
    expect(
      screen.getByText(/player details and this frozen World context.*configured AI provider/i)
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute(
      'href',
      '/worlds/stormbound-chapel'
    )

    await user.click(screen.getByRole('button', { name: 'Start Adventure' }))

    expect(screen.getByText('Enter a player name.')).toHaveAttribute('id', 'player-name-error')
    expect(screen.getByLabelText('Player name (required)')).toHaveAttribute(
      'aria-describedby',
      'player-name-error'
    )
    expect(screen.getByLabelText('Player name (required)')).toHaveFocus()
    expect(createAdventure).not.toHaveBeenCalled()
  })

  it('LC-003/S1/R1-S1 + R1-S2 preserves input and one idempotency key across a safe retry', async () => {
    const user = userEvent.setup()
    const createAdventure = vi
      .fn()
      .mockRejectedValueOnce(new AdventureApiError('network', 'Unavailable'))
      .mockReturnValueOnce(new Promise(() => undefined))
    renderTestApp({
      route: '/worlds/stormbound-chapel/adventures/new',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { getWorld: async () => playableWorld },
      adventureApi: { createAdventure },
    })

    await user.type(await screen.findByLabelText('Player name (required)'), 'Elara Vance')
    await user.type(
      screen.getByLabelText('Physical description (optional)'),
      'A scholar in a salt-stained cloak.'
    )
    await user.click(screen.getByRole('button', { name: 'Start Adventure' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Lorecraft could not start this Adventure. Try again.'
    )
    expect(screen.getByLabelText('Player name (required)')).toHaveValue('Elara Vance')

    await user.click(screen.getByRole('button', { name: 'Start Adventure' }))
    expect(screen.getByRole('button', { name: 'Starting Adventure…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Starting Adventure…' }).closest('form')).toHaveAttribute(
      'aria-busy',
      'true'
    )
    expect(screen.getByLabelText('Player name (required)')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByLabelText('Physical description (optional)')).toHaveAttribute(
      'aria-busy',
      'true'
    )
    expect(screen.getByLabelText('Backstory (optional)')).toHaveAttribute('aria-busy', 'true')
    expect(createAdventure).toHaveBeenCalledTimes(2)
    expect(createAdventure.mock.calls[0][1].creationRequestId).toBe(
      createAdventure.mock.calls[1][1].creationRequestId
    )
    expect(createAdventure.mock.calls[1][1].player).toEqual({
      name: 'Elara Vance',
      physicalDescription: 'A scholar in a salt-stained cloak.',
    })
  })

  it('LC-003/S1/R3-S3 prevents duplicate unavailable-Adventure retries', async () => {
    const user = userEvent.setup()
    const getAdventure = vi
      .fn()
      .mockRejectedValueOnce(new AdventureApiError('network', 'Unavailable'))
      .mockReturnValueOnce(new Promise(() => undefined))
    renderTestApp({
      route: pendingAdventure.route,
      session: { id: 4, email: 'member@example.com' },
      adventureApi: { getAdventure },
    })

    const retry = await screen.findByRole('button', { name: 'Try again' })
    await user.click(retry)

    expect(screen.getByRole('button', { name: 'Trying again…' })).toBeDisabled()
    expect(getAdventure).toHaveBeenCalledTimes(2)
  })

  it('LC-003/S1/R1-S2 focuses and announces the first optional field rejected by the API', async () => {
    const user = userEvent.setup()
    const createAdventure = vi.fn().mockRejectedValue(
      new AdventureApiError('validation', 'Invalid profile', {
        'player.physicalDescription': 'Physical description is too long.',
        'player.backstory': 'Backstory is too long.',
      })
    )
    renderTestApp({
      route: '/worlds/stormbound-chapel/adventures/new',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { getWorld: async () => playableWorld },
      adventureApi: { createAdventure },
    })

    await user.type(await screen.findByLabelText('Player name (required)'), 'Elara Vance')
    await user.type(screen.getByLabelText('Physical description (optional)'), 'Description')
    await user.type(screen.getByLabelText('Backstory (optional)'), 'Backstory')
    await user.click(screen.getByRole('button', { name: 'Start Adventure' }))

    expect(await screen.findByText('Physical description is too long.')).toHaveAttribute(
      'role',
      'alert'
    )
    expect(screen.getByLabelText('Physical description (optional)')).toHaveFocus()
  })

  it('LC-003/S1/R3-S2 polls pending work until the ready opening is authoritative', async () => {
    const readyAdventure: AdventureDetail = {
      ...pendingAdventure,
      status: 'ready',
      story: [
        {
          id: 'opening',
          kind: 'narration',
          content: 'The chapel doors open against the storm.',
        },
      ],
    }
    const getAdventure = vi
      .fn()
      .mockResolvedValueOnce(pendingAdventure)
      .mockResolvedValueOnce(readyAdventure)
    renderTestApp({
      route: pendingAdventure.route,
      session: { id: 4, email: 'member@example.com' },
      adventureApi: { getAdventure },
      adventurePollIntervalMs: 10,
    })

    expect(await screen.findByRole('heading', { name: 'Story' })).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('Preparing your opening')
    expect(screen.getByRole('region', { name: 'Player' })).toHaveTextContent('Elara Vance')
    expect(screen.getByRole('region', { name: 'Scene' })).toHaveTextContent('Mira the Restless')
    const playerRegion = screen.getByRole('region', { name: 'Player' })
    playerRegion.focus()
    expect(await screen.findByText('The chapel doors open against the storm.')).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('Your Adventure opening is ready.')
    expect(playerRegion).toHaveFocus()
    await waitFor(() => expect(getAdventure).toHaveBeenCalledTimes(2))
  })

  it('LC-003/S1/R3-S3 retries terminal failure and moves focus to the restarted Story status', async () => {
    const user = userEvent.setup()
    const retryOpening = vi.fn().mockResolvedValue({
      adventureId: pendingAdventure.id,
      status: 'opening_pending',
      generation: 2,
    })
    renderTestApp({
      route: pendingAdventure.route,
      session: { id: 4, email: 'member@example.com' },
      adventureApi: {
        getAdventure: async () => ({ ...pendingAdventure, status: 'opening_failed' }),
        retryOpening,
      },
      adventurePollIntervalMs: 60_000,
    })

    await user.click(await screen.findByRole('button', { name: 'Try again' }))

    expect(retryOpening).toHaveBeenCalledWith(pendingAdventure.id)
    expect(await screen.findByRole('status')).toHaveTextContent('Preparing your opening')
    expect(screen.getByRole('region', { name: 'Story' })).toHaveFocus()
  })

  it('LC-003/S1/R3-S3 reports a failed opening retry', async () => {
    const user = userEvent.setup()
    renderTestApp({
      route: pendingAdventure.route,
      session: { id: 4, email: 'member@example.com' },
      adventureApi: {
        getAdventure: async () => ({ ...pendingAdventure, status: 'opening_failed' }),
        retryOpening: async () => {
          throw new AdventureApiError('network', 'Unavailable')
        },
      },
      adventurePollIntervalMs: 60_000,
    })

    await user.click(await screen.findByRole('button', { name: 'Try again' }))

    expect(
      await screen.findByText('Lorecraft could not retry this opening. Try again.')
    ).toBeVisible()
    expect(screen.getByRole('region', { name: 'Story' })).toHaveFocus()
  })

  it('LC-001/S3/R1-S4 ends the shared session when Adventure detail reports unauthorized', async () => {
    renderTestApp({
      route: pendingAdventure.route,
      session: { id: 4, email: 'member@example.com' },
      adventureApi: {
        getAdventure: async () => {
          throw new AdventureApiError('unauthorized', 'Session ended')
        },
      },
    })

    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    expect(screen.queryByText('Elara Vance')).not.toBeInTheDocument()
  })

  it('LC-003/S1/R4-S2 confirms reset, restores cancelled focus, and restarts the same Adventure', async () => {
    const user = userEvent.setup()
    const resetAdventure = vi.fn().mockResolvedValue({
      adventureId: pendingAdventure.id,
      status: 'opening_pending',
      generation: 2,
    })
    const { queryClient } = renderTestApp({
      route: pendingAdventure.route,
      session: { id: 4, email: 'member@example.com' },
      adventureApi: {
        getAdventure: async () => ({
          ...pendingAdventure,
          status: 'ready',
          turnCount: 3,
          story: [{ id: 'opening', kind: 'narration', content: 'An opening.' }],
        }),
        resetAdventure,
      },
      adventurePollIntervalMs: 60_000,
    })

    const settingsTrigger = await screen.findByRole('button', { name: 'Adventure settings' })
    await user.click(settingsTrigger)
    let settingsDialog = screen.getByRole('dialog', { name: 'Adventure settings' })
    let resetTrigger = within(settingsDialog).getByRole('button', { name: 'Reset Adventure' })
    await user.click(resetTrigger)
    let dialog = await screen.findByRole('dialog', { name: 'Reset Adventure?' })
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(settingsTrigger).toHaveFocus()

    await user.click(settingsTrigger)
    settingsDialog = screen.getByRole('dialog', { name: 'Adventure settings' })
    resetTrigger = within(settingsDialog).getByRole('button', { name: 'Reset Adventure' })
    await user.click(resetTrigger)
    dialog = await screen.findByRole('dialog', { name: 'Reset Adventure?' })
    await user.click(within(dialog).getByRole('button', { name: 'Reset Adventure' }))

    expect(resetAdventure).toHaveBeenCalledWith(pendingAdventure.id)
    expect(await screen.findByRole('status')).toHaveTextContent('Preparing your opening')
    expect(screen.queryByText('An opening.')).not.toBeInTheDocument()
    expect(
      queryClient.getQueryData<AdventureDetail>(
        adventureQueryKeys.detail(4, pendingAdventure.id)
      )?.turnCount
    ).toBe(0)
  })

  it('LC-003/S1/R5-S3 keeps reset unavailable while opening work is active', async () => {
    const user = userEvent.setup()
    renderTestApp({
      route: pendingAdventure.route,
      session: { id: 4, email: 'member@example.com' },
      adventureApi: { getAdventure: async () => pendingAdventure },
      adventurePollIntervalMs: 60_000,
    })

    await user.click(await screen.findByRole('button', { name: 'Adventure settings' }))
    const settingsDialog = screen.getByRole('dialog', { name: 'Adventure settings' })
    expect(within(settingsDialog).getByRole('button', { name: 'Reset Adventure' })).toBeDisabled()
    expect(
      within(settingsDialog).getByText('Reset is unavailable while the opening is active.')
    ).toBeVisible()
  })

  it('LC-003/S1/R5-S3 announces a pending reset and prevents duplicate confirmation', async () => {
    const user = userEvent.setup()
    const resetAdventure = vi.fn(
      () =>
        new Promise<{
          adventureId: string
          status: 'opening_pending'
          generation: number
        }>(() => undefined)
    )
    renderTestApp({
      route: pendingAdventure.route,
      session: { id: 4, email: 'member@example.com' },
      adventureApi: {
        getAdventure: async () => ({ ...pendingAdventure, status: 'ready' }),
        resetAdventure,
      },
    })

    await user.click(await screen.findByRole('button', { name: 'Adventure settings' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Adventure settings' })).getByRole('button', {
        name: 'Reset Adventure',
      })
    )
    const dialog = await screen.findByRole('dialog', { name: 'Reset Adventure?' })
    const confirm = within(dialog).getByRole('button', { name: 'Reset Adventure' })

    await user.click(confirm)

    expect(within(dialog).getByRole('status')).toHaveTextContent('Resetting Adventure…')
    expect(within(dialog).getByRole('button', { name: 'Resetting Adventure…' })).toBeDisabled()
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled()
    await user.click(within(dialog).getByRole('button', { name: 'Resetting Adventure…' }))
    expect(resetAdventure).toHaveBeenCalledTimes(1)
  })

  it('LC-003/S1/R5-S3 keeps the reset confirmation coherent after a server conflict', async () => {
    const user = userEvent.setup()
    renderTestApp({
      route: pendingAdventure.route,
      session: { id: 4, email: 'member@example.com' },
      adventureApi: {
        getAdventure: async () => ({ ...pendingAdventure, status: 'ready' }),
        resetAdventure: async () => {
          throw new AdventureApiError(
            'conflict',
            'Adventure opening is active.',
            {},
            'The opening started in another session. Wait for it to finish.'
          )
        },
      },
    })

    await user.click(await screen.findByRole('button', { name: 'Adventure settings' }))
    const settingsDialog = screen.getByRole('dialog', { name: 'Adventure settings' })
    await user.click(within(settingsDialog).getByRole('button', { name: 'Reset Adventure' }))
    const dialog = await screen.findByRole('dialog', { name: 'Reset Adventure?' })
    await user.click(within(dialog).getByRole('button', { name: 'Reset Adventure' }))

    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'The opening started in another session. Wait for it to finish.'
    )
    expect(dialog).toBeVisible()
  })
})
