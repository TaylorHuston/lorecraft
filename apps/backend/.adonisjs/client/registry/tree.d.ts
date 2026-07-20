/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  healthChecks: {
    live: typeof routes['health_checks.live']
    ready: typeof routes['health_checks.ready']
  }
  auth: {
    csrf: typeof routes['auth.csrf']
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    sessions: {
      store: typeof routes['auth.sessions.store']
    }
  }
  account: {
    profile: {
      show: typeof routes['account.profile.show']
    }
    sessions: {
      destroy: typeof routes['account.sessions.destroy']
    }
  }
  worlds: {
    index: typeof routes['worlds.index']
    show: typeof routes['worlds.show']
  }
  adventures: {
    store: typeof routes['adventures.store']
    show: typeof routes['adventures.show']
    submitTurn: typeof routes['adventures.submit_turn']
    retryTurn: typeof routes['adventures.retry_turn']
    discardTurn: typeof routes['adventures.discard_turn']
    retryOpening: typeof routes['adventures.retry_opening']
    reset: typeof routes['adventures.reset']
    destroy: typeof routes['adventures.destroy']
  }
}
