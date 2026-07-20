import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('adventure_character_states', (table) => {
      table.string('name', 100).nullable()
      table.string('physical_description', 320).nullable()
      table.string('background', 700).nullable()
      table.string('personality', 320).nullable()
      table.string('voice', 240).nullable()
      table.string('private_knowledge', 700).nullable()
    })
  }

  async down() {
    const overrides = await this.db
      .from('adventure_character_states')
      .whereNotNull('name')
      .orWhereNotNull('physical_description')
      .orWhereNotNull('background')
      .orWhereNotNull('personality')
      .orWhereNotNull('voice')
      .orWhereNotNull('private_knowledge')
      .first()
    if (overrides) {
      throw new Error('Cannot remove Adventure NPC debug overrides while they contain data.')
    }

    this.schema.alterTable('adventure_character_states', (table) => {
      table.dropColumns(
        'name',
        'physical_description',
        'background',
        'personality',
        'voice',
        'private_knowledge'
      )
    })
  }
}
