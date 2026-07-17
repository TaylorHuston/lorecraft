import AdventureCreationService, {
  AdventureCreationError,
} from '#services/adventure_creation_service'
import AdventureQueryService, { type AdventureSummaryDto } from '#services/adventure_query_service'
import type { AdventureDetailDto } from '#services/adventure_query_service'
import AdventureLifecycleService, {
  AdventureLifecycleError,
  type AdventureResetResult,
} from '#services/adventure_lifecycle_service'
import { createAdventureValidator } from '#validators/adventure'
import type { HttpContext } from '@adonisjs/core/http'

export type AdventureSummaryResponseDto = {
  data: AdventureSummaryDto
}

export type AdventureDetailResponseDto = {
  data: AdventureDetailDto
}

export type AdventureLifecycleResponseDto = {
  data: AdventureResetResult
}

type AdventureErrorResponseDto = {
  errors: Array<{
    code: string
    message: string
  }>
}

function creationErrorResponse(error: AdventureCreationError): AdventureErrorResponseDto {
  return {
    errors: [{ code: error.code, message: error.message }],
  }
}

function lifecycleErrorResponse(error: AdventureLifecycleError): AdventureErrorResponseDto {
  return {
    errors: [{ code: error.code, message: error.message }],
  }
}

const adventureNotFoundResponse: AdventureErrorResponseDto = {
  errors: [{ code: 'ADVENTURE_NOT_FOUND', message: 'Adventure not found.' }],
}

export default class AdventuresController {
  async store({ auth, params, request, response }: HttpContext) {
    const input = await request.validateUsing(createAdventureValidator)

    try {
      const created = await new AdventureCreationService().create({
        ownerId: auth.user!.id,
        worldSlug: params.slug,
        creationRequestId: input.creationRequestId,
        player: input.player,
      })
      const detail = await new AdventureQueryService().findForOwner(
        auth.user!.id,
        created.adventureId
      )
      if (!detail) {
        throw new Error(`Created Adventure ${created.adventureId} is not readable by its owner.`)
      }

      const body: AdventureSummaryResponseDto = {
        data: {
          id: detail.id,
          playerName: detail.player.name,
          status: detail.status,
          turnCount: detail.turnCount,
          lastPlayedAt: detail.lastPlayedAt,
          route: detail.route,
        },
      }
      return response.created(body)
    } catch (error) {
      if (error instanceof AdventureCreationError) {
        return response.status(error.status).send(creationErrorResponse(error))
      }

      throw error
    }
  }

  async show({ auth, params, response }: HttpContext) {
    const adventure = await new AdventureQueryService().findForOwner(auth.user!.id, params.id)
    if (!adventure) {
      return response.notFound(adventureNotFoundResponse)
    }

    const body: AdventureDetailResponseDto = { data: adventure }
    return body
  }

  async retryOpening({ auth, params, response }: HttpContext) {
    try {
      const result = await new AdventureLifecycleService().retryOpening(params.id, auth.user!.id)
      const body: AdventureLifecycleResponseDto = { data: result }
      return body
    } catch (error) {
      if (error instanceof AdventureLifecycleError) {
        return response.status(error.status).send(lifecycleErrorResponse(error))
      }

      throw error
    }
  }

  async reset({ auth, params, response }: HttpContext) {
    try {
      const result = await new AdventureLifecycleService().reset(params.id, auth.user!.id)
      const body: AdventureLifecycleResponseDto = { data: result }
      return body
    } catch (error) {
      if (error instanceof AdventureLifecycleError) {
        return response.status(error.status).send(lifecycleErrorResponse(error))
      }

      throw error
    }
  }

  async destroy({ auth, params, response }: HttpContext) {
    try {
      await new AdventureLifecycleService().delete(params.id, auth.user!.id)
      return response.noContent()
    } catch (error) {
      if (error instanceof AdventureLifecycleError) {
        return response.status(error.status).send(lifecycleErrorResponse(error))
      }

      throw error
    }
  }
}
