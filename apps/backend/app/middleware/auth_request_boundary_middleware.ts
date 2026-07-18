import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const authRequestPaths = new Set(['/api/v1/auth/signup', '/api/v1/auth/login'])
const maxAuthRequestBytes = 16 * 1024

export const authPayloadTooLargeResponse = {
  errors: [
    {
      code: 'AUTH_PAYLOAD_TOO_LARGE',
      message: 'Signup and login request bodies must not exceed 16 KB.',
    },
  ],
}

export function isAuthRequestPath(path: string) {
  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, '') : path
  return authRequestPaths.has(normalizedPath)
}

export default class AuthRequestBoundaryMiddleware {
  handle({ request, response }: HttpContext, next: NextFn) {
    if (request.intended() !== 'POST' || !isAuthRequestPath(request.url())) {
      return next()
    }

    const contentType = request.header('content-type')?.split(';', 1)[0]?.trim().toLowerCase()

    if (contentType !== 'application/json') {
      return response.unsupportedMediaType({
        errors: [
          {
            code: 'UNSUPPORTED_AUTH_CONTENT_TYPE',
            message: 'Signup and login requests require application/json.',
          },
        ],
      })
    }

    const contentLength = request.header('content-length')
    if (contentLength && Number(contentLength) > maxAuthRequestBytes) {
      return response.requestEntityTooLarge(authPayloadTooLargeResponse)
    }

    return next()
  }
}
