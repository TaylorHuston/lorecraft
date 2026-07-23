import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import { Button } from '../components/Button/Button'
import { ConfirmDialog } from '../components/Dialog/ConfirmDialog'
import { Dialog } from '../components/Dialog/Dialog'
import { IconButton } from '../components/IconButton/IconButton'
import { worldQueryKeys } from '../worlds/worldApi'
import { AdventureNpcEditor, AdventureWorkbench } from './AdventureWorkbench'
import {
  AdventureApiError,
  adventureQueryKeys,
  type AdventureApi,
  type AdventureDetail,
  type SubmitAdventureTurnInput,
  type UpdateAdventureNpcStateInput,
} from './adventureApi'
import styles from './AdventurePage.module.css'

function isOpeningActive(adventure: AdventureDetail | undefined) {
  return adventure?.status === 'opening_pending' || adventure?.status === 'opening_processing'
}

function isTurnActive(adventure: AdventureDetail | undefined) {
  return (
    adventure?.activeTurn?.status === 'pending' || adventure?.activeTurn?.status === 'processing'
  )
}

function isAdventureWorkActive(adventure: AdventureDetail | undefined) {
  return isOpeningActive(adventure) || isTurnActive(adventure)
}

function mutationError(error: unknown, fallback: string) {
  if (error instanceof AdventureApiError) {
    // Conflict codes are useful to the client, but they are not copy for a
    // creator. Preserve a server-supplied human reason when one exists.
    if (error.reason && !/^[A-Z][A-Z0-9_]+$/.test(error.reason)) return error.reason
    return error.message
  }
  return fallback
}

const settingsSections = [
  { id: 'adventure', label: 'Adventure Settings' },
  { id: 'npcs', label: 'NPCs' },
  { id: 'locations', label: 'Locations' },
] as const

type SettingsSection = (typeof settingsSections)[number]['id']

export function AdventurePage({
  adventureApi,
  pollIntervalMs = 2_000,
}: {
  adventureApi: AdventureApi
  pollIntervalMs?: number
}) {
  const { id = '' } = useParams()
  const { account, endSession } = useAuth()
  const queryClient = useQueryClient()
  const settingsTriggerRef = useRef<HTMLButtonElement>(null)
  const settingsTabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('adventure')
  const [settingsNpcKey, setSettingsNpcKey] = useState<string | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [retryingLoad, setRetryingLoad] = useState(false)
  const queryKey = adventureQueryKeys.detail(account?.id ?? 0, id)
  const updateNpcStateFromApi = adventureApi.updateNpcState
  const adventure = useQuery({
    queryKey,
    queryFn: () => adventureApi.getAdventure(id),
    enabled: account !== null,
    refetchInterval: (query) => (isAdventureWorkActive(query.state.data) ? pollIntervalMs : false),
  })
  const retry = useMutation({
    mutationFn: () => adventureApi.retryOpening(id),
    onSuccess: () => {
      queryClient.setQueryData<AdventureDetail>(queryKey, (current) =>
        current ? { ...current, status: 'opening_pending', story: [] } : current
      )
      const source = adventure.data?.sourceWorld
      if (account && source) {
        void queryClient.invalidateQueries({
          queryKey: worldQueryKeys.detail(account.id, source.slug),
        })
      }
    },
  })
  const reset = useMutation({
    mutationFn: () => adventureApi.resetAdventure(id),
    onSuccess: () => {
      queryClient.setQueryData<AdventureDetail>(queryKey, (current) =>
        current ? { ...current, status: 'opening_pending', turnCount: 0, story: [] } : current
      )
      const source = adventure.data?.sourceWorld
      if (account && source) {
        void queryClient.invalidateQueries({
          queryKey: worldQueryKeys.detail(account.id, source.slug),
        })
      }
      setResetOpen(false)
      setSettingsOpen(false)
      setResetError(null)
    },
    onError: (error) => {
      if (error instanceof AdventureApiError && error.code === 'conflict') {
        setResetError(mutationError(error, 'Lorecraft could not reset this Adventure. Try again.'))
      } else if (!(error instanceof AdventureApiError && error.code === 'unauthorized')) {
        setResetError('Lorecraft could not reset this Adventure. Try again.')
      }
    },
  })
  const submitTurn = useMutation({
    mutationFn: (input: SubmitAdventureTurnInput) => adventureApi.submitTurn(id, input),
    onSuccess: (turn, input) => {
      queryClient.setQueryData<AdventureDetail>(queryKey, (current) =>
        current
          ? {
              ...current,
              activeTurn:
                turn.status === 'succeeded'
                  ? null
                  : {
                      id: turn.id,
                      trigger: turn.trigger,
                      status: turn.status,
                      content:
                        turn.trigger === 'act'
                          ? (input.input ?? null)
                          : turn.trigger === 'pass'
                            ? 'Pass'
                            : null,
                    },
            }
          : current
      )
      void queryClient.invalidateQueries({ queryKey })
    },
  })
  const retryTurn = useMutation({
    mutationFn: (turnId: string) => adventureApi.retryTurn(id, turnId),
    onSuccess: (turn) => {
      queryClient.setQueryData<AdventureDetail>(queryKey, (current) =>
        current?.activeTurn
          ? { ...current, activeTurn: { ...current.activeTurn, status: turn.status } }
          : current
      )
      void queryClient.invalidateQueries({ queryKey })
    },
  })
  const discardTurn = useMutation({
    mutationFn: (turnId: string) => adventureApi.discardTurn(id, turnId),
    onSuccess: () => {
      queryClient.setQueryData<AdventureDetail>(queryKey, (current) =>
        current ? { ...current, activeTurn: null } : current
      )
      void queryClient.invalidateQueries({ queryKey })
    },
  })
  const updateNpcState = useMutation({
    mutationFn: ({
      characterKey,
      input,
    }: {
      characterKey: string
      input: UpdateAdventureNpcStateInput
    }) => {
      if (!updateNpcStateFromApi) {
        throw new AdventureApiError('network', 'NPC state editing is unavailable.')
      }
      return updateNpcStateFromApi(id, characterKey, input)
    },
    onSuccess: (updatedAdventure) => {
      queryClient.setQueryData(queryKey, updatedAdventure)
    },
  })

  useEffect(() => {
    const error =
      adventure.error ??
      retry.error ??
      reset.error ??
      submitTurn.error ??
      retryTurn.error ??
      discardTurn.error ??
      updateNpcState.error
    if (error instanceof AdventureApiError && error.code === 'unauthorized') {
      endSession()
    }
  }, [
    adventure.error,
    discardTurn.error,
    endSession,
    reset.error,
    retry.error,
    retryTurn.error,
    submitTurn.error,
    updateNpcState.error,
  ])

  if (adventure.isPending && !retryingLoad) {
    return (
      <main className={styles.stateShell} aria-busy="true">
        <div role="status" aria-live="polite">
          <p className={styles.stateLabel}>Lorecraft</p>
          <p className={styles.stateTitle}>Loading Adventure…</p>
        </div>
      </main>
    )
  }

  if (adventure.isError || !adventure.data) {
    const missing =
      adventure.error instanceof AdventureApiError && adventure.error.code === 'not-found'
    return (
      <main className={styles.stateShell}>
        <div role="alert">
          <p className={styles.stateLabel}>{missing ? 'Not found' : 'Connection error'}</p>
          <h1 className={styles.stateTitle} data-route-heading>
            {missing ? 'Adventure not found' : 'Adventure unavailable'}
          </h1>
          <p className={styles.stateCopy}>
            {missing
              ? 'This Adventure does not exist or is not available to this account.'
              : 'Lorecraft could not load this Adventure. Try again.'}
          </p>
          {!missing ? (
            <Button
              onClick={() => {
                setRetryingLoad(true)
                void adventure.refetch().finally(() => setRetryingLoad(false))
              }}
              pending={retryingLoad}
              pendingLabel="Trying again…"
              size="touch"
            >
              Try again
            </Button>
          ) : null}
        </div>
      </main>
    )
  }

  const retryError = retry.error
    ? retry.error instanceof AdventureApiError && retry.error.code === 'conflict'
      ? mutationError(retry.error, 'Lorecraft could not retry this opening. Try again.')
      : 'Lorecraft could not retry this opening. Try again.'
    : null
  const submitTurnError = submitTurn.error
    ? mutationError(submitTurn.error, 'Lorecraft could not submit this turn. Try again.')
    : null
  const turnRetryError = retryTurn.error
    ? mutationError(retryTurn.error, 'Lorecraft could not retry this turn. Try again.')
    : null
  const turnDiscardError = discardTurn.error
    ? mutationError(discardTurn.error, 'Lorecraft could not discard this turn. Try again.')
    : null
  const saveNpcState =
    import.meta.env.DEV && updateNpcStateFromApi
      ? async (characterKey: string, input: UpdateAdventureNpcStateInput) => {
          await updateNpcState.mutateAsync({ characterKey, input })
        }
      : undefined
  const settingsNpc = adventure.data.scene.npcs.find((npc) => npc.key === settingsNpcKey) ?? null

  function openSettings() {
    setSettingsSection('adventure')
    setSettingsNpcKey(null)
    setSettingsOpen(true)
  }

  function moveSettingsTab(event: KeyboardEvent<HTMLButtonElement>, current: SettingsSection) {
    const currentIndex = settingsSections.findIndex((section) => section.id === current)
    let nextIndex: number

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % settingsSections.length
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + settingsSections.length) % settingsSections.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = settingsSections.length - 1
    } else {
      return
    }

    event.preventDefault()
    setSettingsSection(settingsSections[nextIndex].id)
    settingsTabRefs.current[nextIndex]?.focus()
  }

  return (
    <main className={styles.shell}>
      <AdventureWorkbench
        adventure={adventure.data}
        retrying={retry.isPending}
        retryError={retryError}
        onRetry={() => retry.mutate()}
        onSubmitTurn={async (input) => {
          await submitTurn.mutateAsync(input)
        }}
        submittingTurn={submitTurn.isPending}
        submitTurnError={submitTurnError}
        onRetryTurn={(turnId) => retryTurn.mutate(turnId)}
        retryingTurn={retryTurn.isPending}
        turnRetryError={turnRetryError}
        onDiscardTurn={(turnId) => discardTurn.mutate(turnId)}
        discardingTurn={discardTurn.isPending}
        turnDiscardError={turnDiscardError}
        onOpenSettings={openSettings}
      />
      {settingsOpen ? (
        <Dialog
          closeLabel="Close Adventure settings"
          open={settingsOpen}
          size="wide"
          title="Adventure settings"
          onOpenChange={setSettingsOpen}
        >
          <div className={styles.settingsContent} data-slot="adventure-settings-workspace">
            <nav className={styles.settingsNavigation} aria-label="Adventure settings sections">
              <p className={styles.settingsNavigationLabel}>Adventure</p>
              <div aria-label="Adventure settings sections" className={styles.settingsTabs} role="tablist">
                {settingsSections.map((section, index) => (
                  <button
                    key={section.id}
                    ref={(element) => {
                      settingsTabRefs.current[index] = element
                    }}
                    aria-controls={`adventure-settings-panel-${section.id}`}
                    aria-selected={settingsSection === section.id}
                    className={styles.settingsTab}
                    id={`adventure-settings-tab-${section.id}`}
                    onClick={() => setSettingsSection(section.id)}
                    onKeyDown={(event) => moveSettingsTab(event, section.id)}
                    role="tab"
                    tabIndex={settingsSection === section.id ? 0 : -1}
                    type="button"
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </nav>
            <div className={styles.settingsPanel}>
              {settingsSection === 'adventure' ? (
                <section
                  aria-labelledby="adventure-settings-tab-adventure"
                  id="adventure-settings-panel-adventure"
                  role="tabpanel"
                >
                  <div>
                    <p className={styles.settingsEyebrow}>Adventure configuration</p>
                    <h3>Adventure Settings</h3>
                    <p className={styles.settingsCopy}>
                      Prompt instructions and other Adventure-level direction will live here.
                    </p>
                  </div>
                  <section className={styles.dangerZone} aria-labelledby="adventure-reset-heading">
                    <div>
                      <p className={styles.settingsEyebrow}>Danger zone</p>
                      <h4 id="adventure-reset-heading">Reset this Adventure</h4>
                      <p className={styles.settingsCopy}>
                        Start again from the frozen World source and preserve the player profile.
                      </p>
                    </div>
                    <Button
                      className={styles.resetAction}
                      disabled={isAdventureWorkActive(adventure.data)}
                      aria-describedby={
                        isAdventureWorkActive(adventure.data) ? 'reset-unavailable' : undefined
                      }
                      onClick={() => {
                        setResetError(null)
                        setSettingsOpen(false)
                        window.setTimeout(() => setResetOpen(true), 0)
                      }}
                      size="touch"
                      variant="destructive"
                    >
                      Reset Adventure
                    </Button>
                    {isAdventureWorkActive(adventure.data) ? (
                      <p className={styles.settingsNotice} id="reset-unavailable">
                        Reset is unavailable while Adventure work is active.
                      </p>
                    ) : null}
                  </section>
                </section>
              ) : null}
              {settingsSection === 'npcs' ? (
                <section
                  aria-labelledby="adventure-settings-tab-npcs"
                  id="adventure-settings-panel-npcs"
                  role="tabpanel"
                >
                  {settingsNpc ? (
                    <>
                      <IconButton label="Back to NPCs" onClick={() => setSettingsNpcKey(null)}>
                        <ArrowLeft aria-hidden="true" size={20} strokeWidth={1.8} />
                      </IconButton>
                      <div>
                        <p className={styles.settingsEyebrow}>NPC card</p>
                        <h3>{settingsNpc.name}</h3>
                        <p className={styles.settingsCopy}>
                          Edit this Adventure&apos;s NPC state without changing the frozen World.
                        </p>
                      </div>
                      <dl className={styles.settingsNpcDetails}>
                        <AdventureNpcEditor key={settingsNpc.key} npc={settingsNpc} onSave={saveNpcState} />
                      </dl>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className={styles.settingsEyebrow}>Adventure workspace</p>
                        <h3>NPCs</h3>
                        <p className={styles.settingsCopy}>People in the current Scene</p>
                      </div>
                      {adventure.data.scene.npcs.length > 0 ? (
                        <ul className={styles.settingsNpcGrid}>
                          {adventure.data.scene.npcs.map((npc) => (
                            <li key={npc.key}>
                              <button
                                aria-label={`Edit ${npc.name}`}
                                className={styles.settingsNpcCard}
                                onClick={() => setSettingsNpcKey(npc.key)}
                                type="button"
                              >
                                <span aria-hidden="true" className={styles.settingsNpcAvatar}>
                                  {npc.name
                                    .split(/\s+/)
                                    .map((part) => part[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </span>
                                <span className={styles.settingsNpcName}>{npc.name}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.settingsCopy}>No NPCs are in the current Scene.</p>
                      )}
                    </>
                  )}
                </section>
              ) : null}
              {settingsSection === 'locations' ? (
                <section
                  aria-labelledby="adventure-settings-tab-locations"
                  id="adventure-settings-panel-locations"
                  role="tabpanel"
                >
                  <p className={styles.settingsEyebrow}>Adventure workspace</p>
                  <h3>Locations</h3>
                  <p className={styles.settingsCopy}>
                    Adventure-scoped location tools will appear here.
                  </p>
                </section>
              ) : null}
            </div>
          </div>
        </Dialog>
      ) : null}
      {resetOpen ? (
        <ConfirmDialog
          confirmLabel="Reset Adventure"
          error={resetError}
          finalFocusRef={settingsTriggerRef}
          onCancel={() => {
            setResetOpen(false)
            setResetError(null)
          }}
          onConfirm={() => reset.mutate()}
          open={resetOpen}
          pending={reset.isPending}
          pendingLabel="Resetting Adventure…"
          title="Reset Adventure?"
        >
          <p>
            This replaces the current opening and runtime state while preserving the original player
            profile and frozen World source.
          </p>
        </ConfirmDialog>
      ) : null}
    </main>
  )
}
