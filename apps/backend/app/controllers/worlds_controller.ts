import WorldCatalogService from '#services/world_catalog_service'
import AdventureQueryService, { type AdventureSummaryDto } from '#services/adventure_query_service'
import type { HttpContext } from '@adonisjs/core/http'

type WorldDetail = NonNullable<Awaited<ReturnType<WorldCatalogService['findFor']>>>

export type WorldDetailResponseDto = {
  data: WorldDetail & {
    adventures: AdventureSummaryDto[]
  }
}

export default class WorldsController {
  async index({ auth }: HttpContext) {
    const worlds = await new WorldCatalogService().listFor(auth.user!.id)
    const adventuresByWorld = await new AdventureQueryService().listForWorldIds(
      auth.user!.id,
      worlds.map((world) => world.id)
    )
    return {
      data: worlds.map((world) => ({
        ...world,
        adventures: adventuresByWorld.get(world.id) ?? [],
      })),
    }
  }

  async show({ auth, params, response }: HttpContext) {
    const world = await new WorldCatalogService().findFor(auth.user!.id, params.slug)
    if (!world) {
      return response.notFound({
        errors: [{ code: 'WORLD_NOT_FOUND', message: 'World not found.' }],
      })
    }
    const adventures = await new AdventureQueryService().listForWorld(auth.user!.id, params.slug)
    if (!adventures) {
      return response.notFound({
        errors: [{ code: 'WORLD_NOT_FOUND', message: 'World not found.' }],
      })
    }

    const body: WorldDetailResponseDto = { data: { ...world, adventures } }
    return body
  }
}
