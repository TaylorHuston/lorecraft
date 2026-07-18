import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './TextField.module.css'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: ReactNode
  label: ReactNode
  pending?: boolean
  supportingText?: ReactNode
  trailingAction?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    className,
    disabled = false,
    error,
    id,
    label,
    pending = false,
    supportingText,
    trailingAction,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = supportingText ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy =
    [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div
      className={styles.field}
      data-disabled={disabled || undefined}
      data-pending={pending || undefined}
      data-slot="text-field"
    >
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <div className={styles.control} data-has-action={Boolean(trailingAction) || undefined}>
        <input
          {...props}
          aria-busy={pending || undefined}
          aria-describedby={describedBy}
          aria-invalid={error ? true : ariaInvalid}
          className={[styles.input, className].filter(Boolean).join(' ')}
          data-slot="text-field-input"
          disabled={disabled}
          id={inputId}
          ref={ref}
        />
        {trailingAction ? (
          <span className={styles.trailingAction} data-slot="text-field-trailing-action">
            {trailingAction}
          </span>
        ) : null}
      </div>
      {supportingText ? (
        <span className={styles.description} id={descriptionId}>
          {supportingText}
        </span>
      ) : null}
      {error ? (
        <span aria-atomic="true" className={styles.error} id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
})
