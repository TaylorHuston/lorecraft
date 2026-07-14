import starterWorld from '#config/starter_world'
import { seedStormboundChapel } from '#services/stormbound_chapel_seed'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await seedStormboundChapel(starterWorld.authorEmail)
  }
}
