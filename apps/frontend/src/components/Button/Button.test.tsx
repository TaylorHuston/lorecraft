import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('prevents repeated activation while an action is pending', () => {
    const onClick = vi.fn()

    render(
      <Button onClick={onClick} pending pendingLabel="Saving World">
        Save World
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Saving World' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')

    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
