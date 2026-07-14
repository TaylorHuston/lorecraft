export type DisposableDatabaseOptions = {
  acknowledgement: string | undefined
  acknowledgementName: string
  applicationDatabaseUrl: string | undefined
  databaseEnvironment?: Record<string, string | undefined>
  nodeEnvironment?: string
  targetDatabaseUrl: string | undefined
  targetName: string
}

export function assertDisposableDatabase(options: DisposableDatabaseOptions): void

export function databaseChildEnvironment(
  environment: NodeJS.ProcessEnv
): NodeJS.ProcessEnv & Record<'PGDATABASE' | 'PGHOST' | 'PGOPTIONS' | 'PGPORT', string>
