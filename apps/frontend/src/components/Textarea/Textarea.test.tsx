import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('associates its label, supporting text, and error with the control', () => {
    render(
      <Textarea
        label="Player background"
        supportingText="Optional context for the Game Master."
        error="Keep the background under 2,000 characters."
      />
    )

    const field = screen.getByLabelText('Player background')
    expect(field).toHaveAccessibleDescription(
      'Optional context for the Game Master. Keep the background under 2,000 characters.'
    )
    expect(field).toHaveAttribute('aria-invalid', 'true')
  })
})
