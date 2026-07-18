import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import styles from './IconButton.module.css'

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> {
  children: ReactNode
  label: string
  pending?: boolean
  pendingLabel?: string
  size?: 'toolbar' | 'touch'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    children,
    className,
    disabled = false,
    label,
    pending = false,
    pendingLabel = 'Working…',
    size = 'touch',
    title,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || pending
  const accessibleLabel = pending ? pendingLabel : label
  const classes = [styles.button, styles[size], className].filter(Boolean).join(' ')

  return (
    <button
      {...props}
      aria-busy={pending || undefined}
      aria-label={accessibleLabel}
      className={classes}
      data-disabled={isDisabled || undefined}
      data-pending={pending || undefined}
      data-slot="icon-button"
      disabled={isDisabled}
      ref={ref}
      title={title ?? accessibleLabel}
      type={type}
    >
      {children}
    </button>
  )
})
