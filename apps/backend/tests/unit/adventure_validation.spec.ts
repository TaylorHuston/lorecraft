import { updateAdventureNpcStateValidator } from '#validators/adventure'
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
  test('LC-003/S3/R3-S1: accepts only complete bounded Debug NPC state', async ({ assert }) => {
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
})
