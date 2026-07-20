import AdventureOpeningWorker, {
  type AdventureOpeningRepository,
  type ClaimedOpening,
  type OpeningFailure,
} from '#services/adventure_opening_worker'
import type {
  StoryGenerationResult,
  StoryGenerator,
} from '#services/story_generation/story_generator'
import type { DevelopmentDebugTraceEntry } from '#services/story_generation/development_debug_trace'
import { test } from '@japa/runner'

const claim: ClaimedOpening = {
  adventureId: '11111111-1111-4111-8111-111111111111',
  jobId: '22222222-2222-4222-8222-222222222222',
  generation: 1,
  attempt: 1,
  leaseToken: 'worker:lease',
  startedAt: new Date('2026-07-18T12:00:00.000Z'),
  input: {
    platformInstructions: 'Write an opening.',
    world: { name: 'World', description: 'Description', adventureGuidance: 'Guidance' },
    startingPoint: { name: 'Start', openingPremise: 'Premise' },
    player: { name: 'Player', physicalDescription: null, backstory: null },
    startingLocation: { name: 'Place', description: 'Description' },
    charactersPresent: [],
  },
}

const result: StoryGenerationResult = {
  narration: 'The opening.',
  provider: 'test',
  model: 'test-model',
  settings: { temperature: 0, maxTokens: 100 },
  request: { byteCount: 10, timeoutMs: 1_000 },
  response: { byteCount: 12, statusCode: 200 },
}

class FakeRepository implements AdventureOpeningRepository {
  finalized: StoryGenerationResult | null = null
  failure: OpeningFailure | null = null

  async failOneExhaustedLease() {
    return null
  }
  async claimOne() {
    return claim
  }
  async rescheduleInterrupted() {
    return true
  }
  async finalizeSuccess(_claim: ClaimedOpening, generation: StoryGenerationResult) {
    this.finalized = generation
    return true
  }
  async finalizeFailure(_claim: ClaimedOpening, failure: OpeningFailure) {
    this.failure = failure
    return 'failed' as const
  }
}

test('Adventure opening worker orchestrates publication through its repository port', async ({
  assert,
}) => {
  const repository = new FakeRepository()
  const traces: DevelopmentDebugTraceEntry[] = []
  const generator: StoryGenerator = {
    async generateOpening() {
      return result
    },
  }
  const worker = new AdventureOpeningWorker({
    generator,
    workerId: 'unit-worker',
    repository,
    debugTrace: {
      async capture(entry) {
        traces.push(entry)
      },
    },
  })

  assert.deepInclude(await worker.runOnce(), { status: 'succeeded', attempt: 1 })
  assert.deepEqual(repository.finalized, result)
  assert.sameMembers(
    traces.map((entry) => entry.stage),
    ['input', 'outcome']
  )
})

test('LC-003/S2/R3-S5: never publishes an opening that directly reflects NPC private knowledge', async ({
  assert,
}) => {
  const repository = new FakeRepository()
  const worker = new AdventureOpeningWorker({
    generator: {
      async generateOpening() {
        return {
          ...result,
          narration: 'The keeper admits the bell rope is hidden behind the altar.',
        }
      },
    },
    workerId: 'unit-worker',
    repository,
  })
  const claimWithPrivateNpc: ClaimedOpening = {
    ...claim,
    input: {
      ...claim.input,
      charactersPresent: [
        {
          key: 'keeper',
          name: 'Keeper',
          physicalDescription: 'Watchful.',
          background: 'Keeps the chapel.',
          personality: 'Cautious.',
          voice: 'Quiet.',
          privateKnowledge: 'The bell rope is hidden behind the altar.',
          initialMood: 'Uneasy.',
          initialStatus: 'Waiting.',
          initialMemory: '',
          sortOrder: 0,
        },
      ],
    },
  }
  repository.claimOne = async () => claimWithPrivateNpc

  assert.deepInclude(await worker.runOnce(), { status: 'failed', attempt: 1 })
  assert.isNull(repository.finalized)
  assert.deepInclude(repository.failure!, { code: 'malformed_response' })
})
