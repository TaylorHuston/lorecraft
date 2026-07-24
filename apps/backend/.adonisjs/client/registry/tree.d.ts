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
    storeCharacter: typeof routes['worlds.store_character']
    updateCharacter: typeof routes['worlds.update_character']
    destroyCharacter: typeof routes['worlds.destroy_character']
  }
  adventures: {
    store: typeof routes['adventures.store']
    show: typeof routes['adventures.show']
    submitTurn: typeof routes['adventures.submit_turn']
    updateNpcDebugState: typeof routes['adventures.update_npc_debug_state']
    updatePlayerDebugState: typeof routes['adventures.update_player_debug_state']
    retryTurn: typeof routes['adventures.retry_turn']
    discardTurn: typeof routes['adventures.discard_turn']
    retryOpening: typeof routes['adventures.retry_opening']
    reset: typeof routes['adventures.reset']
    destroy: typeof routes['adventures.destroy']
  }
}
