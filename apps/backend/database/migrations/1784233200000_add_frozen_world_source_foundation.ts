import { BaseSchema } from '@adonisjs/lucid/schema'

const startingPointLocationConstraint = 'world_starting_points_world_id_location_id_foreign'
const oneDefaultStartingPointIndex = 'world_starting_points_one_default_per_world'
const worldVersionIdentityConstraint = 'world_versions_id_world_id_unique'
const currentWorldVersionConstraint = 'worlds_current_version_world_id_foreign'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('worlds', (table) => {
      table.text('adventure_guidance').notNullable().defaultTo('')
      table.uuid('current_version_id').nullable()
    })

    this.schema.createTable('world_starting_points', (table) => {
      table.increments('id').notNullable()
      table
        .integer('world_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('worlds')
        .onDelete('CASCADE')
      table.integer('location_id').unsigned().notNullable()
      table.string('key', 100).notNullable()
      table.string('name', 200).notNullable()
      table.text('opening_premise').notNullable()
      table.integer('sort_order').notNullable()
      table.boolean('is_default').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['world_id', 'key'], {
        indexName: 'world_starting_points_world_id_key_unique',
      })
      table
        .foreign(['world_id', 'location_id'], startingPointLocationConstraint)
        .references(['world_id', 'id'])
        .inTable('locations')
        .onDelete('RESTRICT')
      table.check(
        'length(btrim(opening_premise)) > 0',
        {},
        'world_starting_points_opening_premise_check'
      )
    })
    this.schema.raw(
      `CREATE UNIQUE INDEX ${oneDefaultStartingPointIndex} ON world_starting_points (world_id) WHERE is_default`
    )

    this.schema.createTable('world_versions', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .integer('world_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('worlds')
        .onDelete('RESTRICT')
      table.integer('ordinal').notNullable()
      table.integer('schema_version').notNullable()
      table.string('content_hash', 64).notNullable()
      table.jsonb('snapshot').notNullable()
      table.timestamp('created_at').notNullable()

      table.unique(['id', 'world_id'], {
        indexName: worldVersionIdentityConstraint,
        useConstraint: true,
      })
      table.unique(['world_id', 'ordinal'], {
        indexName: 'world_versions_world_id_ordinal_unique',
      })
      table.unique(['world_id', 'content_hash'], {
        indexName: 'world_versions_world_id_content_hash_unique',
      })
      table.check('ordinal > 0', {}, 'world_versions_ordinal_check')
      table.check('schema_version > 0', {}, 'world_versions_schema_version_check')
      table.check("content_hash ~ '^[0-9a-f]{64}$'", {}, 'world_versions_content_hash_check')
    })

    this.schema.alterTable('worlds', (table) => {
      table
        .foreign(['current_version_id', 'id'], currentWorldVersionConstraint)
        .references(['id', 'world_id'])
        .inTable('world_versions')
        .onDelete('RESTRICT')
    })

    this.schema.raw(`
      CREATE FUNCTION reject_world_version_mutation()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RAISE EXCEPTION 'WorldVersions are immutable and insert-only.';
      END;
      $$
    `)
    this.schema.raw(`
      CREATE TRIGGER world_versions_reject_mutation
      BEFORE UPDATE OR DELETE ON world_versions
      FOR EACH ROW EXECUTE FUNCTION reject_world_version_mutation()
    `)
  }

  async down() {
    const installedFrozenSources = await this.db
      .from('worlds')
      .leftJoin('world_starting_points', 'world_starting_points.world_id', 'worlds.id')
      .leftJoin('world_versions', 'world_versions.world_id', 'worlds.id')
      .where((query) => {
        query
          .whereNotNull('world_starting_points.id')
          .orWhereNotNull('world_versions.id')
          .orWhereNotNull('worlds.current_version_id')
          .orWhereRaw("worlds.adventure_guidance <> ''")
      })
      .select('worlds.id')
      .first()

    if (installedFrozenSources) {
      throw new Error('Cannot remove the frozen World source foundation while it contains data.')
    }

    this.schema.alterTable('worlds', (table) => {
      table.dropForeign(['current_version_id', 'id'], currentWorldVersionConstraint)
    })
    this.schema.dropTable('world_versions')
    this.schema.raw('DROP FUNCTION reject_world_version_mutation()')
    this.schema.dropTable('world_starting_points')
    this.schema.alterTable('worlds', (table) => {
      table.dropColumn('current_version_id')
      table.dropColumn('adventure_guidance')
    })
  }
}
