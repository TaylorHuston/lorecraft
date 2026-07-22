import WorldCatalogService from '#services/world_catalog_service'
import WorldCharacterService, { WorldCharacterError } from '#services/world_character_service'
import { createCharacterValidator, updateCharacterValidator } from '#validators/character'
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

  async storeCharacter({ auth, params, request, response }: HttpContext) {
    const input = await request.validateUsing(createCharacterValidator)
    try {
      return response.created({
        data: await new WorldCharacterService().create(auth.user!.id, params.slug, input),
      })
    } catch (error) {
      if (error instanceof WorldCharacterError)
        return response
          .status(error.status)
          .send({ errors: [{ code: error.code, message: error.message }] })
      throw error
    }
  }

  async updateCharacter({ auth, params, request, response }: HttpContext) {
    const input = await request.validateUsing(updateCharacterValidator)
    try {
      return {
        data: await new WorldCharacterService().update(
          auth.user!.id,
          params.slug,
          params.key,
          input
        ),
      }
    } catch (error) {
      if (error instanceof WorldCharacterError)
        return response
          .status(error.status)
          .send({ errors: [{ code: error.code, message: error.message }] })
      throw error
    }
  }

  async destroyCharacter({ auth, params, response }: HttpContext) {
    try {
      await new WorldCharacterService().destroy(auth.user!.id, params.slug, params.key)
      return response.noContent()
    } catch (error) {
      if (error instanceof WorldCharacterError)
        return response
          .status(error.status)
          .send({ errors: [{ code: error.code, message: error.message }] })
      throw error
    }
  }
}
