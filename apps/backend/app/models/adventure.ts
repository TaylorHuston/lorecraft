import AdventureJob from '#models/adventure_job'
import AdventurePlayer from '#models/adventure_player'
import AdventureRevision from '#models/adventure_revision'
import AdventureStoryEntry from '#models/adventure_story_entry'
import ModelCall from '#models/model_call'
import User from '#models/user'
import World from '#models/world'
import WorldVersion from '#models/world_version'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type AdventureStatus = 'opening_pending' | 'opening_processing' | 'opening_failed' | 'ready'

export default class Adventure extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare ownerId: number

  @column()
  declare worldId: number

  @column()
  declare worldVersionId: string

  @column()
  declare startingPointKey: string

  @column()
  declare creationRequestId: string

  @column()
  declare status: AdventureStatus

  @column()
  declare generation: number

  @column()
  declare turnCount: number

  @column()
  declare headRevisionId: string | null

  @column.dateTime()
  declare lastPlayedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'ownerId' })
  declare owner: BelongsTo<typeof User>

  @belongsTo(() => World)
  declare world: BelongsTo<typeof World>

  @belongsTo(() => WorldVersion)
  declare worldVersion: BelongsTo<typeof WorldVersion>

  @belongsTo(() => AdventureRevision, { foreignKey: 'headRevisionId' })
  declare headRevision: BelongsTo<typeof AdventureRevision>

  @hasOne(() => AdventurePlayer)
  declare player: HasOne<typeof AdventurePlayer>

  @hasMany(() => AdventureRevision)
  declare revisions: HasMany<typeof AdventureRevision>

  @hasMany(() => AdventureStoryEntry)
  declare storyEntries: HasMany<typeof AdventureStoryEntry>

  @hasMany(() => AdventureJob)
  declare jobs: HasMany<typeof AdventureJob>

  @hasMany(() => ModelCall)
  declare modelCalls: HasMany<typeof ModelCall>
}
