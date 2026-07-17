import { useRef, type ReactNode, type RefObject } from 'react'
import { Button } from '../Button/Button'
import { Dialog } from './Dialog'
import styles from './ConfirmDialog.module.css'

export interface ConfirmDialogProps {
  children: ReactNode
  confirmLabel: string
  error?: string | null
  finalFocusRef?: RefObject<HTMLElement | null>
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  pending?: boolean
  pendingLabel: string
  title: ReactNode
}

export function ConfirmDialog({
  children,
  confirmLabel,
  error,
  finalFocusRef,
  onCancel,
  onConfirm,
  open,
  pending = false,
  pendingLabel,
  title,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <Dialog
      closeDisabled={pending}
      finalFocusRef={finalFocusRef}
      initialFocusRef={cancelRef}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel()
      }}
      open={open}
      description={children}
      title={title}
    >
      {error ? (
        <p aria-atomic="true" className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      {pending ? (
        <p aria-atomic="true" className={styles.status} role="status">
          {pendingLabel}
        </p>
      ) : null}
      <div className={styles.actions}>
        <Button ref={cancelRef} disabled={pending} onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          pending={pending}
          pendingLabel={pendingLabel}
          variant="destructive"
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
