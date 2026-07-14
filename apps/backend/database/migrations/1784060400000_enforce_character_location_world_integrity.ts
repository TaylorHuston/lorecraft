import { BaseSchema } from '@adonisjs/lucid/schema'

const locationWorldConstraint = 'locations_world_id_id_unique'
const characterLocationWorldConstraint = 'characters_world_id_location_id_foreign'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const mismatch = await db
        .from('characters as character')
        .innerJoin('locations as location', 'location.id', 'character.location_id')
        .whereRaw('character.world_id <> location.world_id')
        .select('character.id')
        .first()

      if (mismatch) {
        throw new Error(
          'Cannot enforce Character Location World integrity while cross-World assignments exist.'
        )
      }
    })

    this.schema.alterTable('locations', (table) => {
      table.unique(['world_id', 'id'], {
        indexName: locationWorldConstraint,
        useConstraint: true,
      })
    })

    this.schema.alterTable('characters', (table) => {
      table
        .foreign(['world_id', 'location_id'], characterLocationWorldConstraint)
        .references(['world_id', 'id'])
        .inTable('locations')
        .onDelete('RESTRICT')
    })
  }

  async down() {
    this.schema.alterTable('characters', (table) => {
      table.dropForeign(['world_id', 'location_id'], characterLocationWorldConstraint)
    })

    this.schema.alterTable('locations', (table) => {
      table.dropUnique(['world_id', 'id'], locationWorldConstraint)
    })
  }
}
