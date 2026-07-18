import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE users
        SET email = lower(btrim(email))
        WHERE email <> lower(btrim(email))
      `)
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.check('email = lower(btrim(email))', {}, 'users_email_normalized')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropChecks('users_email_normalized')
    })
  }
}
