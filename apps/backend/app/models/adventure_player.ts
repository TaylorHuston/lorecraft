import Adventure from '#models/adventure'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class AdventurePlayer extends BaseModel {
  @column({ isPrimary: true })
  declare adventureId: string

  @column()
  declare name: string

  @column()
  declare physicalDescription: string | null

  @column()
  declare backstory: string | null

  @column()
  declare status: string

  @column()
  declare currentLocationKey: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Adventure)
  declare adventure: BelongsTo<typeof Adventure>
}
