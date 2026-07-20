/**
 * First-playtest ceilings for complete Character cards and Adventure-owned NPC state.
 * Keep every boundary that accepts or derives these values on this shared contract.
 */
export const characterFieldLimits = {
  key: 100,
  name: 100,
  physicalDescription: 320,
  background: 700,
  personality: 320,
  voice: 240,
  privateKnowledge: 700,
  initialMood: 120,
  initialStatus: 320,
  initialMemory: 500,
} as const

/**
 * Neutral nonblank state for legacy frozen snapshots created before complete NPC
 * state was required. It is applied only to the derived Adventure state, never
 * written back into immutable WorldVersion canon.
 */
export const initialCharacterStateDefaults = {
  mood: 'No current mood has been recorded yet.',
  status: 'No current status has been recorded yet.',
  memory: 'No interactions with the player have been recorded yet.',
} as const

export function completeInitialCharacterState(
  character: {
    initialMood?: string | null
    initialStatus?: string | null
    initialMemory?: string | null
  }
) {
  const valueOrDefault = (value: string | null | undefined, fallback: string) =>
    typeof value === 'string' && value.trim().length > 0 ? value : fallback

  return {
    mood: valueOrDefault(character.initialMood, initialCharacterStateDefaults.mood),
    status: valueOrDefault(character.initialStatus, initialCharacterStateDefaults.status),
    memory: valueOrDefault(character.initialMemory, initialCharacterStateDefaults.memory),
  }
}
