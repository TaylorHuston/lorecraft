import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderTestApp } from '../test/renderTestApp'
import { WorldApiError, type WorldCatalogItem, type WorldDetail } from './worldApi'

const stormboundChapel: WorldCatalogItem = {
  id: 1,
  slug: 'stormbound-chapel',
  name: 'Stormbound Chapel',
  description: 'A storm-battered sanctuary where old vows still shape the living.',
  visibility: 'public',
  readOnly: true,
  playability: { available: true, reason: null },
  adventures: [],
}

const stormboundDetail: WorldDetail = {
  ...stormboundChapel,
  playability: { available: true, reason: null },
  adventures: [],
  locations: [{ key: 'chapel', name: 'Chapel', description: 'Rain taps against warped shutters.' }],
  characters: [
    {
      key: 'mira',
      name: 'Mira',
      physicalDescription: 'A local woman with watchful eyes.',
      background: 'Mira grew up around the chapel.',
      personality: 'Cautious and observant.',
      voice: 'Plain-spoken and restrained.',
      privateKnowledge: 'Mira rang the bell before the storm arrived.',
      initialMood: 'Watchful',
      initialStatus: 'Sheltering in the chapel.',
      initialMemory: 'She has not yet met the player.',
      location: { key: 'chapel', name: 'Chapel' },
    },
  ],
}

describe('World catalog and detail routes', () => {
  it('LC-002/S1/R1-S1 + R2-S1 loads accessible Worlds with identity and read-only navigation', async () => {
    const listWorlds = vi.fn().mockResolvedValue([stormboundChapel])

    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { listWorlds },
    })

    expect(await screen.findByRole('heading', { name: 'Worlds' })).toBeVisible()
    expect(screen.getByLabelText('Signed in as member@example.com')).toBeVisible()
    expect(await screen.findByText(stormboundChapel.description)).toBeVisible()
    expect(screen.getByText('Public')).toBeVisible()
    expect(screen.getByText('Read only')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Stormbound Chapel' })).toHaveAttribute(
      'href',
      '/worlds/stormbound-chapel'
    )
    expect(screen.getByRole('link', { name: 'New Adventure' })).toHaveAttribute(
      'href',
      '/worlds/stormbound-chapel/adventures/new'
    )
    expect(listWorlds).toHaveBeenCalledTimes(1)
  })

  it('lists and deletes an owner Adventure directly from the World catalog', async () => {
    const user = userEvent.setup()
    const deleteAdventure = vi.fn().mockResolvedValue(undefined)
    const adventure = {
      id: '11111111-1111-4111-8111-111111111111',
      playerName: 'Mara Venn',
      status: 'ready' as const,
      turnCount: 3,
      lastPlayedAt: '2026-07-16T19:00:00.000Z',
      route: '/adventures/11111111-1111-4111-8111-111111111111',
    }

    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      worldApi: {
        listWorlds: async () => [{ ...stormboundChapel, adventures: [adventure] }],
      },
      adventureApi: { deleteAdventure },
    })

    const resume = await screen.findByRole('link', { name: 'Resume Adventure as Mara Venn' })
    expect(resume).toHaveAttribute('href', adventure.route)
    expect(resume).toHaveTextContent('Resume')
    expect(screen.getByText('3 turns')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Delete Adventure for Mara Venn' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('The World is unchanged.')
    await user.click(screen.getByRole('button', { name: 'Delete Adventure' }))

    await waitFor(() => expect(deleteAdventure).toHaveBeenCalledWith(adventure.id))
    expect(
      screen.queryByRole('link', { name: 'Resume Adventure as Mara Venn' })
    ).not.toBeInTheDocument()
    expect(screen.getByText('No Adventures started in this World.')).toBeVisible()
  })

  it('isolates the catalog across account changes and purges the previous account cache', async () => {
    const firstAccount = { id: 4, email: 'first@example.com' }
    const secondAccount = { id: 9, email: 'second@example.com' }
    const firstCatalog = {
      ...stormboundChapel,
      description: 'First account catalog response.',
    }
    const secondCatalog = {
      ...stormboundChapel,
      description: 'Second account catalog response.',
    }
    const refreshedFirstCatalog = {
      ...stormboundChapel,
      description: 'Refreshed first account catalog response.',
    }
    const restoreSession = vi
      .fn()
      .mockResolvedValueOnce(firstAccount)
      .mockResolvedValueOnce(secondAccount)
      .mockResolvedValueOnce(firstAccount)
    const listWorlds = vi
      .fn()
      .mockResolvedValueOnce([firstCatalog])
      .mockResolvedValueOnce([secondCatalog])
      .mockResolvedValueOnce([refreshedFirstCatalog])

    renderTestApp({
      route: '/worlds',
      session: null,
      api: { restoreSession },
      worldApi: { listWorlds },
    })

    expect(await screen.findByText(firstCatalog.description)).toBeVisible()

    await act(async () => window.dispatchEvent(new Event('focus')))
    expect(await screen.findByText(secondCatalog.description)).toBeVisible()
    expect(screen.queryByText(firstCatalog.description)).not.toBeInTheDocument()

    await act(async () => window.dispatchEvent(new Event('focus')))
    expect(await screen.findByText(refreshedFirstCatalog.description)).toBeVisible()
    expect(screen.queryByText(firstCatalog.description)).not.toBeInTheDocument()
    expect(listWorlds).toHaveBeenCalledTimes(3)
  })

  it('LC-002/S1/R1-S3 + R2-S2 explains when no Worlds are available without creation', async () => {
    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { listWorlds: async () => [] },
    })

    expect(await screen.findByRole('heading', { name: 'No Worlds available' })).toBeVisible()
    expect(screen.getByText('There are no Worlds available to this account yet.')).toBeVisible()
    expect(screen.queryByRole('button', { name: /create.*world/i })).not.toBeInTheDocument()
  })

  it('LC-002/S1/R2-S2 shows catalog loading while Worlds are unresolved', async () => {
    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { listWorlds: () => new Promise(() => undefined) },
    })

    expect(await screen.findByText('Loading Worlds…')).toHaveAttribute('role', 'status')
  })

  it('LC-002/S1/R2-S3 recovers from a catalog load failure', async () => {
    const user = userEvent.setup()
    const listWorlds = vi
      .fn()
      .mockRejectedValueOnce(new Error('service unavailable'))
      .mockResolvedValueOnce([stormboundChapel])

    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { listWorlds },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Worlds could not be loaded. Try again.'
    )
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('link', { name: 'Stormbound Chapel' })).toBeVisible()
    expect(listWorlds).toHaveBeenCalledTimes(2)
  })

  it('LC-002/S1/R2-S4 preserves catalog context while retry is pending', async () => {
    const user = userEvent.setup()
    const listWorlds = vi
      .fn()
      .mockRejectedValueOnce(new Error('service unavailable'))
      .mockReturnValueOnce(new Promise(() => undefined))

    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { listWorlds },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Worlds could not be loaded. Try again.'
    )
    expect(screen.getByRole('heading', { name: 'Worlds' })).toBeVisible()
    expect(screen.getByLabelText('Signed in as member@example.com')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    const pendingRetry = screen.getByRole('button', { name: 'Trying again…' })
    expect(pendingRetry).toBeDisabled()
    expect(pendingRetry).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('heading', { name: 'Worlds' })).toBeVisible()
    expect(screen.getByLabelText('Signed in as member@example.com')).toBeVisible()
  })

  it('LC-002/S1/R2-S4 keeps the catalog visible while named sign-out is pending', async () => {
    const user = userEvent.setup()

    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      api: { signOut: () => new Promise(() => undefined) },
      worldApi: { listWorlds: async () => [stormboundChapel] },
    })

    await user.click(await screen.findByRole('button', { name: 'Sign out' }))

    const pendingSignOut = screen.getByRole('button', { name: 'Signing out…' })
    expect(pendingSignOut).toBeDisabled()
    expect(pendingSignOut).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('heading', { name: 'Worlds' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Stormbound Chapel' })).toBeVisible()
  })

  it('LC-001/S3/R1-S4 ends the shared session when the catalog reports unauthorized', async () => {
    const user = userEvent.setup()
    const listWorlds = vi
      .fn()
      .mockResolvedValueOnce([stormboundChapel])
      .mockRejectedValueOnce(new WorldApiError('unauthorized', 'Session ended'))

    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { listWorlds, getWorld: async () => stormboundDetail },
    })

    await user.click(await screen.findByRole('link', { name: 'Stormbound Chapel' }))
    expect(await screen.findByRole('heading', { name: 'Stormbound Chapel' })).toBeVisible()

    await user.click(screen.getByRole('link', { name: 'Back to Worlds' }))

    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    expect(screen.queryByText(stormboundChapel.description)).not.toBeInTheDocument()
    expect(screen.queryByText('member@example.com')).not.toBeInTheDocument()
    expect(listWorlds).toHaveBeenCalledTimes(2)
  })

  it('LC-002/S2/R1-S1 + R2-S1 renders structured read-only World detail without a byline', async () => {
    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { getWorld: async () => stormboundDetail },
    })
    expect(await screen.findByRole('heading', { name: 'Stormbound Chapel' })).toBeVisible()
    const canonDocument = screen.getByRole('article', { name: 'Stormbound Chapel' })
    expect(canonDocument).toContainElement(screen.getByRole('region', { name: 'Locations' }))
    expect(canonDocument).toContainElement(screen.getByRole('region', { name: 'Characters' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText(stormboundDetail.description)).toBeVisible()
    expect(screen.getByText('Read only')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to Worlds' })).toHaveAttribute('href', '/worlds')
    expect(screen.getByRole('heading', { name: 'Locations' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Mira' })).toBeVisible()
    expect(screen.getByText('Private knowledge')).toBeInTheDocument()
    expect(screen.getByText('Chapel', { selector: 'span' })).toBeVisible()
    expect(screen.queryByText('member@example.com')).not.toBeInTheDocument()
  })

  it('LC-002/S2/R2-S3 communicates empty Locations while preserving Character hierarchy', async () => {
    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { getWorld: async () => ({ ...stormboundDetail, locations: [] }) },
    })

    const locations = await screen.findByRole('region', { name: 'Locations' })
    expect(locations).toHaveTextContent('No Locations are recorded for this World.')
    expect(screen.getByRole('region', { name: 'Characters' })).toContainElement(
      screen.getByRole('heading', { name: 'Mira' })
    )
  })

  it('LC-003/S1/R4-S1 presents playable Adventure discovery before World canon', async () => {
    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'member@example.com' },
      worldApi: {
        getWorld: async () => ({
          ...stormboundDetail,
          adventures: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              playerName: 'Elara Vance',
              status: 'opening_pending',
              turnCount: 0,
              lastPlayedAt: '2026-07-16T20:30:00.000Z',
              route: '/adventures/11111111-1111-4111-8111-111111111111',
            },
          ],
        }),
      },
    })

    const adventures = await screen.findByRole('region', { name: 'Adventures' })
    expect(adventures).toHaveTextContent('Elara Vance')
    expect(adventures).toHaveTextContent('Opening pending')
    expect(adventures).toHaveTextContent('0 turns')
    const resume = screen.getByRole('link', { name: 'Resume Adventure as Elara Vance' })
    expect(resume).toHaveAttribute('href', '/adventures/11111111-1111-4111-8111-111111111111')
    expect(resume).toHaveTextContent('Resume')
    expect(screen.getByRole('link', { name: 'New Adventure' })).toHaveAttribute(
      'href',
      '/worlds/stormbound-chapel/adventures/new'
    )

    const locations = screen.getByRole('region', { name: 'Locations' })
    expect(
      adventures.compareDocumentPosition(locations) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('LC-003/S1/R2-S3 explains empty and unavailable Adventure states without blocking canon', async () => {
    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'member@example.com' },
      worldApi: {
        getWorld: async () => ({
          ...stormboundDetail,
          playability: {
            available: false,
            reason: 'This World does not have a playable published version.',
          },
        }),
      },
    })

    const adventures = await screen.findByRole('region', { name: 'Adventures' })
    expect(adventures).toHaveTextContent('No Adventures started in this World.')
    expect(adventures).toHaveTextContent('This World does not have a playable published version.')
    expect(screen.queryByRole('link', { name: 'New Adventure' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Locations' })).toBeVisible()
  })

  it('LC-003/S1/R4-S3 deletes only the confirmed Adventure from the World list', async () => {
    const user = userEvent.setup()
    const adventure = {
      id: '11111111-1111-4111-8111-111111111111',
      playerName: 'Elara Vance',
      status: 'ready' as const,
      turnCount: 0,
      lastPlayedAt: '2026-07-16T20:30:00.000Z',
      route: '/adventures/11111111-1111-4111-8111-111111111111',
    }
    const deleteAdventure = vi.fn().mockResolvedValue(undefined)
    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { getWorld: async () => ({ ...stormboundDetail, adventures: [adventure] }) },
      adventureApi: { deleteAdventure },
    })

    await user.click(
      await screen.findByRole('button', { name: 'Delete Adventure for Elara Vance' })
    )
    const dialog = screen.getByRole('dialog', { name: "Delete Elara Vance's Adventure?" })
    await user.click(within(dialog).getByRole('button', { name: 'Delete Adventure' }))

    expect(deleteAdventure).toHaveBeenCalledWith(adventure.id)
    expect(await screen.findByText('No Adventures started in this World.')).toBeVisible()
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Adventures' })).toHaveFocus())
  })

  it('LC-003 keeps World canon stable while an Adventure delete is pending', async () => {
    const user = userEvent.setup()
    const adventure = {
      id: '11111111-1111-4111-8111-111111111111',
      playerName: 'Elara Vance',
      status: 'ready' as const,
      turnCount: 0,
      lastPlayedAt: '2026-07-16T20:30:00.000Z',
      route: '/adventures/11111111-1111-4111-8111-111111111111',
    }
    const deleteAdventure = vi.fn(() => new Promise<void>(() => undefined))

    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { getWorld: async () => ({ ...stormboundDetail, adventures: [adventure] }) },
      adventureApi: { deleteAdventure },
    })

    await user.click(
      await screen.findByRole('button', { name: 'Delete Adventure for Elara Vance' })
    )
    const dialog = screen.getByRole('dialog', { name: "Delete Elara Vance's Adventure?" })
    await user.click(within(dialog).getByRole('button', { name: 'Delete Adventure' }))

    const pendingDelete = within(dialog).getByRole('button', { name: 'Deleting Adventure…' })
    expect(pendingDelete).toBeDisabled()
    expect(pendingDelete).toHaveAttribute('aria-busy', 'true')
    expect(deleteAdventure).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('heading', { name: 'Locations', hidden: true })).toBeInTheDocument()
  })

  it('LC-002/S2/R2-S3 communicates empty Characters while preserving Location hierarchy', async () => {
    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { getWorld: async () => ({ ...stormboundDetail, characters: [] }) },
    })

    const characters = await screen.findByRole('region', { name: 'Characters' })
    expect(characters).toHaveTextContent('No Characters are recorded for this World.')
    expect(screen.getByRole('region', { name: 'Locations' })).toContainElement(
      screen.getByRole('heading', { name: 'Chapel' })
    )
  })

  it('LC-002/S3/R6-S1 exposes complete debug cards but only author controls to the World author', async () => {
    const user = userEvent.setup()
    const createCharacter = vi.fn().mockResolvedValue(undefined)
    const authorWorld = { ...stormboundDetail, readOnly: false }

    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'author@example.com' },
      worldApi: { getWorld: async () => authorWorld, createCharacter },
    })

    expect(
      await screen.findByText(
        'Development / debug information: complete Character Cards include private knowledge and initial Adventure state.'
      )
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Add Character' }))
    await user.type(screen.getByLabelText('Key'), 'alden')
    await user.type(screen.getByLabelText('Name'), 'Brother Alden')
    await user.selectOptions(screen.getByLabelText('Canonical Location'), 'chapel')
    await user.type(screen.getByLabelText('Physical description'), 'A tired priest with a lantern.')
    await user.type(screen.getByLabelText('Background'), 'He guards the chapel archive.')
    await user.type(screen.getByLabelText('Personality'), 'Reserved and dutiful.')
    await user.type(screen.getByLabelText('Voice'), 'Measured and formal.')
    await user.type(screen.getByLabelText('Private knowledge'), 'He carries the vestry key.')
    await user.type(screen.getByLabelText('Initial mood'), 'Concerned')
    await user.type(screen.getByLabelText('Initial status'), 'Watching the player.')
    await user.type(screen.getByLabelText('Initial memory'), 'He has not yet spoken to the player.')
    await user.click(screen.getByRole('button', { name: 'Create Character' }))

    await waitFor(() =>
      expect(createCharacter).toHaveBeenCalledWith('stormbound-chapel', {
        key: 'alden',
        name: 'Brother Alden',
        locationKey: 'chapel',
        physicalDescription: 'A tired priest with a lantern.',
        background: 'He guards the chapel archive.',
        personality: 'Reserved and dutiful.',
        voice: 'Measured and formal.',
        privateKnowledge: 'He carries the vestry key.',
        initialMood: 'Concerned',
        initialStatus: 'Watching the player.',
        initialMemory: 'He has not yet spoken to the player.',
      })
    )
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Characters' })).toHaveFocus())
  })

  it('LC-002/S3/R6-S1 keeps mutation controls out of a non-author World detail', async () => {
    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 9, email: 'reader@example.com' },
      worldApi: { getWorld: async () => stormboundDetail },
    })

    expect(await screen.findByText('Private knowledge')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Add Character' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('LC-002/S3/R2-S2 keeps a rejected Character draft and highlights its supplied field', async () => {
    const user = userEvent.setup()
    const createCharacter = vi.fn().mockRejectedValue(
      new WorldApiError('validation', 'Correct the highlighted fields.', {
        key: 'Use a unique lowercase key with letters, numbers, and hyphens only.',
      })
    )

    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'author@example.com' },
      worldApi: {
        getWorld: async () => ({ ...stormboundDetail, readOnly: false }),
        createCharacter,
      },
    })

    await user.click(await screen.findByRole('button', { name: 'Add Character' }))
    await user.type(screen.getByLabelText('Key'), 'mira')
    await user.type(screen.getByLabelText('Name'), 'Mira Vale')
    await user.selectOptions(screen.getByLabelText('Canonical Location'), 'chapel')
    await user.type(
      screen.getByLabelText('Physical description'),
      'A watchful woman in rain-dark clothes.'
    )
    await user.type(
      screen.getByLabelText('Background'),
      'Mira has served the chapel through every storm.'
    )
    await user.type(screen.getByLabelText('Personality'), 'Cautious and observant.')
    await user.type(screen.getByLabelText('Voice'), 'Plain and restrained.')
    await user.type(
      screen.getByLabelText('Private knowledge'),
      'Mira heard the bell ring before midnight.'
    )
    await user.type(screen.getByLabelText('Initial mood'), 'Uneasy.')
    await user.type(screen.getByLabelText('Initial status'), 'Watching the chapel door.')
    await user.type(
      screen.getByLabelText('Initial memory'),
      'The player has not spoken with Mira yet.'
    )
    await user.click(screen.getByRole('button', { name: 'Create Character' }))

    expect(
      await screen.findByText('Use a unique lowercase key with letters, numbers, and hyphens only.')
    ).toBeVisible()
    expect(screen.getByLabelText('Key')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Key')).toHaveValue('mira')
    expect(screen.getByLabelText('Initial memory')).toHaveValue(
      'The player has not spoken with Mira yet.'
    )
    expect(createCharacter).toHaveBeenCalledTimes(1)
  })

  it('LC-002/S3/R2-S2 highlights an invalid Character Location and retains the draft', async () => {
    const user = userEvent.setup()
    const createCharacter = vi.fn().mockRejectedValue(
      new WorldApiError('validation', 'Correct the highlighted fields.', {
        locationKey: 'Character Location is not valid for this World.',
      })
    )

    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'author@example.com' },
      worldApi: {
        getWorld: async () => ({ ...stormboundDetail, readOnly: false }),
        createCharacter,
      },
    })

    await user.click(await screen.findByRole('button', { name: 'Add Character' }))
    await user.type(screen.getByLabelText('Key'), 'mira')
    await user.type(screen.getByLabelText('Name'), 'Mira Vale')
    await user.selectOptions(screen.getByLabelText('Canonical Location'), 'chapel')
    await user.type(
      screen.getByLabelText('Physical description'),
      'A watchful woman in rain-dark clothes.'
    )
    await user.type(
      screen.getByLabelText('Background'),
      'Mira has served the chapel through every storm.'
    )
    await user.type(screen.getByLabelText('Personality'), 'Cautious and observant.')
    await user.type(screen.getByLabelText('Voice'), 'Plain and restrained.')
    await user.type(
      screen.getByLabelText('Private knowledge'),
      'Mira heard the bell ring before midnight.'
    )
    await user.type(screen.getByLabelText('Initial mood'), 'Uneasy.')
    await user.type(screen.getByLabelText('Initial status'), 'Watching the chapel door.')
    await user.type(
      screen.getByLabelText('Initial memory'),
      'The player has not spoken with Mira yet.'
    )
    await user.click(screen.getByRole('button', { name: 'Create Character' }))

    expect(await screen.findByText('Character Location is not valid for this World.')).toBeVisible()
    expect(screen.getByLabelText('Canonical Location')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Canonical Location')).toHaveAttribute(
      'aria-describedby',
      'character-location-error'
    )
    expect(screen.getByLabelText('Canonical Location')).toHaveValue('chapel')
    expect(screen.getByLabelText('Initial memory')).toHaveValue(
      'The player has not spoken with Mira yet.'
    )
    expect(createCharacter).toHaveBeenCalledTimes(1)
  })

  it('LC-002/S2/R2-S2 keeps return navigation available while World detail is loading', async () => {
    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { getWorld: () => new Promise(() => undefined) },
    })

    expect(await screen.findByRole('heading', { name: 'Loading World…' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to Worlds' })).toHaveAttribute('href', '/worlds')
  })

  it('LC-001/S3/R1-S4 ends the shared session when World detail reports unauthorized', async () => {
    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'member@example.com' },
      worldApi: {
        getWorld: async () => {
          throw new WorldApiError('unauthorized', 'Session ended')
        },
      },
    })

    expect(await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    expect(screen.queryByText('member@example.com')).not.toBeInTheDocument()
    expect(screen.queryByText('The bell rang at midnight.')).not.toBeInTheDocument()
  })

  it('LC-002/S2/R2-S2 retries unavailable World detail with visible pending and recovery', async () => {
    const user = userEvent.setup()
    let resolveRetry!: (world: WorldDetail) => void
    const retry = new Promise<WorldDetail>((resolve) => {
      resolveRetry = resolve
    })
    const getWorld = vi
      .fn()
      .mockRejectedValueOnce(new WorldApiError('network', 'Unavailable'))
      .mockReturnValueOnce(retry)

    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { getWorld },
    })

    await user.click(await screen.findByRole('button', { name: 'Try again' }))
    const pendingRetry = screen.getByRole('button', { name: 'Trying again…' })
    expect(pendingRetry).toBeDisabled()
    expect(pendingRetry).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('heading', { name: 'World unavailable' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to Worlds' })).toHaveAttribute('href', '/worlds')

    await act(async () => resolveRetry(stormboundDetail))

    expect(await screen.findByRole('heading', { name: 'Stormbound Chapel' })).toBeVisible()
    expect(getWorld).toHaveBeenCalledTimes(2)
  })

  it('isolates World detail across account changes and purges the previous account cache', async () => {
    const firstAccount = { id: 4, email: 'first@example.com' }
    const secondAccount = { id: 9, email: 'second@example.com' }
    const detailFor = (voice: string): WorldDetail => ({
      ...stormboundDetail,
      characters: [{ ...stormboundDetail.characters[0], voice }],
    })
    const firstDetail = detailFor('First account detail response.')
    const secondDetail = detailFor('Second account detail response.')
    const refreshedFirstDetail = detailFor('Refreshed first account detail response.')
    const restoreSession = vi
      .fn()
      .mockResolvedValueOnce(firstAccount)
      .mockResolvedValueOnce(secondAccount)
      .mockResolvedValueOnce(firstAccount)
    const getWorld = vi
      .fn()
      .mockResolvedValueOnce(firstDetail)
      .mockResolvedValueOnce(secondDetail)
      .mockResolvedValueOnce(refreshedFirstDetail)

    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: null,
      api: { restoreSession },
      worldApi: { getWorld },
    })

    expect(await screen.findByText('First account detail response.')).toBeVisible()

    await act(async () => window.dispatchEvent(new Event('focus')))
    expect(await screen.findByText('Second account detail response.')).toBeVisible()
    expect(screen.queryByText('First account detail response.')).not.toBeInTheDocument()

    await act(async () => window.dispatchEvent(new Event('focus')))
    expect(await screen.findByText('Refreshed first account detail response.')).toBeVisible()
    expect(screen.queryByText('First account detail response.')).not.toBeInTheDocument()
    expect(getWorld).toHaveBeenCalledTimes(3)
  })

  it('LC-002/S2/R1-S2 + R2-S2 presents an unknown World without ownership details', async () => {
    renderTestApp({
      route: '/worlds/missing',
      session: { id: 4, email: 'member@example.com' },
      worldApi: {
        getWorld: async () => {
          throw new WorldApiError('not-found', 'Missing')
        },
      },
    })
    expect(await screen.findByRole('alert')).toContainElement(
      screen.getByRole('heading', { name: 'World not found' })
    )
    expect(screen.getByRole('link', { name: 'Back to Worlds' })).toHaveAttribute('href', '/worlds')
    expect(screen.queryByText(/author|owner/i)).not.toBeInTheDocument()
  })
})
