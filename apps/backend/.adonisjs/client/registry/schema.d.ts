/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'health_checks.live': {
    methods: ["GET","HEAD"]
    pattern: '/api/health/live'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/health_checks_controller').default['live']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/health_checks_controller').default['live']>>>
    }
  }
  'health_checks.ready': {
    methods: ["GET","HEAD"]
    pattern: '/api/health/ready'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/health_checks_controller').default['ready']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/health_checks_controller').default['ready']>>>
    }
  }
  'auth.csrf': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/csrf'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.sessions.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sessions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sessions_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'account.sessions.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/account/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sessions_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sessions_controller').default['destroy']>>>
    }
  }
  'worlds.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/worlds'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/worlds_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/worlds_controller').default['index']>>>
    }
  }
  'worlds.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/worlds/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/worlds_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/worlds_controller').default['show']>>>
    }
  }
  'worlds.store_character': {
    methods: ["POST"]
    pattern: '/api/v1/worlds/:slug/characters'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/character').createCharacterValidator)>>
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/character').createCharacterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/worlds_controller').default['storeCharacter']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/worlds_controller').default['storeCharacter']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'worlds.update_character': {
    methods: ["PATCH"]
    pattern: '/api/v1/worlds/:slug/characters/:key'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/character').updateCharacterValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; key: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/character').updateCharacterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/worlds_controller').default['updateCharacter']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/worlds_controller').default['updateCharacter']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'worlds.destroy_character': {
    methods: ["DELETE"]
    pattern: '/api/v1/worlds/:slug/characters/:key'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; key: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/worlds_controller').default['destroyCharacter']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/worlds_controller').default['destroyCharacter']>>>
    }
  }
  'adventures.store': {
    methods: ["POST"]
    pattern: '/api/v1/worlds/:slug/adventures'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/adventure').createAdventureValidator)>>
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/adventure').createAdventureValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'adventures.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/adventures/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['show']>>>
    }
  }
  'adventures.submit_turn': {
    methods: ["POST"]
    pattern: '/api/v1/adventures/:id/turns'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/adventure').submitAdventureTurnValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/adventure').submitAdventureTurnValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['submitTurn']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['submitTurn']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'adventures.update_npc_debug_state': {
    methods: ["PATCH"]
    pattern: '/api/v1/adventures/:id/npcs/:key/debug-state'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/adventure').updateAdventureNpcStateValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; key: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/adventure').updateAdventureNpcStateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['updateNpcDebugState']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['updateNpcDebugState']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'adventures.update_player_debug_state': {
    methods: ["PATCH"]
    pattern: '/api/v1/adventures/:id/player/debug-state'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/adventure').updateAdventurePlayerStateValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/adventure').updateAdventurePlayerStateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['updatePlayerDebugState']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['updatePlayerDebugState']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'adventures.retry_turn': {
    methods: ["POST"]
    pattern: '/api/v1/adventures/:id/turns/:turnId/retry'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; turnId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['retryTurn']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['retryTurn']>>>
    }
  }
  'adventures.discard_turn': {
    methods: ["DELETE"]
    pattern: '/api/v1/adventures/:id/turns/:turnId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; turnId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['discardTurn']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['discardTurn']>>>
    }
  }
  'adventures.retry_opening': {
    methods: ["POST"]
    pattern: '/api/v1/adventures/:id/opening/retry'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['retryOpening']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['retryOpening']>>>
    }
  }
  'adventures.reset': {
    methods: ["POST"]
    pattern: '/api/v1/adventures/:id/reset'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['reset']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['reset']>>>
    }
  }
  'adventures.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/adventures/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/adventures_controller').default['destroy']>>>
    }
  }
}
