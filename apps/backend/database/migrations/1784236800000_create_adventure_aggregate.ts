import { BaseSchema } from '@adonisjs/lucid/schema'

const ownerCreationRequestConstraint = 'adventures_owner_id_creation_request_id_unique'
const adventureWorldVersionConstraint = 'adventures_world_version_world_foreign'
const revisionIdentityConstraint = 'adventure_revisions_adventure_id_id_unique'
const revisionParentConstraint = 'adventure_revisions_parent_ownership_foreign'
const storyRevisionConstraint = 'adventure_story_entries_revision_ownership_foreign'
const headRevisionConstraint = 'adventures_head_revision_id_foreign'
const oneActiveOpeningJobIndex = 'adventure_jobs_one_active_opening_per_adventure'
const jobIdentityConstraint = 'adventure_jobs_adventure_id_id_unique'
const modelCallIdentityConstraint = 'model_calls_adventure_id_job_id_id_unique'
const modelCallJobConstraint = 'model_calls_job_ownership_foreign'
const modelCallRetryConstraint = 'model_calls_retry_ownership_foreign'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('adventures', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .integer('owner_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table
        .integer('world_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('worlds')
        .onDelete('RESTRICT')
      table.uuid('world_version_id').notNullable()
      table.string('starting_point_key', 100).notNullable()
      table.uuid('creation_request_id').notNullable()
      table.string('status', 32).notNullable()
      table.integer('generation').notNullable().defaultTo(1)
      table.integer('turn_count').notNullable().defaultTo(0)
      table.uuid('head_revision_id').nullable()
      table.timestamp('last_played_at').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['owner_id', 'creation_request_id'], {
        indexName: ownerCreationRequestConstraint,
      })
      table
        .foreign(['world_version_id', 'world_id'], adventureWorldVersionConstraint)
        .references(['id', 'world_id'])
        .inTable('world_versions')
        .onDelete('RESTRICT')
      table.check(
        "status IN ('opening_pending', 'opening_processing', 'opening_failed', 'ready')",
        {},
        'adventures_status_check'
      )
      table.check('generation > 0', {}, 'adventures_generation_check')
      table.check('turn_count >= 0', {}, 'adventures_turn_count_check')
      table.check(
        'length(btrim(starting_point_key)) > 0',
        {},
        'adventures_starting_point_key_check'
      )
    })

    this.schema.createTable('adventure_players', (table) => {
      table
        .uuid('adventure_id')
        .primary()
        .references('id')
        .inTable('adventures')
        .onDelete('CASCADE')
      table.string('name', 100).notNullable()
      table.string('physical_description', 2_000).nullable()
      table.string('backstory', 8_000).nullable()
      table.string('status', 1_000).notNullable().defaultTo('')
      table.string('current_location_key', 100).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.check('length(btrim(name)) > 0', {}, 'adventure_players_name_check')
      table.check(
        'length(btrim(current_location_key)) > 0',
        {},
        'adventure_players_current_location_key_check'
      )
    })

    this.schema.createTable('adventure_jobs', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('adventure_id')
        .notNullable()
        .references('id')
        .inTable('adventures')
        .onDelete('CASCADE')
      table.integer('generation').notNullable()
      table.string('type', 32).notNullable()
      table.string('status', 32).notNullable()
      table.integer('attempt_count').notNullable().defaultTo(0)
      table.timestamp('available_at').notNullable()
      table.string('lease_owner', 200).nullable()
      table.timestamp('lease_expires_at').nullable()
      table.string('failure_code', 100).nullable()
      table.text('failure_message').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['adventure_id', 'id'], {
        indexName: jobIdentityConstraint,
        useConstraint: true,
      })
      table.index(['status', 'available_at'], 'adventure_jobs_status_available_at_index')
      table.check('generation > 0', {}, 'adventure_jobs_generation_check')
      table.check('attempt_count >= 0', {}, 'adventure_jobs_attempt_count_check')
      table.check("type IN ('opening')", {}, 'adventure_jobs_type_check')
      table.check(
        "status IN ('pending', 'processing', 'succeeded', 'failed')",
        {},
        'adventure_jobs_status_check'
      )
      table.check(
        '(lease_owner IS NULL) = (lease_expires_at IS NULL)',
        {},
        'adventure_jobs_lease_check'
      )
    })
    this.schema.raw(`
      CREATE UNIQUE INDEX ${oneActiveOpeningJobIndex}
      ON adventure_jobs (adventure_id)
      WHERE type = 'opening' AND status IN ('pending', 'processing')
    `)

    this.schema.createTable('model_calls', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('adventure_id')
        .notNullable()
        .references('id')
        .inTable('adventures')
        .onDelete('CASCADE')
      table.uuid('job_id').notNullable()
      table.string('operation', 100).notNullable()
      table.jsonb('redacted_request').notNullable()
      table.text('raw_response').nullable()
      table.string('provider', 100).notNullable()
      table.string('model', 200).notNullable()
      table.jsonb('settings').notNullable()
      table.string('status', 32).notNullable()
      table.timestamp('started_at').notNullable()
      table.timestamp('completed_at').nullable()
      table.integer('duration_ms').nullable()
      table.uuid('retry_of_model_call_id').nullable()
      table.string('failure_code', 100).nullable()
      table.text('failure_message').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['adventure_id', 'job_id', 'id'], {
        indexName: modelCallIdentityConstraint,
        useConstraint: true,
      })
      table
        .foreign(['adventure_id', 'job_id'], modelCallJobConstraint)
        .references(['adventure_id', 'id'])
        .inTable('adventure_jobs')
        .onDelete('CASCADE')
      table
        .foreign(['adventure_id', 'job_id', 'retry_of_model_call_id'], modelCallRetryConstraint)
        .references(['adventure_id', 'job_id', 'id'])
        .inTable('model_calls')
        .onDelete('CASCADE')
      table.check('length(btrim(operation)) > 0', {}, 'model_calls_operation_check')
      table.check('length(btrim(provider)) > 0', {}, 'model_calls_provider_check')
      table.check('length(btrim(model)) > 0', {}, 'model_calls_model_check')
      table.check("status IN ('processing', 'succeeded', 'failed')", {}, 'model_calls_status_check')
      table.check('duration_ms >= 0', {}, 'model_calls_duration_ms_check')
      table.check('(completed_at IS NULL) = (duration_ms IS NULL)', {}, 'model_calls_timing_check')
    })

    this.schema.createTable('adventure_revisions', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('adventure_id')
        .notNullable()
        .references('id')
        .inTable('adventures')
        .onDelete('CASCADE')
      table.integer('sequence').notNullable()
      table.string('kind', 32).notNullable()
      table.uuid('parent_revision_id').nullable()
      table.timestamp('created_at').notNullable()

      table.unique(['adventure_id', 'id'], {
        indexName: revisionIdentityConstraint,
        useConstraint: true,
      })
      table.unique(['adventure_id', 'sequence'], {
        indexName: 'adventure_revisions_adventure_id_sequence_unique',
      })
      table
        .foreign(['adventure_id', 'parent_revision_id'], revisionParentConstraint)
        .references(['adventure_id', 'id'])
        .inTable('adventure_revisions')
        .onDelete('CASCADE')
      table.check('sequence >= 0', {}, 'adventure_revisions_sequence_check')
      table.check('length(btrim(kind)) > 0', {}, 'adventure_revisions_kind_check')
    })

    this.schema.createTable('adventure_story_entries', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('adventure_id')
        .notNullable()
        .references('id')
        .inTable('adventures')
        .onDelete('CASCADE')
      table.uuid('revision_id').notNullable()
      table.integer('sequence').notNullable()
      table.string('kind', 32).notNullable()
      table.text('content').notNullable()
      table.timestamp('created_at').notNullable()

      table
        .foreign(['adventure_id', 'revision_id'], storyRevisionConstraint)
        .references(['adventure_id', 'id'])
        .inTable('adventure_revisions')
        .onDelete('CASCADE')
      table.unique(['revision_id', 'sequence'], {
        indexName: 'adventure_story_entries_revision_id_sequence_unique',
      })
      table.check('sequence >= 0', {}, 'adventure_story_entries_sequence_check')
      table.check('length(btrim(kind)) > 0', {}, 'adventure_story_entries_kind_check')
      table.check('length(btrim(content)) > 0', {}, 'adventure_story_entries_content_check')
    })

    this.schema.alterTable('adventures', (table) => {
      table
        .foreign('head_revision_id', headRevisionConstraint)
        .references('id')
        .inTable('adventure_revisions')
        .onDelete('SET NULL')
    })

    this.schema.raw(`
      CREATE FUNCTION enforce_adventure_head_revision_ownership()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        IF NEW.head_revision_id IS NOT NULL AND NOT EXISTS (
          SELECT 1
          FROM adventure_revisions
          WHERE id = NEW.head_revision_id
            AND adventure_id = NEW.id
        ) THEN
          RAISE EXCEPTION 'adventures_head_revision_ownership_foreign';
        END IF;
        RETURN NEW;
      END;
      $$
    `)
    this.schema.raw(`
      CREATE TRIGGER adventures_enforce_head_revision_ownership
      BEFORE INSERT OR UPDATE OF id, head_revision_id ON adventures
      FOR EACH ROW EXECUTE FUNCTION enforce_adventure_head_revision_ownership()
    `)

    this.schema.raw(`
      CREATE FUNCTION reject_adventure_revision_update()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RAISE EXCEPTION 'Adventure revisions are immutable.';
      END;
      $$
    `)
    this.schema.raw(`
      CREATE TRIGGER adventure_revisions_reject_update
      BEFORE UPDATE ON adventure_revisions
      FOR EACH ROW EXECUTE FUNCTION reject_adventure_revision_update()
    `)

    this.schema.raw(`
      CREATE FUNCTION reject_adventure_story_entry_update()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RAISE EXCEPTION 'Adventure story entries are immutable.';
      END;
      $$
    `)
    this.schema.raw(`
      CREATE TRIGGER adventure_story_entries_reject_update
      BEFORE UPDATE ON adventure_story_entries
      FOR EACH ROW EXECUTE FUNCTION reject_adventure_story_entry_update()
    `)
  }

  async down() {
    const installedAdventure = await this.db.from('adventures').select('id').first()
    if (installedAdventure) {
      throw new Error('Cannot remove the Adventure aggregate while it contains data.')
    }

    this.schema.dropTable('adventure_story_entries')
    this.schema.alterTable('adventures', (table) => {
      table.dropForeign('head_revision_id', headRevisionConstraint)
    })
    this.schema.raw('DROP TRIGGER adventures_enforce_head_revision_ownership ON adventures')
    this.schema.dropTable('adventure_revisions')
    this.schema.raw('DROP FUNCTION reject_adventure_story_entry_update()')
    this.schema.raw('DROP FUNCTION reject_adventure_revision_update()')
    this.schema.raw('DROP FUNCTION enforce_adventure_head_revision_ownership()')
    this.schema.dropTable('model_calls')
    this.schema.dropTable('adventure_jobs')
    this.schema.dropTable('adventure_players')
    this.schema.dropTable('adventures')
  }
}
