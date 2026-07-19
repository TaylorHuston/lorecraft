import Adventure from '#models/adventure'
import AdventureRevision from '#models/adventure_revision'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class AdventureRevisionMutation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare adventureId: string

  @column()
  declare revisionId: string

  @column()
  declare sequence: number

  @column()
  declare accepted: boolean

  @column()
  declare actorType: 'player' | 'character' | 'unknown'

  @column()
  declare actorKey: string | null

  @column()
  declare field: 'current_location_key' | 'mood' | 'status' | 'memory' | 'unknown'

  @column()
  declare previousValue: string | null

  @column()
  declare resultingValue: string | null

  @column()
  declare rejectionCode: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Adventure)
  declare adventure: BelongsTo<typeof Adventure>

  @belongsTo(() => AdventureRevision)
  declare revision: BelongsTo<typeof AdventureRevision>
}
