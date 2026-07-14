import { act, screen } from '@testing-library/react'
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
  locations: [{ key: 'chapel', name: 'Chapel', description: 'Rain taps against warped shutters.' }],
  characters: [
    {
      key: 'mira',
      name: 'Mira',
      physicalDescription: 'A local woman with watchful eyes.',
      background: 'Mira grew up around the chapel.',
      personality: 'Cautious and observant.',
      voice: 'Plain-spoken and restrained.',
      privateKnowledge: 'The bell rang at midnight.',
      location: { key: 'chapel', name: 'Chapel' },
    },
  ],
}

describe('World catalog and detail routes', () => {
  it('LC-002/S1/R1-S1 loads accessible Worlds with public read-only navigation', async () => {
    const listWorlds = vi.fn().mockResolvedValue([stormboundChapel])

    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { listWorlds },
    })

    expect(await screen.findByRole('heading', { name: 'Worlds' })).toBeVisible()
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

  it('LC-002/S1/R1-S3 explains when no Worlds are currently available', async () => {
    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { listWorlds: async () => [] },
    })

    expect(await screen.findByRole('heading', { name: 'No Worlds available' })).toBeVisible()
    expect(screen.getByText('There are no Worlds available to this account yet.')).toBeVisible()
  })

  it('shows catalog loading while Worlds are unresolved', async () => {
    renderTestApp({
      route: '/worlds',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { listWorlds: () => new Promise(() => undefined) },
    })

    expect(await screen.findByText('Loading Worlds…')).toHaveAttribute('role', 'status')
  })

  it('recovers from a catalog load failure', async () => {
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

  it('LC-002/S2/R1-S1 renders structured World detail without a byline', async () => {
    renderTestApp({
      route: '/worlds/stormbound-chapel',
      session: { id: 4, email: 'member@example.com' },
      worldApi: { getWorld: async () => stormboundDetail },
    })
    expect(await screen.findByRole('heading', { name: 'Stormbound Chapel' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Locations' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Mira' })).toBeVisible()
    expect(screen.getByText('The bell rang at midnight.')).toBeVisible()
    expect(screen.getByText('Chapel', { selector: 'span' })).toBeVisible()
    expect(screen.queryByText('member@example.com')).not.toBeInTheDocument()
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

  it('retries a failed World detail request with visible pending and recovery states', async () => {
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
    const detailFor = (privateKnowledge: string): WorldDetail => ({
      ...stormboundDetail,
      characters: [{ ...stormboundDetail.characters[0], privateKnowledge }],
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

  it('LC-002/S2/R1-S2 presents an unknown World without ownership details', async () => {
    renderTestApp({
      route: '/worlds/missing',
      session: { id: 4, email: 'member@example.com' },
      worldApi: {
        getWorld: async () => {
          throw new WorldApiError('not-found', 'Missing')
        },
      },
    })
    expect(await screen.findByRole('heading', { name: 'World not found' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to Worlds' })).toHaveAttribute('href', '/worlds')
    expect(screen.queryByText(/author|owner/i)).not.toBeInTheDocument()
  })
})
