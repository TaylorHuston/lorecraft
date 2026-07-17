import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../Button/Button'
import { ConfirmDialog } from './ConfirmDialog'
import { Dialog } from './Dialog'

describe('Dialog', () => {
  it('moves focus inside, contains keyboard focus, closes on Escape, and restores focus', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [open, setOpen] = useState(false)
      const firstActionRef = useRef<HTMLButtonElement>(null)
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open settings</Button>
          <Dialog
            initialFocusRef={firstActionRef}
            onOpenChange={setOpen}
            open={open}
            title="Adventure settings"
          >
            <Button ref={firstActionRef} variant="secondary">
              First action
            </Button>
            <Button>Last action</Button>
          </Dialog>
        </>
      )
    }

    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Open settings' })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Adventure settings' })
    expect(within(dialog).getByRole('button', { name: 'First action' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('keeps a destructive confirmation open and inert while pending, with announced failure', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        confirmLabel="Delete Adventure"
        error="Lorecraft could not delete this Adventure."
        onCancel={onCancel}
        onConfirm={onConfirm}
        open
        pending
        pendingLabel="Deleting Adventure…"
        title="Delete Adventure?"
      >
        This cannot be undone.
      </ConfirmDialog>
    )

    const dialog = screen.getByRole('dialog', { name: 'Delete Adventure?' })
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'Lorecraft could not delete this Adventure.'
    )
    expect(within(dialog).getByRole('button', { name: 'Deleting Adventure…' })).toBeDisabled()
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled()

    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog', { name: 'Delete Adventure?' })).toBeVisible()
    expect(onCancel).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
