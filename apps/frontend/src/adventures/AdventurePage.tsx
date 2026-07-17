import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import { worldQueryKeys } from '../worlds/worldApi'
import { AdventureWorkbench } from './AdventureWorkbench'
import { ConfirmDialog } from './ConfirmDialog'
import {
  AdventureApiError,
  adventureQueryKeys,
  type AdventureApi,
  type AdventureDetail,
} from './adventureApi'
import styles from './AdventurePage.module.css'

function isOpeningActive(adventure: AdventureDetail | undefined) {
  return (
    adventure?.status === 'opening_pending' || adventure?.status === 'opening_processing'
  )
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
  const menuRef = useRef<HTMLDetailsElement>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const queryKey = adventureQueryKeys.detail(account?.id ?? 0, id)
  const adventure = useQuery({
    queryKey,
    queryFn: () => adventureApi.getAdventure(id),
    enabled: account !== null,
    refetchInterval: (query) =>
      isOpeningActive(query.state.data) ? pollIntervalMs : false,
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
        current ? { ...current, status: 'opening_pending', story: [] } : current
      )
      const source = adventure.data?.sourceWorld
      if (account && source) {
        void queryClient.invalidateQueries({
          queryKey: worldQueryKeys.detail(account.id, source.slug),
        })
      }
      setResetOpen(false)
      setResetError(null)
      if (menuRef.current) menuRef.current.open = false
    },
    onError: (error) => {
      if (error instanceof AdventureApiError && error.code === 'conflict') {
        setResetError(error.reason ?? error.message)
      } else if (!(error instanceof AdventureApiError && error.code === 'unauthorized')) {
        setResetError('Lorecraft could not reset this Adventure. Try again.')
      }
    },
  })

  useEffect(() => {
    const error = adventure.error ?? retry.error ?? reset.error
    if (error instanceof AdventureApiError && error.code === 'unauthorized') {
      endSession()
    }
  }, [adventure.error, endSession, reset.error, retry.error])

  if (adventure.isPending) {
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
          <h1 className={styles.stateTitle}>
            {missing ? 'Adventure not found' : 'Adventure unavailable'}
          </h1>
          <p className={styles.stateCopy}>
            {missing
              ? 'This Adventure does not exist or is not available to this account.'
              : 'Lorecraft could not load this Adventure. Try again.'}
          </p>
          {!missing ? <button type="button" onClick={() => void adventure.refetch()}>Try again</button> : null}
        </div>
      </main>
    )
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <strong>Lorecraft</strong>
          <span aria-hidden="true" />
          <span title={adventure.data.sourceWorld.name}>{adventure.data.sourceWorld.name}</span>
        </div>
        <div className={styles.headerActions}>
          <Link to={adventure.data.sourceWorld.route}>Return to World</Link>
          <details ref={menuRef} className={styles.menu}>
            <summary>Adventure menu</summary>
            <div className={styles.menuContent}>
              <button
                type="button"
                disabled={isOpeningActive(adventure.data)}
                aria-describedby={isOpeningActive(adventure.data) ? 'reset-unavailable' : undefined}
                onClick={() => {
                  setResetError(null)
                  setResetOpen(true)
                }}
              >
                Reset Adventure
              </button>
              {isOpeningActive(adventure.data) ? (
                <p id="reset-unavailable">Reset is unavailable while the opening is active.</p>
              ) : null}
            </div>
          </details>
        </div>
      </header>
      <AdventureWorkbench
        adventure={adventure.data}
        retrying={retry.isPending}
        onRetry={() => retry.mutate()}
      />
      {resetOpen ? (
        <ConfirmDialog
          title="Reset Adventure?"
          confirmLabel="Reset Adventure"
          pendingLabel="Resetting Adventure…"
          pending={reset.isPending}
          error={resetError}
          onCancel={() => {
            setResetOpen(false)
            setResetError(null)
          }}
          onConfirm={() => reset.mutate()}
        >
          <p>
            This replaces the current opening and runtime state while preserving the original
            player profile and frozen World source.
          </p>
        </ConfirmDialog>
      ) : null}
    </main>
  )
}
