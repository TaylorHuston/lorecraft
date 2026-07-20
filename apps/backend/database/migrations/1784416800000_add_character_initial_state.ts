import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('characters', (table) => {
      // Existing canonical Characters remain readable; newly authored cards are validated as complete.
      table.string('initial_mood', 120).notNullable().defaultTo('')
      table.string('initial_status', 320).notNullable().defaultTo('')
      table.string('initial_memory', 500).notNullable().defaultTo('')
    })
  }

  async down() {
    const initialState = await this.db
      .from('characters')
      .whereNot('initial_mood', '')
      .orWhereNot('initial_status', '')
      .orWhereNot('initial_memory', '')
      .first()
    if (initialState) {
      throw new Error('Cannot remove Character initial state while it contains authored data.')
    }

    this.schema.alterTable('characters', (table) => {
      table.dropColumn('initial_mood')
      table.dropColumn('initial_status')
      table.dropColumn('initial_memory')
    })
  }
}
