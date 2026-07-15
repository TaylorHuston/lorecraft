import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthApiError } from '../auth/authApi'
import { useAuth } from '../auth/authContext'
import { WorldApiError, worldQueryKeys, type WorldApi } from '../worlds/worldApi'
import styles from './WorkspacePage.module.css'

export function WorkspacePage({ worldApi }: { worldApi: WorldApi }) {
  const { account, api, endSession } = useAuth()
  const navigate = useNavigate()
  const [isRetrying, setIsRetrying] = useState(false)
  const signOut = useMutation({
    mutationFn: () => api.signOut(),
    retry: false,
    onSuccess: () => {
      endSession()
      navigate('/sign-in', { replace: true })
    },
  })
  const worlds = useQuery({
    queryKey: worldQueryKeys.catalog(account?.id ?? 0),
    queryFn: () => worldApi.listWorlds(),
    enabled: account !== null,
  })

  useEffect(() => {
    if (worlds.error instanceof WorldApiError && worlds.error.code === 'unauthorized') {
      endSession()
    }
  }, [endSession, worlds.error])

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
            <h2 className={styles.sectionTitle} id="available-worlds-title">
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
    </main>
  )
}
