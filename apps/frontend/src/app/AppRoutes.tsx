import { useEffect, useRef } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import { SignInPage } from '../auth/SignInPage'
import { SignUpPage } from '../auth/SignUpPage'
import type { AdventureApi } from '../adventures/adventureApi'
import { NewAdventurePage } from '../adventures/NewAdventurePage'
import { AdventurePage } from '../adventures/AdventurePage'
import { WorkspacePage } from '../workspace/WorkspacePage'
import type { WorldApi } from '../worlds/worldApi'
import { WorldDetailPage } from '../worlds/WorldDetailPage'
import styles from './AppRoutes.module.css'

type FocusSnapshot = {
  element: HTMLElement
  id: string | null
  tagName: string
  name: string | null
  href: string | null
  type: string | null
  ariaLabel: string | null
  text: string
  matchingIndex: number
}

function normalizedText(element: HTMLElement) {
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function hasSameFocusIdentity(element: HTMLElement, snapshot: FocusSnapshot) {
  return (
    element.getAttribute('name') === snapshot.name &&
    element.getAttribute('href') === snapshot.href &&
    element.getAttribute('type') === snapshot.type &&
    element.getAttribute('aria-label') === snapshot.ariaLabel &&
    normalizedText(element) === snapshot.text
  )
}

function captureFocus(element: HTMLElement): FocusSnapshot {
  const tagName = element.tagName.toLowerCase()
  const identity = {
    element,
    id: element.id || null,
    tagName,
    name: element.getAttribute('name'),
    href: element.getAttribute('href'),
    type: element.getAttribute('type'),
    ariaLabel: element.getAttribute('aria-label'),
    text: normalizedText(element),
  }
  const matches = Array.from(document.querySelectorAll<HTMLElement>(tagName)).filter((candidate) =>
    hasSameFocusIdentity(candidate, { ...identity, matchingIndex: 0 })
  )

  return {
    ...identity,
    matchingIndex: Math.max(0, matches.indexOf(element)),
  }
}

function restoreFocus(snapshot: FocusSnapshot | null) {
  if (!snapshot) return
  if (snapshot.element.isConnected) {
    snapshot.element.focus()
    return
  }

  const elementById = snapshot.id ? document.getElementById(snapshot.id) : null
  if (elementById) {
    elementById.focus()
    return
  }

  const matches = Array.from(document.querySelectorAll<HTMLElement>(snapshot.tagName)).filter(
    (candidate) => hasSameFocusIdentity(candidate, snapshot)
  )
  matches[snapshot.matchingIndex]?.focus()
}

export function SessionLoading() {
  return (
    <main className={styles.stateShell}>
      <div
        className={styles.stateContent}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-busy="true"
      >
        <p className={styles.stateLabel}>Lorecraft</p>
        <p className={styles.stateTitle}>Checking your session…</p>
      </div>
    </main>
  )
}

export function SessionError({ focusRetry = false }: { focusRetry?: boolean }) {
  const { retry } = useAuth()
  const retryRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (focusRetry) retryRef.current?.focus()
  }, [focusRetry])

  return (
    <main className={styles.stateShell}>
      <div
        className={styles.stateContent}
        role="alert"
        aria-labelledby="session-error-title"
        aria-atomic="true"
      >
        <p className={styles.stateLabel}>Connection error</p>
        <h1 className={styles.stateTitle} id="session-error-title">
          We couldn't reach Lorecraft
        </h1>
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

export function SessionRefreshError() {
  const { isRevalidating, retry } = useAuth()

  return (
    <div
      className={styles.refreshError}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      aria-busy={isRevalidating}
    >
      <span>We couldn't refresh your session.</span>
      <button
        className={styles.refreshRetry}
        type="button"
        disabled={isRevalidating}
        onClick={retry}
      >
        {isRevalidating ? 'Trying again…' : 'Try again'}
      </button>
    </div>
  )
}

function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()
  const lastFocusedElement = useRef<FocusSnapshot | null>(null)
  const wasRevalidating = useRef(false)

  useEffect(() => {
    if (!auth.account || auth.isRevalidating || auth.error) return

    const rememberFocus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement) {
        lastFocusedElement.current = captureFocus(event.target)
      }
    }

    document.addEventListener('focusin', rememberFocus)
    return () => document.removeEventListener('focusin', rememberFocus)
  }, [auth.account, auth.error, auth.isRevalidating])

  useEffect(() => {
    if (wasRevalidating.current && !auth.isRevalidating && auth.account && !auth.error) {
      restoreFocus(lastFocusedElement.current)
    }

    wasRevalidating.current = auth.isRevalidating
  }, [auth.account, auth.error, auth.isRevalidating])

  if (auth.isLoading || auth.isRevalidating) return <SessionLoading />
  if (auth.error) return <SessionError focusRetry={Boolean(auth.account)} />

  return auth.account ? <Outlet /> : <Navigate to="/sign-in" replace state={{ from: location }} />
}

function PublicOnlyRoute() {
  const auth = useAuth()
  const location = useLocation()

  if (auth.isLoading) return <SessionLoading />
  if (auth.isInitialError) return <SessionError />

  const returnLocation = (
    location.state as {
      from?: { pathname: string; search?: string; hash?: string }
    } | null
  )?.from
  const authenticatedDestination = returnLocation
    ? `${returnLocation.pathname}${returnLocation.search ?? ''}${returnLocation.hash ?? ''}`
    : '/worlds'

  return auth.account ? (
    <Navigate to={authenticatedDestination} replace />
  ) : (
    <>
      {auth.error ? <SessionRefreshError /> : null}
      <Outlet />
    </>
  )
}

function routeTitle(pathname: string) {
  if (pathname === '/sign-in') return 'Sign in | Lorecraft'
  if (pathname === '/sign-up') return 'Create account | Lorecraft'
  if (pathname === '/worlds') return 'Worlds | Lorecraft'
  if (/^\/worlds\/[^/]+\/adventures\/new$/.test(pathname)) return 'Start an Adventure | Lorecraft'
  if (/^\/worlds\/[^/]+$/.test(pathname)) return 'World | Lorecraft'
  if (/^\/adventures\/[^/]+$/.test(pathname)) return 'Adventure | Lorecraft'
  return 'Lorecraft'
}

function RoutePresentation() {
  const location = useLocation()

  useEffect(() => {
    document.title = routeTitle(location.pathname)

    const focusHeading = () => {
      const heading = document.querySelector<HTMLElement>('[data-route-heading]')
      if (!heading) return false
      heading.tabIndex = -1
      heading.focus()
      return true
    }

    if (focusHeading()) return
    const observer = new MutationObserver(() => {
      if (focusHeading()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [location.pathname])

  return null
}

export function AppRoutes({
  worldApi,
  adventureApi,
  adventurePollIntervalMs,
}: {
  worldApi: WorldApi
  adventureApi: AdventureApi
  adventurePollIntervalMs?: number
}) {
  return (
    <>
      <RoutePresentation />
      <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route
          path="/worlds"
          element={<WorkspacePage worldApi={worldApi} adventureApi={adventureApi} />}
        />
        <Route
          path="/worlds/:slug"
          element={<WorldDetailPage worldApi={worldApi} adventureApi={adventureApi} />}
        />
        <Route
          path="/worlds/:slug/adventures/new"
          element={<NewAdventurePage worldApi={worldApi} adventureApi={adventureApi} />}
        />
        <Route
          path="/adventures/:id"
          element={
            <AdventurePage adventureApi={adventureApi} pollIntervalMs={adventurePollIntervalMs} />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/worlds" replace />} />
      </Routes>
    </>
  )
}
