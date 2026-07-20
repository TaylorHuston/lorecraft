import { BaseSchema } from '@adonisjs/lucid/schema'

const mutationRevisionConstraint = 'adventure_revision_mutations_revision_ownership_foreign'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('adventure_character_states', (table) => {
      table
        .uuid('adventure_id')
        .notNullable()
        .references('id')
        .inTable('adventures')
        .onDelete('CASCADE')
      table.string('character_key', 100).notNullable()
      table.string('current_location_key', 100).notNullable()
      table.string('mood', 500).notNullable().defaultTo('')
      table.string('status', 1_000).notNullable().defaultTo('')
      table.string('memory', 2_000).notNullable().defaultTo('')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.primary(['adventure_id', 'character_key'])
      table.index(
        ['adventure_id', 'current_location_key'],
        'adventure_character_states_location_index'
      )
      table.check(
        'length(btrim(character_key)) > 0',
        {},
        'adventure_character_states_character_key_check'
      )
      table.check(
        'length(btrim(current_location_key)) > 0',
        {},
        'adventure_character_states_current_location_key_check'
      )
    })

    this.schema.createTable('adventure_revision_mutations', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('adventure_id')
        .notNullable()
        .references('id')
        .inTable('adventures')
        .onDelete('CASCADE')
      table.uuid('revision_id').notNullable()
      table.integer('sequence').notNullable()
      table.boolean('accepted').notNullable()
      table.string('actor_type', 16).notNullable()
      table.string('actor_key', 100).nullable()
      table.string('field', 32).notNullable()
      table.string('previous_value', 2_000).nullable()
      table.string('resulting_value', 2_000).nullable()
      table.string('rejection_code', 100).nullable()
      table.timestamp('created_at').notNullable()

      table
        .foreign(['adventure_id', 'revision_id'], mutationRevisionConstraint)
        .references(['adventure_id', 'id'])
        .inTable('adventure_revisions')
        .onDelete('CASCADE')
      table.unique(['revision_id', 'sequence'], {
        indexName: 'adventure_revision_mutations_revision_id_sequence_unique',
      })
      table.check('sequence >= 0', {}, 'adventure_revision_mutations_sequence_check')
      table.check(
        "actor_type IN ('player', 'character', 'unknown')",
        {},
        'adventure_revision_mutations_actor_type_check'
      )
      table.check(
        "field IN ('current_location_key', 'mood', 'status', 'memory', 'unknown')",
        {},
        'adventure_revision_mutations_field_check'
      )
      table.check(
        "(actor_type = 'player' AND actor_key IS NULL) OR (actor_type = 'character' AND actor_key IS NOT NULL AND length(btrim(actor_key)) > 0) OR (actor_type = 'unknown' AND actor_key IS NULL)",
        {},
        'adventure_revision_mutations_actor_shape_check'
      )
      table.check(
        '(accepted AND rejection_code IS NULL AND previous_value IS NOT NULL AND resulting_value IS NOT NULL) OR (NOT accepted AND rejection_code IS NOT NULL AND length(btrim(rejection_code)) > 0 AND previous_value IS NULL AND resulting_value IS NULL)',
        {},
        'adventure_revision_mutations_outcome_shape_check'
      )
      table.check(
        "NOT accepted OR (actor_type IN ('player', 'character') AND field <> 'unknown' AND (actor_type <> 'player' OR field = 'current_location_key'))",
        {},
        'adventure_revision_mutations_accepted_allowlist_check'
      )
      table.check(
        "NOT accepted OR (field <> 'current_location_key' OR (length(btrim(previous_value)) > 0 AND length(btrim(resulting_value)) > 0))",
        {},
        'adventure_revision_mutations_location_value_check'
      )
      table.check(
        "NOT accepted OR (field <> 'current_location_key' OR (length(previous_value) <= 100 AND length(resulting_value) <= 100))",
        {},
        'adventure_revision_mutations_location_value_length_check'
      )
      table.check(
        "NOT accepted OR (field <> 'mood' OR (length(previous_value) <= 500 AND length(resulting_value) <= 500))",
        {},
        'adventure_revision_mutations_mood_value_length_check'
      )
      table.check(
        "NOT accepted OR (field <> 'status' OR (length(previous_value) <= 1000 AND length(resulting_value) <= 1000))",
        {},
        'adventure_revision_mutations_status_value_length_check'
      )
    })

    this.schema.raw(`
      CREATE FUNCTION reject_adventure_revision_mutation_update()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RAISE EXCEPTION 'Adventure revision mutations are immutable.';
      END;
      $$
    `)
    this.schema.raw(`
      CREATE TRIGGER adventure_revision_mutations_reject_update
      BEFORE UPDATE ON adventure_revision_mutations
      FOR EACH ROW EXECUTE FUNCTION reject_adventure_revision_mutation_update()
    `)
  }

  async down() {
    const installedState = await this.db
      .from('adventure_character_states')
      .select('adventure_id')
      .first()
    const installedMutation = await this.db
      .from('adventure_revision_mutations')
      .select('id')
      .first()
    if (installedState || installedMutation) {
      throw new Error('Cannot remove Adventure mutation state while it contains data.')
    }

    this.schema.dropTable('adventure_revision_mutations')
    this.schema.raw('DROP FUNCTION reject_adventure_revision_mutation_update()')
    this.schema.dropTable('adventure_character_states')
  }
}
