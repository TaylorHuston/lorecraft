import User from '#models/user'
import { loginValidator } from '#validators/user'
import UserTransformer from '#transformers/user_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as authErrors } from '@adonisjs/auth'

const INVALID_CREDENTIALS_RESPONSE = {
  errors: [
    {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    },
  ],
}

export default class SessionsController {
  async store({ request, response, auth, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      return response.ok(await serialize(UserTransformer.transform(user)))
    } catch (error) {
      if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
        return response.unauthorized(INVALID_CREDENTIALS_RESPONSE)
      }

      throw error
    }
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.noContent()
  }
}
