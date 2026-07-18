import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('model_calls', (table) => {
      table.jsonb('request_metadata').notNullable().defaultTo('{}')
      table.jsonb('response_metadata').notNullable().defaultTo('{}')
      table.dropColumn('redacted_request')
      table.dropColumn('raw_response')
    })
  }

  async down() {
    this.schema.alterTable('model_calls', (table) => {
      table.jsonb('redacted_request').notNullable().defaultTo('{}')
      table.text('raw_response').nullable()
      table.dropColumn('request_metadata')
      table.dropColumn('response_metadata')
    })
  }
}
