import { sessionCookieName } from '#config/session'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RequireSessionCookieMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    if (!request.cookie(sessionCookieName)) {
      return response.unauthorized({ errors: [{ message: 'Unauthorized access' }] })
    }

    return next()
  }
}
