import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderTestApp } from '../test/renderTestApp'
import { WorldApiError, type WorldDetail, type WorldSummary } from './worldApi'

const stormboundChapel: WorldSummary = {
  id: 1,
  slug: 'stormbound-chapel',
  name: 'Stormbound Chapel',
  description: 'A storm-battered sanctuary where old vows still shape the living.',
  visibility: 'public',
  readOnly: true,
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
    expect(listWorlds).toHaveBeenCalledTimes(1)
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

  it('ends the shared session when the catalog reports unauthorized', async () => {
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
    expect(screen.getByText(stormboundDetail.description)).toBeVisible()
    expect(screen.getByText('Read only')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to Worlds' })).toHaveAttribute('href', '/worlds')
    expect(screen.getByRole('heading', { name: 'Locations' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Mira' })).toBeVisible()
    expect(screen.queryByText('Private knowledge')).not.toBeInTheDocument()
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
    expect(screen.getByRole('link', { name: 'Resume Adventure as Elara Vance' })).toHaveAttribute(
      'href',
      '/adventures/11111111-1111-4111-8111-111111111111'
    )
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
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Adventures' })).toHaveFocus()
    )
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

  it('LC-002/S2/R2-S2 keeps return navigation available while World detail is loading', async () => {
    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { getWorld: () => new Promise(() => undefined) },
    })

    expect(await screen.findByRole('heading', { name: 'Loading World…' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to Worlds' })).toHaveAttribute('href', '/worlds')
  })

  it('ends the shared session when World detail reports unauthorized', async () => {
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
    expect(screen.getByRole('button', { name: 'Trying again…' })).toBeDisabled()

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
