import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.css'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: ReactNode
  label: ReactNode
  pending?: boolean
  supportingText?: ReactNode
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
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
    ...props
  },
  ref
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const descriptionId = supportingText ? `${textareaId}-description` : undefined
  const errorId = error ? `${textareaId}-error` : undefined
  const describedBy =
    [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={styles.field} data-pending={pending || undefined} data-slot="textarea-field">
      <label className={styles.label} htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        {...props}
        aria-busy={pending || undefined}
        aria-describedby={describedBy}
        aria-invalid={error ? true : ariaInvalid}
        className={[styles.textarea, className].filter(Boolean).join(' ')}
        disabled={disabled}
        id={textareaId}
        ref={ref}
      />
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
