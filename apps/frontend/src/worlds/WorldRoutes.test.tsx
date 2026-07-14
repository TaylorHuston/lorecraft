import { screen } from '@testing-library/react'
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
