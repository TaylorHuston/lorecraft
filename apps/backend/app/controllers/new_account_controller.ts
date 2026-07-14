import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import db from '@adonisjs/lucid/services/db'

const DUPLICATE_ACCOUNT_RESPONSE = {
  errors: [
    {
      code: 'ACCOUNT_ALREADY_EXISTS',
      message: 'An account with this email already exists.',
    },
  ],
}

function isDuplicateEmailError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505' &&
    'constraint' in error &&
    error.constraint === 'users_email_unique'
  )
}

export default class NewAccountController {
  async store({ request, response, auth, serialize, logger }: HttpContext) {
    const { email, password } = await request.validateUsing(signupValidator)
    let sessionEstablished = false

    try {
      const user = await db.transaction(async (transaction) => {
        const account = new User()
        account.useTransaction(transaction)
        account.merge({ email, password })
        await account.save()

        await auth.use('web').login(account)
        sessionEstablished = true

        return account
      })

      return response.created(await serialize(UserTransformer.transform(user)))
    } catch (error) {
      if (sessionEstablished) {
        try {
          await auth.use('web').logout()
        } catch (cleanupError) {
          logger.error({ err: cleanupError }, 'Failed to clean up a signup session after rollback')
        }
      }

      if (isDuplicateEmailError(error)) {
        return response.conflict(DUPLICATE_ACCOUNT_RESPONSE)
      }

      throw error
    }
  }
}
