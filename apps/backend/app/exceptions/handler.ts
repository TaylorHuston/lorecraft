import app from '@adonisjs/core/services/app'
import {
  authPayloadTooLargeResponse,
  isAuthRequestPath,
} from '#middleware/auth_request_boundary_middleware'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as shieldErrors } from '@adonisjs/shield'

function hasStatus(error: unknown, status: number) {
  if (typeof error !== 'object' || error === null) return false

  const statusLike = error as { status?: unknown; statusCode?: unknown }
  return statusLike.status === status || statusLike.statusCode === status
}

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof shieldErrors.E_BAD_CSRF_TOKEN) {
      return ctx.response.status(403).send({
        errors: [
          {
            code: 'INVALID_CSRF_TOKEN',
            message: 'Invalid or expired CSRF token.',
          },
        ],
      })
    }

    if (
      hasStatus(error, 413) &&
      ctx.request.intended() === 'POST' &&
      isAuthRequestPath(ctx.request.url())
    ) {
      return ctx.response.requestEntityTooLarge(authPayloadTooLargeResponse)
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
