import Location from '#models/location'
import World from '#models/world'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Character extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare worldId: number

  @column()
  declare locationId: number

  @column()
  declare key: string

  @column()
  declare name: string

  @column()
  declare physicalDescription: string

  @column()
  declare background: string

  @column()
  declare personality: string

  @column()
  declare voice: string

  @column()
  declare privateKnowledge: string

  @column()
  declare initialMood: string

  @column()
  declare initialStatus: string

  @column()
  declare initialMemory: string

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => World)
  declare world: BelongsTo<typeof World>

  @belongsTo(() => Location)
  declare location: BelongsTo<typeof Location>
}
