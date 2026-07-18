/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
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
