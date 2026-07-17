import Location from '#models/location'
import World from '#models/world'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class StartingPoint extends BaseModel {
  static table = 'world_starting_points'

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
  declare openingPremise: string

  @column()
  declare sortOrder: number

  @column()
  declare isDefault: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => World)
  declare world: BelongsTo<typeof World>

  @belongsTo(() => Location)
  declare location: BelongsTo<typeof Location>
}
