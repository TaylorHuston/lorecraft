import Adventure from '#models/adventure'
import AdventureJob from '#models/adventure_job'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type ModelCallStatus = 'processing' | 'succeeded' | 'failed'

export default class ModelCall extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare adventureId: string

  @column()
  declare jobId: string

  @column()
  declare operation: string

  @column()
  declare requestMetadata: Record<string, unknown>

  @column()
  declare responseMetadata: Record<string, unknown>

  @column()
  declare provider: string

  @column()
  declare model: string

  @column()
  declare settings: Record<string, unknown>

  @column()
  declare status: ModelCallStatus

  @column.dateTime()
  declare startedAt: DateTime

  @column.dateTime()
  declare completedAt: DateTime | null

  @column()
  declare durationMs: number | null

  @column()
  declare retryOfModelCallId: string | null

  @column()
  declare failureCode: string | null

  @column()
  declare failureMessage: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Adventure)
  declare adventure: BelongsTo<typeof Adventure>

  @belongsTo(() => AdventureJob, { foreignKey: 'jobId' })
  declare job: BelongsTo<typeof AdventureJob>

  @belongsTo(() => ModelCall, { foreignKey: 'retryOfModelCallId' })
  declare retryOfModelCall: BelongsTo<typeof ModelCall>

  @hasMany(() => ModelCall, { foreignKey: 'retryOfModelCallId' })
  declare retries: HasMany<typeof ModelCall>
}
