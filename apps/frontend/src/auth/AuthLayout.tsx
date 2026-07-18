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
      <section className={styles.content} aria-labelledby="auth-title">
        <header className={styles.header}>
          <p className={styles.brand}>Lorecraft</p>
          <h1 className={styles.title} id="auth-title">
            {title}
          </h1>
          <p className={styles.description}>{description}</p>
        </header>
        {children}
        <div className={styles.footer}>{footer}</div>
      </section>
    </main>
  )
}
