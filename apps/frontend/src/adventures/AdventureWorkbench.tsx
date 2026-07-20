import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button/Button'
import { ConfirmDialog } from '../components/Dialog/ConfirmDialog'
import { creationRequestId } from './creationRequestId'
import {
  AdventureApiError,
  type AdventureDetail,
  type AdventureTurnTrigger,
  type SubmitAdventureTurnInput,
  type UpdateAdventureNpcStateInput,
} from './adventureApi'
import styles from './AdventureWorkbench.module.css'

export type AdventureView = AdventureDetail
type NpcField = keyof UpdateAdventureNpcStateInput

type AdventurePane = 'story' | 'player' | 'scene'

const paneOrder: AdventurePane[] = ['story', 'player', 'scene']
const paneLabels: Record<AdventurePane, string> = {
  story: 'Story',
  player: 'Player',
  scene: 'Scene',
}

const emptyNpcStateFallback = {
  mood: 'No current mood has been recorded yet.',
  status: 'No current status has been recorded yet.',
  memory: 'No interactions with the player have been recorded yet.',
} as const

function NpcFieldError({ error, id }: { error?: string; id: string }) {
  return error ? (
    <span className={styles.npcEditorFieldError} id={id} role="alert">
      {error}
    </span>
  ) : null
}

function PanelHeading({ eyebrow, id, title }: { eyebrow: string; id: string; title: string }) {
  return (
    <header className={styles.panelHeading}>
      <p>{eyebrow}</p>
      <h2 id={id}>{title}</h2>
    </header>
  )
}

function PlayerRegion({ adventure }: { adventure: AdventureView }) {
  const { player } = adventure

  return (
    <section
      className={styles.sideRegion}
      aria-label="Player"
      data-slot="player-scroll-region"
      tabIndex={0}
    >
      <PanelHeading eyebrow="Player" id="adventure-player-heading" title={player.name} />
      <dl className={styles.details}>
        <div>
          <dt>Current location</dt>
          <dd>{player.currentLocation.name}</dd>
        </div>
        {player.physicalDescription ? (
          <div>
            <dt>Physical description</dt>
            <dd>{player.physicalDescription}</dd>
          </div>
        ) : null}
        {player.backstory ? (
          <div>
            <dt>Backstory</dt>
            <dd>{player.backstory}</dd>
          </div>
        ) : null}
        {player.status ? (
          <div>
            <dt>Current status</dt>
            <dd>{player.status}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}

const turnInputLimits: Record<Exclude<AdventureTurnTrigger, 'pass'>, number> = {
  act: 4_000,
  guide: 1_200,
}

function TurnComposer({
  onSubmit,
  pending,
  error,
  resolving = false,
}: {
  onSubmit?: (input: SubmitAdventureTurnInput) => Promise<void>
  pending: boolean
  error: string | null
  resolving?: boolean
}) {
  const [mode, setMode] = useState<Exclude<AdventureTurnTrigger, 'pass'>>('act')
  const [text, setText] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [passOpen, setPassOpen] = useState(false)
  const requestIdRef = useRef<string | null>(null)
  const signatureRef = useRef<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const passRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (error) textareaRef.current?.focus()
  }, [error])

  function requestFor(trigger: AdventureTurnTrigger, input?: string) {
    const signature = `${trigger}:${input ?? ''}`
    if (signatureRef.current !== signature) {
      signatureRef.current = signature
      requestIdRef.current = creationRequestId()
    }
    return requestIdRef.current!
  }

  async function submit(trigger: AdventureTurnTrigger) {
    const input = trigger === 'pass' ? undefined : text.trim()
    if (trigger !== 'pass' && (!input || input.length > turnInputLimits[trigger])) {
      setLocalError(
        input
          ? `Keep this ${trigger === 'act' ? 'Act' : 'Guide'} to ${turnInputLimits[trigger].toLocaleString()} characters or fewer.`
          : `Enter a ${trigger === 'act' ? 'player action' : 'private direction'} before continuing.`
      )
      textareaRef.current?.focus()
      return
    }

    setLocalError(null)
    try {
      await onSubmit?.({
        requestId: requestFor(trigger, input),
        trigger,
        ...(input ? { input } : {}),
      })
      setText('')
      requestIdRef.current = null
      signatureRef.current = null
      setPassOpen(false)
    } catch {
      // The route owns the actionable error message; retain the input and request identity for retry.
    }
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submit(mode)
  }

  function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
      return
    }

    event.preventDefault()
    if (!pending) {
      void submit(mode)
    }
  }

  if (resolving) {
    return (
      <div
        aria-busy="true"
        aria-label="Resolving your turn"
        className={`${styles.turnComposer} ${styles.turnComposerResolving}`}
        role="status"
      >
        <div className={styles.composerProgress}>
          <span aria-hidden="true" className={styles.composerSpinner} />
          <span>Resolving…</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <form className={styles.turnComposer} aria-busy={pending} onSubmit={submitForm}>
        <label className={styles.composerPrompt} htmlFor="adventure-turn-input">
          <em>
            {mode === 'act' ? 'What would you like to do?' : 'Private direction for this turn'}
          </em>
        </label>
        <div className={styles.composerInput}>
          <div className={styles.composerModes} aria-label="Turn type" role="group">
            {(['act', 'guide'] as const).map((trigger) => (
              <Button
                key={trigger}
                aria-pressed={mode === trigger}
                onClick={() => {
                  setMode(trigger)
                  setLocalError(null)
                }}
                size="dense"
                type="button"
                variant="ghost"
              >
                {trigger === 'act' ? 'Act' : 'Guide'}
              </Button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            aria-invalid={Boolean(localError || error)}
            disabled={pending}
            id="adventure-turn-input"
            maxLength={turnInputLimits[mode]}
            onChange={(event) => {
              setText(event.target.value)
              setLocalError(null)
            }}
            onKeyDown={submitOnEnter}
            placeholder={
              mode === 'act' ? 'Describe your action…' : 'Direct the Game Master privately…'
            }
            value={text}
          />
        </div>
        <p className={styles.composerDisclosure}>
          Your turn and relevant Adventure and World context will be processed by Lorecraft&apos;s
          configured AI provider.
        </p>
        {localError || error ? (
          <p className={styles.composerError} role="alert">
            {localError ?? error}
          </p>
        ) : null}
        <div className={styles.composerActions}>
          <Button pending={pending} pendingLabel="Sending turn…" size="touch" type="submit">
            Continue
          </Button>
          <Button
            ref={passRef}
            disabled={pending}
            onClick={() => setPassOpen(true)}
            size="touch"
            type="button"
            variant="secondary"
          >
            Pass
          </Button>
        </div>
      </form>
      {passOpen ? (
        <ConfirmDialog
          confirmLabel="Pass"
          finalFocusRef={passRef}
          onCancel={() => setPassOpen(false)}
          onConfirm={() => void submit('pass')}
          open={passOpen}
          pending={pending}
          pendingLabel="Passing…"
          title="Pass this moment?"
        >
          <p>The Game Master may advance the scene without an action from you.</p>
        </ConfirmDialog>
      ) : null}
    </>
  )
}

function StoryRegion({
  adventure,
  onRetry,
  retrying,
  retryError,
  onSubmitTurn,
  submittingTurn,
  submitTurnError,
  onRetryTurn,
  retryingTurn,
  turnRetryError,
  onDiscardTurn,
  discardingTurn,
  turnDiscardError,
}: {
  adventure: AdventureView
  onRetry?: () => void
  retrying: boolean
  retryError?: string | null
  onSubmitTurn?: (input: SubmitAdventureTurnInput) => Promise<void>
  submittingTurn: boolean
  submitTurnError: string | null
  onRetryTurn?: (turnId: string) => void
  retryingTurn: boolean
  turnRetryError: string | null
  onDiscardTurn?: (turnId: string) => void
  discardingTurn: boolean
  turnDiscardError: string | null
}) {
  const openingInProgress =
    adventure.status === 'opening_pending' || adventure.status === 'opening_processing'
  const regionRef = useRef<HTMLElement>(null)
  const storyContentRef = useRef<HTMLDivElement>(null)
  const wasOpening = useRef(openingInProgress)
  const previousActiveTurnId = useRef(adventure.activeTurn?.id ?? null)
  const previousTurnCount = useRef(adventure.turnCount)
  const [completionAnnouncement, setCompletionAnnouncement] = useState('')

  useEffect(() => {
    if (wasOpening.current && adventure.status === 'ready') {
      setCompletionAnnouncement('Your Adventure opening is ready.')
    }
    if (
      previousActiveTurnId.current &&
      !adventure.activeTurn &&
      adventure.turnCount > previousTurnCount.current
    ) {
      setCompletionAnnouncement('Your turn is ready.')
    }
    wasOpening.current = openingInProgress
    previousActiveTurnId.current = adventure.activeTurn?.id ?? null
    previousTurnCount.current = adventure.turnCount
  }, [adventure.activeTurn, adventure.status, adventure.turnCount, openingInProgress])

  useLayoutEffect(() => {
    const storyContent = storyContentRef.current
    if (storyContent) {
      storyContent.scrollTop = storyContent.scrollHeight
    }
  }, [adventure])

  function retryOpening() {
    onRetry?.()
    regionRef.current?.focus()
  }

  return (
    <section
      ref={regionRef}
      className={styles.storyRegion}
      aria-label="Story"
      data-route-heading
      tabIndex={-1}
    >
      {!openingInProgress ? (
        <p className={styles.srOnly} role="status" aria-atomic="true">
          {completionAnnouncement}
        </p>
      ) : null}
      <div className={styles.storyBody}>
        <div
          ref={storyContentRef}
          className={styles.storyContent}
          data-slot="story-scroll-region"
          tabIndex={0}
        >
          {openingInProgress ? (
            <div className={styles.storyState} role="status" aria-atomic="true">
              <p className={styles.stateEyebrow}>Game Master</p>
              <h2>Preparing your opening</h2>
              <p>
                Your Adventure is safe. You can leave this page and return while the story begins.
              </p>
            </div>
          ) : null}
          {adventure.status === 'opening_failed' ? (
            <div className={`${styles.storyState} ${styles.failureState}`} role="alert">
              <p className={styles.stateEyebrow}>Opening failed</p>
              <h2>Lorecraft couldn't prepare your opening</h2>
              <p>No partial story was saved. Try again when you're ready.</p>
              {retryError ? <p className={styles.retryError}>{retryError}</p> : null}
              <div className={styles.stateActions}>
                <Button
                  onClick={retryOpening}
                  pending={retrying}
                  pendingLabel="Trying again…"
                  size="touch"
                >
                  Try again
                </Button>
                <Link to={adventure.sourceWorld.route}>Return to World</Link>
              </div>
            </div>
          ) : null}
          {adventure.story.map((entry) => (
            <article className={styles.storyEntry} key={entry.id}>
              {entry.content.split(/\n\n+/).map((paragraph, index) => (
                <p key={`${entry.id}-${index}`}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>
        <div className={styles.composerDock} data-slot="turn-composer-dock">
          {adventure.status === 'ready' && adventure.activeTurn?.status === 'failed' ? (
            <div className={`${styles.turnFailure} ${styles.failureState}`} role="alert">
              <p className={styles.stateEyebrow}>Turn interrupted</p>
              <h2>Your last turn did not change the story</h2>
              <p>Retry the same turn or discard it to return to the composer.</p>
              {turnRetryError || turnDiscardError ? (
                <p className={styles.retryError}>{turnRetryError ?? turnDiscardError}</p>
              ) : null}
              <div className={styles.stateActions}>
                <Button
                  onClick={() => onRetryTurn?.(adventure.activeTurn!.id)}
                  pending={retryingTurn}
                  pendingLabel="Retrying turn…"
                  size="touch"
                >
                  Retry turn
                </Button>
                <Button
                  onClick={() => onDiscardTurn?.(adventure.activeTurn!.id)}
                  pending={discardingTurn}
                  pendingLabel="Discarding turn…"
                  size="touch"
                  variant="secondary"
                >
                  Discard
                </Button>
              </div>
            </div>
          ) : null}
          {adventure.status === 'ready' && !adventure.activeTurn ? (
            <TurnComposer
              onSubmit={onSubmitTurn}
              pending={submittingTurn}
              error={submitTurnError}
            />
          ) : null}
          {adventure.status === 'ready' &&
          adventure.activeTurn &&
          adventure.activeTurn.status !== 'failed' ? (
            <TurnComposer pending={false} error={null} resolving />
          ) : null}
        </div>
      </div>
    </section>
  )
}

function NpcDebugEditor({
  npc,
  onSave,
}: {
  npc: AdventureView['scene']['npcs'][number]
  onSave: (characterKey: string, input: UpdateAdventureNpcStateInput) => Promise<void>
}) {
  const initialMood = npc.mood.trim() || emptyNpcStateFallback.mood
  const initialStatus = npc.status.trim() || emptyNpcStateFallback.status
  const initialMemory = npc.memory.trim() || emptyNpcStateFallback.memory
  const [draft, setDraft] = useState<UpdateAdventureNpcStateInput>({
    name: npc.name,
    currentLocationKey: npc.currentLocation.key,
    physicalDescription: npc.physicalDescription,
    background: npc.background,
    personality: npc.personality,
    voice: npc.voice,
    privateKnowledge: npc.privateKnowledge,
    mood: initialMood,
    status: initialStatus,
    memory: initialMemory,
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<NpcField, string>>>({})
  const sourceSignature = JSON.stringify({
    name: npc.name,
    currentLocationKey: npc.currentLocation.key,
    physicalDescription: npc.physicalDescription,
    background: npc.background,
    personality: npc.personality,
    voice: npc.voice,
    privateKnowledge: npc.privateKnowledge,
    mood: initialMood,
    status: initialStatus,
    memory: initialMemory,
  })
  const draftSignature = JSON.stringify(draft)
  const [lastSubmittedSignature, setLastSubmittedSignature] = useState(sourceSignature)

  useEffect(() => {
    if (saving || sourceSignature === draftSignature || lastSubmittedSignature === draftSignature)
      return
    const timeout = window.setTimeout(() => {
      setLastSubmittedSignature(draftSignature)
      setSaving(true)
      setSaveError(null)
      void onSave(npc.key, draft)
        .catch((error: unknown) => {
          if (error instanceof AdventureApiError && error.code === 'validation') {
            const nextFieldErrors = Object.fromEntries(
              Object.entries(error.fieldErrors).filter(([field]) => field in draft)
            ) as Partial<Record<NpcField, string>>
            setFieldErrors(nextFieldErrors)
            setSaveError(
              Object.keys(nextFieldErrors).length > 0
                ? 'Correct the highlighted fields.'
                : 'NPC state could not be saved. Please try again.'
            )
            return
          }
          setSaveError(error instanceof Error ? error.message : 'NPC state could not be saved.')
        })
        .finally(() => setSaving(false))
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [draft, draftSignature, lastSubmittedSignature, npc.key, onSave, saving, sourceSignature])

  function update<K extends keyof UpdateAdventureNpcStateInput>(
    field: K,
    value: UpdateAdventureNpcStateInput[K]
  ) {
    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const remaining = { ...current }
        delete remaining[field]
        return remaining
      })
      setSaveError(null)
    }
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function retrySave() {
    setFieldErrors({})
    setSaveError(null)
    setLastSubmittedSignature('')
  }

  function errorId(field: NpcField) {
    return `npc-${npc.key}-${field}-error`
  }

  function fieldAccessibility(field: NpcField) {
    const error = fieldErrors[field]
    return {
      'aria-describedby': error ? errorId(field) : undefined,
      'aria-invalid': error ? true : undefined,
    }
  }

  return (
    <>
      <div className={styles.npcEditor}>
        <dt>Name</dt>
        <dd>
          <input
            aria-label="Name"
            disabled={saving}
            maxLength={100}
            onChange={(event) => update('name', event.target.value)}
            value={draft.name}
            {...fieldAccessibility('name')}
          />
          <NpcFieldError error={fieldErrors.name} id={errorId('name')} />
        </dd>
      </div>
      <div className={styles.npcEditor}>
        <dt>Current location</dt>
        <dd>
          <input
            aria-label="Current location key"
            disabled={saving}
            maxLength={100}
            onChange={(event) => update('currentLocationKey', event.target.value)}
            value={draft.currentLocationKey}
            {...fieldAccessibility('currentLocationKey')}
          />
          <NpcFieldError
            error={fieldErrors.currentLocationKey}
            id={errorId('currentLocationKey')}
          />
        </dd>
      </div>
      <div className={styles.npcEditor}>
        <dt>Physical description</dt>
        <dd>
          <textarea
            aria-label="Physical description"
            disabled={saving}
            maxLength={320}
            onChange={(event) => update('physicalDescription', event.target.value)}
            value={draft.physicalDescription}
            {...fieldAccessibility('physicalDescription')}
          />
          <NpcFieldError
            error={fieldErrors.physicalDescription}
            id={errorId('physicalDescription')}
          />
        </dd>
      </div>
      <div className={styles.npcEditor}>
        <dt>Background</dt>
        <dd>
          <textarea
            aria-label="Background"
            disabled={saving}
            maxLength={700}
            onChange={(event) => update('background', event.target.value)}
            value={draft.background}
            {...fieldAccessibility('background')}
          />
          <NpcFieldError error={fieldErrors.background} id={errorId('background')} />
        </dd>
      </div>
      <div className={styles.npcEditor}>
        <dt>Personality</dt>
        <dd>
          <textarea
            aria-label="Personality"
            disabled={saving}
            maxLength={320}
            onChange={(event) => update('personality', event.target.value)}
            value={draft.personality}
            {...fieldAccessibility('personality')}
          />
          <NpcFieldError error={fieldErrors.personality} id={errorId('personality')} />
        </dd>
      </div>
      <div className={styles.npcEditor}>
        <dt>Voice</dt>
        <dd>
          <textarea
            aria-label="Voice"
            disabled={saving}
            maxLength={240}
            onChange={(event) => update('voice', event.target.value)}
            value={draft.voice}
            {...fieldAccessibility('voice')}
          />
          <NpcFieldError error={fieldErrors.voice} id={errorId('voice')} />
        </dd>
      </div>
      <div className={styles.npcEditor}>
        <dt>Private knowledge</dt>
        <dd>
          <textarea
            aria-label="Private knowledge"
            disabled={saving}
            maxLength={700}
            onChange={(event) => update('privateKnowledge', event.target.value)}
            value={draft.privateKnowledge}
            {...fieldAccessibility('privateKnowledge')}
          />
          <NpcFieldError
            error={fieldErrors.privateKnowledge}
            id={errorId('privateKnowledge')}
          />
        </dd>
      </div>
      <div className={styles.npcEditor}>
        <dt>Mood</dt>
        <dd>
          <textarea
            aria-label="Mood"
            disabled={saving}
            maxLength={120}
            onChange={(event) => update('mood', event.target.value)}
            value={draft.mood}
            {...fieldAccessibility('mood')}
          />
          <NpcFieldError error={fieldErrors.mood} id={errorId('mood')} />
        </dd>
      </div>
      <div className={styles.npcEditor}>
        <dt>Status</dt>
        <dd>
          <textarea
            aria-label="Status"
            disabled={saving}
            maxLength={320}
            onChange={(event) => update('status', event.target.value)}
            value={draft.status}
            {...fieldAccessibility('status')}
          />
          <NpcFieldError error={fieldErrors.status} id={errorId('status')} />
        </dd>
      </div>
      <div className={styles.npcEditor}>
        <dt>Memory</dt>
        <dd>
          <textarea
            aria-label="Memory"
            disabled={saving}
            maxLength={500}
            onChange={(event) => update('memory', event.target.value)}
            value={draft.memory}
            {...fieldAccessibility('memory')}
          />
          <NpcFieldError error={fieldErrors.memory} id={errorId('memory')} />
        </dd>
      </div>
      <div className={styles.npcEditorStatus}>
        <dt>Save status</dt>
        <dd aria-live="polite">
          {saveError ? (
            <>
              <span role="alert">{saveError}</span>
              {Object.keys(fieldErrors).length === 0 ? (
                <Button onClick={retrySave} size="dense" variant="secondary">
                  Retry save
                </Button>
              ) : null}
            </>
          ) : saving ? (
            'Saving NPC state…'
          ) : (
            'NPC state saved.'
          )}
        </dd>
      </div>
    </>
  )
}

function SceneRegion({
  adventure,
  onSaveNpcState,
}: {
  adventure: AdventureView
  onSaveNpcState?: (characterKey: string, input: UpdateAdventureNpcStateInput) => Promise<void>
}) {
  const { scene } = adventure
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [selectedNpc, setSelectedNpc] = useState<AdventureView['scene']['npcs'][number] | null>(
    null
  )
  const selected =
    scene.npcs.find((npc) => npc.key === selectedKey) ?? (onSaveNpcState ? selectedNpc : null)
  const npcButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  const sceneRegionRef = useRef<HTMLElement>(null)

  return (
    <section
      className={styles.sideRegion}
      aria-label="Scene"
      data-slot="scene-scroll-region"
      ref={sceneRegionRef}
      tabIndex={0}
    >
      <PanelHeading eyebrow="Scene" id="adventure-scene-heading" title={scene.location.name} />
      <p className={styles.sceneDescription}>{scene.location.description}</p>
      {selected ? (
        <section className={styles.sceneNpcs} aria-label="NPC debug card">
          <Button
            onClick={() => {
              const returningKey = selected.key
              setSelectedKey(null)
              setSelectedNpc(null)
              window.setTimeout(() => {
                const returningButton = npcButtonRefs.current.get(returningKey)
                if (returningButton) returningButton.focus()
                else sceneRegionRef.current?.focus()
              }, 0)
            }}
            size="touch"
            variant="ghost"
          >
            Back to Scene
          </Button>
          <p className={styles.stateEyebrow}>Development / debug information</p>
          <h3>{onSaveNpcState ? 'NPC card' : selected.name}</h3>
          {onSaveNpcState ? (
            <>
              <p className={styles.npcEditorNote}>
                Click a card value to edit. It autosaves to this Adventure only and never changes
                the frozen World or seed data.
              </p>
              {!scene.npcs.some((npc) => npc.key === selected.key) ? (
                <p className={styles.npcEditorNote}>
                  This NPC is no longer in the current Scene; this Debug editor remains open for
                  local edits.
                </p>
              ) : null}
            </>
          ) : null}
          <dl className={styles.details}>
            <div>
              <dt>Key</dt>
              <dd>{selected.key}</dd>
            </div>
            {onSaveNpcState ? (
              <NpcDebugEditor
                key={selected.key}
                npc={selected}
                onSave={onSaveNpcState}
              />
            ) : (
              <>
                <div>
                  <dt>Name</dt>
                  <dd>{selected.name}</dd>
                </div>
                <div>
                  <dt>Current location</dt>
                  <dd>{selected.currentLocation.name}</dd>
                </div>
                <div>
                  <dt>Physical description</dt>
                  <dd>{selected.physicalDescription}</dd>
                </div>
                <div>
                  <dt>Background</dt>
                  <dd>{selected.background}</dd>
                </div>
                <div>
                  <dt>Personality</dt>
                  <dd>{selected.personality}</dd>
                </div>
                <div>
                  <dt>Voice</dt>
                  <dd>{selected.voice}</dd>
                </div>
                <div>
                  <dt>Private knowledge</dt>
                  <dd>{selected.privateKnowledge}</dd>
                </div>
                <div>
                  <dt>Mood</dt>
                  <dd>{selected.mood}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{selected.status}</dd>
                </div>
                <div>
                  <dt>Memory</dt>
                  <dd>{selected.memory}</dd>
                </div>
              </>
            )}
          </dl>
        </section>
      ) : (
        <section className={styles.sceneNpcs} aria-labelledby="adventure-npcs-heading">
          <h3 id="adventure-npcs-heading">People here</h3>
          {scene.npcs.length > 0 ? (
            <ul>
              {scene.npcs.map((npc) => (
                <li key={npc.key}>
                  <Button
                    ref={(element) => {
                      if (element) npcButtonRefs.current.set(npc.key, element)
                      else npcButtonRefs.current.delete(npc.key)
                    }}
                    onClick={() => {
                      setSelectedKey(npc.key)
                      setSelectedNpc(npc)
                    }}
                    size="touch"
                    variant="ghost"
                  >
                    {npc.name}
                  </Button>
                  <p>{npc.physicalDescription}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No one else is visible here.</p>
          )}
        </section>
      )}
    </section>
  )
}

export function AdventureWorkbench({
  adventure,
  onRetry,
  retrying = false,
  retryError = null,
  onSubmitTurn,
  submittingTurn = false,
  submitTurnError = null,
  onRetryTurn,
  retryingTurn = false,
  turnRetryError = null,
  onDiscardTurn,
  discardingTurn = false,
  turnDiscardError = null,
  onSaveNpcState,
  layout = 'auto',
}: {
  adventure: AdventureView
  onRetry?: () => void
  retrying?: boolean
  retryError?: string | null
  onSubmitTurn?: (input: SubmitAdventureTurnInput) => Promise<void>
  submittingTurn?: boolean
  submitTurnError?: string | null
  onRetryTurn?: (turnId: string) => void
  retryingTurn?: boolean
  turnRetryError?: string | null
  onDiscardTurn?: (turnId: string) => void
  discardingTurn?: boolean
  turnDiscardError?: string | null
  onSaveNpcState?: (characterKey: string, input: UpdateAdventureNpcStateInput) => Promise<void>
  layout?: 'auto' | 'desktop' | 'mobile'
}) {
  const [narrowViewport, setNarrowViewport] = useState(
    () => window.matchMedia?.('(max-width: 60rem)').matches ?? false
  )
  const [activePane, setActivePane] = useState<AdventurePane>('story')

  useEffect(() => {
    if (layout !== 'auto' || !window.matchMedia) return
    const media = window.matchMedia('(max-width: 60rem)')
    const update = () => setNarrowViewport(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [layout])

  const mobile = layout === 'mobile' || (layout === 'auto' && narrowViewport)

  function paneFor(pane: AdventurePane) {
    if (pane === 'player') return <PlayerRegion adventure={adventure} />
    if (pane === 'scene') {
      return <SceneRegion adventure={adventure} onSaveNpcState={onSaveNpcState} />
    }
    return (
      <StoryRegion
        adventure={adventure}
        onRetry={onRetry}
        retrying={retrying}
        retryError={retryError}
        onSubmitTurn={onSubmitTurn}
        submittingTurn={submittingTurn}
        submitTurnError={submitTurnError}
        onRetryTurn={onRetryTurn}
        retryingTurn={retryingTurn}
        turnRetryError={turnRetryError}
        onDiscardTurn={onDiscardTurn}
        discardingTurn={discardingTurn}
        turnDiscardError={turnDiscardError}
      />
    )
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, pane: AdventurePane) {
    const currentIndex = paneOrder.indexOf(pane)
    let nextIndex: number | undefined

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % paneOrder.length
    if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + paneOrder.length) % paneOrder.length
    }
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = paneOrder.length - 1
    if (nextIndex === undefined) return

    event.preventDefault()
    const nextPane = paneOrder[nextIndex]
    setActivePane(nextPane)
    document.getElementById(`adventure-tab-${nextPane}`)?.focus()
  }

  if (mobile) {
    return (
      <div className={styles.mobileWorkbench} data-slot="adventure-workbench">
        <nav className={styles.mobileTabs} role="tablist" aria-label="Adventure views">
          {paneOrder.map((pane) => (
            <Button
              key={pane}
              id={`adventure-tab-${pane}`}
              role="tab"
              aria-controls={activePane === pane ? `adventure-panel-${pane}` : undefined}
              aria-selected={activePane === pane}
              tabIndex={activePane === pane ? 0 : -1}
              onClick={() => setActivePane(pane)}
              onKeyDown={(event) => handleTabKey(event, pane)}
              size="touch"
              variant="ghost"
            >
              {paneLabels[pane]}
            </Button>
          ))}
        </nav>
        <div
          className={styles.mobilePanel}
          id={`adventure-panel-${activePane}`}
          role="tabpanel"
          aria-labelledby={`adventure-tab-${activePane}`}
          tabIndex={0}
        >
          {paneFor(activePane)}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.desktopGrid} data-slot="adventure-workbench">
      <StoryRegion
        adventure={adventure}
        onRetry={onRetry}
        retrying={retrying}
        retryError={retryError}
        onSubmitTurn={onSubmitTurn}
        submittingTurn={submittingTurn}
        submitTurnError={submitTurnError}
        onRetryTurn={onRetryTurn}
        retryingTurn={retryingTurn}
        turnRetryError={turnRetryError}
        onDiscardTurn={onDiscardTurn}
        discardingTurn={discardingTurn}
        turnDiscardError={turnDiscardError}
      />
      <PlayerRegion adventure={adventure} />
      <SceneRegion adventure={adventure} onSaveNpcState={onSaveNpcState} />
    </div>
  )
}
