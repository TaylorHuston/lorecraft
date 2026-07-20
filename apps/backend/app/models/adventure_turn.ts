import Adventure from '#models/adventure'
import AdventureJob from '#models/adventure_job'
import AdventureRevision from '#models/adventure_revision'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type AdventureTurnTrigger = 'act' | 'pass' | 'guide'
export type AdventureTurnStatus = 'pending' | 'processing' | 'succeeded' | 'failed'

export default class AdventureTurn extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare adventureId: string

  @column()
  declare requestId: string

  @column()
  declare trigger: AdventureTurnTrigger

  @column()
  declare input: string | null

  @column()
  declare status: AdventureTurnStatus

  @column()
  declare sourceRevisionId: string

  @column()
  declare resultRevisionId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Adventure)
  declare adventure: BelongsTo<typeof Adventure>

  @belongsTo(() => AdventureRevision, { foreignKey: 'sourceRevisionId' })
  declare sourceRevision: BelongsTo<typeof AdventureRevision>

  @belongsTo(() => AdventureRevision, { foreignKey: 'resultRevisionId' })
  declare resultRevision: BelongsTo<typeof AdventureRevision>

  @hasMany(() => AdventureJob, { foreignKey: 'turnId' })
  declare jobs: HasMany<typeof AdventureJob>
}
