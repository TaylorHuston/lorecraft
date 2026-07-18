import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('provides an accessible action name and matching title', () => {
    render(
      <IconButton label="Show password">
        <span aria-hidden="true">icon</span>
      </IconButton>
    )

    expect(screen.getByRole('button', { name: 'Show password' })).toHaveAttribute(
      'title',
      'Show password'
    )
  })

  it('prevents activation and announces progress while pending', () => {
    const onClick = vi.fn()

    render(
      <IconButton
        label="Hide password"
        onClick={onClick}
        pending
        pendingLabel="Updating password visibility"
      >
        <span aria-hidden="true">icon</span>
      </IconButton>
    )

    const button = screen.getByRole('button', { name: 'Updating password visibility' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')

    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
