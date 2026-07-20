import { test } from '@japa/runner'
import ReconcileCharacterStateBounds from '../../database/migrations/1784424000000_reconcile_character_state_bounds.js'
import {
  rollbackMigration,
  runMigration,
  withIsolatedMigrationDatabase,
} from '../helpers/migration_database.js'

test.group('Character state bounds database migration', () => {
  test('LC-003/S1/R4-S2 + S3/R3-S2: preserves authored values, backfills legacy blanks, and enforces complete bounded state', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      await client.schema.createTable('characters', (table) => {
        table.increments('id').primary()
        table.string('initial_mood', 120).notNullable()
        table.string('initial_status', 320).notNullable()
        table.string('initial_memory', 500).notNullable()
      })
      await client.schema.createTable('adventure_character_states', (table) => {
        table.increments('id').primary()
        table.string('mood', 500).notNullable()
        table.string('status', 1_000).notNullable()
        table.string('memory', 2_000).notNullable()
      })
      await client.table('characters').insert([
        { initial_mood: '\t', initial_status: '\n', initial_memory: '   ' },
        {
          initial_mood: 'Wary.',
          initial_status: 'Keeping watch.',
          initial_memory: 'Has not met the player.',
        },
      ])
      await client.table('adventure_character_states').insert([
        { mood: '\t', status: '\n', memory: '   ' },
        {
          mood: 'Alert.',
          status: 'Watching the door.',
          memory: 'The player arrived in the rain.',
        },
      ])

      await runMigration(
        client,
        ReconcileCharacterStateBounds,
        '1784424000000_reconcile_character_state_bounds'
      )
      await client.table('characters').insert({})

      const characters = await client.from('characters').orderBy('id')
      const states = await client.from('adventure_character_states').orderBy('id')
      assert.deepInclude(characters[0], {
        initial_mood: 'No current mood has been recorded yet.',
        initial_status: 'No current status has been recorded yet.',
        initial_memory: 'No interactions with the player have been recorded yet.',
      })
      assert.deepInclude(characters[1], {
        initial_mood: 'Wary.',
        initial_status: 'Keeping watch.',
        initial_memory: 'Has not met the player.',
      })
      assert.deepInclude(characters[2], {
        initial_mood: 'No current mood has been recorded yet.',
        initial_status: 'No current status has been recorded yet.',
        initial_memory: 'No interactions with the player have been recorded yet.',
      })
      assert.deepInclude(states[0], {
        mood: 'No current mood has been recorded yet.',
        status: 'No current status has been recorded yet.',
        memory: 'No interactions with the player have been recorded yet.',
      })
      assert.deepInclude(states[1], {
        mood: 'Alert.',
        status: 'Watching the door.',
        memory: 'The player arrived in the rain.',
      })

      await assert.rejects(
        () =>
          client.table('characters').insert({
            initial_mood: '\t',
            initial_status: 'Ready.',
            initial_memory: 'Remembered.',
          }),
        /character_initial_mood_complete_check/
      )
      await assert.rejects(
        () =>
          client
            .table('adventure_character_states')
            .insert({ mood: 'Mood.', status: '\n', memory: 'Memory.' }),
        /adventure_character_state_status_complete_check/
      )
      await assert.rejects(
        () =>
          client
            .table('adventure_character_states')
            .insert({ mood: 'm'.repeat(121), status: 'Ready.', memory: 'Remembered.' }),
        /adventure_character_state_mood_length_check/
      )

      await rollbackMigration(
        client,
        ReconcileCharacterStateBounds,
        '1784424000000_reconcile_character_state_bounds'
      )
      await client.table('adventure_character_states').insert({ mood: '', status: '', memory: '' })
    })
  })
})
