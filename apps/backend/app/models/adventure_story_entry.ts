import Adventure from '#models/adventure'
import AdventureRevision from '#models/adventure_revision'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class AdventureStoryEntry extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare adventureId: string

  @column()
  declare revisionId: string

  @column()
  declare sequence: number

  @column()
  declare kind: string

  @column()
  declare content: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Adventure)
  declare adventure: BelongsTo<typeof Adventure>

  @belongsTo(() => AdventureRevision)
  declare revision: BelongsTo<typeof AdventureRevision>
}
