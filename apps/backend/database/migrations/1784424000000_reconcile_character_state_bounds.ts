import { BaseSchema } from '@adonisjs/lucid/schema'

const legacyDefaults = {
  mood: 'No current mood has been recorded yet.',
  status: 'No current status has been recorded yet.',
  memory: 'No interactions with the player have been recorded yet.',
} as const

export default class extends BaseSchema {
  async up() {
    await this.db
      .from('characters')
      .whereRaw("regexp_replace(initial_mood, '[[:space:]]', '', 'g') = ''")
      .update({
        initial_mood: legacyDefaults.mood,
      })
    await this.db
      .from('characters')
      .whereRaw("regexp_replace(initial_status, '[[:space:]]', '', 'g') = ''")
      .update({
        initial_status: legacyDefaults.status,
      })
    await this.db
      .from('characters')
      .whereRaw("regexp_replace(initial_memory, '[[:space:]]', '', 'g') = ''")
      .update({
        initial_memory: legacyDefaults.memory,
      })
    await this.db
      .from('adventure_character_states')
      .whereRaw("regexp_replace(mood, '[[:space:]]', '', 'g') = ''")
      .update({
        mood: legacyDefaults.mood,
      })
    await this.db
      .from('adventure_character_states')
      .whereRaw("regexp_replace(status, '[[:space:]]', '', 'g') = ''")
      .update({
        status: legacyDefaults.status,
      })
    await this.db
      .from('adventure_character_states')
      .whereRaw("regexp_replace(memory, '[[:space:]]', '', 'g') = ''")
      .update({
        memory: legacyDefaults.memory,
      })

    this.schema.raw(`
      ALTER TABLE characters
        ALTER COLUMN initial_mood SET DEFAULT '${legacyDefaults.mood}',
        ALTER COLUMN initial_status SET DEFAULT '${legacyDefaults.status}',
        ALTER COLUMN initial_memory SET DEFAULT '${legacyDefaults.memory}'
    `)
    this.schema.raw(`
      ALTER TABLE characters
        ADD CONSTRAINT character_initial_mood_complete_check
          CHECK (char_length(regexp_replace(initial_mood, '[[:space:]]', '', 'g')) > 0),
        ADD CONSTRAINT character_initial_status_complete_check
          CHECK (char_length(regexp_replace(initial_status, '[[:space:]]', '', 'g')) > 0),
        ADD CONSTRAINT character_initial_memory_complete_check
          CHECK (char_length(regexp_replace(initial_memory, '[[:space:]]', '', 'g')) > 0)
    `)
    this.schema.raw(`
      ALTER TABLE adventure_character_states
        ADD CONSTRAINT adventure_character_state_mood_complete_check
          CHECK (char_length(regexp_replace(mood, '[[:space:]]', '', 'g')) > 0),
        ADD CONSTRAINT adventure_character_state_status_complete_check
          CHECK (char_length(regexp_replace(status, '[[:space:]]', '', 'g')) > 0),
        ADD CONSTRAINT adventure_character_state_memory_complete_check
          CHECK (char_length(regexp_replace(memory, '[[:space:]]', '', 'g')) > 0),
        ADD CONSTRAINT adventure_character_state_mood_length_check
          CHECK (char_length(mood) <= 120),
        ADD CONSTRAINT adventure_character_state_status_length_check
          CHECK (char_length(status) <= 320),
        ADD CONSTRAINT adventure_character_state_memory_length_check
          CHECK (char_length(memory) <= 500)
    `)
  }

  async down() {
    this.schema.raw(`
      ALTER TABLE adventure_character_states
        DROP CONSTRAINT adventure_character_state_memory_length_check,
        DROP CONSTRAINT adventure_character_state_status_length_check,
        DROP CONSTRAINT adventure_character_state_mood_length_check,
        DROP CONSTRAINT adventure_character_state_memory_complete_check,
        DROP CONSTRAINT adventure_character_state_status_complete_check,
        DROP CONSTRAINT adventure_character_state_mood_complete_check
    `)
    this.schema.raw(`
      ALTER TABLE characters
        ALTER COLUMN initial_mood SET DEFAULT '',
        ALTER COLUMN initial_status SET DEFAULT '',
        ALTER COLUMN initial_memory SET DEFAULT '',
        DROP CONSTRAINT character_initial_memory_complete_check,
        DROP CONSTRAINT character_initial_status_complete_check,
        DROP CONSTRAINT character_initial_mood_complete_check
    `)
  }
}
