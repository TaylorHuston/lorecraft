import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('email', 254).notNullable()
      table.string('password').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['email'], { indexName: 'users_email_unique' })
      table.check('email = lower(btrim(email))', {}, 'users_email_normalized')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
