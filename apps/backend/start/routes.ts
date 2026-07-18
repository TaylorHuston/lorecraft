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
import {
  adventureGenerationThrottle,
  csrfBootstrapThrottle,
  loginThrottle,
  signupThrottle,
} from '#start/limiter'

const AdventuresController = () => import('#controllers/adventures_controller')

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
        router
          .post(':slug/adventures', [AdventuresController, 'store'])
          .use(middleware.browserCsrf())
          .use(adventureGenerationThrottle)
      })
      .prefix('worlds')
      .use(middleware.requireSessionCookie())
      .use(middleware.session())
      .use(middleware.auth({ guards: ['web'] }))

    router
      .group(() => {
        router.get(':id', [AdventuresController, 'show'])
        router
          .post(':id/opening/retry', [AdventuresController, 'retryOpening'])
          .use(middleware.browserCsrf())
          .use(adventureGenerationThrottle)
        router
          .post(':id/reset', [AdventuresController, 'reset'])
          .use(middleware.browserCsrf())
          .use(adventureGenerationThrottle)
        router.delete(':id', [AdventuresController, 'destroy']).use(middleware.browserCsrf())
      })
      .prefix('adventures')
      .use(middleware.requireSessionCookie())
      .use(middleware.session())
      .use(middleware.auth({ guards: ['web'] }))
  })
  .prefix('/api/v1')
