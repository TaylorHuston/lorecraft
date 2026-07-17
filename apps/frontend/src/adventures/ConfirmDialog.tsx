import { useRef, type ReactNode } from 'react'
import { ModalDialog } from './ModalDialog'
import styles from './ConfirmDialog.module.css'

export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  pendingLabel,
  pending = false,
  error,
  onConfirm,
  onCancel,
}: {
  title: string
  children: ReactNode
  confirmLabel: string
  pendingLabel: string
  pending?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <ModalDialog
      title={title}
      onClose={onCancel}
      closeDisabled={pending}
      initialFocusRef={cancelRef}
      describedBy="confirmation-dialog-description"
    >
      <div id="confirmation-dialog-description" className={styles.description}>
        {children}
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <div className={styles.actions}>
        <button ref={cancelRef} type="button" disabled={pending} onClick={onCancel}>
          Cancel
        </button>
        <button
          className={styles.danger}
          type="button"
          disabled={pending}
          onClick={onConfirm}
        >
          {pending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </ModalDialog>
  )
}
