import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AdventureApiError,
  type AdventureApi,
  type AdventureSummary,
} from '../adventures/adventureApi'
import { ConfirmDialog } from '../adventures/ConfirmDialog'
import { AuthApiError } from '../auth/authApi'
import { useAuth } from '../auth/authContext'
import { WorldApiError, worldQueryKeys, type WorldApi } from '../worlds/worldApi'
import styles from './WorkspacePage.module.css'

const adventureStatusLabels = {
  opening_pending: 'Opening pending',
  opening_processing: 'Opening in progress',
  opening_failed: 'Opening failed',
  ready: 'Ready',
} as const

function formatLastPlayed(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function WorkspacePage({
  worldApi,
  adventureApi,
}: {
  worldApi: WorldApi
  adventureApi: AdventureApi
}) {
  const { account, api, endSession } = useAuth()
  const navigate = useNavigate()
  const [isRetrying, setIsRetrying] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdventureSummary | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const catalogHeadingRef = useRef<HTMLHeadingElement>(null)
  const queryClient = useQueryClient()
  const catalogQueryKey = worldQueryKeys.catalog(account?.id ?? 0)
  const signOut = useMutation({
    mutationFn: () => api.signOut(),
    retry: false,
    onSuccess: () => {
      endSession()
      navigate('/sign-in', { replace: true })
    },
  })
  const worlds = useQuery({
    queryKey: catalogQueryKey,
    queryFn: () => worldApi.listWorlds(),
    enabled: account !== null,
  })
  const deleteAdventure = useMutation({
    mutationFn: (adventureId: string) => adventureApi.deleteAdventure(adventureId),
    onSuccess: (_result, adventureId) => {
      queryClient.setQueryData<typeof worldList>(catalogQueryKey, (current) =>
        current?.map((world) => ({
          ...world,
          adventures: world.adventures.filter((item) => item.id !== adventureId),
        }))
      )
      setDeleteTarget(null)
      setDeleteError(null)
      requestAnimationFrame(() => catalogHeadingRef.current?.focus())
    },
    onError: (error) => {
      if (!(error instanceof AdventureApiError && error.code === 'unauthorized')) {
        setDeleteError('Lorecraft could not delete this Adventure. Try again.')
      }
    },
  })

  useEffect(() => {
    const error = worlds.error ?? deleteAdventure.error
    if (
      (error instanceof WorldApiError || error instanceof AdventureApiError) &&
      error.code === 'unauthorized'
    ) {
      endSession()
    }
  }, [deleteAdventure.error, endSession, worlds.error])

  async function retryWorlds() {
    setIsRetrying(true)
    try {
      await worlds.refetch()
    } finally {
      setIsRetrying(false)
    }
  }

  const worldList = worlds.data ?? []

  return (
    <main
      className={styles.shell}
      aria-busy={worlds.isPending || isRetrying || signOut.isPending || undefined}
    >
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <span className={styles.brand}>Lorecraft</span>
          <span className={styles.separator} aria-hidden="true" />
          {account ? (
            <span
              className={styles.account}
              aria-label={`Signed in as ${account.email}`}
              title={account.email}
            >
              {account.email}
            </span>
          ) : null}
        </div>
        <button
          id="workspace-sign-out"
          className={styles.signOut}
          type="button"
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
        >
          {signOut.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </header>
      <div className={styles.content}>
        <div className={styles.headingRow}>
          <p className={styles.eyebrow}>World library</p>
          <h1 className={styles.title}>Worlds</h1>
        </div>
        {signOut.isError ? (
          <p className={styles.error} role="alert">
            {signOut.error instanceof AuthApiError && signOut.error.code === 'rate-limited'
              ? signOut.error.message
              : signOut.error instanceof AuthApiError && signOut.error.code === 'csrf-expired'
                ? signOut.error.message
                : 'We couldn’t sign you out. Try again.'}
          </p>
        ) : null}
        {worlds.isPending && !isRetrying ? (
          <p className={styles.loading} role="status" aria-live="polite">
            Loading Worlds…
          </p>
        ) : worlds.isError || isRetrying ? (
          <div className={styles.catalogError} role="alert">
            <h2>Worlds could not be loaded. Try again.</h2>
            <p>Lorecraft could not reach the World catalog.</p>
            <button
              className={styles.retryWorlds}
              type="button"
              disabled={isRetrying}
              onClick={() => void retryWorlds()}
            >
              {isRetrying ? 'Trying again…' : 'Try again'}
            </button>
          </div>
        ) : worldList.length > 0 ? (
          <section className={styles.catalog} aria-labelledby="available-worlds-title">
            <h2
              ref={catalogHeadingRef}
              className={styles.sectionTitle}
              id="available-worlds-title"
              tabIndex={-1}
            >
              Available Worlds
            </h2>
            <ul className={styles.worldList}>
              {worldList.map((world) => (
                <li className={styles.worldRow} key={world.id}>
                  <article>
                    <div className={styles.worldHeading}>
                      <h3 className={styles.worldName}>
                        <Link className={styles.worldLink} to={`/worlds/${world.slug}`}>
                          {world.name}
                        </Link>
                      </h3>
                      <div className={styles.worldFlags} aria-label="World access">
                        <span>{world.visibility === 'public' ? 'Public' : 'Private'}</span>
                        {world.readOnly ? <span>Read only</span> : null}
                      </div>
                    </div>
                    <p className={styles.worldDescription}>{world.description}</p>
                    <div className={styles.worldActions}>
                      {world.playability.available ? (
                        <Link
                          className={styles.newAdventure}
                          to={`/worlds/${world.slug}/adventures/new`}
                        >
                          New Adventure
                        </Link>
                      ) : (
                        <span className={styles.unavailableWorld}>{world.playability.reason}</span>
                      )}
                    </div>
                    {world.adventures.length > 0 ? (
                      <div className={styles.adventureList} aria-label={`${world.name} Adventures`}>
                        {world.adventures.map((adventure) => (
                          <article className={styles.adventureRow} key={adventure.id}>
                            <Link
                              className={styles.adventureLink}
                              to={adventure.route}
                              aria-label={`Resume Adventure as ${adventure.playerName}`}
                            >
                              <strong>{adventure.playerName}</strong>
                              <span>{adventureStatusLabels[adventure.status]}</span>
                            </Link>
                            <div className={styles.adventureMeta}>
                              <span>
                                {adventure.turnCount} {adventure.turnCount === 1 ? 'turn' : 'turns'}
                              </span>
                              <time dateTime={adventure.lastPlayedAt}>
                                Last played {formatLastPlayed(adventure.lastPlayedAt)}
                              </time>
                            </div>
                            <button
                              className={styles.deleteAdventure}
                              type="button"
                              aria-label={`Delete Adventure for ${adventure.playerName}`}
                              onClick={() => {
                                setDeleteError(null)
                                setDeleteTarget(adventure)
                              }}
                            >
                              Delete
                            </button>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.noAdventures}>No Adventures started in this World.</p>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className={styles.emptyState} aria-labelledby="empty-worlds-title">
            <p className={styles.emptyLabel}>Nothing to browse</p>
            <h2 className={styles.emptyTitle} id="empty-worlds-title">
              No Worlds available
            </h2>
            <p className={styles.emptyCopy}>There are no Worlds available to this account yet.</p>
          </section>
        )}
      </div>
      {deleteTarget ? (
        <ConfirmDialog
          title={`Delete ${deleteTarget.playerName}'s Adventure?`}
          confirmLabel="Delete Adventure"
          pendingLabel="Deleting Adventure…"
          pending={deleteAdventure.isPending}
          error={deleteError}
          onCancel={() => {
            setDeleteTarget(null)
            setDeleteError(null)
          }}
          onConfirm={() => deleteAdventure.mutate(deleteTarget.id)}
        >
          <p>
            This permanently removes this Adventure and its generated story. The World is unchanged.
          </p>
        </ConfirmDialog>
      ) : null}
    </main>
  )
}
