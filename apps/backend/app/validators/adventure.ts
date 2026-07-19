import vine from '@vinejs/vine'

export const ACT_INPUT_MAX_LENGTH = 4_000
export const GUIDE_INPUT_MAX_LENGTH = 1_200

export const createAdventureValidator = vine.create({
  creationRequestId: vine.string().trim().uuid(),
  player: vine.object({
    name: vine.string().trim().minLength(1).maxLength(100),
    physicalDescription: vine.string().trim().maxLength(2_000).optional(),
    backstory: vine.string().trim().maxLength(8_000).optional(),
  }),
})

export const submitAdventureTurnValidator = vine.create(
  vine
    .object({
      requestId: vine.string().trim().uuid(),
      trigger: vine.enum(['act', 'pass', 'guide'] as const),
      // Keep the optional field in the static request shape; the conditional
      // group below supplies the trigger-specific requiredness and bounds.
      input: vine.string().trim().maxLength(ACT_INPUT_MAX_LENGTH).optional(),
    })
    .merge(
      vine.group([
        vine.group.if((value) => value.trigger === 'act', {
          input: vine.string().trim().minLength(1).maxLength(ACT_INPUT_MAX_LENGTH),
        }),
        vine.group.if((value) => value.trigger === 'guide', {
          input: vine.string().trim().minLength(1).maxLength(GUIDE_INPUT_MAX_LENGTH),
        }),
        vine.group.if((value) => value.trigger === 'pass', {
          input: vine.string().trim().maxLength(0).optional(),
        }),
      ])
    )
)
