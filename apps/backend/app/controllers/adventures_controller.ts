import AdventureCreationService, {
  AdventureCreationError,
} from '#services/adventure_creation_service'
import AdventureQueryService, { type AdventureSummaryDto } from '#services/adventure_query_service'
import type { AdventureDetailDto } from '#services/adventure_query_service'
import AdventureLifecycleService, {
  AdventureLifecycleError,
  type AdventureResetResult,
} from '#services/adventure_lifecycle_service'
import AdventureTurnSubmissionService, {
  AdventureTurnSubmissionError,
  type AdventureTurnSubmissionResult,
} from '#services/adventure_turn_submission_service'
import AdventureTurnLifecycleService, {
  AdventureTurnLifecycleError,
} from '#services/adventure_turn_lifecycle_service'
import AdventureNpcDebugStateService, {
  AdventureNpcDebugStateError,
  isAdventureNpcDebugEditingEnabled,
} from '#services/adventure_npc_debug_state_service'
import AdventurePlayerDebugStateService, {
  AdventurePlayerDebugStateError,
  isAdventurePlayerDebugEditingEnabled,
} from '#services/adventure_player_debug_state_service'
import env from '#start/env'
import {
  createAdventureValidator,
  submitAdventureTurnValidator,
  updateAdventureNpcStateValidator,
  updateAdventurePlayerStateValidator,
} from '#validators/adventure'
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

export type AdventureTurnSubmissionResponseDto = {
  data: AdventureTurnSubmissionResult
}

export type AdventureTurnLifecycleResponseDto = {
  data: { id: string; status: 'pending' }
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

function turnSubmissionErrorResponse(
  error: AdventureTurnSubmissionError
): AdventureErrorResponseDto {
  return {
    errors: [{ code: error.code, message: error.message }],
  }
}

function turnLifecycleErrorResponse(error: AdventureTurnLifecycleError): AdventureErrorResponseDto {
  return { errors: [{ code: error.code, message: error.message }] }
}

function npcDebugStateErrorResponse(error: AdventureNpcDebugStateError): AdventureErrorResponseDto {
  return { errors: [{ code: error.code, message: error.message }] }
}

function playerDebugStateErrorResponse(
  error: AdventurePlayerDebugStateError
): AdventureErrorResponseDto {
  return { errors: [{ code: error.code, message: error.message }] }
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

  async submitTurn({ auth, params, request, response }: HttpContext) {
    const input = (await request.validateUsing(submitAdventureTurnValidator)) as {
      requestId: string
      trigger: 'act' | 'pass' | 'guide'
      input?: string
    }

    try {
      const turn = await new AdventureTurnSubmissionService().submit({
        ownerId: auth.user!.id,
        adventureId: params.id,
        requestId: input.requestId,
        trigger: input.trigger,
        input: input.input,
      })
      const body: AdventureTurnSubmissionResponseDto = { data: turn }
      return response.created(body)
    } catch (error) {
      if (error instanceof AdventureTurnSubmissionError) {
        return response.status(error.status).send(turnSubmissionErrorResponse(error))
      }

      throw error
    }
  }

  async updateNpcDebugState({ auth, params, request, response }: HttpContext) {
    if (!isAdventureNpcDebugEditingEnabled(env.get('NODE_ENV'))) {
      return response.notFound(adventureNotFoundResponse)
    }
    const input = await request.validateUsing(updateAdventureNpcStateValidator)
    try {
      await new AdventureNpcDebugStateService().update({
        ownerId: auth.user!.id,
        adventureId: params.id,
        characterKey: params.key,
        ...input,
      })
      const adventure = await new AdventureQueryService().findForOwner(auth.user!.id, params.id)
      if (!adventure) return response.notFound(adventureNotFoundResponse)
      return { data: adventure }
    } catch (error) {
      if (error instanceof AdventureNpcDebugStateError) {
        return response.status(error.status).send(npcDebugStateErrorResponse(error))
      }
      throw error
    }
  }

  async updatePlayerDebugState({ auth, params, request, response }: HttpContext) {
    if (!isAdventurePlayerDebugEditingEnabled(env.get('NODE_ENV'))) {
      return response.notFound(adventureNotFoundResponse)
    }
    const input = await request.validateUsing(updateAdventurePlayerStateValidator)
    try {
      await new AdventurePlayerDebugStateService().update({
        ownerId: auth.user!.id,
        adventureId: params.id,
        ...input,
      })
      const adventure = await new AdventureQueryService().findForOwner(auth.user!.id, params.id)
      if (!adventure) return response.notFound(adventureNotFoundResponse)
      return { data: adventure }
    } catch (error) {
      if (error instanceof AdventurePlayerDebugStateError) {
        return response.status(error.status).send(playerDebugStateErrorResponse(error))
      }
      throw error
    }
  }

  async retryTurn({ auth, params, response }: HttpContext) {
    try {
      const turn = await new AdventureTurnLifecycleService().retry({
        ownerId: auth.user!.id,
        adventureId: params.id,
        turnId: params.turnId,
      })
      const body: AdventureTurnLifecycleResponseDto = { data: turn }
      return body
    } catch (error) {
      if (error instanceof AdventureTurnLifecycleError) {
        return response.status(error.status).send(turnLifecycleErrorResponse(error))
      }
      throw error
    }
  }

  async discardTurn({ auth, params, response }: HttpContext) {
    try {
      await new AdventureTurnLifecycleService().discard({
        ownerId: auth.user!.id,
        adventureId: params.id,
        turnId: params.turnId,
      })
      return response.noContent()
    } catch (error) {
      if (error instanceof AdventureTurnLifecycleError) {
        return response.status(error.status).send(turnLifecycleErrorResponse(error))
      }
      throw error
    }
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
