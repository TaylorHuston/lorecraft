import { BaseSchema } from '@adonisjs/lucid/schema'

const seedIdentityConstraint = 'worlds_seed_identity_unique'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('worlds', (table) => {
      table.string('seed_identity', 100).nullable()
      table.unique(['seed_identity'], { indexName: seedIdentityConstraint })
    })
  }

  async down() {
    const installedSeeds = await this.db
      .from('worlds')
      .whereNotNull('seed_identity')
      .count('* as total')
    if (Number(installedSeeds[0]?.total ?? 0) > 0) {
      throw new Error('Cannot remove World seed identity while seeded Worlds are installed.')
    }

    this.schema.alterTable('worlds', (table) => {
      table.dropUnique(['seed_identity'], seedIdentityConstraint)
      table.dropColumn('seed_identity')
    })
  }
}
