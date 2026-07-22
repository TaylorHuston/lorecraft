import limiter from '@adonisjs/limiter/services/main'

const adventureGenerationLimit = process.env.NODE_ENV === 'test' ? 100 : 10

export const csrfBootstrapThrottle = limiter.define('csrf-bootstrap', (ctx) => {
  return limiter.allowRequests(60).every('1 minute').usingKey(ctx.request.ip())
})

export const signupThrottle = limiter.define('signup', (ctx) => {
  return limiter.allowRequests(10).every('1 minute').usingKey(ctx.request.ip())
})

export const loginThrottle = limiter.define('login', (ctx) => {
  return limiter.allowRequests(20).every('1 minute').usingKey(ctx.request.ip())
})

export const adventureGenerationThrottle = limiter.define('adventure-generation', (ctx) => {
  const accountKey = ctx.auth.user ? `account:${ctx.auth.user.id}` : `ip:${ctx.request.ip()}`
  return limiter.allowRequests(adventureGenerationLimit).every('1 minute').usingKey(accountKey)
})
