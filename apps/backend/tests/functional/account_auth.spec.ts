import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import limiter from '@adonisjs/limiter/services/main'
import {
  bootstrapBrowserSession,
  continueBrowserSession,
  withBrowserSession,
} from '#tests/helpers/browser_session'

test.group('Account browser authentication', (group) => {
  group.each.setup(async () => {
    await limiter.clear(['memory'])
  })
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-001/S1/R1-S1 + R2-S1: valid signup creates a normalized account and session', async ({
    client,
    assert,
  }) => {
    const browser = await bootstrapBrowserSession(client)
    const signup = await withBrowserSession(client.post('/api/v1/auth/signup'), browser.session, {
      csrf: true,
    }).json({
      email: '  NEW.USER@Example.COM  ',
      password: 'correct horse battery staple',
      passwordConfirmation: 'correct horse battery staple',
    })

    signup.assertCreated()
    signup.assertBodyContains({ data: { email: 'new.user@example.com' } })
    signup.assertBodyNotContains({ password: 'correct horse battery staple' })
    assert.notProperty(signup.body(), 'data.token')
    const authenticatedBrowser = continueBrowserSession(signup, browser.session)
    const persistedSession = await db
      .from('sessions')
      .where('id', authenticatedBrowser.sessionId)
      .first()
    assert.exists(persistedSession)

    const profile = await withBrowserSession(
      client.get('/api/v1/account/profile'),
      authenticatedBrowser
    )

    profile.assertOk()
    profile.assertBodyContains({ data: { email: 'new.user@example.com' } })
  })

  test('LC-001/S1/R1-S1: signup persists only a password hash', async ({ client, assert }) => {
    const password = 'correct horse battery staple'
    const browser = await bootstrapBrowserSession(client)
    const signup = await withBrowserSession(client.post('/api/v1/auth/signup'), browser.session, {
      csrf: true,
    }).json({ email: 'hashed@example.com', password, passwordConfirmation: password })

    signup.assertCreated()
    const signupBody = signup.body() as unknown as { data: { id: number } }
    const account = await User.findOrFail(signupBody.data.id)
    assert.notEqual(account.password, password)
    assert.isTrue(await hash.verify(account.password, password))
  })

  test('LC-001/S1/R1-S3: a normalized duplicate email returns a safe conflict', async ({
    client,
    assert,
  }) => {
    const password = 'correct horse battery staple'
    const browser = await bootstrapBrowserSession(client)
    await withBrowserSession(client.post('/api/v1/auth/signup'), browser.session, {
      csrf: true,
    }).json({ email: 'duplicate@example.com', password, passwordConfirmation: password })

    const duplicateBrowser = await bootstrapBrowserSession(client)
    const duplicate = await withBrowserSession(
      client.post('/api/v1/auth/signup'),
      duplicateBrowser.session,
      { csrf: true }
    ).json({
      email: '  DUPLICATE@EXAMPLE.COM  ',
      password,
      passwordConfirmation: password,
    })

    duplicate.assertStatus(409)
    assert.deepEqual(duplicate.body(), {
      errors: [
        {
          code: 'ACCOUNT_ALREADY_EXISTS',
          message: 'An account with this email already exists.',
        },
      ],
    })
    assert.lengthOf(await User.query().where('email', 'duplicate@example.com'), 1)
  })

  test('LC-001/S2/R1-S1 + R2-S1: valid credentials establish a restorable web session', async ({
    client,
    assert,
  }) => {
    const password = 'correct horse battery staple'
    const signupBrowser = await bootstrapBrowserSession(client)
    await withBrowserSession(client.post('/api/v1/auth/signup'), signupBrowser.session, {
      csrf: true,
    }).json({ email: 'returning@example.com', password, passwordConfirmation: password })

    const loginBrowser = await bootstrapBrowserSession(client)
    const login = await withBrowserSession(
      client.post('/api/v1/auth/login'),
      loginBrowser.session,
      { csrf: true }
    ).json({ email: '  RETURNING@EXAMPLE.COM ', password })

    login.assertOk()
    login.assertBodyContains({ data: { email: 'returning@example.com' } })
    assert.notProperty(login.body(), 'data.token')
    const authenticatedBrowser = continueBrowserSession(login, loginBrowser.session)
    assert.exists(await db.from('sessions').where('id', authenticatedBrowser.sessionId).first())

    const restored = await withBrowserSession(
      client.get('/api/v1/account/profile'),
      authenticatedBrowser
    )
    restored.assertOk()
    restored.assertBodyContains({ data: { email: 'returning@example.com' } })
  })

  test('LC-001/S2/R1-S2: unknown email and wrong password return the same generic error', async ({
    client,
    assert,
  }) => {
    const password = 'correct horse battery staple'
    const signupBrowser = await bootstrapBrowserSession(client)
    await withBrowserSession(client.post('/api/v1/auth/signup'), signupBrowser.session, {
      csrf: true,
    }).json({ email: 'known@example.com', password, passwordConfirmation: password })

    const wrongPasswordBrowser = await bootstrapBrowserSession(client)
    const wrongPassword = await withBrowserSession(
      client.post('/api/v1/auth/login'),
      wrongPasswordBrowser.session,
      { csrf: true }
    ).json({ email: 'known@example.com', password: 'this password is incorrect' })
    const unknownEmailBrowser = await bootstrapBrowserSession(client)
    const unknownEmail = await withBrowserSession(
      client.post('/api/v1/auth/login'),
      unknownEmailBrowser.session,
      { csrf: true }
    ).json({ email: 'unknown@example.com', password: 'this password is incorrect' })

    wrongPassword.assertStatus(401)
    unknownEmail.assertStatus(401)
    wrongPassword.assertBody(unknownEmail.body())
    assert.deepEqual(wrongPassword.body(), {
      errors: [{ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }],
    })

    const wrongPasswordProfile = await withBrowserSession(
      client.get('/api/v1/account/profile'),
      continueBrowserSession(wrongPassword, wrongPasswordBrowser.session)
    )
    const unknownEmailProfile = await withBrowserSession(
      client.get('/api/v1/account/profile'),
      continueBrowserSession(unknownEmail, unknownEmailBrowser.session)
    )
    wrongPasswordProfile.assertStatus(401)
    unknownEmailProfile.assertStatus(401)
  })

  test('LC-001/S3/R2-S1: logout removes authentication from the persisted browser session', async ({
    client,
  }) => {
    const password = 'correct horse battery staple'
    const browser = await bootstrapBrowserSession(client)
    const signup = await withBrowserSession(client.post('/api/v1/auth/signup'), browser.session, {
      csrf: true,
    }).json({ email: 'logout@example.com', password, passwordConfirmation: password })
    const authenticatedBrowser = continueBrowserSession(signup, browser.session)

    const logout = await withBrowserSession(
      client.post('/api/v1/account/logout'),
      authenticatedBrowser,
      { csrf: true }
    )

    logout.assertNoContent()
    const loggedOutBrowser = continueBrowserSession(logout, authenticatedBrowser)
    const profile = await withBrowserSession(
      client.get('/api/v1/account/profile'),
      loggedOutBrowser
    )
    profile.assertStatus(401)
  })
})
