import {
  updateAdventureNpcStateValidator,
  updateAdventurePlayerStateValidator,
} from '#validators/adventure'
import { test } from '@japa/runner'

const validNpcState = {
  name: 'Mira',
  currentLocationKey: 'chapel',
  physicalDescription: 'Rain-dark clothes.',
  background: 'A chapel caretaker.',
  personality: 'Watchful.',
  voice: 'Quiet.',
  privateKnowledge: 'She knows the bell.',
  mood: 'm'.repeat(120),
  status: 's'.repeat(320),
  memory: 'r'.repeat(500),
}

test.group('Adventure validation', () => {
  test('LC-003/S3/R3-S2: accepts only complete bounded Debug NPC state', async ({ assert }) => {
    const [validError, output] = await updateAdventureNpcStateValidator.tryValidate(validNpcState)
    assert.isNull(validError)
    assert.deepEqual(output, validNpcState)

    for (const [field, value] of [
      ['currentLocationKey', 'k'.repeat(101)],
      ['mood', 'm'.repeat(121)],
      ['status', 's'.repeat(321)],
      ['memory', 'r'.repeat(501)],
      ['mood', '  '],
      ['status', '  '],
      ['memory', '  '],
    ] as const) {
      const [error] = await updateAdventureNpcStateValidator.tryValidate({
        ...validNpcState,
        [field]: value,
      })
      assert.isNotNull(error)
      assert.include(
        error!.messages.map((message: { field: string }) => message.field),
        field
      )
    }
  })

  test('LC-003/S1/R5-S3: bounds complete Debug Player state while allowing empty optional profile text', async ({
    assert,
  }) => {
    const validPlayerState = {
      name: 'Elara',
      currentLocationKey: 'chapel',
      physicalDescription: '',
      backstory: '',
      status: 's'.repeat(1_000),
    }
    const [validError, output] =
      await updateAdventurePlayerStateValidator.tryValidate(validPlayerState)
    assert.isNull(validError)
    assert.deepEqual(output, validPlayerState)

    for (const [field, value] of [
      ['name', '  '],
      ['currentLocationKey', '  '],
      ['physicalDescription', 'p'.repeat(2_001)],
      ['backstory', 'b'.repeat(8_001)],
      ['status', 's'.repeat(1_001)],
    ] as const) {
      const [error] = await updateAdventurePlayerStateValidator.tryValidate({
        ...validPlayerState,
        [field]: value,
      })
      assert.isNotNull(error)
      assert.include(
        error!.messages.map((message: { field: string }) => message.field),
        field
      )
    }
  })
})
