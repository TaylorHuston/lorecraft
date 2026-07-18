import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('worlds', (table) => {
      table.increments('id').notNullable()
      table
        .integer('author_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.string('slug', 100).notNullable()
      table.string('name', 200).notNullable()
      table.text('description').notNullable()
      table.string('visibility', 16).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['slug'], { indexName: 'worlds_slug_unique' })
      table.index(['author_id'], 'worlds_author_id_index')
      table.index(['visibility'], 'worlds_visibility_index')
      table.check("visibility IN ('public', 'private')", {}, 'worlds_visibility_check')
    })

    this.schema.createTable('locations', (table) => {
      table.increments('id').notNullable()
      table
        .integer('world_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('worlds')
        .onDelete('CASCADE')
      table.string('key', 100).notNullable()
      table.string('name', 200).notNullable()
      table.text('description').notNullable()
      table.integer('sort_order').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['world_id', 'key'], { indexName: 'locations_world_id_key_unique' })
    })

    this.schema.createTable('characters', (table) => {
      table.increments('id').notNullable()
      table
        .integer('world_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('worlds')
        .onDelete('CASCADE')
      table
        .integer('location_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('locations')
        .onDelete('RESTRICT')
      table.string('key', 100).notNullable()
      table.string('name', 200).notNullable()
      table.text('physical_description').notNullable()
      table.text('background').notNullable()
      table.text('personality').notNullable()
      table.text('voice').notNullable()
      table.text('private_knowledge').notNullable()
      table.integer('sort_order').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['world_id', 'key'], { indexName: 'characters_world_id_key_unique' })
      table.index(['location_id'], 'characters_location_id_index')
    })
  }

  async down() {
    this.schema.dropTable('characters')
    this.schema.dropTable('locations')
    this.schema.dropTable('worlds')
  }
}
