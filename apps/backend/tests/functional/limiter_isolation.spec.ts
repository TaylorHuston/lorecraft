import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { bootstrapBrowserSession, withBrowserSession } from '#tests/helpers/browser_session'

const password = 'correct horse battery staple'
const sharedClientIp = '203.0.113.250'

async function invalidSignup(client: Parameters<typeof bootstrapBrowserSession>[0]) {
  const browser = await bootstrapBrowserSession(client)

  return withBrowserSession(
    client.post('/api/v1/auth/signup').header('x-forwarded-for', sharedClientIp),
    browser.session,
    { csrf: true }
  ).json({
    email: 'not-an-email',
    password: 'too-short',
    passwordConfirmation: password,
  })
}

test.group('Functional limiter isolation', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-001/S1/R4-S3: throttles repeated signup attempts within one functional test', async ({
    client,
  }) => {
    for (let request = 1; request <= 10; request += 1) {
      const response = await invalidSignup(client)
      response.assertStatus(422)
    }

    const overQuota = await invalidSignup(client)
    overQuota.assertStatus(429)
  })

  test('LC-001/S2/R4-S3: a later functional test starts with a fresh limiter store', async ({
    client,
  }) => {
    const response = await invalidSignup(client)

    response.assertStatus(422)
  })
})
