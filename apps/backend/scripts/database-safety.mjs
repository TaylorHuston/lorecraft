function effectiveSchema(url, variableName) {
  if (url.searchParams.has('search_path') || url.searchParams.has('schema')) {
    throw new Error(
      `${variableName} must use PostgreSQL options=-csearch_path=... for isolated schemas.`
    )
  }

  const optionsValues = url.searchParams.getAll('options')

  if (optionsValues.length > 1) {
    throw new Error(`${variableName} must contain at most one unambiguous search_path option.`)
  }

  const options = optionsValues[0] ?? ''

  if (!/search_path/i.test(options)) {
    return 'public'
  }

  const match = options.match(/^-c(?:\s+)?search_path=([^\s,]+)$/i)

  if (!match) {
    throw new Error(`${variableName} must contain at most one unambiguous search_path option.`)
  }

  const configuredSchema = match[1]

  if (configuredSchema.startsWith('"') && configuredSchema.endsWith('"')) {
    return configuredSchema.slice(1, -1).replace(/""/g, '"')
  }

  return configuredSchema.toLowerCase()
}

function normalizedHost(hostname) {
  const host = hostname.toLowerCase()

  if (['localhost', 'localhost.', '127.0.0.1', '[::1]', '::1'].includes(host)) {
    return 'loopback'
  }

  return host.endsWith('.neon.tech') ? host.replace(/^([^.]+)-pooler\./, '$1.') : host
}

function databaseTarget(value, variableName) {
  let url

  try {
    url = new URL(value)
  } catch {
    throw new Error(`${variableName} must be a valid PostgreSQL URL.`)
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error(`${variableName} must be a PostgreSQL URL.`)
  }

  const identityOverrides = ['host', 'port', 'database', 'dbname']

  if (identityOverrides.some((parameter) => url.searchParams.has(parameter))) {
    throw new Error(`${variableName} must not override database identity through query parameters.`)
  }

  const database = decodeURIComponent(url.pathname.replace(/^\//, ''))

  if (!url.hostname || !database) {
    throw new Error(`${variableName} must explicitly identify its database host and name.`)
  }

  return {
    database,
    host: normalizedHost(url.hostname),
    port: url.port || '5432',
    schema: effectiveSchema(url, variableName),
  }
}

export function databaseChildEnvironment(environment) {
  return {
    ...environment,
    PGDATABASE: '',
    PGHOST: '',
    PGOPTIONS: '',
    PGPORT: '',
  }
}

function databaseIdentity(target) {
  return JSON.stringify(target)
}

export function assertDirectMigrationDatabase({
  acknowledgement,
  applicationDatabaseUrl,
  migrationDatabaseUrl,
  nodeEnvironment,
}) {
  if (nodeEnvironment !== 'production') {
    throw new Error('Production migration tooling requires NODE_ENV=production.')
  }

  if (acknowledgement !== '1') {
    throw new Error('Production migration requires ALLOW_PRODUCTION_DATABASE_MIGRATION=1.')
  }

  if (!applicationDatabaseUrl) {
    throw new Error('DATABASE_URL is required to verify the production migration target.')
  }

  if (!migrationDatabaseUrl) {
    throw new Error('MIGRATION_DATABASE_URL is required for production migrations.')
  }

  const runtimeUrl = new URL(applicationDatabaseUrl)
  const migrationUrl = new URL(migrationDatabaseUrl)

  if (
    runtimeUrl.hostname.toLowerCase().endsWith('.neon.tech') &&
    !/-pooler(?:\.|$)/i.test(runtimeUrl.hostname)
  ) {
    throw new Error('DATABASE_URL must use the pooled Neon endpoint for production runtime traffic.')
  }

  if (/-pooler(?:\.|$)/i.test(migrationUrl.hostname)) {
    throw new Error('MIGRATION_DATABASE_URL must use a direct connection, not a pooled endpoint.')
  }

  const runtimeIdentity = databaseIdentity(databaseTarget(applicationDatabaseUrl, 'DATABASE_URL'))
  const migrationIdentity = databaseIdentity(
    databaseTarget(migrationDatabaseUrl, 'MIGRATION_DATABASE_URL')
  )

  if (runtimeIdentity !== migrationIdentity) {
    throw new Error('MIGRATION_DATABASE_URL must identify the same database target as DATABASE_URL.')
  }
}

const disposableIdentifier =
  /(^|[^a-z0-9])(test|testing|e2e|ci|ephemeral|disposable|preview|temp|tmp)([^a-z0-9]|$)/i

export function assertDisposableDatabase({
  acknowledgement,
  acknowledgementName,
  applicationDatabaseUrl,
  databaseEnvironment = {},
  nodeEnvironment,
  targetDatabaseUrl,
  targetName,
}) {
  if (nodeEnvironment === 'production') {
    throw new Error('Disposable test tooling refuses database writes when NODE_ENV=production.')
  }

  if (acknowledgement !== '1') {
    throw new Error(`Database writes require ${acknowledgementName}=1.`)
  }

  if (!applicationDatabaseUrl) {
    throw new Error('DATABASE_URL is required to verify a separate disposable database target.')
  }

  for (const variableName of ['PGDATABASE', 'PGHOST', 'PGOPTIONS', 'PGPORT']) {
    if (databaseEnvironment[variableName]) {
      throw new Error(
        `${variableName} must be unset because guarded database tooling uses explicit URLs.`
      )
    }
  }

  const target = databaseTarget(targetDatabaseUrl, targetName)
  const targetIdentity = databaseIdentity(target)
  const applicationIdentity = databaseIdentity(
    databaseTarget(applicationDatabaseUrl, 'DATABASE_URL')
  )

  if (targetIdentity === applicationIdentity) {
    throw new Error(`${targetName} must differ from DATABASE_URL.`)
  }

  if (!disposableIdentifier.test(target.database) && !disposableIdentifier.test(target.schema)) {
    throw new Error(
      `${targetName} database name or schema must contain a disposable identifier such as test, e2e, ci, ephemeral, or preview.`
    )
  }
}
