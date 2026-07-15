import User from '#models/user'
import Location from '#models/location'
import Character from '#models/character'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type WorldVisibility = 'public' | 'private'

export default class World extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare authorId: number

  @column()
  declare seedIdentity: string | null

  @column()
  declare slug: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare visibility: WorldVisibility

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>

  @hasMany(() => Location)
  declare locations: HasMany<typeof Location>

  @hasMany(() => Character)
  declare characters: HasMany<typeof Character>
}
