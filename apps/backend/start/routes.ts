/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { csrfBootstrapThrottle, loginThrottle, signupThrottle } from '#start/limiter'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router
          .get('csrf', ({ response }) => response.noContent())
          .use(csrfBootstrapThrottle)
          .use(middleware.session())
          .use(middleware.browserCsrf())
          .as('csrf')
        router
          .post('signup', [controllers.NewAccount, 'store'])
          .use(signupThrottle)
          .use(middleware.session())
          .use(middleware.browserCsrf())
        router
          .post('login', [controllers.Sessions, 'store'])
          .use(loginThrottle)
          .use(middleware.session())
          .use(middleware.browserCsrf())
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router
          .get('profile', [controllers.Profile, 'show'])
          .use(middleware.requireSessionCookie())
          .use(middleware.session())
          .use(middleware.auth({ guards: ['web'] }))
        router
          .post('logout', [controllers.Sessions, 'destroy'])
          .use(middleware.requireSessionCookie())
          .use(middleware.session())
          .use(middleware.auth({ guards: ['web'] }))
          .use(middleware.browserCsrf())
      })
      .prefix('account')
      .as('account')

    router
      .group(() => {
        router.get('', [controllers.Worlds, 'index'])
        router.get(':slug', [controllers.Worlds, 'show'])
      })
      .prefix('worlds')
      .use(middleware.requireSessionCookie())
      .use(middleware.session())
      .use(middleware.auth({ guards: ['web'] }))
  })
  .prefix('/api/v1')
