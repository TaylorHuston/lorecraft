import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AdventureWorkbench, type AdventureView } from './AdventureWorkbench'

const readyAdventure: AdventureView = {
  id: '11111111-1111-4111-8111-111111111111',
  status: 'ready',
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
  activeTurn: null,
  story: [
    {
      id: 'opening',
      kind: 'narration',
      content: 'The chapel doors open against the storm.',
    },
  ],
}

describe('AdventureWorkbench', () => {
  it('LC-003/S1/R5-S2 renders the ready opening as primary content with filtered context', () => {
    render(<AdventureWorkbench adventure={readyAdventure} />)

    expect(screen.getByRole('region', { name: 'Story' })).toHaveTextContent(
      'The chapel doors open against the storm.'
    )
    expect(screen.getByRole('region', { name: 'Player' })).toHaveTextContent('Elara Vance')
    expect(screen.getByRole('region', { name: 'Scene' })).toHaveTextContent('Mira the Restless')
    expect(screen.getAllByRole('heading')[0]).toHaveTextContent('Story')
    expect(screen.getAllByRole('heading')[0]).toHaveProperty('tagName', 'H1')
    expect(screen.getByRole('textbox', { name: 'What do you do?' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Act' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Guide' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('button', { name: 'Pass' })).toBeVisible()
    expect(
      screen.queryByText(/private knowledge|personality|director observation/i)
    ).not.toBeInTheDocument()
  })

  it('renders repeated narration paragraphs without duplicate React keys', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(
      <AdventureWorkbench
        adventure={{
          ...readyAdventure,
          story: [{ ...readyAdventure.story[0], content: 'The bell rings.\n\nThe bell rings.' }],
        }}
      />
    )

    expect(screen.getAllByText('The bell rings.')).toHaveLength(2)
    expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining('same key'))
    consoleError.mockRestore()
  })

  it('LC-003/S1/R5-S1 keeps Player and Scene context available while the opening is pending', () => {
    render(
      <AdventureWorkbench adventure={{ ...readyAdventure, status: 'opening_pending', story: [] }} />
    )

    expect(screen.getByRole('status')).toHaveTextContent('Preparing your opening')
    expect(screen.getByRole('heading', { name: 'Preparing your opening', level: 2 })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Player' })).toHaveTextContent('Elara Vance')
    expect(screen.getByRole('region', { name: 'Scene' })).toHaveTextContent('Stormbound Chapel')
    expect(screen.queryByText('The chapel doors open against the storm.')).not.toBeInTheDocument()
  })

  it('LC-003/S1/R3-S3 presents a recoverable terminal failure without partial story', async () => {
    const user = userEvent.setup()
    let retried = false
    render(
      <MemoryRouter>
        <AdventureWorkbench
          adventure={{ ...readyAdventure, status: 'opening_failed', story: [] }}
          onRetry={() => {
            retried = true
          }}
        />
      </MemoryRouter>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent("couldn't prepare your opening")
    expect(
      screen.getByRole('heading', {
        name: "Lorecraft couldn't prepare your opening",
        level: 2,
      })
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Return to World' })).toHaveAttribute(
      'href',
      '/worlds/stormbound-chapel'
    )
    expect(screen.queryByText('The chapel doors open against the storm.')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(retried).toBe(true)
  })

  it('LC-003/S1/R5-S2 uses Story-first keyboard-operable tabs on mobile', async () => {
    const user = userEvent.setup()
    render(<AdventureWorkbench adventure={readyAdventure} layout="mobile" />)

    const storyTab = screen.getByRole('tab', { name: 'Story' })
    expect(storyTab).toHaveAttribute('aria-selected', 'true')
    expect(storyTab).toHaveAttribute('aria-controls', 'adventure-panel-story')
    expect(screen.getByRole('tab', { name: 'Player' })).not.toHaveAttribute('aria-controls')
    expect(screen.getByRole('tab', { name: 'Scene' })).not.toHaveAttribute('aria-controls')
    expect(screen.getByRole('tabpanel', { name: 'Story' })).toHaveTextContent(
      'The chapel doors open against the storm.'
    )

    storyTab.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Player' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Player' })).toHaveAttribute(
      'aria-controls',
      'adventure-panel-player'
    )
    expect(storyTab).not.toHaveAttribute('aria-controls')
    expect(screen.getByRole('tabpanel', { name: 'Player' })).toHaveTextContent('Elara Vance')

    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Scene' })).toHaveFocus()
    expect(screen.getByRole('tabpanel', { name: 'Scene' })).toHaveTextContent('Mira the Restless')
  })

  it('LC-003/S2/R5-S1 submits Act and keeps Guide private in the composer', async () => {
    const user = userEvent.setup()
    const submitTurn = vi.fn().mockResolvedValue(undefined)
    render(<AdventureWorkbench adventure={readyAdventure} onSubmitTurn={submitTurn} />)

    await user.type(
      screen.getByRole('textbox', { name: 'What do you do?' }),
      'I ask Mira about the bell.'
    )
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(submitTurn).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: 'act', input: 'I ask Mira about the bell.' })
    )

    await user.click(screen.getByRole('tab', { name: 'Guide' }))
    expect(screen.getByRole('textbox', { name: 'Private direction for this turn' })).toBeVisible()
    expect(
      screen.getByText('This direction guides only this resolution. It is not shown in the story.')
    ).toBeVisible()
  })

  it('LC-003/S2/R5-S1 confirms Pass before submitting an empty turn', async () => {
    const user = userEvent.setup()
    const submitTurn = vi.fn().mockResolvedValue(undefined)
    render(<AdventureWorkbench adventure={readyAdventure} onSubmitTurn={submitTurn} />)

    await user.click(screen.getByRole('button', { name: 'Pass' }))
    const dialog = screen.getByRole('dialog', { name: 'Pass this moment?' })
    expect(dialog).toHaveTextContent('without an action from you')
    await user.click(within(dialog).getByRole('button', { name: 'Pass' }))
    expect(submitTurn).toHaveBeenCalledWith(expect.objectContaining({ trigger: 'pass' }))
    expect(submitTurn.mock.calls[0][0]).not.toHaveProperty('input')
  })

  it('LC-003/S2/R5-S2..R5-S4 preserves story during progress and offers failed-turn recovery', async () => {
    const user = userEvent.setup()
    const retryTurn = vi.fn()
    const discardTurn = vi.fn()
    const { rerender } = render(
      <AdventureWorkbench
        adventure={{
          ...readyAdventure,
          activeTurn: { id: 'turn-1', trigger: 'act', status: 'pending' },
        }}
      />
    )
    expect(
      screen
        .getAllByRole('status')
        .find((status) => status.textContent?.includes('Resolving your turn'))
    ).toBeTruthy()
    expect(screen.getByText('The chapel doors open against the storm.')).toBeVisible()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

    rerender(
      <AdventureWorkbench
        adventure={{
          ...readyAdventure,
          activeTurn: { id: 'turn-1', trigger: 'act', status: 'failed' },
        }}
        onRetryTurn={retryTurn}
        onDiscardTurn={discardTurn}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('did not change the story')
    await user.click(screen.getByRole('button', { name: 'Retry turn' }))
    await user.click(screen.getByRole('button', { name: 'Discard' }))
    expect(retryTurn).toHaveBeenCalledWith('turn-1')
    expect(discardTurn).toHaveBeenCalledWith('turn-1')
  })

  it('LC-003/S2/R5-S3 announces one completed turn without stealing focus', () => {
    const { rerender } = render(
      <AdventureWorkbench
        adventure={{
          ...readyAdventure,
          activeTurn: { id: 'turn-1', trigger: 'act', status: 'processing' },
        }}
      />
    )
    const player = screen.getByRole('region', { name: 'Player' })
    player.focus()
    rerender(
      <AdventureWorkbench
        adventure={{
          ...readyAdventure,
          turnCount: 1,
          activeTurn: null,
          story: [
            ...readyAdventure.story,
            { id: 'turn-1', kind: 'narration', content: 'Mira answers quietly.' },
          ],
        }}
      />
    )
    expect(screen.getByRole('status')).toHaveTextContent('Your turn is ready.')
    expect(player).toHaveFocus()
    expect(screen.getByText('Mira answers quietly.')).toBeVisible()
  })
})
