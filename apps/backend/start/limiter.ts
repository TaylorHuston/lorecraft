import limiter from '@adonisjs/limiter/services/main'

export const csrfBootstrapThrottle = limiter.define('csrf-bootstrap', (ctx) => {
  return limiter.allowRequests(60).every('1 minute').usingKey(ctx.request.ip())
})

export const signupThrottle = limiter.define('signup', (ctx) => {
  return limiter.allowRequests(10).every('1 minute').usingKey(ctx.request.ip())
})

export const loginThrottle = limiter.define('login', (ctx) => {
  return limiter.allowRequests(20).every('1 minute').usingKey(ctx.request.ip())
})
