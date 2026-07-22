import { test } from '@japa/runner'
import { request as sendHttpRequest } from 'node:http'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'
import { sessionCookieName } from '#config/session'
import User from '#models/user'
import {
  bootstrapBrowserSession,
  continueBrowserSession,
  withBrowserSession,
} from '#tests/helpers/browser_session'

const csrfMutationCases = [
  {
    id: 'signup',
    path: '/api/v1/auth/signup',
    story: 'LC-001/S1/R4-S1',
  },
  {
    id: 'login',
    path: '/api/v1/auth/login',
    story: 'LC-001/S2/R4-S1',
  },
  {
    id: 'logout',
    path: '/api/v1/account/logout',
    story: 'LC-001/S3/R2-S3',
  },
] as const

const invalidCsrfTokens = [
  { label: 'missing', value: undefined },
  { label: 'invalid', value: 'forged-csrf-token' },
] as const

const invalidCsrfResponse = {
  errors: [{ code: 'INVALID_CSRF_TOKEN', message: 'Invalid or expired CSRF token.' }],
}

function sendChunkedJson(url: string, chunks: string[]) {
  return new Promise<{
    body: unknown
    headers: Record<string, string | string[] | undefined>
    status: number
  }>((resolve, reject) => {
    const request = sendHttpRequest(
      url,
      {
        method: 'POST',
        headers: { 'accept': 'application/json', 'content-type': 'application/json' },
      },
      (response) => {
        const bodyChunks: Buffer[] = []
        response.on('data', (chunk) => bodyChunks.push(Buffer.from(chunk)))
        response.on('end', () => {
          resolve({
            body: JSON.parse(Buffer.concat(bodyChunks).toString('utf8')),
            headers: response.headers,
            status: response.statusCode ?? 0,
          })
        })
      }
    )
    request.on('error', reject)
    chunks.forEach((chunk) => request.write(chunk))
    request.end()
  })
}

async function authStateCounts() {
  const users = await db.from('users').count('* as total').firstOrFail()
  const sessions = await db.from('sessions').count('* as total').firstOrFail()

  return {
    sessions: Number(sessions.total),
    users: Number(users.total),
  }
}

test.group('Account API security', (group) => {
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
      .header('origin', 'http://localhost:4310')
      .header('access-control-request-method', 'POST')

    response.assertStatus(204)
    response.assertHeader('access-control-allow-origin', 'http://localhost:4310')
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

  for (const mutation of csrfMutationCases) {
    test(`${mutation.story}: ${mutation.id} rejects missing and invalid CSRF tokens without mutation`, async ({
      client,
      assert,
    }) => {
      for (const token of invalidCsrfTokens) {
        const email = `csrf-${mutation.id}-${token.label}@example.com`

        if (mutation.id === 'login') {
          await User.create({ email, password: 'correct horse battery staple' })
        }

        const browser = await bootstrapBrowserSession(client)
        let browserSession = browser.session

        if (mutation.id === 'logout') {
          const signup = await withBrowserSession(
            client.post('/api/v1/auth/signup'),
            browserSession,
            {
              csrf: true,
            }
          ).json({
            email,
            password: 'correct horse battery staple',
            passwordConfirmation: 'correct horse battery staple',
          })
          signup.assertCreated()
          browserSession = continueBrowserSession(signup, browserSession)
        }

        const accountsBefore = await db.from('users').count('* as total').firstOrFail()
        const sessionBefore = await db
          .from('sessions')
          .select('user_id')
          .where('id', browserSession.sessionId)
          .firstOrFail()
        const request = withBrowserSession(client.post(mutation.path), browserSession)

        if (token.value) {
          request.header('x-csrf-token', token.value)
        }

        const response =
          mutation.id === 'logout'
            ? await request
            : await request.json(
                mutation.id === 'signup'
                  ? {
                      email,
                      password: 'correct horse battery staple',
                      passwordConfirmation: 'correct horse battery staple',
                    }
                  : { email, password: 'correct horse battery staple' }
              )

        response.assertStatus(403)
        assert.deepEqual(response.body(), invalidCsrfResponse)
        response.assertBodyNotContains({ password: 'correct horse battery staple' })

        const accountsAfter = await db.from('users').count('* as total').firstOrFail()
        const sessionAfter = await db
          .from('sessions')
          .select('user_id')
          .where('id', browserSession.sessionId)
          .firstOrFail()
        assert.equal(Number(accountsAfter.total), Number(accountsBefore.total))
        assert.equal(sessionAfter.user_id, sessionBefore.user_id)

        const profile = await withBrowserSession(
          client.get('/api/v1/account/profile'),
          browserSession
        )
        profile.assertStatus(mutation.id === 'logout' ? 200 : 401)

        if (mutation.id === 'logout') {
          profile.assertBodyContains({ data: { email } })
        }
      }
    })
  }

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

  test('LC-001/S1/R4-S2 + S2/R4-S2: auth routes reject multipart before session and CSRF processing', async ({
    client,
    assert,
  }) => {
    const stateBefore = await authStateCounts()
    const oversizedAuthFile = Buffer.alloc(17 * 1024, 'x')

    for (const path of [
      '/api/v1/auth/signup',
      '/api/v1/auth/signup/',
      '/api/v1/auth/signup?source=security-test',
      '/api/v1/auth/login',
      '/api/v1/auth/login/',
      '/api/v1/auth/login?source=security-test',
    ]) {
      const response = await client.post(path).file('attachment', oversizedAuthFile, {
        filename: 'oversized-auth-payload.txt',
        contentType: 'text/plain',
      })

      response.assertStatus(415)
      assert.deepEqual(response.body(), {
        errors: [
          {
            code: 'UNSUPPORTED_AUTH_CONTENT_TYPE',
            message: 'Signup and login requests require application/json.',
          },
        ],
      })
      response.assertCookieMissing('adonis-session')
      response.assertCookieMissing('XSRF-TOKEN')
    }

    assert.deepEqual(await authStateCounts(), stateBefore)
  })

  test('LC-001/S1/R4-S2 + S2/R4-S2: auth routes reject URL-encoded forms before body parsing', async ({
    client,
    assert,
  }) => {
    const stateBefore = await authStateCounts()

    for (const path of [
      '/api/v1/auth/signup',
      '/api/v1/auth/signup/',
      '/api/v1/auth/login',
      '/api/v1/auth/login/',
    ]) {
      const response = await client.post(path).form({
        email: 'unsupported@example.com',
        password: 'unsupported',
      })

      response.assertStatus(415)
      assert.deepEqual(response.body(), {
        errors: [
          {
            code: 'UNSUPPORTED_AUTH_CONTENT_TYPE',
            message: 'Signup and login requests require application/json.',
          },
        ],
      })
      response.assertCookieMissing('adonis-session')
      response.assertCookieMissing('XSRF-TOKEN')
    }

    assert.deepEqual(await authStateCounts(), stateBefore)
  })

  test('LC-001/S1/R4-S2 + S2/R4-S2: auth routes reject oversized JSON before session and CSRF processing', async ({
    client,
    assert,
  }) => {
    const stateBefore = await authStateCounts()

    for (const path of ['/api/v1/auth/signup', '/api/v1/auth/login?source=security-test']) {
      const response = await client.post(path).json({
        email: 'x'.repeat(17 * 1024),
        password: 'irrelevant',
      })

      response.assertStatus(413)
      assert.deepEqual(response.body(), {
        errors: [
          {
            code: 'AUTH_PAYLOAD_TOO_LARGE',
            message: 'Signup and login request bodies must not exceed 16 KB.',
          },
        ],
      })
      response.assertCookieMissing('adonis-session')
      response.assertCookieMissing('XSRF-TOKEN')
    }

    assert.deepEqual(await authStateCounts(), stateBefore)
  })

  test('LC-001/S1/R4-S2 + S2/R4-S2: auth routes normalize oversized chunked JSON rejection', async ({
    client,
    assert,
  }) => {
    const stateBefore = await authStateCounts()

    for (const path of ['/api/v1/auth/signup', '/api/v1/auth/login']) {
      const endpoint = client.post(path).request.url
      const response = await sendChunkedJson(endpoint, [
        '{"email":"',
        'x'.repeat(17 * 1024),
        '","password":"irrelevant"}',
      ])

      assert.equal(response.status, 413)
      assert.deepEqual(response.body, {
        errors: [
          {
            code: 'AUTH_PAYLOAD_TOO_LARGE',
            message: 'Signup and login request bodies must not exceed 16 KB.',
          },
        ],
      })
      assert.isUndefined(response.headers['set-cookie'])
    }

    assert.deepEqual(await authStateCounts(), stateBefore)
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

  test('LC-001/S1/R4-S3: repeated signup attempts are throttled before validation', async ({
    client,
    assert,
  }) => {
    const accountsBefore = await db.from('users').count('* as total').firstOrFail()
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

    const accountsAfter = await db.from('users').count('* as total').firstOrFail()
    assert.equal(Number(accountsAfter.total), Number(accountsBefore.total))
  })

  test('LC-001/S2/R4-S3: repeated login attempts are throttled per forwarded client', async ({
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

    const profile = await withBrowserSession(client.get('/api/v1/account/profile'), browser.session)
    profile.assertStatus(401)
  })
})
