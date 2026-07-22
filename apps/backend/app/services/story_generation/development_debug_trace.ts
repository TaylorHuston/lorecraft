import { chmod, mkdir, open, readdir, stat, unlink } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const sevenDaysMs = 7 * 24 * 60 * 60 * 1_000
const directoryMode = 0o700
const fileMode = 0o600

export const debugTraceDirectory = fileURLToPath(new URL('../../../tmp/debug/', import.meta.url))

export type DevelopmentDebugTraceOperation =
  'opening_generation' | 'turn_narration_generation' | 'turn_state_extraction'

export type DevelopmentDebugTraceEntry = {
  traceId: string
  operation: DevelopmentDebugTraceOperation
  stage: 'input' | 'provider' | 'outcome' | 'failure'
  adventureId?: string
  jobId?: string
  turnId?: string
  provider?: string
  model?: string
  input?: unknown
  promptSummary?: unknown
  promptByteCount?: number
  rawRequest?: unknown
  rawResponse?: unknown
  parsedOutput?: unknown
  narration?: string
  acceptedUpdates?: unknown
  ignoredUpdates?: unknown
  status?: string
  timingsMs?: Record<string, number>
}

export interface DevelopmentDebugTrace {
  capture(entry: DevelopmentDebugTraceEntry): Promise<void>
}

type DevelopmentDebugTraceOptions = {
  nodeEnv: 'development' | 'production' | 'test'
  enabled: boolean
  captureRawRequest: boolean
  captureRawResponse: boolean
  now?: () => Date
}

type DevelopmentDebugTraceEnvironment = {
  nodeEnv: DevelopmentDebugTraceOptions['nodeEnv']
  enabled?: boolean
  captureRawRequest?: boolean
  captureRawResponse?: boolean
}

/**
 * Local development starts with enough protected evidence to refine prompts.
 * Operators may still turn either capture surface off explicitly, and production
 * is rejected by createDevelopmentDebugTrace regardless of these defaults.
 */
export function resolveDevelopmentDebugTraceOptions(
  environment: DevelopmentDebugTraceEnvironment
): DevelopmentDebugTraceOptions {
  const localDefaults = environment.nodeEnv === 'development'

  return {
    ...environment,
    enabled: environment.enabled ?? localDefaults,
    captureRawRequest: environment.captureRawRequest ?? localDefaults,
    captureRawResponse: environment.captureRawResponse ?? localDefaults,
  }
}

class LocalDevelopmentDebugTrace implements DevelopmentDebugTrace {
  readonly #now: () => Date

  constructor(
    private readonly options: Required<Omit<DevelopmentDebugTraceOptions, 'now'>> & {
      now: () => Date
    }
  ) {
    this.#now = options.now
  }

  async capture(entry: DevelopmentDebugTraceEntry): Promise<void> {
    try {
      const now = this.#now()
      await this.#prepareDirectory(now)
      const filePath = `${debugTraceDirectory}trace-${now.toISOString().slice(0, 10)}.jsonl`
      const handle = await open(filePath, 'a', fileMode)
      try {
        await handle.chmod(fileMode)
        await handle.writeFile(`${JSON.stringify(this.#record(entry, now))}\n`, 'utf8')
      } finally {
        await handle.close()
      }
    } catch {
      // A local-only diagnostic must never alter Adventure generation outcomes.
    }
  }

  async #prepareDirectory(now: Date): Promise<void> {
    await mkdir(debugTraceDirectory, { recursive: true, mode: directoryMode })
    await chmod(debugTraceDirectory, directoryMode)
    const entries = await readdir(debugTraceDirectory, { withFileTypes: true })
    await Promise.all(
      entries
        .filter((entry) => entry.isFile() && /^trace-\d{4}-\d{2}-\d{2}\.jsonl$/.test(entry.name))
        .map(async (entry) => {
          const filePath = `${debugTraceDirectory}${entry.name}`
          const metadata = await stat(filePath)
          if (now.getTime() - metadata.mtime.getTime() > sevenDaysMs) await unlink(filePath)
        })
    )
  }

  #record(entry: DevelopmentDebugTraceEntry, now: Date) {
    return removeUndefined({
      timestamp: now.toISOString(),
      traceId: entry.traceId,
      operation: entry.operation,
      stage: entry.stage,
      adventureId: entry.adventureId,
      jobId: entry.jobId,
      turnId: entry.turnId,
      provider: entry.provider,
      model: entry.model,
      input: sanitize(entry.input),
      promptSummary: sanitize(entry.promptSummary),
      promptByteCount: entry.promptByteCount,
      rawRequest: this.options.captureRawRequest ? sanitize(entry.rawRequest) : undefined,
      rawResponse: this.options.captureRawResponse ? sanitize(entry.rawResponse) : undefined,
      parsedOutput: sanitize(entry.parsedOutput),
      narration: entry.narration,
      acceptedUpdates: sanitize(entry.acceptedUpdates),
      ignoredUpdates: sanitize(entry.ignoredUpdates),
      status: entry.status,
      timingsMs: entry.timingsMs,
    })
  }
}

/** Returns null unless a developer explicitly enables the local-only trace. */
export function createDevelopmentDebugTrace(
  options: DevelopmentDebugTraceOptions
): DevelopmentDebugTrace | null {
  if (!options.enabled) return null
  if (options.nodeEnv === 'production') {
    throw new Error('Development Debug capture cannot run in production.')
  }
  return new LocalDevelopmentDebugTrace({
    ...options,
    now: options.now ?? (() => new Date()),
  })
}

function removeUndefined(value: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined))
}

function secretKey(key: string) {
  // OpenAI-compatible providers commonly return these accounting counters.
  // They are not credentials, and keeping them available in the local-only
  // trace is necessary to estimate per-operation API cost.
  if (/^(?:prompt|completion|total|input|output|cached|reasoning)(?:_|)tokens$/i.test(key)) {
    return false
  }
  return /authorization|cookie|api[-_]?key|token|secret|password/i.test(key)
}

function redactString(value: string) {
  return value
    .replace(/\bBearer\s+[^\s"']+/gi, 'Bearer [REDACTED]')
    .replace(
      /((?:api[-_]?key|authorization|cookie|token|secret|password)\s*[=:]\s*)[^\s,}"']+/gi,
      '$1[REDACTED]'
    )
}

function sanitize(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.stringify(sanitize(JSON.parse(value)))
    } catch {
      return redactString(value)
    }
  }
  if (Array.isArray(value)) return value.map(sanitize)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      secretKey(key) ? '[REDACTED]' : sanitize(item),
    ])
  )
}
