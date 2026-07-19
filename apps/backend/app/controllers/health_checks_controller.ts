import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

export default class HealthChecksController {
  async live({ response }: HttpContext) {
    return response.ok({ status: 'ok' })
  }

  async ready({ response }: HttpContext) {
    try {
      await db.rawQuery('select 1')
      return response.ok({ status: 'ready' })
    } catch {
      return response.serviceUnavailable({ status: 'not_ready' })
    }
  }
}
