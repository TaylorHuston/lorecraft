import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { AuthApiError } from '../auth/authApi'
import { sessionQueryKey, useAuth } from '../auth/authContext'
import styles from './WorkspacePage.module.css'

export function WorkspacePage() {
  const { account, api } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const signOut = useMutation({
    mutationFn: () => api.signOut(),
    retry: false,
    onSuccess: () => {
      queryClient.setQueryData(sessionQueryKey, null)
      navigate('/sign-in', { replace: true })
    },
  })

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <span className={styles.brand}>Lorecraft</span>
          <span className={styles.separator} aria-hidden="true" />
          <span className={styles.account} title={account?.email}>
            {account?.email}
          </span>
        </div>
        <button
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
          <p className={styles.eyebrow}>Private workspace</p>
          <h1 className={styles.title}>Your Worlds</h1>
        </div>
        {signOut.isError ? (
          <p className={styles.error} role="alert">
            {signOut.error instanceof AuthApiError && signOut.error.code === 'rate-limited'
              ? signOut.error.message
              : 'We couldn’t sign you out. Try again.'}
          </p>
        ) : null}
        <section className={styles.emptyState} aria-labelledby="empty-worlds-title">
          <p className={styles.emptyLabel}>Workspace is empty</p>
          <h2 className={styles.emptyTitle} id="empty-worlds-title">
            No Worlds yet
          </h2>
          <p className={styles.emptyCopy}>You don't have any Worlds yet.</p>
        </section>
      </div>
    </main>
  )
}
