import WorldCatalogService from '#services/world_catalog_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class WorldsController {
  async index({ auth }: HttpContext) {
    return { data: await new WorldCatalogService().listFor(auth.user!.id) }
  }

  async show({ auth, params, response }: HttpContext) {
    const world = await new WorldCatalogService().findFor(auth.user!.id, params.slug)
    if (!world) {
      return response.notFound({
        errors: [{ code: 'WORLD_NOT_FOUND', message: 'World not found.' }],
      })
    }
    return { data: world }
  }
}
