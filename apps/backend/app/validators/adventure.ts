import vine from '@vinejs/vine'
import { characterFieldLimits } from '#services/character_field_limits'

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

/** Development-only editor input for Adventure-owned NPC state, never World canon. */
export const updateAdventureNpcStateValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(characterFieldLimits.name),
  currentLocationKey: vine.string().trim().minLength(1).maxLength(characterFieldLimits.key),
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
  mood: vine.string().trim().minLength(1).maxLength(characterFieldLimits.initialMood),
  status: vine.string().trim().minLength(1).maxLength(characterFieldLimits.initialStatus),
  memory: vine.string().trim().minLength(1).maxLength(characterFieldLimits.initialMemory),
})

/** Development-only editor input for Adventure-owned Player state, never World canon. */
export const updateAdventurePlayerStateValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(100),
  currentLocationKey: vine.string().trim().minLength(1).maxLength(100),
  physicalDescription: vine.string().trim().maxLength(2_000),
  backstory: vine.string().trim().maxLength(8_000),
  status: vine.string().trim().maxLength(1_000),
})
