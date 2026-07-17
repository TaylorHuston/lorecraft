import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useState, type ComponentProps } from 'react'
import { IconButton } from '../components/IconButton/IconButton'
import { TextField } from '../components/TextField/TextField'

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, 'type' | 'trailingAction'>

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ label, pending = false, ...props }, ref) {
    const [visible, setVisible] = useState(false)
    const actionLabel = `${visible ? 'Hide' : 'Show'} ${String(label)}`

    return (
      <TextField
        {...props}
        ref={ref}
        label={label}
        pending={pending}
        type={visible ? 'text' : 'password'}
        trailingAction={
          <IconButton
            disabled={pending}
            label={actionLabel}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </IconButton>
        }
      />
    )
  }
)
