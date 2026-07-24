import { isAdventureNpcDebugEditingEnabled } from '#services/adventure_npc_debug_state_service'
import { isAdventurePlayerDebugEditingEnabled } from '#services/adventure_player_debug_state_service'
import { test } from '@japa/runner'

test('LC-003/S3/R3-S2: production refuses the NPC Debug editor boundary', ({ assert }) => {
  assert.isFalse(isAdventureNpcDebugEditingEnabled('production'))
  assert.isTrue(isAdventureNpcDebugEditingEnabled('development'))
  assert.isTrue(isAdventureNpcDebugEditingEnabled('test'))
})

test('LC-003/S1/R5-S7: production refuses the Player Debug editor boundary', ({ assert }) => {
  assert.isFalse(isAdventurePlayerDebugEditingEnabled('production'))
  assert.isTrue(isAdventurePlayerDebugEditingEnabled('development'))
  assert.isTrue(isAdventurePlayerDebugEditingEnabled('test'))
})
