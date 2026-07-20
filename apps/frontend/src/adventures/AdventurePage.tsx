import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import { Button } from '../components/Button/Button'
import { ConfirmDialog } from '../components/Dialog/ConfirmDialog'
import { Dialog } from '../components/Dialog/Dialog'
import { IconButton } from '../components/IconButton/IconButton'
import { worldQueryKeys } from '../worlds/worldApi'
import { AdventureWorkbench } from './AdventureWorkbench'
import {
  AdventureApiError,
  adventureQueryKeys,
  type AdventureApi,
  type AdventureDetail,
  type SubmitAdventureTurnInput,
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
  if (error instanceof AdventureApiError) return error.reason ?? error.message
  return fallback
}

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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [retryingLoad, setRetryingLoad] = useState(false)
  const queryKey = adventureQueryKeys.detail(account?.id ?? 0, id)
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
        setResetError(error.reason ?? error.message)
      } else if (!(error instanceof AdventureApiError && error.code === 'unauthorized')) {
        setResetError('Lorecraft could not reset this Adventure. Try again.')
      }
    },
  })
  const submitTurn = useMutation({
    mutationFn: (input: SubmitAdventureTurnInput) => adventureApi.submitTurn(id, input),
    onSuccess: (turn) => {
      queryClient.setQueryData<AdventureDetail>(queryKey, (current) =>
        current
          ? {
              ...current,
              activeTurn:
                turn.status === 'succeeded'
                  ? null
                  : { id: turn.id, trigger: turn.trigger, status: turn.status },
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

  useEffect(() => {
    const error =
      adventure.error ??
      retry.error ??
      reset.error ??
      submitTurn.error ??
      retryTurn.error ??
      discardTurn.error
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
      ? (retry.error.reason ?? retry.error.message)
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

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerStart}>
          <Link className={styles.returnButton} to={adventure.data.sourceWorld.route}>
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.8} />
            Return to World
          </Link>
          <div className={styles.identity}>
            <strong>Lorecraft</strong>
            <span aria-hidden="true" />
            <span title={adventure.data.sourceWorld.name}>{adventure.data.sourceWorld.name}</span>
          </div>
        </div>
        <IconButton
          className={styles.settingsButton}
          label="Adventure settings"
          onClick={() => setSettingsOpen(true)}
          ref={settingsTriggerRef}
        >
          <Settings aria-hidden="true" size={18} strokeWidth={1.8} />
        </IconButton>
      </header>
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
      />
      {settingsOpen ? (
        <Dialog
          closeLabel="Close Adventure settings"
          open={settingsOpen}
          title="Adventure settings"
          onOpenChange={setSettingsOpen}
        >
          <div className={styles.settingsContent}>
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
              <p id="reset-unavailable">Reset is unavailable while Adventure work is active.</p>
            ) : null}
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
