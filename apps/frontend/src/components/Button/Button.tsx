import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'dense' | 'standard' | 'touch'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Replaces the button label and prevents activation while true. */
  pending?: boolean
  /** Status label announced as the button's accessible name while pending. */
  pendingLabel?: ReactNode
  size?: ButtonSize
  variant?: ButtonVariant
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled = false,
    pending = false,
    pendingLabel = 'Working…',
    size = 'standard',
    type = 'button',
    variant = 'primary',
    ...props
  },
  ref
) {
  const isDisabled = disabled || pending
  const classes = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...props}
      aria-busy={pending || undefined}
      className={classes}
      data-disabled={isDisabled || undefined}
      data-pending={pending || undefined}
      data-slot="button"
      data-variant={variant}
      disabled={isDisabled}
      ref={ref}
      type={type}
    >
      {pending ? pendingLabel : children}
    </button>
  )
})
