import type { WorldVersionSnapshot } from '#models/world_version'
import { characterFieldLimits } from '#services/character_field_limits'

export type AdventureCharacterCurrentState = {
  currentLocationKey: string
  mood: string
  status: string
  memory: string
}

export type AdventureMutationState = {
  player: { currentLocationKey: string }
  characters: Record<string, AdventureCharacterCurrentState>
}

type ActorType = 'player' | 'character' | 'unknown'
type MutationField = 'current_location_key' | 'mood' | 'status' | 'memory' | 'unknown'

export type AcceptedAdventureMutation = {
  accepted: true
  actorType: 'player' | 'character'
  actorKey: string | null
  field: Exclude<MutationField, 'unknown'>
  previousValue: string
  resultingValue: string
}

export type RejectedAdventureMutation = {
  accepted: false
  actorType: ActorType
  actorKey: string | null
  field: MutationField
  rejectionCode:
    | 'invalid_proposal'
    | 'unknown_actor'
    | 'unknown_character'
    | 'missing_character_state'
    | 'forbidden_field'
    | 'unknown_location'
    | 'invalid_value'
    | 'value_too_long'
    | 'no_change'
}

export type ResolvedAdventureMutations = {
  accepted: AcceptedAdventureMutation[]
  rejected: RejectedAdventureMutation[]
  nextState: AdventureMutationState
}

const fieldByInputName = {
  currentLocationKey: 'current_location_key',
  mood: 'mood',
  status: 'status',
  memory: 'memory',
} as const

export const adventureMutationFieldLimits = {
  currentLocationKey: characterFieldLimits.key,
  mood: characterFieldLimits.initialMood,
  status: characterFieldLimits.initialStatus,
  memory: characterFieldLimits.initialMemory,
} as const

const maximumLengthByField = {
  current_location_key: adventureMutationFieldLimits.currentLocationKey,
  mood: adventureMutationFieldLimits.mood,
  status: adventureMutationFieldLimits.status,
  memory: adventureMutationFieldLimits.memory,
} as const

function copyState(state: AdventureMutationState): AdventureMutationState {
  return {
    player: { ...state.player },
    characters: Object.fromEntries(
      Object.entries(state.characters).map(([key, character]) => [key, { ...character }])
    ),
  }
}

function actorTypeFor(proposal: Record<string, unknown>): ActorType {
  return proposal.actor === 'player' || proposal.actor === 'character' ? proposal.actor : 'unknown'
}

function fieldFor(proposal: Record<string, unknown>): MutationField {
  return typeof proposal.field === 'string' && proposal.field in fieldByInputName
    ? fieldByInputName[proposal.field as keyof typeof fieldByInputName]
    : 'unknown'
}

function characterKeyFor(proposal: Record<string, unknown>): string | null {
  if (typeof proposal.characterKey !== 'string') return null

  const characterKey = proposal.characterKey.trim()
  return characterKey || null
}

function rejected(
  actorType: ActorType,
  actorKey: string | null,
  field: MutationField,
  rejectionCode: RejectedAdventureMutation['rejectionCode']
): RejectedAdventureMutation {
  return { accepted: false, actorType, actorKey, field, rejectionCode }
}

/** Converts the extractor's wire contract into individual allowlisted field proposals. */
function expandExtractionProposal(rawProposal: unknown): unknown[] {
  if (!rawProposal || typeof rawProposal !== 'object' || Array.isArray(rawProposal)) {
    return [rawProposal]
  }

  const proposal = rawProposal as Record<string, unknown>
  if (typeof proposal.type !== 'string') return [proposal]
  if (proposal.type === 'player_location') {
    return [
      {
        actor: 'player',
        field: 'currentLocationKey',
        value: proposal.locationKey,
      },
    ]
  }
  if (proposal.type === 'character_state') {
    const changes = [
      ['currentLocationKey', proposal.locationKey],
      ['mood', proposal.mood],
      ['status', proposal.currentStatus],
      ['memory', proposal.summarizedMemory],
    ].filter(([, value]) => value !== undefined)

    return changes.length > 0
      ? changes.map(([field, value]) => ({
          actor: 'character',
          characterKey: proposal.characterKey,
          field,
          value,
        }))
      : [{ actor: 'character', characterKey: proposal.characterKey }]
  }

  return [{ actor: 'unknown' }]
}

function normalizedValue(
  value: unknown,
  field: Exclude<MutationField, 'unknown'>
): { value: string } | { rejectionCode: 'invalid_value' | 'value_too_long' } {
  if (typeof value !== 'string') return { rejectionCode: 'invalid_value' }

  const normalized = value.trim()
  if (!normalized) return { rejectionCode: 'invalid_value' }
  if (normalized.length > maximumLengthByField[field]) return { rejectionCode: 'value_too_long' }

  return { value: normalized }
}

/**
 * Resolves untrusted extraction proposals against frozen source identity and current Adventure state.
 * Rejections intentionally retain only bounded structural metadata, never arbitrary provider values.
 */
export function resolveAdventureMutations(input: {
  snapshot: WorldVersionSnapshot
  state: AdventureMutationState
  proposals: unknown[]
}): ResolvedAdventureMutations {
  const nextState = copyState(input.state)
  const accepted: AcceptedAdventureMutation[] = []
  const rejectedMutations: RejectedAdventureMutation[] = []
  const locationKeys = new Set(input.snapshot.locations.map((location) => location.key))
  const characterKeys = new Set(input.snapshot.characters.map((character) => character.key))

  for (const extractedProposal of input.proposals) {
    for (const rawProposal of expandExtractionProposal(extractedProposal)) {
      if (!rawProposal || typeof rawProposal !== 'object' || Array.isArray(rawProposal)) {
        rejectedMutations.push(rejected('unknown', null, 'unknown', 'invalid_proposal'))
        continue
      }

      const proposal = rawProposal as Record<string, unknown>
      const actorType = actorTypeFor(proposal)
      const field = fieldFor(proposal)
      const actorKey = characterKeyFor(proposal)

      if (actorType === 'unknown') {
        rejectedMutations.push(rejected('unknown', null, 'unknown', 'unknown_actor'))
        continue
      }
      if (field === 'unknown') {
        rejectedMutations.push(
          rejected(
            actorType,
            actorType === 'character' ? actorKey : null,
            'unknown',
            'forbidden_field'
          )
        )
        continue
      }
      if (actorType === 'player' && field !== 'current_location_key') {
        rejectedMutations.push(rejected('player', null, field, 'forbidden_field'))
        continue
      }
      if (actorType === 'character' && !actorKey) {
        rejectedMutations.push(rejected('character', null, field, 'invalid_proposal'))
        continue
      }
      if (actorType === 'character' && !characterKeys.has(actorKey!)) {
        rejectedMutations.push(rejected('character', actorKey, field, 'unknown_character'))
        continue
      }
      if (actorType === 'character' && !nextState.characters[actorKey!]) {
        rejectedMutations.push(rejected('character', actorKey, field, 'missing_character_state'))
        continue
      }

      const value = normalizedValue(proposal.value, field)
      if ('rejectionCode' in value) {
        rejectedMutations.push(
          rejected(
            actorType,
            actorType === 'character' ? actorKey : null,
            field,
            value.rejectionCode
          )
        )
        continue
      }
      if (field === 'current_location_key' && !locationKeys.has(value.value)) {
        rejectedMutations.push(
          rejected(
            actorType,
            actorType === 'character' ? actorKey : null,
            field,
            'unknown_location'
          )
        )
        continue
      }

      const currentValue =
        actorType === 'player'
          ? nextState.player.currentLocationKey
          : field === 'current_location_key'
            ? nextState.characters[actorKey!].currentLocationKey
            : nextState.characters[actorKey!][field]
      if (currentValue === value.value) {
        rejectedMutations.push(
          rejected(actorType, actorType === 'character' ? actorKey : null, field, 'no_change')
        )
        continue
      }

      if (actorType === 'player') {
        nextState.player.currentLocationKey = value.value
      } else if (field === 'current_location_key') {
        nextState.characters[actorKey!].currentLocationKey = value.value
      } else {
        nextState.characters[actorKey!][field] = value.value
      }
      accepted.push({
        accepted: true,
        actorType,
        actorKey: actorType === 'character' ? actorKey : null,
        field,
        previousValue: currentValue,
        resultingValue: value.value,
      })
    }
  }

  return { accepted, rejected: rejectedMutations, nextState }
}
