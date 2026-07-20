import vine from '@vinejs/vine'

export const characterFieldLimits = {
  key: 100,
  name: 100,
  physicalDescription: 320,
  background: 700,
  personality: 320,
  voice: 240,
  privateKnowledge: 700,
  initialMood: 120,
  initialStatus: 320,
  initialMemory: 500,
} as const

const completeCard = {
  name: vine.string().trim().minLength(1).maxLength(characterFieldLimits.name),
  locationKey: vine.string().trim().minLength(1).maxLength(characterFieldLimits.key),
  physicalDescription: vine
    .string()
    .trim()
    .minLength(1)
    .maxLength(characterFieldLimits.physicalDescription),
  background: vine.string().trim().minLength(1).maxLength(characterFieldLimits.background),
  personality: vine.string().trim().minLength(1).maxLength(characterFieldLimits.personality),
  voice: vine.string().trim().minLength(1).maxLength(characterFieldLimits.voice),
  privateKnowledge: vine
    .string()
    .trim()
    .minLength(1)
    .maxLength(characterFieldLimits.privateKnowledge),
  initialMood: vine.string().trim().minLength(1).maxLength(characterFieldLimits.initialMood),
  initialStatus: vine.string().trim().minLength(1).maxLength(characterFieldLimits.initialStatus),
  initialMemory: vine.string().trim().minLength(1).maxLength(characterFieldLimits.initialMemory),
}

export const createCharacterValidator = vine.create({
  key: vine
    .string()
    .trim()
    .minLength(1)
    .maxLength(characterFieldLimits.key)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  ...completeCard,
})
export const updateCharacterValidator = vine.create(completeCard)
