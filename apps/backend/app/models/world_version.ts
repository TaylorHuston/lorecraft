import World from '#models/world'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type WorldVersionSnapshot = {
  schemaVersion: 1 | 2
  world: {
    slug: string
    name: string
    description: string
    visibility: 'public' | 'private'
    adventureGuidance: string
  }
  locations: Array<{
    key: string
    name: string
    description: string
    sortOrder: number
  }>
  characters: Array<{
    key: string
    name: string
    locationKey: string
    physicalDescription: string
    background: string
    personality: string
    voice: string
    privateKnowledge: string
    initialMood?: string
    initialStatus?: string
    initialMemory?: string
    sortOrder: number
  }>
  startingPoints: Array<{
    key: string
    name: string
    locationKey: string
    openingPremise: string
    sortOrder: number
    isDefault: boolean
  }>
}

export default class WorldVersion extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare worldId: number

  @column()
  declare ordinal: number

  @column()
  declare schemaVersion: number

  @column()
  declare contentHash: string

  @column()
  declare snapshot: WorldVersionSnapshot

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => World)
  declare world: BelongsTo<typeof World>
}
