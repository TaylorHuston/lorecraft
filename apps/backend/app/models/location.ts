import Character from '#models/character'
import World from '#models/world'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Location extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare worldId: number

  @column()
  declare key: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => World)
  declare world: BelongsTo<typeof World>

  @hasMany(() => Character)
  declare characters: HasMany<typeof Character>
}
