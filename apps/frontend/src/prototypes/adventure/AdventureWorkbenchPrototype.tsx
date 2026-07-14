import { useState } from 'react'
import styles from './AdventureWorkbenchPrototype.module.css'

export type AdventurePane = 'story' | 'player' | 'scene'
export type ComposerMode = 'act' | 'story' | 'guide'

type AdventureWorkbenchPrototypeProps = {
  layout?: 'desktop' | 'mobile'
  initialPane?: AdventurePane
  initialMode?: ComposerMode
  generating?: boolean
}

const paneLabels: Record<AdventurePane, string> = {
  story: 'Story',
  player: 'Player',
  scene: 'Scene',
}

const modeLabels: Record<ComposerMode, string> = {
  act: 'Act',
  story: 'Story',
  guide: 'Guide',
}

function Header() {
  return (
    <header className={styles.header}>
      <div>
        <strong className={styles.brand}>Lorecraft</strong>
        <span className={styles.session}>Stormbound Chapel</span>
      </div>
      <button className={styles.quietButton} type="button" aria-label="Open Adventure menu">
        Menu
      </button>
    </header>
  )
}

function PanelHeading({ eyebrow, id, title }: { eyebrow: string; id: string; title: string }) {
  return (
    <div className={styles.panelHeading}>
      <p>{eyebrow}</p>
      <h2 id={id}>{title}</h2>
    </div>
  )
}

function PlayerPane() {
  return (
    <section className={styles.sidePane} aria-labelledby="player-heading">
      <PanelHeading eyebrow="Player identity" id="player-heading" title="Elara Vance" />
      <div className={styles.identityMark} aria-hidden="true">
        EV
      </div>
      <p className={styles.role}>Wandering scholar</p>

      <dl className={styles.details}>
        <div>
          <dt>Current location</dt>
          <dd>Stormbound Chapel</dd>
        </div>
        <div>
          <dt>Appearance</dt>
          <dd>
            A slight figure in a salt-stained cloak, dark hair pinned away from watchful eyes.
          </dd>
        </div>
        <div>
          <dt>Background</dt>
          <dd>An academy archivist following the trail of a forbidden leyline map.</dd>
        </div>
        <div>
          <dt>Current status</dt>
          <dd>Cold and rain-soaked, but steady after reaching shelter.</dd>
        </div>
      </dl>

      <nav className={styles.secondaryActions} aria-label="Player resources">
        <button type="button">Return to Worlds</button>
        <button type="button">Journal / Transcript</button>
      </nav>
    </section>
  )
}

function ScenePane() {
  return (
    <section className={styles.sidePane} aria-labelledby="scene-heading">
      <PanelHeading eyebrow="Current location" id="scene-heading" title="Stormbound Chapel" />
      <p className={styles.bodyCopy}>
        A ruined sanctuary perched above the coast. Wind threads through shattered windows while
        rainwater gathers beneath a cracked obsidian altar.
      </p>

      <div className={styles.contextSection}>
        <h3>Known exits</h3>
        <ul className={styles.linkList}>
          <li>
            <button type="button">Nave doors to Weeping Coast</button>
          </li>
          <li>
            <button type="button">Crumbling stairwell to catacombs</button>
          </li>
        </ul>
      </div>

      <div className={styles.contextSection}>
        <h3>Visible NPC</h3>
        <article className={styles.npcProfile}>
          <div className={styles.npcHeading}>
            <span className={styles.npcMark} aria-hidden="true">
              M
            </span>
            <div>
              <h4>Mira the Restless</h4>
              <p>Stormcaller acolyte</p>
            </div>
          </div>
          <dl className={styles.compactDetails}>
            <div>
              <dt>Description</dt>
              <dd>A spectral figure with a dying candle, garments moving in an unseen wind.</dd>
            </div>
            <div>
              <dt>Personality</dt>
              <dd>Careful, observant, fiercely protective of the altar.</dd>
            </div>
            <div>
              <dt>Current status</dt>
              <dd>Watching Elara from beside the cracked altar.</dd>
            </div>
            <div>
              <dt>Durable memory</dt>
              <dd>Elara placed a chalk warning beside the nave doors.</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  )
}

function Composer({
  mode,
  onModeChange,
  generating,
}: {
  mode: ComposerMode
  onModeChange: (mode: ComposerMode) => void
  generating: boolean
}) {
  const placeholders: Record<ComposerMode, string> = {
    act: 'Describe what Elara does...',
    story: 'Add accepted scene prose...',
    guide: 'Privately steer the Game Master...',
  }

  return (
    <form className={styles.composer} onSubmit={(event) => event.preventDefault()}>
      <div className={styles.modeRow} aria-label="Narrative input mode">
        {Object.entries(modeLabels).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => onModeChange(value as ComposerMode)}
          >
            {label}
          </button>
        ))}
        <button type="button" className={styles.passButton}>
          Pass
        </button>
      </div>
      <div className={styles.inputRow}>
        <label className={styles.visuallyHidden} htmlFor="adventure-composer">
          {placeholders[mode]}
        </label>
        <textarea
          id="adventure-composer"
          rows={2}
          placeholder={placeholders[mode]}
          disabled={generating}
        />
        <button type="submit" disabled={generating}>
          {generating ? 'Working' : 'Send'}
        </button>
      </div>
    </form>
  )
}

function StoryPane({
  mode,
  onModeChange,
  generating,
}: {
  mode: ComposerMode
  onModeChange: (mode: ComposerMode) => void
  generating: boolean
}) {
  return (
    <section className={styles.storyPane} aria-labelledby="chronicle-heading">
      <div className={styles.storyHeader}>
        <div>
          <p>Chronicle stream</p>
          <h2 id="chronicle-heading">The long storm</h2>
        </div>
        <span role="status">{generating ? 'Game Master writing' : 'Saved'}</span>
      </div>

      <div className={styles.storyScroll} tabIndex={0} aria-label="Chronicle entries">
        <article className={styles.narration}>
          <p>
            You push open the heavy oak doors of the Stormbound Chapel. The hinges scream in
            protest, a sound quickly swallowed by the roaring wind outside.
          </p>
          <p>
            Rain lashes across the cracked stone floor, pooling around the shattered remnants of
            wooden pews. At the far end, the cracked obsidian altar pulses with a weak, erratic
            purple light.
          </p>
        </article>

        <aside className={styles.observation} aria-label="Director observation">
          <strong>Director observation</strong>
          <p>
            The storm outside is intensifying based on earlier choices, but the ambient noise makes
            subtle checks harder.
          </p>
        </aside>

        <article className={styles.narration}>
          <p>
            A figure shifts in the shadows near the altar. It is Mira. Her spectral form flickers
            like a dying candle, garments whipping in an unseen wind.
          </p>
          <p>
            “The tides turn, traveler,” she murmurs. “Have you brought the calm, or are you just
            another bolt of lightning in the dark?”
          </p>
        </article>

        <blockquote className={styles.playerStory}>
          Elara lowers her hood and raises an empty hand. “I came to listen.”
        </blockquote>
      </div>

      <Composer mode={mode} onModeChange={onModeChange} generating={generating} />
    </section>
  )
}

function MobileTabs({
  activePane,
  onChange,
}: {
  activePane: AdventurePane
  onChange: (pane: AdventurePane) => void
}) {
  return (
    <nav className={styles.mobileTabs} aria-label="Adventure views">
      {Object.entries(paneLabels).map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-current={activePane === value ? 'page' : undefined}
          onClick={() => onChange(value as AdventurePane)}
        >
          {label}
          {value === 'scene' && activePane !== 'scene' ? (
            <span className={styles.changeDot} aria-label="Scene updated" />
          ) : null}
        </button>
      ))}
    </nav>
  )
}

export function AdventureWorkbenchPrototype({
  layout = 'desktop',
  initialPane = 'story',
  initialMode = 'act',
  generating = false,
}: AdventureWorkbenchPrototypeProps) {
  const [activePane, setActivePane] = useState<AdventurePane>(initialPane)
  const [mode, setMode] = useState<ComposerMode>(initialMode)

  if (layout === 'mobile') {
    return (
      <div className={styles.mobileStage}>
        <div className={styles.mobileFrame}>
          <Header />
          <main className={styles.mobileContent}>
            {activePane === 'story' ? (
              <StoryPane mode={mode} onModeChange={setMode} generating={generating} />
            ) : null}
            {activePane === 'player' ? <PlayerPane /> : null}
            {activePane === 'scene' ? <ScenePane /> : null}
          </main>
          <MobileTabs activePane={activePane} onChange={setActivePane} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.desktopShell}>
      <Header />
      <main className={styles.desktopGrid}>
        <PlayerPane />
        <StoryPane mode={mode} onModeChange={setMode} generating={generating} />
        <ScenePane />
      </main>
    </div>
  )
}
