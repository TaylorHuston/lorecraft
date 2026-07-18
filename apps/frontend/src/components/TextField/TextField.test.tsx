import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Eye } from 'lucide-react'
import { createRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { IconButton } from '../IconButton/IconButton'
import { TextField } from './TextField'

describe('TextField', () => {
  it('keeps the field value, focus, purpose, and descriptions when a trailing action changes presentation', async () => {
    const user = userEvent.setup()
    const inputRef = createRef<HTMLInputElement>()

    function PasswordField() {
      const [visible, setVisible] = useState(false)
      return (
        <TextField
          ref={inputRef}
          autoComplete="current-password"
          error="Check this password."
          label="Password"
          type={visible ? 'text' : 'password'}
          defaultValue="correct horse"
          trailingAction={
            <IconButton
              label={visible ? 'Hide password' : 'Show password'}
              onClick={() => setVisible(!visible)}
            >
              <Eye aria-hidden="true" size={18} />
            </IconButton>
          }
        />
      )
    }

    render(<PasswordField />)
    const field = screen.getByLabelText('Password')
    field.focus()
    expect(field).toHaveFocus()
    expect(field).toHaveAttribute('type', 'password')
    expect(field).toHaveAttribute('autocomplete', 'current-password')
    expect(field).toHaveAccessibleDescription('Check this password.')

    await user.click(screen.getByRole('button', { name: 'Show password' }))

    expect(field).toHaveValue('correct horse')
    expect(field).toHaveAttribute('type', 'text')
    expect(field).toHaveAttribute('autocomplete', 'current-password')
    expect(field).toHaveAccessibleDescription('Check this password.')
    expect(inputRef.current).toBe(field)
  })
})
