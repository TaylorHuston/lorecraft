import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import type { WorldApi } from './worldApi'
import { WorldApiError } from './worldApi'
import styles from './WorldDetailPage.module.css'

export function WorldDetailPage({ worldApi }: { worldApi: WorldApi }) {
  const { slug = '' } = useParams()
  const world = useQuery({ queryKey: ['world', slug], queryFn: () => worldApi.getWorld(slug) })

  if (world.isPending)
    return (
      <main className={styles.state} role="status">
        Loading World…
      </main>
    )
  if (world.isError) {
    const missing = world.error instanceof WorldApiError && world.error.code === 'not-found'
    return (
      <main className={styles.state}>
        <p className={styles.eyebrow}>{missing ? 'Not found' : 'Connection error'}</p>
        <h1>{missing ? 'World not found' : 'World unavailable'}</h1>
        <p>
          {missing
            ? 'This World does not exist or is not available to this account.'
            : 'Lorecraft could not load this World. Try again.'}
        </p>
        <Link to="/worlds">Back to Worlds</Link>
      </main>
    )
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link to="/worlds">Back to Worlds</Link>
        <span>Read only</span>
      </header>
      <article className={styles.content}>
        <p className={styles.eyebrow}>{world.data.visibility} World</p>
        <h1>{world.data.name}</h1>
        <p className={styles.lede}>{world.data.description}</p>
        <section aria-labelledby="locations-title">
          <h2 id="locations-title">Locations</h2>
          <div className={styles.list}>
            {world.data.locations.map((location) => (
              <article className={styles.entry} key={location.key}>
                <h3>{location.name}</h3>
                <p>{location.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section aria-labelledby="characters-title">
          <h2 id="characters-title">Characters</h2>
          <div className={styles.list}>
            {world.data.characters.map((character) => (
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
        </section>
      </article>
    </main>
  )
}
