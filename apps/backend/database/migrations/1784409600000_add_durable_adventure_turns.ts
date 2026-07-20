import { BaseSchema } from '@adonisjs/lucid/schema'

const turnRequestIdentityConstraint = 'adventure_turns_adventure_id_request_id_unique'
const turnAdventureOwnershipConstraint = 'adventure_turns_adventure_id_id_unique'
const turnSourceRevisionConstraint = 'adventure_turns_source_revision_ownership_foreign'
const turnResultRevisionConstraint = 'adventure_turns_result_revision_ownership_foreign'
const turnJobConstraint = 'adventure_jobs_turn_ownership_foreign'
const oneActiveTurnIndex = 'adventure_turns_one_active_per_adventure'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('adventure_turns', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('adventure_id')
        .notNullable()
        .references('id')
        .inTable('adventures')
        .onDelete('CASCADE')
      table.uuid('request_id').notNullable()
      table.string('trigger', 16).notNullable()
      table.text('input').nullable()
      table.string('status', 32).notNullable()
      table.uuid('source_revision_id').notNullable()
      table.uuid('result_revision_id').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['adventure_id', 'request_id'], {
        indexName: turnRequestIdentityConstraint,
      })
      table.unique(['adventure_id', 'id'], {
        indexName: turnAdventureOwnershipConstraint,
      })
      table
        .foreign(['adventure_id', 'source_revision_id'], turnSourceRevisionConstraint)
        .references(['adventure_id', 'id'])
        .inTable('adventure_revisions')
        .onDelete('RESTRICT')
      table
        .foreign(['adventure_id', 'result_revision_id'], turnResultRevisionConstraint)
        .references(['adventure_id', 'id'])
        .inTable('adventure_revisions')
        .onDelete('RESTRICT')
      table.check("trigger IN ('act', 'pass', 'guide')", {}, 'adventure_turns_trigger_check')
      table.check(
        "status IN ('pending', 'processing', 'succeeded', 'failed')",
        {},
        'adventure_turns_status_check'
      )
      table.check(
        "(trigger = 'pass' AND input IS NULL) OR (trigger IN ('act', 'guide') AND input IS NOT NULL AND length(btrim(input)) > 0)",
        {},
        'adventure_turns_trigger_input_check'
      )
      table.check(
        "(trigger <> 'act' OR length(input) <= 4000) AND (trigger <> 'guide' OR length(input) <= 1200)",
        {},
        'adventure_turns_input_length_check'
      )
    })
    this.schema.raw(`
      CREATE UNIQUE INDEX ${oneActiveTurnIndex}
      ON adventure_turns (adventure_id)
      WHERE status IN ('pending', 'processing')
    `)

    this.schema.alterTable('adventure_jobs', (table) => {
      table.uuid('turn_id').nullable()
      table
        .foreign(['adventure_id', 'turn_id'], turnJobConstraint)
        .references(['adventure_id', 'id'])
        .inTable('adventure_turns')
        .onDelete('CASCADE')
    })
    this.schema.raw('ALTER TABLE adventure_jobs DROP CONSTRAINT adventure_jobs_type_check')
    this.schema.raw(
      "ALTER TABLE adventure_jobs ADD CONSTRAINT adventure_jobs_type_check CHECK (type IN ('opening', 'turn'))"
    )
    this.schema.raw(`
      ALTER TABLE adventure_jobs
      ADD CONSTRAINT adventure_jobs_turn_shape_check
      CHECK (
        (type = 'opening' AND turn_id IS NULL) OR
        (type = 'turn' AND turn_id IS NOT NULL)
      )
    `)
    this.schema.raw(`
      CREATE UNIQUE INDEX adventure_jobs_one_active_turn_job_per_turn
      ON adventure_jobs (turn_id)
      WHERE type = 'turn' AND status IN ('pending', 'processing')
    `)
  }

  async down() {
    const installedTurn = await this.db.from('adventure_turns').select('id').first()
    if (installedTurn) {
      throw new Error('Cannot remove durable Adventure turns while they contain data.')
    }

    this.schema.raw('DROP INDEX IF EXISTS adventure_jobs_one_active_turn_job_per_turn')
    this.schema.raw('ALTER TABLE adventure_jobs DROP CONSTRAINT adventure_jobs_turn_shape_check')
    this.schema.raw('ALTER TABLE adventure_jobs DROP CONSTRAINT adventure_jobs_type_check')
    this.schema.raw(
      "ALTER TABLE adventure_jobs ADD CONSTRAINT adventure_jobs_type_check CHECK (type IN ('opening'))"
    )
    this.schema.alterTable('adventure_jobs', (table) => {
      table.dropForeign(['adventure_id', 'turn_id'], turnJobConstraint)
      table.dropColumn('turn_id')
    })
    this.schema.dropTable('adventure_turns')
  }
}
