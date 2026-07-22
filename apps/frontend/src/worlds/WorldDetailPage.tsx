import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AdventureApiError,
  type AdventureApi,
  type AdventureSummary,
} from '../adventures/adventureApi'
import { useAuth } from '../auth/authContext'
import { Button } from '../components/Button/Button'
import { ConfirmDialog } from '../components/Dialog/ConfirmDialog'
import { TextField } from '../components/TextField/TextField'
import { Textarea } from '../components/Textarea/Textarea'
import {
  WorldApiError,
  worldQueryKeys,
  type WorldApi,
  type WorldCharacter,
  type WorldCharacterInput,
  type WorldCharacterUpdateInput,
  type WorldDetail,
} from './worldApi'
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

const characterLimits = {
  key: 100,
  name: 100,
  physicalDescription: 320,
  background: 700,
  personality: 320,
  voice: 240,
  privateKnowledge: 700,
  initialMood: 120,
  initialStatus: 320,
  initialMemory: 500,
} as const

type CharacterEditor =
  | { mode: 'create' }
  | { mode: 'edit'; character: WorldCharacter }

function draftFor(character?: WorldCharacter): WorldCharacterInput {
  return {
    key: character?.key ?? '',
    name: character?.name ?? '',
    locationKey: character?.location?.key ?? '',
    physicalDescription: character?.physicalDescription ?? '',
    background: character?.background ?? '',
    personality: character?.personality ?? '',
    voice: character?.voice ?? '',
    privateKnowledge: character?.privateKnowledge ?? '',
    initialMood: character?.initialMood ?? '',
    initialStatus: character?.initialStatus ?? '',
    initialMemory: character?.initialMemory ?? '',
  }
}

function CharacterEditorForm({
  editor,
  locations,
  pending,
  error,
  onCancel,
  onSubmit,
}: {
  editor: CharacterEditor
  locations: WorldDetail['locations']
  pending: boolean
  error: WorldApiError | null
  onCancel: () => void
  onSubmit: (input: WorldCharacterInput | WorldCharacterUpdateInput) => Promise<void>
}) {
  const [draft, setDraft] = useState(() => draftFor(editor.mode === 'edit' ? editor.character : undefined))
  const fieldErrors = error?.code === 'validation' ? error.fieldErrors : {}
  const editing = editor.mode === 'edit'

  function update<Field extends keyof WorldCharacterInput>(field: Field, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const updateInput: WorldCharacterUpdateInput = {
      name: draft.name,
      locationKey: draft.locationKey,
      physicalDescription: draft.physicalDescription,
      background: draft.background,
      personality: draft.personality,
      voice: draft.voice,
      privateKnowledge: draft.privateKnowledge,
      initialMood: draft.initialMood,
      initialStatus: draft.initialStatus,
      initialMemory: draft.initialMemory,
    }
    await onSubmit(editing ? updateInput : draft)
  }

  return (
    <form className={styles.characterEditor} aria-busy={pending || undefined} onSubmit={submit}>
      <div className={styles.characterEditorHeading}>
        <div>
          <p className={styles.eyebrow}>{editing ? 'Edit Character' : 'New Character'}</p>
          <h3>{editing ? `Edit ${editor.character.name}` : 'Add a Character'}</h3>
        </div>
        <p>Every field is required. Concise canon is welcome.</p>
      </div>
      {error && error.code !== 'validation' ? (
        <p className={styles.editorError} role="alert">
          {error.message}
        </p>
      ) : null}
      <div className={styles.characterFields}>
        <TextField
          disabled={editing || pending}
          error={fieldErrors.key}
          label="Key"
          maxLength={characterLimits.key}
          onChange={(event) => update('key', event.target.value)}
          required
          supportingText={editing ? 'Character keys cannot change.' : 'Lowercase letters, numbers, and hyphens.'}
          value={draft.key}
        />
        <TextField
          disabled={pending}
          error={fieldErrors.name}
          label="Name"
          maxLength={characterLimits.name}
          onChange={(event) => update('name', event.target.value)}
          required
          value={draft.name}
        />
        <div className={styles.locationField}>
          <label htmlFor="character-location">Canonical Location</label>
          <select
            aria-describedby={fieldErrors.locationKey ? 'character-location-error' : undefined}
            aria-invalid={Boolean(fieldErrors.locationKey) || undefined}
            disabled={pending}
            id="character-location"
            onChange={(event) => update('locationKey', event.target.value)}
            required
            value={draft.locationKey}
          >
            <option value="">Choose a Location</option>
            {locations.map((location) => (
              <option key={location.key} value={location.key}>
                {location.name}
              </option>
            ))}
          </select>
          {fieldErrors.locationKey ? (
            <span className={styles.editorFieldError} id="character-location-error" role="alert">
              {fieldErrors.locationKey}
            </span>
          ) : null}
        </div>
        <Textarea
          disabled={pending}
          error={fieldErrors.physicalDescription}
          label="Physical description"
          maxLength={characterLimits.physicalDescription}
          onChange={(event) => update('physicalDescription', event.target.value)}
          required
          value={draft.physicalDescription}
        />
        <Textarea
          disabled={pending}
          error={fieldErrors.background}
          label="Background"
          maxLength={characterLimits.background}
          onChange={(event) => update('background', event.target.value)}
          required
          value={draft.background}
        />
        <Textarea
          disabled={pending}
          error={fieldErrors.personality}
          label="Personality"
          maxLength={characterLimits.personality}
          onChange={(event) => update('personality', event.target.value)}
          required
          value={draft.personality}
        />
        <Textarea
          disabled={pending}
          error={fieldErrors.voice}
          label="Voice"
          maxLength={characterLimits.voice}
          onChange={(event) => update('voice', event.target.value)}
          required
          value={draft.voice}
        />
        <Textarea
          disabled={pending}
          error={fieldErrors.privateKnowledge}
          label="Private knowledge"
          maxLength={characterLimits.privateKnowledge}
          onChange={(event) => update('privateKnowledge', event.target.value)}
          required
          value={draft.privateKnowledge}
        />
        <TextField
          disabled={pending}
          error={fieldErrors.initialMood}
          label="Initial mood"
          maxLength={characterLimits.initialMood}
          onChange={(event) => update('initialMood', event.target.value)}
          required
          value={draft.initialMood}
        />
        <Textarea
          disabled={pending}
          error={fieldErrors.initialStatus}
          label="Initial status"
          maxLength={characterLimits.initialStatus}
          onChange={(event) => update('initialStatus', event.target.value)}
          required
          value={draft.initialStatus}
        />
        <Textarea
          disabled={pending}
          error={fieldErrors.initialMemory}
          label="Initial memory"
          maxLength={characterLimits.initialMemory}
          onChange={(event) => update('initialMemory', event.target.value)}
          required
          value={draft.initialMemory}
        />
      </div>
      <div className={styles.characterEditorActions}>
        <Button pending={pending} pendingLabel={editing ? 'Saving Character…' : 'Creating Character…'} size="touch" type="submit">
          {editing ? 'Save Character' : 'Create Character'}
        </Button>
        <Button disabled={pending} onClick={onCancel} size="touch" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
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
  const charactersHeadingRef = useRef<HTMLHeadingElement>(null)
  const [characterEditor, setCharacterEditor] = useState<CharacterEditor | null>(null)
  const [characterDeleteTarget, setCharacterDeleteTarget] = useState<WorldCharacter | null>(null)
  const [characterDeleteError, setCharacterDeleteError] = useState<string | null>(null)
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
  const createCharacter = useMutation({
    mutationFn: (input: WorldCharacterInput) => worldApi.createCharacter(slug, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey })
      setCharacterEditor(null)
      window.setTimeout(() => charactersHeadingRef.current?.focus(), 0)
    },
  })
  const updateCharacter = useMutation({
    mutationFn: ({ key, input }: { key: string; input: WorldCharacterUpdateInput }) =>
      worldApi.updateCharacter(slug, key, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey })
      setCharacterEditor(null)
      window.setTimeout(() => charactersHeadingRef.current?.focus(), 0)
    },
  })
  const deleteCharacter = useMutation({
    mutationFn: (key: string) => worldApi.deleteCharacter(slug, key),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey })
      setCharacterDeleteTarget(null)
      setCharacterDeleteError(null)
      window.setTimeout(() => charactersHeadingRef.current?.focus(), 0)
    },
    onError: (error) => {
      if (!(error instanceof WorldApiError && error.code === 'unauthorized')) {
        setCharacterDeleteError('Lorecraft could not delete this Character. Try again.')
      }
    },
  })

  useEffect(() => {
    const error =
      world.error ??
      deleteAdventure.error ??
      createCharacter.error ??
      updateCharacter.error ??
      deleteCharacter.error
    if (
      (error instanceof WorldApiError || error instanceof AdventureApiError) &&
      error.code === 'unauthorized'
    ) {
      endSession()
    }
  }, [
    createCharacter.error,
    deleteAdventure.error,
    deleteCharacter.error,
    endSession,
    updateCharacter.error,
    world.error,
  ])

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
            <h1 data-route-heading>{missing ? 'World not found' : 'World unavailable'}</h1>
            <p>
              {missing
                ? 'This World does not exist or is not available to this account.'
                : 'Lorecraft could not load this World. Try again.'}
            </p>
          </div>
          <div className={styles.stateActions}>
            {!missing ? (
              <Button
                onClick={() => void retry()}
                pending={isRetrying}
                pendingLabel="Trying again…"
                size="touch"
                variant="secondary"
              >
                Try again
              </Button>
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
  const characterMutation = characterEditor?.mode === 'edit' ? updateCharacter : createCharacter

  async function submitCharacter(input: WorldCharacterInput | WorldCharacterUpdateInput) {
    if (characterEditor?.mode === 'edit') {
      await updateCharacter.mutateAsync({ key: characterEditor.character.key, input })
      return
    }
    await createCharacter.mutateAsync(input as WorldCharacterInput)
  }

  return (
    <main className={styles.shell}>
      <DetailHeader readOnly={worldData.readOnly} />
      <article className={styles.content} aria-labelledby="world-title">
        <header className={styles.worldIdentity}>
          <p className={styles.eyebrow}>{worldData.visibility} World</p>
          <h1 data-route-heading id="world-title">
            {worldData.name}
          </h1>
          <p className={styles.lede}>{worldData.description}</p>
        </header>
        <section aria-labelledby="adventures-title">
          <div className={styles.sectionHeading}>
            <h2 ref={adventuresHeadingRef} id="adventures-title" tabIndex={-1}>
              Adventures
            </h2>
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
                    <Button
                      className={styles.deleteAdventure}
                      aria-label={`Delete Adventure for ${adventure.playerName}`}
                      onClick={() => {
                        setDeleteError(null)
                        setDeleteTarget(adventure)
                      }}
                      size="touch"
                      variant="destructive"
                    >
                      Delete
                    </Button>
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
          <div className={styles.sectionHeading}>
            <h2 ref={charactersHeadingRef} id="characters-title" tabIndex={-1}>
              Characters
            </h2>
            {!worldData.readOnly ? (
              <Button
                onClick={() => {
                  createCharacter.reset()
                  updateCharacter.reset()
                  setCharacterEditor({ mode: 'create' })
                }}
                size="touch"
              >
                Add Character
              </Button>
            ) : null}
          </div>
          <p className={styles.debugDisclosure}>
            Development / debug information: complete Character Cards include private knowledge and
            initial Adventure state.
          </p>
          {characterEditor ? (
            <CharacterEditorForm
              key={characterEditor.mode === 'edit' ? characterEditor.character.key : 'create'}
              editor={characterEditor}
              error={
                characterMutation.error instanceof WorldApiError ? characterMutation.error : null
              }
              locations={worldData.locations}
              onCancel={() => {
                createCharacter.reset()
                updateCharacter.reset()
                setCharacterEditor(null)
              }}
              onSubmit={submitCharacter}
              pending={characterMutation.isPending}
            />
          ) : null}
          {worldData.characters.length > 0 ? (
            <div className={styles.list}>
              {worldData.characters.map((character) => (
                <article className={styles.entry} key={character.key}>
                  <div className={styles.characterHeading}>
                    <h3>{character.name}</h3>
                    <div className={styles.characterActions}>
                      <span>{character.location?.name ?? 'Location unknown'}</span>
                      {!worldData.readOnly ? (
                        <>
                          <Button
                            onClick={() => {
                              createCharacter.reset()
                              updateCharacter.reset()
                              setCharacterEditor({ mode: 'edit', character })
                            }}
                            size="dense"
                            variant="ghost"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => {
                              setCharacterDeleteError(null)
                              setCharacterDeleteTarget(character)
                            }}
                            size="dense"
                            variant="ghost"
                          >
                            Delete
                          </Button>
                        </>
                      ) : null}
                    </div>
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
                    <dt>Initial mood</dt>
                    <dd>{character.initialMood}</dd>
                    <dt>Initial status</dt>
                    <dd>{character.initialStatus}</dd>
                    <dt>Initial memory</dt>
                    <dd>{character.initialMemory}</dd>
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
          open={true}
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
      {characterDeleteTarget ? (
        <ConfirmDialog
          confirmLabel="Delete Character"
          error={characterDeleteError}
          onCancel={() => {
            setCharacterDeleteTarget(null)
            setCharacterDeleteError(null)
          }}
          onConfirm={() => deleteCharacter.mutate(characterDeleteTarget.key)}
          open={true}
          pending={deleteCharacter.isPending}
          pendingLabel="Deleting Character…"
          title={`Delete ${characterDeleteTarget.name}?`}
        >
          <p>
            This removes the Character from current canon and future Adventures. Existing Adventures
            remain unchanged.
          </p>
        </ConfirmDialog>
      ) : null}
    </main>
  )
}
