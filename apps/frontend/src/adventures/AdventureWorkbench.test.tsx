import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AdventureApiError } from './adventureApi'
import { AdventureNpcEditor, AdventureWorkbench, type AdventureView } from './AdventureWorkbench'

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
        background: 'A keeper bound to the chapel.',
        personality: 'Reserved and exacting.',
        voice: 'Low and deliberate.',
        privateKnowledge: 'She knows why the bell rang.',
        currentLocation: { key: 'chapel', name: 'Stormbound Chapel' },
        mood: 'Uneasy',
        status: 'Watching the doors.',
        memory: 'The player has just arrived.',
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
    expect(screen.queryByRole('heading', { name: 'Story' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'What would you like to do?' })).toHaveAttribute(
      'placeholder',
      'What would you like to do?'
    )
    expect(screen.getByRole('textbox').closest('[data-slot="turn-composer-dock"]')).not.toBeNull()
    expect(screen.queryByText('What would you like to do?')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Act' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Guide' })).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.queryByText(
        "Your turn and relevant Adventure and World context will be processed by Lorecraft's configured AI provider."
      )
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pass' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Send' }).closest('[data-slot="turn-composer-actions"]')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Send' }).closest('[data-slot="turn-composer-input"]')).not.toBeNull()
    expect(
      screen.queryByText(/private knowledge|personality|director observation/i)
    ).not.toBeInTheDocument()
  })

  it('LC-003/S2/R5-S6 renders Guide input as an italicized player message beside the left/right transcript', () => {
    render(
      <AdventureWorkbench
        adventure={{
          ...readyAdventure,
          activeTurn: {
            id: 'turn-active',
            trigger: 'guide',
            status: 'processing',
            content: 'Keep the bell silent until Mira speaks.',
          },
          story: [
            ...readyAdventure.story,
            { id: 'act-1', kind: 'act', content: 'I follow Mira to the vestry.' },
            { id: 'narration-1', kind: 'narration', content: 'Mira raises her candle.' },
            { id: 'pass-1', kind: 'pass', content: 'Pass' },
          ],
        }}
      />
    )

    expect(screen.getAllByRole('article', { name: 'Player message' })[0]).toHaveAttribute(
      'data-message-kind',
      'act'
    )
    expect(screen.getAllByRole('article', { name: 'Player message' })[1]).toHaveAttribute(
      'data-message-kind',
      'pass'
    )
    const guideMessage = screen.getAllByRole('article', { name: 'Player message' })[2]
    expect(guideMessage).toHaveAttribute('data-message-kind', 'guide')
    expect(guideMessage).toHaveTextContent('Keep the bell silent until Mira speaks.')
    expect(guideMessage.querySelector('em')).toHaveTextContent('Keep the bell silent until Mira speaks.')
    expect(screen.getByText('Action')).toBeVisible()
    expect(screen.getAllByText('Pass')[0]).toBeVisible()
    expect(screen.getByText('Guide')).toBeVisible()
    expect(screen.getAllByRole('article', { name: 'Game Master message' })).toHaveLength(2)
  })

  it('LC-003/S3/R1-S1 opens player-visible NPC details and restores list focus on Back', async () => {
    const user = userEvent.setup()
    render(<AdventureWorkbench adventure={readyAdventure} />)

    const npc = screen.getByRole('button', { name: 'Mira the Restless' })
    await user.click(npc)

    const details = screen.getByRole('region', { name: 'NPC details' })
    expect(details).toHaveTextContent('Mira the Restless')
    expect(details).toHaveTextContent('A spectral figure carrying a dying candle.')
    expect(details).toHaveTextContent('Watching the doors.')
    expect(details).not.toHaveTextContent('She knows why the bell rang.')
    expect(details).not.toHaveTextContent('A keeper bound to the chapel.')
    expect(details).not.toHaveTextContent('Reserved and exacting.')
    expect(details).not.toHaveTextContent('Low and deliberate.')
    expect(details).not.toHaveTextContent('The player has just arrived.')

    const backToScene = screen.getByRole('button', { name: 'Back to Scene' })
    expect(backToScene.querySelector('svg.lucide-arrow-left')).not.toBeNull()
    await user.click(backToScene)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Mira the Restless' })).toHaveFocus()
    )
  })

  it('LC-003/S3/R3-S1 autosaves every editable Adventure-owned NPC card field', async () => {
    const user = userEvent.setup()
    const saveNpcState = vi.fn().mockResolvedValue(undefined)
    render(<AdventureNpcEditor npc={readyAdventure.scene.npcs[0]} onSave={saveNpcState} />)
    expect(screen.getByLabelText('Mood')).toHaveAttribute('maxlength', '120')
    expect(screen.getByLabelText('Status')).toHaveAttribute('maxlength', '320')
    expect(screen.getByLabelText('Memory')).toHaveAttribute('maxlength', '500')

    const mood = screen.getByLabelText('Mood')
    await user.clear(mood)
    await user.type(mood, 'Curious')

    await waitFor(() =>
      expect(saveNpcState).toHaveBeenCalledWith('mira', {
        name: 'Mira the Restless',
        currentLocationKey: 'chapel',
        physicalDescription: 'A spectral figure carrying a dying candle.',
        background: 'A keeper bound to the chapel.',
        personality: 'Reserved and exacting.',
        voice: 'Low and deliberate.',
        privateKnowledge: 'She knows why the bell rang.',
        mood: 'Curious',
        status: 'Watching the doors.',
        memory: 'The player has just arrived.',
      })
    )
  })

  it('LC-003/S3/R3-S1 gives a frozen legacy NPC usable state defaults without changing its source', async () => {
    const user = userEvent.setup()
    const saveNpcState = vi.fn().mockResolvedValue(undefined)
    render(
      <AdventureNpcEditor
        npc={{ ...readyAdventure.scene.npcs[0], mood: '', status: '', memory: '' }}
        onSave={saveNpcState}
      />
    )
    expect(screen.getByLabelText('Mood')).toHaveValue('No current mood has been recorded yet.')
    expect(screen.getByLabelText('Status')).toHaveValue('No current status has been recorded yet.')
    expect(screen.getByLabelText('Memory')).toHaveValue(
      'No interactions with the player have been recorded yet.'
    )

    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'Mira Vale')
    await waitFor(() =>
      expect(saveNpcState).toHaveBeenCalledWith(
        'mira',
        expect.objectContaining({
          name: 'Mira Vale',
          mood: 'No current mood has been recorded yet.',
          status: 'No current status has been recorded yet.',
          memory: 'No interactions with the player have been recorded yet.',
        })
      )
    )
  })

  it('LC-003/S3/R3-S2 identifies the rejected Debug NPC field after an autosave validation failure', async () => {
    const user = userEvent.setup()
    const saveNpcState = vi.fn().mockRejectedValue(
      new AdventureApiError('validation', 'Correct the highlighted fields.', {
        mood: 'Enter a value using 120 characters or fewer.',
      })
    )
    render(<AdventureNpcEditor npc={readyAdventure.scene.npcs[0]} onSave={saveNpcState} />)
    await user.clear(screen.getByLabelText('Mood'))

    await waitFor(() => expect(saveNpcState).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByLabelText('Mood')).toHaveAttribute('aria-invalid', 'true'))
    expect(screen.getByLabelText('Mood')).toHaveAccessibleDescription(
      'Enter a value using 120 characters or fewer.'
    )
    expect(screen.getByText('Enter a value using 120 characters or fewer.')).toBeVisible()
    expect(screen.getByText('Correct the highlighted fields.')).toBeVisible()

    await user.type(screen.getByLabelText('Mood'), 'Curious')
    expect(screen.getByLabelText('Mood')).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByText('Correct the highlighted fields.')).not.toBeInTheDocument()
  })

  it('LC-003/S3/R3-S2 retries an unchanged NPC draft after a recoverable autosave failure', async () => {
    const user = userEvent.setup()
    const saveNpcState = vi
      .fn()
      .mockRejectedValueOnce(new Error('NPC state could not be saved.'))
      .mockResolvedValueOnce(undefined)
    render(<AdventureNpcEditor npc={readyAdventure.scene.npcs[0]} onSave={saveNpcState} />)
    await user.clear(screen.getByLabelText('Mood'))
    await user.type(screen.getByLabelText('Mood'), 'Curious')

    await waitFor(() => expect(saveNpcState).toHaveBeenCalledTimes(1))
    expect(screen.getByRole('alert')).toHaveTextContent('NPC state could not be saved.')
    expect(screen.getByRole('button', { name: 'Retry save' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Retry save' }))
    await waitFor(() => expect(saveNpcState).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(screen.getByText('NPC state saved.')).toBeVisible())
    expect(saveNpcState).toHaveBeenLastCalledWith(
      'mira',
      expect.objectContaining({ mood: 'Curious' })
    )
  })

  it('LC-003/S3/R3-S1 preserves the active editor through an authoritative autosave refresh', async () => {
    const user = userEvent.setup()
    const saveNpcState = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(
      <AdventureNpcEditor npc={readyAdventure.scene.npcs[0]} onSave={saveNpcState} />
    )
    const mood = screen.getByLabelText('Mood')
    await user.clear(mood)
    await user.type(mood, 'Curious')
    await waitFor(() => expect(saveNpcState).toHaveBeenCalledTimes(1))

    rerender(
      <AdventureNpcEditor
        npc={{ ...readyAdventure.scene.npcs[0], mood: 'Curious' }}
        onSave={saveNpcState}
      />
    )

    expect(screen.getByLabelText('Mood')).toHaveValue('Curious')
    expect(screen.getByLabelText('Mood')).toHaveFocus()
  })

  it('LC-003/S3/R1-S3 clears a selected NPC when authoritative Scene state removes it', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<AdventureWorkbench adventure={readyAdventure} />)
    await user.click(screen.getByRole('button', { name: 'Mira the Restless' }))
    expect(screen.getByRole('region', { name: 'NPC details' })).toBeVisible()

    rerender(
      <AdventureWorkbench
        adventure={{ ...readyAdventure, scene: { ...readyAdventure.scene, npcs: [] } }}
      />
    )

    expect(await screen.findByText('No one else is visible here.')).toBeVisible()
    expect(screen.queryByRole('region', { name: 'NPC details' })).not.toBeInTheDocument()
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

  it('LC-003/S1/R5-S2 snaps the narration scroller to its newest entry after load and refresh', () => {
    const scrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => 1_000,
    })

    try {
      const { rerender } = render(<AdventureWorkbench adventure={readyAdventure} />)
      const storyContent = screen
        .getByRole('region', { name: 'Story' })
        .querySelector('[data-slot="story-scroll-region"]') as HTMLDivElement
      expect(storyContent.scrollTop).toBe(1_000)

      storyContent.scrollTop = 50
      rerender(<AdventureWorkbench adventure={{ ...readyAdventure }} />)
      expect(storyContent.scrollTop).toBe(1_000)
    } finally {
      if (scrollHeight) {
        Object.defineProperty(HTMLElement.prototype, 'scrollHeight', scrollHeight)
      } else {
        delete (HTMLElement.prototype as { scrollHeight?: number }).scrollHeight
      }
    }
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
    expect(alert).toHaveTextContent('Opening failed')
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

  it('LC-003/S1/R5-S4 uses Story-first keyboard-operable tabs on mobile', async () => {
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

  it('LC-003/S2/R5-S1 submits Act and provides a Guide composer mode', async () => {
    const user = userEvent.setup()
    const submitTurn = vi.fn().mockResolvedValue(undefined)
    render(<AdventureWorkbench adventure={readyAdventure} onSubmitTurn={submitTurn} />)

    await user.type(
      screen.getByRole('textbox', { name: 'What would you like to do?' }),
      'I ask Mira about the bell.'
    )
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(submitTurn).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: 'act', input: 'I ask Mira about the bell.' })
    )

    await user.click(screen.getByRole('button', { name: 'Guide' }))
    expect(screen.getByRole('textbox', { name: 'Private direction for this turn' })).toHaveAttribute(
      'placeholder',
      'Private direction for this turn'
    )
    expect(screen.queryByText('Private direction for this turn')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Act' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Guide' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('LC-003/S2/R5-S1 submits a typed turn with Enter and keeps Shift+Enter for a line break', async () => {
    const user = userEvent.setup()
    const submitTurn = vi.fn().mockResolvedValue(undefined)
    render(<AdventureWorkbench adventure={readyAdventure} onSubmitTurn={submitTurn} />)

    const input = screen.getByRole('textbox', { name: 'What would you like to do?' })
    await user.type(input, 'I ask Mira{Shift>}{Enter}{/Shift}about the bell.')
    expect(submitTurn).not.toHaveBeenCalled()

    await user.keyboard('{Enter}')
    expect(submitTurn).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: 'act', input: 'I ask Mira\nabout the bell.' })
    )
  })

  it('LC-003/S2/R5-S1 submits Pass immediately as an empty turn', async () => {
    const user = userEvent.setup()
    const submitTurn = vi.fn().mockResolvedValue(undefined)
    render(<AdventureWorkbench adventure={readyAdventure} onSubmitTurn={submitTurn} />)

    await user.click(screen.getByRole('button', { name: 'Pass' }))
    expect(submitTurn).toHaveBeenCalledWith(expect.objectContaining({ trigger: 'pass' }))
    expect(submitTurn.mock.calls[0][0]).not.toHaveProperty('input')
    expect(screen.queryByRole('dialog', { name: 'Pass this moment?' })).not.toBeInTheDocument()
  })

  it('LC-003/S2/R5-S2 + R5-S4 preserves story during progress and offers failed-turn recovery', async () => {
    const user = userEvent.setup()
    const retryTurn = vi.fn()
    const discardTurn = vi.fn()
    const { rerender } = render(
      <AdventureWorkbench
        adventure={{
          ...readyAdventure,
          activeTurn: { id: 'turn-1', trigger: 'act', status: 'pending', content: 'I wait.' },
        }}
      />
    )
    expect(screen.getByRole('status', { name: 'Resolving your turn' })).toHaveTextContent(
      'Resolving…'
    )
    expect(screen.getByText('The chapel doors open against the storm.')).toBeVisible()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByText('Your Adventure is safe.')).not.toBeInTheDocument()

    rerender(
      <AdventureWorkbench
        adventure={{
          ...readyAdventure,
          activeTurn: { id: 'turn-1', trigger: 'act', status: 'failed', content: 'I wait.' },
        }}
        onRetryTurn={retryTurn}
        onDiscardTurn={discardTurn}
      />
    )
    const failure = screen.getByRole('alert')
    expect(failure).toHaveTextContent('did not change the story')
    expect(failure.closest('[data-slot="turn-composer-dock"]')).not.toBeNull()
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
          activeTurn: { id: 'turn-1', trigger: 'act', status: 'processing', content: 'I wait.' },
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
