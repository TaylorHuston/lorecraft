import Adventure from '#models/adventure'
import AdventureStoryEntry from '#models/adventure_story_entry'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class AdventureRevision extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare adventureId: string

  @column()
  declare sequence: number

  @column()
  declare kind: string

  @column()
  declare parentRevisionId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Adventure)
  declare adventure: BelongsTo<typeof Adventure>

  @belongsTo(() => AdventureRevision, { foreignKey: 'parentRevisionId' })
  declare parentRevision: BelongsTo<typeof AdventureRevision>

  @hasMany(() => AdventureRevision, { foreignKey: 'parentRevisionId' })
  declare childRevisions: HasMany<typeof AdventureRevision>

  @hasMany(() => AdventureStoryEntry, { foreignKey: 'revisionId' })
  declare storyEntries: HasMany<typeof AdventureStoryEntry>
}
