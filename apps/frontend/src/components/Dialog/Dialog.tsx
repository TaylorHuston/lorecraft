import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import type { ReactNode, RefObject } from 'react'
import { IconButton } from '../IconButton/IconButton'
import styles from './Dialog.module.css'

export interface DialogProps {
  children: ReactNode
  closeDisabled?: boolean
  closeLabel?: string
  description?: ReactNode
  finalFocusRef?: RefObject<HTMLElement | null>
  initialFocusRef?: RefObject<HTMLElement | null>
  onOpenChange: (open: boolean) => void
  open: boolean
  title: ReactNode
}

export function Dialog({
  children,
  closeDisabled = false,
  closeLabel = 'Close dialog',
  description,
  finalFocusRef,
  initialFocusRef,
  onOpenChange,
  open,
  title,
}: DialogProps) {
  return (
    <BaseDialog.Root
      onOpenChange={(nextOpen) => {
        if (nextOpen || !closeDisabled) onOpenChange(nextOpen)
      }}
      open={open}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Viewport className={styles.viewport}>
          <BaseDialog.Popup
            className={styles.popup}
            finalFocus={finalFocusRef}
            initialFocus={initialFocusRef}
          >
            <header className={styles.header}>
              <div className={styles.heading}>
                <BaseDialog.Title className={styles.title}>{title}</BaseDialog.Title>
                {description ? (
                  <BaseDialog.Description className={styles.description} render={<div />}>
                    {description}
                  </BaseDialog.Description>
                ) : null}
              </div>
              <BaseDialog.Close
                disabled={closeDisabled}
                render={
                  <IconButton disabled={closeDisabled} label={closeLabel} size="toolbar">
                    <X aria-hidden="true" size={18} />
                  </IconButton>
                }
              />
            </header>
            <div className={styles.content}>{children}</div>
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
