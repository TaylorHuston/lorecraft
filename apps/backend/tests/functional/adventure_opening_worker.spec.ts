import AdventureCreationService from '#services/adventure_creation_service'
import AdventureOpeningWorker from '#services/adventure_opening_worker'
import Character from '#models/character'
import Location from '#models/location'
import StartingPoint from '#models/starting_point'
import User from '#models/user'
import World from '#models/world'
import { publishWorldVersion } from '#services/world_version_publication_service'
import type {
  OpeningStoryInput,
  StoryGenerationResult,
  StoryGenerator,
} from '#services/story_generation/story_generator'
import { StoryGenerationError } from '#services/story_generation/story_generator'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

const now = new Date('2099-07-16T20:00:00.000Z')

function successfulResult(
  narration = 'The chapel bell answered the storm.'
): StoryGenerationResult {
  return {
    narration,
    provider: 'test-provider',
    model: 'test-model',
    settings: { temperature: 0.4, maxTokens: 800 },
    redactedRequest: {
      method: 'POST',
      url: 'https://story.example.test/v1/chat/completions',
      headers: { 'content-type': 'application/json' },
      body: { messages: ['redacted fixture'] },
      timeoutMs: 1_000,
    },
    rawResponse: JSON.stringify({ narration }),
  }
}

function generationError(code: 'timeout' | 'provider_failure') {
  const result = successfulResult()
  return new StoryGenerationError(code, `secret provider detail for ${code}`, {
    provider: result.provider,
    model: result.model,
    settings: result.settings,
    redactedRequest: {
      ...result.redactedRequest,
      headers: {
        ...result.redactedRequest.headers,
        authorization: 'Bearer credential-that-must-not-persist',
      },
    },
    rawResponse: code === 'provider_failure' ? 'provider unavailable' : null,
  })
}

class SequenceGenerator implements StoryGenerator {
  calls: OpeningStoryInput[] = []

  constructor(private readonly outcomes: unknown[]) {}

  async generateOpening(input: OpeningStoryInput): Promise<StoryGenerationResult> {
    this.calls.push(input)
    const outcome = this.outcomes.shift()
    if (outcome instanceof Error) throw outcome
    return outcome as StoryGenerationResult
  }
}

class DelayedGenerator implements StoryGenerator {
  calls: OpeningStoryInput[] = []

  constructor(private readonly delayMs: number) {}

  async generateOpening(input: OpeningStoryInput): Promise<StoryGenerationResult> {
    this.calls.push(input)
    await new Promise((resolve) => setTimeout(resolve, this.delayMs))
    return successfulResult()
  }
}

class MutatingGenerator implements StoryGenerator {
  calls: OpeningStoryInput[] = []

  constructor(private readonly mutate: () => Promise<void>) {}

  async generateOpening(input: OpeningStoryInput): Promise<StoryGenerationResult> {
    this.calls.push(input)
    await this.mutate()
    return successfulResult()
  }
}

async function createOpeningFixture(suffix: string) {
  const owner = await User.create({
    email: `opening-worker-${suffix}@example.com`,
    password: 'correct horse battery staple',
  })
  const world = await World.create({
    authorId: owner.id,
    slug: `opening-worker-${suffix}`,
    name: 'Stormbound Chapel',
    description: 'A chapel isolated by an endless storm.',
    visibility: 'private',
    adventureGuidance: 'Keep the opening tense and grounded.',
  })
  const location = await Location.create({
    worldId: world.id,
    key: 'chapel-threshold',
    name: 'Chapel Threshold',
    description: 'Rain runs down the locked chapel doors.',
    sortOrder: 0,
  })
  await Character.create({
    worldId: world.id,
    locationId: location.id,
    key: 'warden-hale',
    name: 'Warden Hale',
    physicalDescription: 'A weathered keeper in a salt-stained coat.',
    background: 'The last keeper of the chapel.',
    personality: 'Watchful and restrained.',
    voice: 'Low and deliberate.',
    privateKnowledge: 'The bell has no rope.',
    sortOrder: 0,
  })
  const startingPoint = await StartingPoint.create({
    worldId: world.id,
    locationId: location.id,
    key: 'chapel-arrival',
    name: 'Chapel Arrival',
    openingPremise: 'The chapel bell rings although no one is inside.',
    sortOrder: 0,
    isDefault: true,
  })
  const version = await publishWorldVersion(world.id)
  const created = await new AdventureCreationService().create({
    ownerId: owner.id,
    worldSlug: world.slug,
    creationRequestId: `00000000-0000-4000-8000-${suffix.padStart(12, '0')}`,
    player: {
      name: 'Mara Venn',
      physicalDescription: 'A rain-dark coat and a silver scar across one palm.',
      backstory: 'Mara came looking for her missing brother.',
    },
  })

  return { ...created, owner, world, version, location, startingPoint }
}

test.group('AdventureOpeningWorker', (group) => {
  group.each.setup(async () => {
    await db.rawQuery(`
      TRUNCATE TABLE
        model_calls,
        adventure_story_entries,
        adventure_revisions,
        adventure_jobs,
        adventure_players,
        adventures,
        world_versions,
        world_starting_points,
        characters,
        locations,
        worlds,
        auth_access_tokens,
        sessions,
        users
      RESTART IDENTITY CASCADE
    `)
  })

  test('LC-003/S1/R3-S1 + R3-S2: one worker publishes one complete opening atomically', async ({
    assert,
  }) => {
    const fixture = await createOpeningFixture('1')
    const firstGenerator = new DelayedGenerator(50)
    const secondGenerator = new DelayedGenerator(50)
    const firstWorker = new AdventureOpeningWorker({
      generator: firstGenerator,
      workerId: 'worker-one',
      now: () => new Date(now),
    })
    const secondWorker = new AdventureOpeningWorker({
      generator: secondGenerator,
      workerId: 'worker-two',
      now: () => new Date(now),
    })

    const results = await Promise.all([firstWorker.runOnce(), secondWorker.runOnce()])
    const succeeded = results.find((result) => result.status === 'succeeded')
    const idle = results.find((result) => result.status === 'idle')
    const claimedGenerator = firstGenerator.calls.length > 0 ? firstGenerator : secondGenerator

    assert.isDefined(idle)
    assert.deepInclude(succeeded!, {
      status: 'succeeded',
      adventureId: fixture.adventureId,
    })
    assert.equal(firstGenerator.calls.length + secondGenerator.calls.length, 1)
    assert.deepInclude(claimedGenerator.calls[0], {
      world: {
        name: 'Stormbound Chapel',
        description: 'A chapel isolated by an endless storm.',
        adventureGuidance: 'Keep the opening tense and grounded.',
      },
      startingPoint: {
        name: 'Chapel Arrival',
        openingPremise: 'The chapel bell rings although no one is inside.',
      },
      player: {
        name: 'Mara Venn',
        physicalDescription: 'A rain-dark coat and a silver scar across one palm.',
        backstory: 'Mara came looking for her missing brother.',
      },
      startingLocation: {
        name: 'Chapel Threshold',
        description: 'Rain runs down the locked chapel doors.',
      },
    })
    assert.deepInclude(claimedGenerator.calls[0].charactersPresent[0], {
      key: 'warden-hale',
      name: 'Warden Hale',
      privateKnowledge: 'The bell has no rope.',
    })

    const adventure = await db.from('adventures').where('id', fixture.adventureId).firstOrFail()
    const jobs = await db.from('adventure_jobs').where('adventure_id', fixture.adventureId)
    const revisions = await db
      .from('adventure_revisions')
      .where('adventure_id', fixture.adventureId)
    const story = await db
      .from('adventure_story_entries')
      .where('adventure_id', fixture.adventureId)
    const calls = await db.from('model_calls').where('adventure_id', fixture.adventureId)

    assert.deepInclude(adventure, { status: 'ready', turn_count: 0 })
    assert.equal(adventure.head_revision_id, revisions[0].id)
    assert.lengthOf(jobs, 1)
    assert.deepInclude(jobs[0], { status: 'succeeded', attempt_count: 1 })
    assert.isNull(jobs[0].lease_owner)
    assert.lengthOf(revisions, 1)
    assert.deepInclude(revisions[0], { sequence: 0, kind: 'opening', parent_revision_id: null })
    assert.lengthOf(story, 1)
    assert.deepInclude(story[0], {
      revision_id: revisions[0].id,
      sequence: 0,
      kind: 'narration',
      content: 'The chapel bell answered the storm.',
    })
    assert.lengthOf(calls, 1)
    assert.equal(calls[0].status, 'succeeded')
    assert.deepEqual(await firstWorker.runOnce(), { status: 'idle' })
    assert.lengthOf(
      await db.from('adventure_story_entries').where('adventure_id', fixture.adventureId),
      1
    )
  })

  test('LC-003/S1/R3-S2: an expired processing lease is reclaimed as the second attempt', async ({
    assert,
  }) => {
    const fixture = await createOpeningFixture('2')
    await db
      .from('adventure_jobs')
      .where('adventure_id', fixture.adventureId)
      .update({
        status: 'processing',
        attempt_count: 1,
        lease_owner: 'lost-worker:old-lease',
        lease_expires_at: new Date(now.getTime() - 1),
        updated_at: new Date(now.getTime() - 60_001),
      })
    await db
      .from('adventures')
      .where('id', fixture.adventureId)
      .update({ status: 'opening_processing' })
    const generator = new SequenceGenerator([successfulResult('A reclaimed opening.')])

    const result = await new AdventureOpeningWorker({
      generator,
      workerId: 'recovery-worker',
      now: () => new Date(now),
    }).runOnce()

    assert.deepInclude(result, {
      status: 'succeeded',
      adventureId: fixture.adventureId,
      attempt: 2,
    })
    assert.lengthOf(generator.calls, 1)
    assert.deepInclude(
      await db.from('adventure_jobs').where('adventure_id', fixture.adventureId).firstOrFail(),
      { status: 'succeeded', attempt_count: 2 }
    )
    const calls = await db
      .from('model_calls')
      .where('adventure_id', fixture.adventureId)
      .orderBy('created_at')
      .orderBy('id')
    assert.lengthOf(calls, 2)
    const expiredCall = calls.find((call) => call.failure_code === 'lease_expired')
    const successfulCall = calls.find((call) => call.status === 'succeeded')
    assert.isDefined(expiredCall)
    assert.isDefined(successfulCall)
    assert.equal(successfulCall!.retry_of_model_call_id, expiredCall!.id)
    assert.deepInclude(await db.from('adventures').where('id', fixture.adventureId).firstOrFail(), {
      status: 'ready',
      turn_count: 0,
    })
  })

  test('LC-003/S1/R3-S2 + R3-S3: an expired final-attempt lease becomes terminal', async ({
    assert,
  }) => {
    const fixture = await createOpeningFixture('6')
    await db
      .from('adventure_jobs')
      .where('adventure_id', fixture.adventureId)
      .update({
        status: 'processing',
        attempt_count: 2,
        lease_owner: 'lost-worker:final-lease',
        lease_expires_at: new Date(now.getTime() - 1),
        updated_at: new Date(now.getTime() - 60_001),
      })
    await db
      .from('adventures')
      .where('id', fixture.adventureId)
      .update({ status: 'opening_processing' })
    const generator = new SequenceGenerator([successfulResult('Must not be called.')])

    const result = await new AdventureOpeningWorker({
      generator,
      workerId: 'exhaustion-worker',
      now: () => new Date(now),
    }).runOnce()

    assert.deepInclude(result, {
      status: 'failed',
      adventureId: fixture.adventureId,
      attempt: 2,
    })
    assert.lengthOf(generator.calls, 0)
    assert.deepInclude(
      await db.from('adventure_jobs').where('adventure_id', fixture.adventureId).firstOrFail(),
      {
        status: 'failed',
        attempt_count: 2,
        failure_code: 'lease_expired',
      }
    )
    assert.deepInclude(await db.from('adventures').where('id', fixture.adventureId).firstOrFail(), {
      status: 'opening_failed',
      turn_count: 0,
    })
  })

  test('LC-003/S1/R3-S3 + R3-S4: invalid generation retries once then fails without prose', async ({
    assert,
  }) => {
    const fixture = await createOpeningFixture('3')
    const generator = new SequenceGenerator([
      generationError('provider_failure'),
      { ...successfulResult(), narration: '   ' },
    ])
    const logRecords: Array<{ event: string; fields: Record<string, string | number> }> = []
    const worker = new AdventureOpeningWorker({
      generator,
      workerId: 'failure-worker',
      now: () => new Date(now),
      logger: {
        info(event, fields) {
          logRecords.push({ event, fields })
        },
      },
    })

    assert.deepInclude(await worker.runOnce(), { status: 'retry_scheduled', attempt: 1 })
    assert.deepInclude(await worker.runOnce(), { status: 'failed', attempt: 2 })

    const adventure = await db.from('adventures').where('id', fixture.adventureId).firstOrFail()
    const job = await db
      .from('adventure_jobs')
      .where('adventure_id', fixture.adventureId)
      .firstOrFail()
    const calls = await db
      .from('model_calls')
      .where('adventure_id', fixture.adventureId)
      .orderBy('created_at')
      .orderBy('id')

    assert.deepInclude(adventure, { status: 'opening_failed', turn_count: 0 })
    assert.isNull(adventure.head_revision_id)
    assert.deepInclude(job, {
      status: 'failed',
      attempt_count: 2,
      failure_code: 'empty_narration',
    })
    assert.lengthOf(calls, 2)
    const providerFailure = calls.find((call) => call.failure_code === 'provider_failure')
    const emptyNarration = calls.find((call) => call.failure_code === 'empty_narration')
    assert.isDefined(providerFailure)
    assert.isDefined(emptyNarration)
    assert.equal(emptyNarration!.retry_of_model_call_id, providerFailure!.id)
    assert.notInclude(JSON.stringify(calls), 'credential-that-must-not-persist')
    assert.lengthOf(
      await db.from('adventure_revisions').where('adventure_id', fixture.adventureId),
      0
    )
    assert.lengthOf(
      await db.from('adventure_story_entries').where('adventure_id', fixture.adventureId),
      0
    )
    assert.notInclude(JSON.stringify(logRecords), 'secret provider detail')
    assert.notInclude(JSON.stringify(logRecords), 'provider unavailable')
    for (const record of logRecords) {
      assert.deepEqual(
        Object.keys(record.fields).sort(),
        [
          'adventureId',
          'jobId',
          'generation',
          'attempt',
          'status',
          ...(record.event === 'adventure_opening.claimed' ? [] : ['durationMs']),
        ].sort()
      )
    }
  })

  test('LC-003/S1/R3-S2 + R3-S4: reset and delete make in-flight finalization stale', async ({
    assert,
  }) => {
    const resetFixture = await createOpeningFixture('4')
    const resetGenerator = new MutatingGenerator(async () => {
      await db.from('adventure_jobs').where('adventure_id', resetFixture.adventureId).delete()
      await db.from('adventures').where('id', resetFixture.adventureId).update({
        status: 'opening_pending',
        generation: 2,
        head_revision_id: null,
        turn_count: 0,
      })
      await db.table('adventure_jobs').insert({
        adventure_id: resetFixture.adventureId,
        generation: 2,
        type: 'opening',
        status: 'pending',
        attempt_count: 0,
        available_at: now,
        lease_owner: null,
        lease_expires_at: null,
        failure_code: null,
        failure_message: null,
        created_at: now,
        updated_at: null,
      })
    })
    const resetWorker = new AdventureOpeningWorker({
      generator: resetGenerator,
      workerId: 'stale-reset-worker',
      now: () => new Date(now),
    })
    assert.deepInclude(await resetWorker.runOnce(), { status: 'stale', attempt: 1 })
    assert.deepInclude(
      await db.from('adventures').where('id', resetFixture.adventureId).firstOrFail(),
      { status: 'opening_pending', generation: 2, turn_count: 0 }
    )
    assert.lengthOf(
      await db.from('adventure_story_entries').where('adventure_id', resetFixture.adventureId),
      0
    )

    const deleteFixture = await createOpeningFixture('5')
    const deleteGenerator = new MutatingGenerator(async () => {
      await db.from('adventures').where('id', deleteFixture.adventureId).delete()
    })
    const deleteWorker = new AdventureOpeningWorker({
      generator: deleteGenerator,
      workerId: 'stale-delete-worker',
      now: () => new Date(now),
    })
    assert.deepInclude(await deleteWorker.runOnce(), { status: 'stale', attempt: 1 })
    assert.isNull(await db.from('adventures').where('id', deleteFixture.adventureId).first())
    for (const table of [
      'adventure_jobs',
      'model_calls',
      'adventure_revisions',
      'adventure_story_entries',
    ]) {
      assert.lengthOf(await db.from(table).where('adventure_id', deleteFixture.adventureId), 0)
    }
  })
})
