import { sessionCookieName } from '#config/session'
import type { ApiClient, ApiRequest, ApiResponse } from '@japa/api-client'

export type BrowserSession = {
  csrfToken: string
  sessionId: string
}

function requiredCookie(response: ApiResponse, name: string) {
  const cookie = response.cookie(name)

  if (!cookie || typeof cookie.value !== 'string') {
    throw new Error(`Expected response cookie "${name}"`)
  }

  return cookie.value
}

export async function bootstrapBrowserSession(client: ApiClient) {
  const response = await client.get('/api/v1/auth/csrf')

  response.assertNoContent()

  return {
    response,
    session: {
      csrfToken: requiredCookie(response, 'XSRF-TOKEN'),
      sessionId: requiredCookie(response, sessionCookieName),
    } satisfies BrowserSession,
  }
}

export function continueBrowserSession(response: ApiResponse, previous: BrowserSession) {
  return {
    csrfToken: response.cookie('XSRF-TOKEN')?.value ?? previous.csrfToken,
    sessionId: response.cookie(sessionCookieName)?.value ?? previous.sessionId,
  } satisfies BrowserSession
}

export function withBrowserSession<TBody, TResponse, TQuery>(
  request: ApiRequest<TBody, TResponse, TQuery>,
  session: BrowserSession,
  options: { csrf?: boolean } = {}
) {
  request.withCookie(sessionCookieName, session.sessionId)

  if (options.csrf) {
    request.header('x-csrf-token', session.csrfToken)
  }

  return request
}
