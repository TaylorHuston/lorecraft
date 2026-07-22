import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { renderTestApp } from '../test/renderTestApp'

it('LC-001/S3/R3-S1 sets the title and focuses the destination heading', async () => {
  renderTestApp({ route: '/sign-in', session: null })

  const heading = await screen.findByRole('heading', { name: 'Sign in to Lorecraft' })
  await waitFor(() => expect(heading).toHaveFocus())
  expect(document.title).toBe('Sign in | Lorecraft')
})

it('LC-001/S3/R3-S1 follows link navigation without reacting to background rendering', async () => {
  const user = userEvent.setup()
  renderTestApp({ route: '/sign-in', session: null })

  await user.click(await screen.findByRole('link', { name: 'Create an account' }))
  const heading = await screen.findByRole('heading', { name: 'Create your Lorecraft account' })
  await waitFor(() => expect(heading).toHaveFocus())
  expect(document.title).toBe('Create account | Lorecraft')

  const email = screen.getByLabelText('Email')
  email.focus()
  await Promise.resolve()
  expect(email).toHaveFocus()
})

it('LC-001/S3/R3-S1 applies after an authenticated redirect', async () => {
  renderTestApp({ route: '/sign-in', session: { id: 4, email: 'member@example.com' } })

  const heading = await screen.findByRole('heading', { name: 'Worlds' })
  await waitFor(() => expect(heading).toHaveFocus())
  expect(document.title).toBe('Worlds | Lorecraft')
})

it('LC-001/S3/R3-S2 preserves focus chosen while a destination is loading', async () => {
  const user = userEvent.setup()
  let resolveWorlds: (worlds: []) => void = () => undefined
  const worlds = new Promise<[]>((resolve) => {
    resolveWorlds = resolve
  })
  renderTestApp({
    route: '/worlds',
    session: { id: 4, email: 'member@example.com' },
    worldApi: { listWorlds: async () => worlds },
  })

  const focusedControl = document.createElement('button')
  focusedControl.textContent = 'Keep focus here'
  document.body.append(focusedControl)
  await user.click(focusedControl)
  resolveWorlds([])

  await screen.findByRole('heading', { name: 'Worlds' })
  await waitFor(() => expect(focusedControl).toHaveFocus())
  focusedControl.remove()
})
