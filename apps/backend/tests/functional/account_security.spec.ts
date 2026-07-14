import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import { sessionCookieName } from '#config/session'
import { bootstrapBrowserSession, withBrowserSession } from '#tests/helpers/browser_session'

test.group('Account API security', (group) => {
  group.each.setup(async () => {
    await limiter.clear(['memory'])
  })
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-001/S3/R1-S2: anonymous safe requests do not create browser session state', async ({
    client,
    assert,
  }) => {
    const sessionsBefore = await db.from('sessions').count('* as total').firstOrFail()

    const root = await client.get('/')
    const profile = await client.get('/api/v1/account/profile')

    root.assertOk()
    root.assertCookieMissing('adonis-session')
    root.assertCookieMissing('XSRF-TOKEN')
    profile.assertStatus(401)
    profile.assertCookieMissing('adonis-session')
    profile.assertCookieMissing('XSRF-TOKEN')

    const sessionsAfter = await db.from('sessions').count('* as total').firstOrFail()
    assert.equal(Number(sessionsAfter.total), Number(sessionsBefore.total))
  })

  test('LC-001/S3/R2-S1: cookie-less logout is unauthorized without creating a session', async ({
    client,
    assert,
  }) => {
    const sessionsBefore = await db.from('sessions').count('* as total').firstOrFail()

    const response = await client.post('/api/v1/account/logout')

    response.assertStatus(401)
    response.assertCookieMissing('adonis-session')
    response.assertCookieMissing('XSRF-TOKEN')

    const sessionsAfter = await db.from('sessions').count('* as total').firstOrFail()
    assert.equal(Number(sessionsAfter.total), Number(sessionsBefore.total))
  })

  test('LC-001/S3/R2-S1: fabricated-cookie logout is unauthorized without creating a session', async ({
    client,
    assert,
  }) => {
    const sessionsBefore = await db.from('sessions').count('* as total').firstOrFail()

    const response = await client
      .post('/api/v1/account/logout')
      .withCookie(sessionCookieName, 'fabricated-session')

    response.assertStatus(401)
    response.assertCookieMissing('XSRF-TOKEN')

    const sessionsAfter = await db.from('sessions').count('* as total').firstOrFail()
    assert.equal(Number(sessionsAfter.total), Number(sessionsBefore.total))
  })

  test('LC-001/S1/R2-S1: a browser can bootstrap XSRF protection without a bearer token', async ({
    client,
    assert,
  }) => {
    const { response } = await bootstrapBrowserSession(client)

    response.assertNoContent()
    response.assertCookie('adonis-session')
    response.assertCookie('XSRF-TOKEN')
    assert.notStrictEqual(response.cookie('XSRF-TOKEN')!.httpOnly, true)
    assert.notProperty(response.headers(), 'authorization')
  })

  test('LC-001/S1/R2-S1: credentialed CORS allows only the configured browser origin', async ({
    client,
  }) => {
    const response = await client
      .options('/api/v1/auth/signup')
      .header('origin', 'http://localhost:5173')
      .header('access-control-request-method', 'POST')

    response.assertStatus(204)
    response.assertHeader('access-control-allow-origin', 'http://localhost:5173')
    response.assertHeader('access-control-allow-credentials', 'true')
  })

  test('LC-001/S3/R1-S2: CORS does not authorize an unconfigured browser origin', async ({
    client,
  }) => {
    const response = await client
      .options('/api/v1/account/profile')
      .header('origin', 'https://untrusted.example')
      .header('access-control-request-method', 'GET')

    response.assertStatus(204)
    response.assertHeaderMissing('access-control-allow-origin')
    response.assertHeaderMissing('access-control-allow-credentials')
  })

  test('LC-001/Cross-Story: state-changing account requests require a CSRF token', async ({
    client,
  }) => {
    const browser = await bootstrapBrowserSession(client)
    const response = await withBrowserSession(
      client.post('/api/v1/auth/signup'),
      browser.session
    ).json({
      email: 'new.user@example.com',
      password: 'correct horse battery staple',
      passwordConfirmation: 'correct horse battery staple',
    })

    response.assertStatus(403)
    response.assertBody({
      errors: [{ code: 'INVALID_CSRF_TOKEN', message: 'Invalid or expired CSRF token.' }],
    })
    response.assertBodyNotContains({ password: 'correct horse battery staple' })
  })

  test('LC-001/S3/R1-S2: an anonymous protected API request returns no account data', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/api/v1/account/profile')

    response.assertStatus(401)
    assert.notProperty(response.body(), 'data')
  })

  test('LC-001/S1/R1-S2: invalid signup identifies fields without echoing credentials', async ({
    client,
    assert,
  }) => {
    const accountsBefore = await db.from('users').count('* as total').firstOrFail()
    const browser = await bootstrapBrowserSession(client)
    const response = await withBrowserSession(client.post('/api/v1/auth/signup'), browser.session, {
      csrf: true,
    }).json({
      email: 'not-an-email',
      password: 'too-short',
      passwordConfirmation: 'different',
    })

    response.assertStatus(422)
    const body = response.body() as unknown as { errors: Array<{ field: string }> }
    assert.includeMembers(
      body.errors.map((error) => error.field),
      ['email', 'password', 'passwordConfirmation']
    )
    response.assertBodyNotContains({ password: 'too-short' })
    response.assertBodyNotContains({ passwordConfirmation: 'different' })

    const accountsAfter = await db.from('users').count('* as total').firstOrFail()
    assert.equal(Number(accountsAfter.total), Number(accountsBefore.total))
  })

  test('LC-001/Cross-Story: anonymous CSRF throttling isolates forwarded clients', async ({
    client,
    assert,
  }) => {
    const sessionsBefore = await db.from('sessions').count('* as total').firstOrFail()
    const firstClientIp = '203.0.113.10'
    const secondClientIp = '203.0.113.11'

    for (let request = 1; request <= 60; request += 1) {
      const response = await client
        .get('/api/v1/auth/csrf')
        .header('x-forwarded-for', firstClientIp)
      response.assertNoContent()
    }

    const overQuota = await client.get('/api/v1/auth/csrf').header('x-forwarded-for', firstClientIp)
    overQuota.assertStatus(429)
    overQuota.assertCookieMissing('adonis-session')
    overQuota.assertCookieMissing('XSRF-TOKEN')

    const distinctClient = await client
      .get('/api/v1/auth/csrf')
      .header('x-forwarded-for', secondClientIp)
    distinctClient.assertNoContent()

    const sessionsAfter = await db.from('sessions').count('* as total').firstOrFail()
    assert.equal(Number(sessionsAfter.total) - Number(sessionsBefore.total), 61)
  })

  test('LC-001/Cross-Story: repeated signup attempts are throttled before validation', async ({
    client,
  }) => {
    const browser = await bootstrapBrowserSession(client)

    for (let request = 1; request <= 10; request += 1) {
      const response = await withBrowserSession(
        client.post('/api/v1/auth/signup'),
        browser.session,
        { csrf: true }
      ).json({
        email: 'not-an-email',
        password: 'too-short',
        passwordConfirmation: 'different',
      })
      response.assertStatus(422)
    }

    const overQuota = await withBrowserSession(
      client.post('/api/v1/auth/signup'),
      browser.session,
      { csrf: true }
    ).json({
      email: 'not-an-email',
      password: 'too-short',
      passwordConfirmation: 'different',
    })
    overQuota.assertStatus(429)
  })

  test('LC-001/Cross-Story: repeated login attempts are throttled per forwarded client', async ({
    client,
  }) => {
    const browser = await bootstrapBrowserSession(client)
    const firstClientIp = '203.0.113.20'
    const secondClientIp = '203.0.113.21'

    for (let request = 1; request <= 20; request += 1) {
      const response = await withBrowserSession(
        client.post('/api/v1/auth/login').header('x-forwarded-for', firstClientIp),
        browser.session,
        { csrf: true }
      ).json({ email: 'unknown@example.com', password: 'incorrect password' })
      response.assertStatus(401)
    }

    const overQuota = await withBrowserSession(
      client.post('/api/v1/auth/login').header('x-forwarded-for', firstClientIp),
      browser.session,
      { csrf: true }
    ).json({ email: 'unknown@example.com', password: 'incorrect password' })
    overQuota.assertStatus(429)

    const distinctClient = await withBrowserSession(
      client.post('/api/v1/auth/login').header('x-forwarded-for', secondClientIp),
      browser.session,
      { csrf: true }
    ).json({ email: 'unknown@example.com', password: 'incorrect password' })
    distinctClient.assertStatus(401)
  })
})
