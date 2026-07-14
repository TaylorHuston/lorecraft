import assert from 'node:assert/strict'
import test from 'node:test'
import { assertDisposableDatabase, databaseChildEnvironment } from './database-safety.mjs'

test('rejects acknowledged database writes in a production runtime', () => {
  assert.throws(
    () =>
      assertDisposableDatabase({
        acknowledgement: '1',
        acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
        applicationDatabaseUrl: 'postgresql://app:secret@localhost:5432/lorecraft',
        nodeEnvironment: 'production',
        targetDatabaseUrl: 'postgresql://test:secret@localhost:5432/lorecraft_test',
        targetName: 'TEST_DATABASE_URL',
      }),
    /refuses database writes when NODE_ENV=production/
  )
})

test('rejects a disposable database target without explicit acknowledgement', () => {
  assert.throws(
    () =>
      assertDisposableDatabase({
        acknowledgement: undefined,
        acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
        applicationDatabaseUrl: 'postgresql://app:secret@localhost:5432/lorecraft',
        targetDatabaseUrl: 'postgresql://test:secret@localhost:5432/lorecraft_test',
        targetName: 'TEST_DATABASE_URL',
      }),
    /ALLOW_TEST_DATABASE_WRITES=1/
  )
})

test('rejects a target when the application database is unavailable for comparison', () => {
  assert.throws(
    () =>
      assertDisposableDatabase({
        acknowledgement: '1',
        acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
        applicationDatabaseUrl: undefined,
        targetDatabaseUrl: 'postgresql://test:secret@localhost:5432/lorecraft_test',
        targetName: 'TEST_DATABASE_URL',
      }),
    /DATABASE_URL is required to verify a separate disposable database target/
  )
})

test('rejects the normal application database even when credentials and connection options differ', () => {
  assert.throws(
    () =>
      assertDisposableDatabase({
        acknowledgement: '1',
        acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
        applicationDatabaseUrl:
          'postgresql://app:application-secret@db.example.com:5432/lorecraft_test?sslmode=require',
        targetDatabaseUrl:
          'postgres://runner:target-secret@db.example.com/lorecraft_test?sslmode=verify-full',
        targetName: 'TEST_DATABASE_URL',
      }),
    (error) => {
      assert.match(error.message, /must differ from DATABASE_URL/)
      assert.doesNotMatch(error.message, /application-secret|target-secret/)
      return true
    }
  )
})

test('treats localhost, IPv4 loopback, and IPv6 loopback as the same database host', () => {
  const targets = [
    'postgresql://runner:secret@127.0.0.1:5432/lorecraft_test',
    'postgresql://runner:secret@[::1]:5432/lorecraft_test',
  ]

  for (const targetDatabaseUrl of targets) {
    assert.throws(
      () =>
        assertDisposableDatabase({
          acknowledgement: '1',
          acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
          applicationDatabaseUrl: 'postgresql://app:secret@localhost:5432/lorecraft_test',
          targetDatabaseUrl,
          targetName: 'TEST_DATABASE_URL',
        }),
      /must differ from DATABASE_URL/
    )
  }
})

test('uses PostgreSQL identifier casing semantics when comparing schemas', () => {
  const applicationDatabaseUrl =
    'postgresql://app:secret@db.example.com/lorecraft?options=-csearch_path%3DLorecraft_Test'

  assert.throws(
    () =>
      assertDisposableDatabase({
        acknowledgement: '1',
        acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
        applicationDatabaseUrl,
        targetDatabaseUrl:
          'postgresql://runner:secret@db.example.com/lorecraft?options=-csearch_path%3Dlorecraft_test',
        targetName: 'TEST_DATABASE_URL',
      }),
    /must differ from DATABASE_URL/
  )

  assert.doesNotThrow(() =>
    assertDisposableDatabase({
      acknowledgement: '1',
      acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
      applicationDatabaseUrl,
      targetDatabaseUrl:
        'postgresql://runner:secret@db.example.com/lorecraft?options=-csearch_path%3D%22Lorecraft_Test%22',
      targetName: 'TEST_DATABASE_URL',
    })
  )
})

test('rejects a remote target whose database and schema do not identify it as disposable', () => {
  assert.throws(
    () =>
      assertDisposableDatabase({
        acknowledgement: '1',
        acknowledgementName: 'ALLOW_E2E_DATABASE_WRITES',
        applicationDatabaseUrl: 'postgresql://app:secret@app.example.com/lorecraft',
        targetDatabaseUrl:
          'postgresql://runner:secret@ep-example.us-east-2.aws.neon.tech/neondb?application_name=lorecraft_test',
        targetName: 'E2E_DATABASE_URL',
      }),
    /database name or schema must contain a disposable identifier/
  )
})

test('rejects a search path that can write to a non-disposable schema first', () => {
  assert.throws(
    () =>
      assertDisposableDatabase({
        acknowledgement: '1',
        acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
        applicationDatabaseUrl: 'postgresql://app:secret@db.example.com/lorecraft',
        targetDatabaseUrl:
          'postgresql://runner:secret@db.example.com/lorecraft?options=-csearch_path%3Dpublic%2Clorecraft_test',
        targetName: 'TEST_DATABASE_URL',
      }),
    /must contain at most one unambiguous search_path option/
  )
})

test('rejects ambiguous PostgreSQL options that can replace the guarded schema', () => {
  const targets = [
    'postgresql://runner:secret@db.example.com/lorecraft?options=-csearch_path%3Dlorecraft_test&options=-csearch_path%3Dpublic',
    'postgresql://runner:secret@db.example.com/lorecraft?options=-csearch_path%3Dlorecraft_test%20-csearch_path%3Dpublic',
  ]

  for (const targetDatabaseUrl of targets) {
    assert.throws(
      () =>
        assertDisposableDatabase({
          acknowledgement: '1',
          acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
          applicationDatabaseUrl: 'postgresql://app:secret@db.example.com/lorecraft',
          targetDatabaseUrl,
          targetName: 'TEST_DATABASE_URL',
        }),
      /must contain at most one unambiguous search_path option/
    )
  }
})

test('rejects query parameters that override database target identity', () => {
  const overrides = ['host=app.example.com', 'port=5433', 'database=lorecraft_test']

  for (const override of overrides) {
    assert.throws(
      () =>
        assertDisposableDatabase({
          acknowledgement: '1',
          acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
          applicationDatabaseUrl: 'postgresql://app:secret@app.example.com/lorecraft',
          targetDatabaseUrl: `postgresql://runner:secret@test.example.com/lorecraft_test?${override}`,
          targetName: 'TEST_DATABASE_URL',
        }),
      /must not override database identity through query parameters/
    )
  }
})

test('rejects inherited PostgreSQL settings that can override database target identity', () => {
  const overrides = {
    PGDATABASE: 'lorecraft_test',
    PGHOST: 'application.example.com',
    PGOPTIONS: '-c search_path=lorecraft_test',
    PGPORT: '5433',
  }

  for (const [name, value] of Object.entries(overrides)) {
    assert.throws(
      () =>
        assertDisposableDatabase({
          acknowledgement: '1',
          acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
          applicationDatabaseUrl: 'postgresql://app:secret@app.example.com/lorecraft',
          databaseEnvironment: { [name]: value },
          targetDatabaseUrl: 'postgresql://runner:secret@test.example.com/lorecraft_test',
          targetName: 'TEST_DATABASE_URL',
        }),
      new RegExp(`${name} must be unset`)
    )
  }
})

test('requires the guarded URL to explicitly identify its host and database', () => {
  for (const targetDatabaseUrl of [
    'postgresql:///lorecraft_test',
    'postgresql://runner:secret@localhost:5432',
  ]) {
    assert.throws(
      () =>
        assertDisposableDatabase({
          acknowledgement: '1',
          acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
          applicationDatabaseUrl: 'postgresql://app:secret@localhost:5432/lorecraft',
          targetDatabaseUrl,
          targetName: 'TEST_DATABASE_URL',
        }),
      /must explicitly identify its database host and name/
    )
  }
})

test('neutralizes PostgreSQL environment overrides in guarded child processes', () => {
  const environment = databaseChildEnvironment({
    APP_KEY: 'kept',
    PGDATABASE: 'application',
    PGHOST: 'application.example.com',
    PGOPTIONS: '-c search_path=public',
    PGPORT: '5433',
  })

  assert.equal(environment.APP_KEY, 'kept')
  assert.equal(environment.PGDATABASE, '')
  assert.equal(environment.PGHOST, '')
  assert.equal(environment.PGOPTIONS, '')
  assert.equal(environment.PGPORT, '')
})

test('rejects schema selectors that the PostgreSQL runtime does not apply', () => {
  for (const selector of ['search_path=lorecraft_test', 'schema=lorecraft_test']) {
    assert.throws(
      () =>
        assertDisposableDatabase({
          acknowledgement: '1',
          acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
          applicationDatabaseUrl: 'postgresql://app:secret@db.example.com/lorecraft',
          targetDatabaseUrl: `postgresql://runner:secret@db.example.com/lorecraft?${selector}`,
          targetName: 'TEST_DATABASE_URL',
        }),
      /must use PostgreSQL options=-csearch_path=/
    )
  }
})

test('accepts explicitly identified localhost, disposable Neon, and isolated-schema targets', () => {
  const targets = [
    'postgresql://runner:secret@localhost:5432/lorecraft_test',
    'postgresql://runner:secret@ep-example.us-east-2.aws.neon.tech/lorecraft_e2e',
    'postgresql://runner:secret@ep-example.us-east-2.aws.neon.tech/neondb?options=-csearch_path%3Dlorecraft_e2e_run_42',
    'postgresql://runner:secret@ep-example.us-east-2.aws.neon.tech/neondb?options=-c%20search_path%3Dlorecraft_test_run_42',
  ]

  for (const targetDatabaseUrl of targets) {
    assert.doesNotThrow(() =>
      assertDisposableDatabase({
        acknowledgement: '1',
        acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
        applicationDatabaseUrl: 'postgresql://app:secret@ep-example.us-east-2.aws.neon.tech/neondb',
        targetDatabaseUrl,
        targetName: 'TEST_DATABASE_URL',
      })
    )
  }
})

test('treats pooled and direct Neon hostnames as the same database target', () => {
  assert.throws(
    () =>
      assertDisposableDatabase({
        acknowledgement: '1',
        acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
        applicationDatabaseUrl:
          'postgresql://app:secret@ep-example.us-east-2.aws.neon.tech/lorecraft_test',
        targetDatabaseUrl:
          'postgresql://runner:secret@ep-example-pooler.us-east-2.aws.neon.tech/lorecraft_test',
        targetName: 'TEST_DATABASE_URL',
      }),
    /must differ from DATABASE_URL/
  )
})
