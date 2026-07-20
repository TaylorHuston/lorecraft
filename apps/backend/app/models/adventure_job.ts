import Adventure from '#models/adventure'
import AdventureTurn from '#models/adventure_turn'
import ModelCall from '#models/model_call'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type AdventureJobType = 'opening' | 'turn'
export type AdventureJobStatus = 'pending' | 'processing' | 'succeeded' | 'failed'

export default class AdventureJob extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare adventureId: string

  @column()
  declare turnId: string | null

  @column()
  declare generation: number

  @column()
  declare type: AdventureJobType

  @column()
  declare status: AdventureJobStatus

  @column()
  declare attemptCount: number

  @column.dateTime()
  declare availableAt: DateTime

  @column()
  declare leaseOwner: string | null

  @column.dateTime()
  declare leaseExpiresAt: DateTime | null

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

  @belongsTo(() => AdventureTurn, { foreignKey: 'turnId' })
  declare turn: BelongsTo<typeof AdventureTurn>

  @hasMany(() => ModelCall, { foreignKey: 'jobId' })
  declare modelCalls: HasMany<typeof ModelCall>
}
