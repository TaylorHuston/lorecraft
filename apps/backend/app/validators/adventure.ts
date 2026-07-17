import vine from '@vinejs/vine'

export const createAdventureValidator = vine.create({
  creationRequestId: vine.string().trim().uuid(),
  player: vine.object({
    name: vine.string().trim().minLength(1).maxLength(100),
    physicalDescription: vine.string().trim().maxLength(2_000).optional(),
    backstory: vine.string().trim().maxLength(8_000).optional(),
  }),
})
