import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AdventureApiError,
  type AdventureApi,
  type AdventureSummary,
} from '../adventures/adventureApi'
import { ConfirmDialog } from '../adventures/ConfirmDialog'
import { useAuth } from '../auth/authContext'
import { WorldApiError, worldQueryKeys, type WorldApi, type WorldDetail } from './worldApi'
import styles from './WorldDetailPage.module.css'

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

function DetailHeader({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerIdentity}>
        <Link className={styles.navigationLink} to="/worlds">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.8} />
          Back to Worlds
        </Link>
        <span className={styles.separator} aria-hidden="true" />
        <span className={styles.brand}>Lorecraft</span>
      </div>
      {readOnly ? <span className={styles.readOnlyStatus}>Read only</span> : null}
    </header>
  )
}

export function WorldDetailPage({
  worldApi,
  adventureApi,
}: {
  worldApi: WorldApi
  adventureApi: AdventureApi
}) {
  const { slug = '' } = useParams()
  const { account, endSession } = useAuth()
  const [isRetrying, setIsRetrying] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdventureSummary | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const adventuresHeadingRef = useRef<HTMLHeadingElement>(null)
  const queryClient = useQueryClient()
  const queryKey = worldQueryKeys.detail(account?.id ?? 0, slug)
  const world = useQuery({
    queryKey,
    queryFn: () => worldApi.getWorld(slug),
    enabled: account !== null,
  })
  const deleteAdventure = useMutation({
    mutationFn: (adventureId: string) => adventureApi.deleteAdventure(adventureId),
    onSuccess: (_result, adventureId) => {
      queryClient.setQueryData<WorldDetail>(queryKey, (current) =>
        current
          ? {
              ...current,
              adventures: current.adventures.filter((item) => item.id !== adventureId),
            }
          : current
      )
      setDeleteTarget(null)
      setDeleteError(null)
      requestAnimationFrame(() => adventuresHeadingRef.current?.focus())
    },
    onError: (error) => {
      if (!(error instanceof AdventureApiError && error.code === 'unauthorized')) {
        setDeleteError('Lorecraft could not delete this Adventure. Try again.')
      }
    },
  })

  useEffect(() => {
    const error = world.error ?? deleteAdventure.error
    if (
      (error instanceof WorldApiError || error instanceof AdventureApiError) &&
      error.code === 'unauthorized'
    ) {
      endSession()
    }
  }, [deleteAdventure.error, endSession, world.error])

  async function retry() {
    setIsRetrying(true)
    try {
      await world.refetch()
    } finally {
      setIsRetrying(false)
    }
  }

  if (world.isPending && !isRetrying) {
    return (
      <main className={styles.shell} aria-busy="true">
        <DetailHeader />
        <section className={styles.state} role="status" aria-live="polite">
          <p className={styles.eyebrow}>World library</p>
          <h1>Loading World…</h1>
          <p>Lorecraft is retrieving this World’s canon.</p>
        </section>
      </main>
    )
  }

  if (world.isError || isRetrying) {
    const missing = world.error instanceof WorldApiError && world.error.code === 'not-found'

    return (
      <main className={styles.shell} aria-busy={isRetrying || undefined}>
        <DetailHeader />
        <section className={styles.state}>
          <div role="alert">
            <p className={styles.eyebrow}>{missing ? 'Not found' : 'Connection error'}</p>
            <h1>{missing ? 'World not found' : 'World unavailable'}</h1>
            <p>
              {missing
                ? 'This World does not exist or is not available to this account.'
                : 'Lorecraft could not load this World. Try again.'}
            </p>
          </div>
          <div className={styles.stateActions}>
            {!missing ? (
              <button
                className={styles.retry}
                type="button"
                disabled={isRetrying}
                onClick={() => void retry()}
              >
                {isRetrying ? 'Trying again…' : 'Try again'}
              </button>
            ) : null}
          </div>
        </section>
      </main>
    )
  }

  if (!world.data) {
    return (
      <main className={styles.shell} aria-busy="true">
        <DetailHeader />
        <section className={styles.state} role="status" aria-live="polite">
          <p className={styles.eyebrow}>World library</p>
          <h1>Loading World…</h1>
        </section>
      </main>
    )
  }

  const worldData = world.data

  return (
    <main className={styles.shell}>
      <DetailHeader readOnly={worldData.readOnly} />
      <article className={styles.content}>
        <header className={styles.worldIdentity}>
          <p className={styles.eyebrow}>{worldData.visibility} World</p>
          <h1>{worldData.name}</h1>
          <p className={styles.lede}>{worldData.description}</p>
        </header>
        <section aria-labelledby="adventures-title">
          <div className={styles.sectionHeading}>
            <h2 ref={adventuresHeadingRef} id="adventures-title" tabIndex={-1}>Adventures</h2>
            {worldData.playability.available ? (
              <Link className={styles.newAdventure} to={`/worlds/${worldData.slug}/adventures/new`}>
                New Adventure
              </Link>
            ) : null}
          </div>
          {worldData.adventures.length > 0 ? (
            <div className={styles.adventureList}>
              {worldData.adventures.map((adventure) => (
                <article className={styles.adventureRow} key={adventure.id}>
                  <div className={styles.adventureIdentity}>
                    <strong>{adventure.playerName}</strong>
                    <span>{adventureStatusLabels[adventure.status]}</span>
                  </div>
                  <div className={styles.adventureMeta}>
                    <span>
                      {adventure.turnCount} {adventure.turnCount === 1 ? 'turn' : 'turns'}
                    </span>
                    <time dateTime={adventure.lastPlayedAt}>
                      Last played {formatLastPlayed(adventure.lastPlayedAt)}
                    </time>
                  </div>
                  <div className={styles.adventureActions}>
                    <Link
                      className={styles.resumeAdventure}
                      to={adventure.route}
                      aria-label={`Resume Adventure as ${adventure.playerName}`}
                    >
                      Resume
                    </Link>
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
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.emptyCollection}>No Adventures started in this World.</p>
          )}
          {!worldData.playability.available && worldData.playability.reason ? (
            <p className={styles.playabilityNotice}>{worldData.playability.reason}</p>
          ) : null}
        </section>
        <section aria-labelledby="locations-title">
          <h2 id="locations-title">Locations</h2>
          {worldData.locations.length > 0 ? (
            <div className={styles.list}>
              {worldData.locations.map((location) => (
                <article className={styles.entry} key={location.key}>
                  <h3>{location.name}</h3>
                  <p>{location.description}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.emptyCollection}>No Locations are recorded for this World.</p>
          )}
        </section>
        <section aria-labelledby="characters-title">
          <h2 id="characters-title">Characters</h2>
          {worldData.characters.length > 0 ? (
            <div className={styles.list}>
              {worldData.characters.map((character) => (
                <article className={styles.entry} key={character.key}>
                  <div className={styles.characterHeading}>
                    <h3>{character.name}</h3>
                    <span>{character.location?.name ?? 'Location unknown'}</span>
                  </div>
                  <dl>
                    <dt>Physical description</dt>
                    <dd>{character.physicalDescription}</dd>
                    <dt>Background</dt>
                    <dd>{character.background}</dd>
                    <dt>Personality</dt>
                    <dd>{character.personality}</dd>
                    <dt>Voice</dt>
                    <dd>{character.voice}</dd>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.emptyCollection}>No Characters are recorded for this World.</p>
          )}
        </section>
      </article>
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
          <p>This permanently removes this Adventure and its generated story. The World is unchanged.</p>
        </ConfirmDialog>
      ) : null}
    </main>
  )
}
