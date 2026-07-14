import { browserCsrfOptions } from '#config/shield'
import { inject } from '@adonisjs/core'
import { Encryption } from '@adonisjs/core/encryption'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { csrfFactory } from '@adonisjs/shield/guards'

@inject()
export default class BrowserCsrfMiddleware {
  private readonly csrfGuard: ReturnType<typeof csrfFactory>

  constructor(encryption: Encryption) {
    this.csrfGuard = csrfFactory(browserCsrfOptions, encryption)
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.csrfGuard(ctx)
    return next()
  }
}
