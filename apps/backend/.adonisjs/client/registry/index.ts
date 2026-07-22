/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'health_checks.live': {
    methods: ["GET","HEAD"],
    pattern: '/api/health/live',
    tokens: [{"old":"/api/health/live","type":0,"val":"api","end":""},{"old":"/api/health/live","type":0,"val":"health","end":""},{"old":"/api/health/live","type":0,"val":"live","end":""}],
    types: placeholder as Registry['health_checks.live']['types'],
  },
  'health_checks.ready': {
    methods: ["GET","HEAD"],
    pattern: '/api/health/ready',
    tokens: [{"old":"/api/health/ready","type":0,"val":"api","end":""},{"old":"/api/health/ready","type":0,"val":"health","end":""},{"old":"/api/health/ready","type":0,"val":"ready","end":""}],
    types: placeholder as Registry['health_checks.ready']['types'],
  },
  'auth.csrf': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/csrf',
    tokens: [{"old":"/api/v1/auth/csrf","type":0,"val":"api","end":""},{"old":"/api/v1/auth/csrf","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/csrf","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/csrf","type":0,"val":"csrf","end":""}],
    types: placeholder as Registry['auth.csrf']['types'],
  },
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.sessions.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.sessions.store']['types'],
  },
  'account.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['account.profile.show']['types'],
  },
  'account.sessions.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['account.sessions.destroy']['types'],
  },
  'worlds.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/worlds',
    tokens: [{"old":"/api/v1/worlds","type":0,"val":"api","end":""},{"old":"/api/v1/worlds","type":0,"val":"v1","end":""},{"old":"/api/v1/worlds","type":0,"val":"worlds","end":""}],
    types: placeholder as Registry['worlds.index']['types'],
  },
  'worlds.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/worlds/:slug',
    tokens: [{"old":"/api/v1/worlds/:slug","type":0,"val":"api","end":""},{"old":"/api/v1/worlds/:slug","type":0,"val":"v1","end":""},{"old":"/api/v1/worlds/:slug","type":0,"val":"worlds","end":""},{"old":"/api/v1/worlds/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['worlds.show']['types'],
  },
  'worlds.store_character': {
    methods: ["POST"],
    pattern: '/api/v1/worlds/:slug/characters',
    tokens: [{"old":"/api/v1/worlds/:slug/characters","type":0,"val":"api","end":""},{"old":"/api/v1/worlds/:slug/characters","type":0,"val":"v1","end":""},{"old":"/api/v1/worlds/:slug/characters","type":0,"val":"worlds","end":""},{"old":"/api/v1/worlds/:slug/characters","type":1,"val":"slug","end":""},{"old":"/api/v1/worlds/:slug/characters","type":0,"val":"characters","end":""}],
    types: placeholder as Registry['worlds.store_character']['types'],
  },
  'worlds.update_character': {
    methods: ["PATCH"],
    pattern: '/api/v1/worlds/:slug/characters/:key',
    tokens: [{"old":"/api/v1/worlds/:slug/characters/:key","type":0,"val":"api","end":""},{"old":"/api/v1/worlds/:slug/characters/:key","type":0,"val":"v1","end":""},{"old":"/api/v1/worlds/:slug/characters/:key","type":0,"val":"worlds","end":""},{"old":"/api/v1/worlds/:slug/characters/:key","type":1,"val":"slug","end":""},{"old":"/api/v1/worlds/:slug/characters/:key","type":0,"val":"characters","end":""},{"old":"/api/v1/worlds/:slug/characters/:key","type":1,"val":"key","end":""}],
    types: placeholder as Registry['worlds.update_character']['types'],
  },
  'worlds.destroy_character': {
    methods: ["DELETE"],
    pattern: '/api/v1/worlds/:slug/characters/:key',
    tokens: [{"old":"/api/v1/worlds/:slug/characters/:key","type":0,"val":"api","end":""},{"old":"/api/v1/worlds/:slug/characters/:key","type":0,"val":"v1","end":""},{"old":"/api/v1/worlds/:slug/characters/:key","type":0,"val":"worlds","end":""},{"old":"/api/v1/worlds/:slug/characters/:key","type":1,"val":"slug","end":""},{"old":"/api/v1/worlds/:slug/characters/:key","type":0,"val":"characters","end":""},{"old":"/api/v1/worlds/:slug/characters/:key","type":1,"val":"key","end":""}],
    types: placeholder as Registry['worlds.destroy_character']['types'],
  },
  'adventures.store': {
    methods: ["POST"],
    pattern: '/api/v1/worlds/:slug/adventures',
    tokens: [{"old":"/api/v1/worlds/:slug/adventures","type":0,"val":"api","end":""},{"old":"/api/v1/worlds/:slug/adventures","type":0,"val":"v1","end":""},{"old":"/api/v1/worlds/:slug/adventures","type":0,"val":"worlds","end":""},{"old":"/api/v1/worlds/:slug/adventures","type":1,"val":"slug","end":""},{"old":"/api/v1/worlds/:slug/adventures","type":0,"val":"adventures","end":""}],
    types: placeholder as Registry['adventures.store']['types'],
  },
  'adventures.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/adventures/:id',
    tokens: [{"old":"/api/v1/adventures/:id","type":0,"val":"api","end":""},{"old":"/api/v1/adventures/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/adventures/:id","type":0,"val":"adventures","end":""},{"old":"/api/v1/adventures/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['adventures.show']['types'],
  },
  'adventures.submit_turn': {
    methods: ["POST"],
    pattern: '/api/v1/adventures/:id/turns',
    tokens: [{"old":"/api/v1/adventures/:id/turns","type":0,"val":"api","end":""},{"old":"/api/v1/adventures/:id/turns","type":0,"val":"v1","end":""},{"old":"/api/v1/adventures/:id/turns","type":0,"val":"adventures","end":""},{"old":"/api/v1/adventures/:id/turns","type":1,"val":"id","end":""},{"old":"/api/v1/adventures/:id/turns","type":0,"val":"turns","end":""}],
    types: placeholder as Registry['adventures.submit_turn']['types'],
  },
  'adventures.update_npc_debug_state': {
    methods: ["PATCH"],
    pattern: '/api/v1/adventures/:id/npcs/:key/debug-state',
    tokens: [{"old":"/api/v1/adventures/:id/npcs/:key/debug-state","type":0,"val":"api","end":""},{"old":"/api/v1/adventures/:id/npcs/:key/debug-state","type":0,"val":"v1","end":""},{"old":"/api/v1/adventures/:id/npcs/:key/debug-state","type":0,"val":"adventures","end":""},{"old":"/api/v1/adventures/:id/npcs/:key/debug-state","type":1,"val":"id","end":""},{"old":"/api/v1/adventures/:id/npcs/:key/debug-state","type":0,"val":"npcs","end":""},{"old":"/api/v1/adventures/:id/npcs/:key/debug-state","type":1,"val":"key","end":""},{"old":"/api/v1/adventures/:id/npcs/:key/debug-state","type":0,"val":"debug-state","end":""}],
    types: placeholder as Registry['adventures.update_npc_debug_state']['types'],
  },
  'adventures.retry_turn': {
    methods: ["POST"],
    pattern: '/api/v1/adventures/:id/turns/:turnId/retry',
    tokens: [{"old":"/api/v1/adventures/:id/turns/:turnId/retry","type":0,"val":"api","end":""},{"old":"/api/v1/adventures/:id/turns/:turnId/retry","type":0,"val":"v1","end":""},{"old":"/api/v1/adventures/:id/turns/:turnId/retry","type":0,"val":"adventures","end":""},{"old":"/api/v1/adventures/:id/turns/:turnId/retry","type":1,"val":"id","end":""},{"old":"/api/v1/adventures/:id/turns/:turnId/retry","type":0,"val":"turns","end":""},{"old":"/api/v1/adventures/:id/turns/:turnId/retry","type":1,"val":"turnId","end":""},{"old":"/api/v1/adventures/:id/turns/:turnId/retry","type":0,"val":"retry","end":""}],
    types: placeholder as Registry['adventures.retry_turn']['types'],
  },
  'adventures.discard_turn': {
    methods: ["DELETE"],
    pattern: '/api/v1/adventures/:id/turns/:turnId',
    tokens: [{"old":"/api/v1/adventures/:id/turns/:turnId","type":0,"val":"api","end":""},{"old":"/api/v1/adventures/:id/turns/:turnId","type":0,"val":"v1","end":""},{"old":"/api/v1/adventures/:id/turns/:turnId","type":0,"val":"adventures","end":""},{"old":"/api/v1/adventures/:id/turns/:turnId","type":1,"val":"id","end":""},{"old":"/api/v1/adventures/:id/turns/:turnId","type":0,"val":"turns","end":""},{"old":"/api/v1/adventures/:id/turns/:turnId","type":1,"val":"turnId","end":""}],
    types: placeholder as Registry['adventures.discard_turn']['types'],
  },
  'adventures.retry_opening': {
    methods: ["POST"],
    pattern: '/api/v1/adventures/:id/opening/retry',
    tokens: [{"old":"/api/v1/adventures/:id/opening/retry","type":0,"val":"api","end":""},{"old":"/api/v1/adventures/:id/opening/retry","type":0,"val":"v1","end":""},{"old":"/api/v1/adventures/:id/opening/retry","type":0,"val":"adventures","end":""},{"old":"/api/v1/adventures/:id/opening/retry","type":1,"val":"id","end":""},{"old":"/api/v1/adventures/:id/opening/retry","type":0,"val":"opening","end":""},{"old":"/api/v1/adventures/:id/opening/retry","type":0,"val":"retry","end":""}],
    types: placeholder as Registry['adventures.retry_opening']['types'],
  },
  'adventures.reset': {
    methods: ["POST"],
    pattern: '/api/v1/adventures/:id/reset',
    tokens: [{"old":"/api/v1/adventures/:id/reset","type":0,"val":"api","end":""},{"old":"/api/v1/adventures/:id/reset","type":0,"val":"v1","end":""},{"old":"/api/v1/adventures/:id/reset","type":0,"val":"adventures","end":""},{"old":"/api/v1/adventures/:id/reset","type":1,"val":"id","end":""},{"old":"/api/v1/adventures/:id/reset","type":0,"val":"reset","end":""}],
    types: placeholder as Registry['adventures.reset']['types'],
  },
  'adventures.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/adventures/:id',
    tokens: [{"old":"/api/v1/adventures/:id","type":0,"val":"api","end":""},{"old":"/api/v1/adventures/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/adventures/:id","type":0,"val":"adventures","end":""},{"old":"/api/v1/adventures/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['adventures.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
