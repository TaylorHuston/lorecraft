/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),
  CORS_ORIGIN: Env.schema.string({ format: 'url', tld: false }),

  // Database
  DATABASE_URL: Env.schema.string(),
  STARTER_WORLD_AUTHOR_EMAIL: Env.schema.string.optional(),

  // Story generation worker
  LLM_BASE_URL: Env.schema.string.optional(),
  LLM_API_KEY: Env.schema.string.optional(),
  LLM_MODEL: Env.schema.string.optional(),
  LLM_TIMEOUT_MS: Env.schema.number.optional(),
  LLM_MAX_TOKENS: Env.schema.number.optional(),
  LLM_TEMPERATURE: Env.schema.number.optional(),
  LLM_REASONING_EFFORT: Env.schema.enum.optional(['none', 'low', 'medium', 'high'] as const),
  ADVENTURE_WORKER_POLL_INTERVAL_MS: Env.schema.number.optional(),

  // Session
  SESSION_DRIVER: Env.schema.enum(['memory', 'database'] as const),
})
