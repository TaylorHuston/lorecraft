import { useEffect, useRef } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import { SignInPage } from '../auth/SignInPage'
import { SignUpPage } from '../auth/SignUpPage'
import { WorkspacePage } from '../workspace/WorkspacePage'
import styles from './AppRoutes.module.css'

function SessionLoading() {
  return (
    <main className={styles.stateShell} aria-busy="true">
      <div className={styles.stateContent} role="status">
        <p className={styles.stateLabel}>Lorecraft</p>
        <p className={styles.stateTitle}>Checking your session...</p>
      </div>
    </main>
  )
}

function SessionError({ focusRetry = false }: { focusRetry?: boolean }) {
  const { retry } = useAuth()
  const retryRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (focusRetry) retryRef.current?.focus()
  }, [focusRetry])

  return (
    <main className={styles.stateShell}>
      <div className={styles.stateContent}>
        <p className={styles.stateLabel}>Connection error</p>
        <h1 className={styles.stateTitle}>We couldn't reach Lorecraft</h1>
        <p className={styles.stateCopy}>
          Your session could not be checked. Try again when the service is available.
        </p>
        <button ref={retryRef} className={styles.retry} type="button" onClick={retry}>
          Try again
        </button>
      </div>
    </main>
  )
}

function SessionRefreshError() {
  const { retry } = useAuth()

  return (
    <aside className={styles.refreshError} role="alert">
      <span>We couldn't refresh your session.</span>
      <button className={styles.refreshRetry} type="button" onClick={retry}>
        Try again
      </button>
    </aside>
  )
}

function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()
  const lastFocusedElementId = useRef<string | null>(null)
  const wasRevalidating = useRef(false)

  useEffect(() => {
    const rememberFocus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && event.target.id) {
        lastFocusedElementId.current = event.target.id
      }
    }

    document.addEventListener('focusin', rememberFocus)
    return () => document.removeEventListener('focusin', rememberFocus)
  }, [])

  useEffect(() => {
    if (wasRevalidating.current && !auth.isRevalidating && auth.account && !auth.error) {
      document.getElementById(lastFocusedElementId.current ?? '')?.focus()
    }

    wasRevalidating.current = auth.isRevalidating
  }, [auth.account, auth.error, auth.isRevalidating])

  if (auth.isLoading || auth.isRevalidating) return <SessionLoading />
  if (auth.error) return <SessionError focusRetry={Boolean(auth.account)} />

  return auth.account ? <Outlet /> : <Navigate to="/sign-in" replace state={{ from: location }} />
}

function PublicOnlyRoute() {
  const auth = useAuth()

  if (auth.isLoading) return <SessionLoading />
  if (auth.isInitialError) return <SessionError />

  return auth.account ? (
    <Navigate to="/worlds" replace />
  ) : (
    <>
      {auth.error ? <SessionRefreshError /> : null}
      <Outlet />
    </>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/worlds" element={<WorkspacePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/worlds" replace />} />
    </Routes>
  )
}
