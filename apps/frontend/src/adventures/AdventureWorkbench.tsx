import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button/Button'
import type { AdventureDetail } from './adventureApi'
import styles from './AdventureWorkbench.module.css'

export type AdventureView = AdventureDetail

type AdventurePane = 'story' | 'player' | 'scene'

const paneOrder: AdventurePane[] = ['story', 'player', 'scene']
const paneLabels: Record<AdventurePane, string> = {
  story: 'Story',
  player: 'Player',
  scene: 'Scene',
}

function PanelHeading({ eyebrow, id, title }: { eyebrow: string; id: string; title: string }) {
  return (
    <header className={styles.panelHeading}>
      <p>{eyebrow}</p>
      <h2 id={id}>{title}</h2>
    </header>
  )
}

function PlayerRegion({ adventure }: { adventure: AdventureView }) {
  const { player } = adventure

  return (
    <section className={styles.sideRegion} aria-label="Player">
      <PanelHeading eyebrow="Player" id="adventure-player-heading" title={player.name} />
      <dl className={styles.details}>
        <div>
          <dt>Current location</dt>
          <dd>{player.currentLocation.name}</dd>
        </div>
        {player.physicalDescription ? (
          <div>
            <dt>Physical description</dt>
            <dd>{player.physicalDescription}</dd>
          </div>
        ) : null}
        {player.backstory ? (
          <div>
            <dt>Backstory</dt>
            <dd>{player.backstory}</dd>
          </div>
        ) : null}
        {player.status ? (
          <div>
            <dt>Current status</dt>
            <dd>{player.status}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}

function StoryRegion({
  adventure,
  onRetry,
  retrying,
  retryError,
}: {
  adventure: AdventureView
  onRetry?: () => void
  retrying: boolean
  retryError?: string | null
}) {
  const openingInProgress =
    adventure.status === 'opening_pending' || adventure.status === 'opening_processing'
  const regionRef = useRef<HTMLElement>(null)

  function retryOpening() {
    onRetry?.()
    regionRef.current?.focus()
  }

  return (
    <section
      ref={regionRef}
      className={styles.storyRegion}
      aria-labelledby="adventure-story-heading"
      tabIndex={-1}
    >
      <PanelHeading eyebrow="Chronicle" id="adventure-story-heading" title="Story" />
      <div className={styles.storyContent}>
        {openingInProgress ? (
          <div className={styles.storyState} role="status" aria-live="polite" aria-atomic="true">
            <p className={styles.stateEyebrow}>Game Master</p>
            <h3>Preparing your opening</h3>
            <p>
              Your Adventure is safe. You can leave this page and return while the story begins.
            </p>
          </div>
        ) : null}
        {adventure.status === 'opening_failed' ? (
          <div className={`${styles.storyState} ${styles.failureState}`} role="alert">
            <p className={styles.stateEyebrow}>Opening interrupted</p>
            <h3>Lorecraft couldn't prepare your opening</h3>
            <p>No partial story was saved. Try again when you're ready.</p>
            {retryError ? <p className={styles.retryError}>{retryError}</p> : null}
            <div className={styles.stateActions}>
              <Button
                onClick={retryOpening}
                pending={retrying}
                pendingLabel="Trying again…"
                size="touch"
              >
                Try again
              </Button>
              <Link to={adventure.sourceWorld.route}>Return to World</Link>
            </div>
          </div>
        ) : null}
        {adventure.story.map((entry) => (
          <article className={styles.storyEntry} key={entry.id}>
            {entry.content.split(/\n\n+/).map((paragraph, index) => (
              <p key={`${entry.id}-${index}`}>{paragraph}</p>
            ))}
          </article>
        ))}
      </div>
    </section>
  )
}

function SceneRegion({ adventure }: { adventure: AdventureView }) {
  const { scene } = adventure

  return (
    <section className={styles.sideRegion} aria-label="Scene">
      <PanelHeading eyebrow="Scene" id="adventure-scene-heading" title={scene.location.name} />
      <p className={styles.sceneDescription}>{scene.location.description}</p>
      <section className={styles.sceneNpcs} aria-labelledby="adventure-npcs-heading">
        <h3 id="adventure-npcs-heading">People here</h3>
        {scene.npcs.length > 0 ? (
          <ul>
            {scene.npcs.map((npc) => (
              <li key={npc.key}>
                <h4>{npc.name}</h4>
                <p>{npc.physicalDescription}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No one else is visible here.</p>
        )}
      </section>
    </section>
  )
}

export function AdventureWorkbench({
  adventure,
  onRetry,
  retrying = false,
  retryError = null,
  layout = 'auto',
}: {
  adventure: AdventureView
  onRetry?: () => void
  retrying?: boolean
  retryError?: string | null
  layout?: 'auto' | 'desktop' | 'mobile'
}) {
  const [narrowViewport, setNarrowViewport] = useState(
    () => window.matchMedia?.('(max-width: 60rem)').matches ?? false
  )
  const [activePane, setActivePane] = useState<AdventurePane>('story')

  useEffect(() => {
    if (layout !== 'auto' || !window.matchMedia) return
    const media = window.matchMedia('(max-width: 60rem)')
    const update = () => setNarrowViewport(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [layout])

  const mobile = layout === 'mobile' || (layout === 'auto' && narrowViewport)

  function paneFor(pane: AdventurePane) {
    if (pane === 'player') return <PlayerRegion adventure={adventure} />
    if (pane === 'scene') return <SceneRegion adventure={adventure} />
    return (
      <StoryRegion
        adventure={adventure}
        onRetry={onRetry}
        retrying={retrying}
        retryError={retryError}
      />
    )
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, pane: AdventurePane) {
    const currentIndex = paneOrder.indexOf(pane)
    let nextIndex: number | undefined

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % paneOrder.length
    if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + paneOrder.length) % paneOrder.length
    }
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = paneOrder.length - 1
    if (nextIndex === undefined) return

    event.preventDefault()
    const nextPane = paneOrder[nextIndex]
    setActivePane(nextPane)
    document.getElementById(`adventure-tab-${nextPane}`)?.focus()
  }

  if (mobile) {
    return (
      <div className={styles.mobileWorkbench}>
        <nav className={styles.mobileTabs} role="tablist" aria-label="Adventure views">
          {paneOrder.map((pane) => (
            <Button
              key={pane}
              id={`adventure-tab-${pane}`}
              role="tab"
              aria-controls={`adventure-panel-${pane}`}
              aria-selected={activePane === pane}
              tabIndex={activePane === pane ? 0 : -1}
              onClick={() => setActivePane(pane)}
              onKeyDown={(event) => handleTabKey(event, pane)}
              size="touch"
              variant="ghost"
            >
              {paneLabels[pane]}
            </Button>
          ))}
        </nav>
        <div
          className={styles.mobilePanel}
          id={`adventure-panel-${activePane}`}
          role="tabpanel"
          aria-labelledby={`adventure-tab-${activePane}`}
          tabIndex={0}
        >
          {paneFor(activePane)}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.desktopGrid}>
      <PlayerRegion adventure={adventure} />
      <StoryRegion
        adventure={adventure}
        onRetry={onRetry}
        retrying={retrying}
        retryError={retryError}
      />
      <SceneRegion adventure={adventure} />
    </div>
  )
}
