import type { ReactNode } from 'react'
import styles from './AuthLayout.module.css'

export type AuthLayoutProps = {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <main className={styles.shell}>
      <aside className={styles.context} aria-label="About Lorecraft">
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            LC
          </span>
          <span>Lorecraft</span>
        </div>
        <div>
          <p className={styles.contextCopy}>A private workspace for coherent Worlds.</p>
          <p className={styles.contextLabel}>Account access</p>
        </div>
      </aside>
      <section className={styles.content} aria-labelledby="auth-title">
        <p className={styles.eyebrow}>Lorecraft account</p>
        <h1 className={styles.title} id="auth-title">
          {title}
        </h1>
        <p className={styles.description}>{description}</p>
        {children}
        <div className={styles.footer}>{footer}</div>
      </section>
    </main>
  )
}
