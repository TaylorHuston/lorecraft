import { isAdventureNpcDebugEditingEnabled } from '#services/adventure_npc_debug_state_service'
import { test } from '@japa/runner'

test('LC-003/S3/R3-S2: production refuses the NPC Debug editor boundary', ({ assert }) => {
  assert.isFalse(isAdventureNpcDebugEditingEnabled('production'))
  assert.isTrue(isAdventureNpcDebugEditingEnabled('development'))
  assert.isTrue(isAdventureNpcDebugEditingEnabled('test'))
})
