import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import { Button } from '../components/Button/Button'
import { Textarea } from '../components/Textarea/Textarea'
import { TextField } from '../components/TextField/TextField'
import { WorldApiError, worldQueryKeys, type WorldApi } from '../worlds/worldApi'
import {
  AdventureApiError,
  type AdventureApi,
  type AdventureField,
  type CreateAdventureInput,
} from './adventureApi'
import styles from './NewAdventurePage.module.css'

type FieldErrors = Partial<Record<AdventureField, string>>

function creationRequestId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function NewAdventurePage({
  worldApi,
  adventureApi,
}: {
  worldApi: WorldApi
  adventureApi: AdventureApi
}) {
  const { slug = '' } = useParams()
  const { account, endSession } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const nameRef = useRef<HTMLInputElement>(null)
  const physicalDescriptionRef = useRef<HTMLTextAreaElement>(null)
  const backstoryRef = useRef<HTMLTextAreaElement>(null)
  const requestIdRef = useRef(creationRequestId())
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const world = useQuery({
    queryKey: worldQueryKeys.detail(account?.id ?? 0, slug),
    queryFn: () => worldApi.getWorld(slug),
    enabled: account !== null,
  })
  const create = useMutation({
    mutationFn: (input: CreateAdventureInput) => adventureApi.createAdventure(slug, input),
    onSuccess: async (adventure) => {
      if (account) {
        await queryClient.invalidateQueries({ queryKey: worldQueryKeys.detail(account.id, slug) })
      }
      navigate(adventure.route, { replace: true })
    },
  })

  useEffect(() => {
    const error = world.error ?? create.error
    if (
      (error instanceof WorldApiError || error instanceof AdventureApiError) &&
      error.code === 'unauthorized'
    ) {
      endSession()
    }
  }, [create.error, endSession, world.error])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (create.isPending) return

    const form = new FormData(event.currentTarget)
    const name = String(form.get('playerName') ?? '').trim()
    const physicalDescription = String(form.get('physicalDescription') ?? '').trim()
    const backstory = String(form.get('backstory') ?? '').trim()

    if (!name) {
      setFieldErrors({ 'player.name': 'Enter a player name.' })
      setFormError(null)
      nameRef.current?.focus()
      return
    }

    setFieldErrors({})
    setFormError(null)
    try {
      await create.mutateAsync({
        creationRequestId: requestIdRef.current,
        player: {
          name,
          ...(physicalDescription ? { physicalDescription } : {}),
          ...(backstory ? { backstory } : {}),
        },
      })
    } catch (error) {
      if (error instanceof AdventureApiError) {
        if (error.code === 'validation') {
          setFieldErrors(error.fieldErrors)
          if (error.fieldErrors['player.name']) nameRef.current?.focus()
          else if (error.fieldErrors['player.physicalDescription']) {
            physicalDescriptionRef.current?.focus()
          } else if (error.fieldErrors['player.backstory']) {
            backstoryRef.current?.focus()
          }
          return
        }
        if (error.code === 'unauthorized') return
        setFormError(
          error.code === 'conflict'
            ? (error.reason ?? error.message)
            : 'Lorecraft could not start this Adventure. Try again.'
        )
        return
      }
      setFormError('Lorecraft could not start this Adventure. Try again.')
    }
  }

  const returnRoute = `/worlds/${slug}`

  if (world.isPending) {
    return (
      <main className={styles.shell} aria-busy="true">
        <p role="status" aria-live="polite">
          Loading Adventure setup…
        </p>
      </main>
    )
  }

  if (world.isError || !world.data) {
    return (
      <main className={styles.shell}>
        <div className={styles.state} role="alert">
          <p className={styles.eyebrow}>Adventure setup</p>
          <h1>World unavailable</h1>
          <p>Lorecraft could not load this World.</p>
          <Link to={returnRoute}>Return to World</Link>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>Lorecraft</span>
        <Link to={returnRoute}>Return to World</Link>
      </header>
      <div className={styles.content}>
        <header className={styles.introduction}>
          <p className={styles.eyebrow}>{world.data.name}</p>
          <h1>Start an Adventure</h1>
          <p>Create the player who will enter this frozen version of the World.</p>
        </header>

        {!world.data.playability.available ? (
          <section className={styles.state} role="alert">
            <h2>This World is not playable yet</h2>
            <p>{world.data.playability.reason}</p>
            <Link to={returnRoute}>Return to World</Link>
          </section>
        ) : (
          <form
            aria-busy={create.isPending}
            className={styles.form}
            onSubmit={(event) => void submit(event)}
            noValidate
          >
            {formError ? (
              <p className={styles.formError} role="alert">
                {formError}
              </p>
            ) : null}
            <TextField
              ref={nameRef}
              error={fieldErrors['player.name']}
              label={
                <>
                  Player name <span>(required)</span>
                </>
              }
              id="player-name"
              name="playerName"
              pending={create.isPending}
              required
              autoComplete="off"
            />
            <Textarea
              ref={physicalDescriptionRef}
              error={fieldErrors['player.physicalDescription']}
              label={
                <>
                  Physical description <span>(optional)</span>
                </>
              }
              id="player-description"
              name="physicalDescription"
              pending={create.isPending}
              rows={4}
            />
            <Textarea
              ref={backstoryRef}
              error={fieldErrors['player.backstory']}
              label={
                <>
                  Backstory <span>(optional)</span>
                </>
              }
              id="player-backstory"
              name="backstory"
              pending={create.isPending}
              rows={5}
            />
            <div className={styles.actions}>
              <Button
                pending={create.isPending}
                pendingLabel="Starting Adventure…"
                size="touch"
                type="submit"
              >
                Start Adventure
              </Button>
              <Link to={returnRoute}>Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
