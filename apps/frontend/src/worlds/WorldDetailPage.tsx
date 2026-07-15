import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import { WorldApiError, worldQueryKeys, type WorldApi } from './worldApi'
import styles from './WorldDetailPage.module.css'

function DetailHeader({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerIdentity}>
        <span className={styles.brand}>Lorecraft</span>
        <span className={styles.separator} aria-hidden="true" />
        <Link className={styles.navigationLink} to="/worlds">
          Back to Worlds
        </Link>
      </div>
      {readOnly ? <span className={styles.readOnlyStatus}>Read only</span> : null}
    </header>
  )
}

export function WorldDetailPage({ worldApi }: { worldApi: WorldApi }) {
  const { slug = '' } = useParams()
  const { account, endSession } = useAuth()
  const [isRetrying, setIsRetrying] = useState(false)
  const world = useQuery({
    queryKey: worldQueryKeys.detail(account?.id ?? 0, slug),
    queryFn: () => worldApi.getWorld(slug),
    enabled: account !== null,
  })

  useEffect(() => {
    if (world.error instanceof WorldApiError && world.error.code === 'unauthorized') {
      endSession()
    }
  }, [endSession, world.error])

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
                    <dt>Private knowledge</dt>
                    <dd>{character.privateKnowledge}</dd>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.emptyCollection}>No Characters are recorded for this World.</p>
          )}
        </section>
      </article>
    </main>
  )
}
