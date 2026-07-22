import Adventure from '#models/adventure'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class AdventureCharacterState extends BaseModel {
  public static primaryKey = 'adventureId'

  @column({ isPrimary: true })
  declare adventureId: string

  @column({ isPrimary: true })
  declare characterKey: string

  @column()
  declare currentLocationKey: string

  @column()
  declare mood: string

  @column()
  declare status: string

  @column()
  declare memory: string

  @column()
  declare name: string | null

  @column()
  declare physicalDescription: string | null

  @column()
  declare background: string | null

  @column()
  declare personality: string | null

  @column()
  declare voice: string | null

  @column()
  declare privateKnowledge: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Adventure)
  declare adventure: BelongsTo<typeof Adventure>
}
