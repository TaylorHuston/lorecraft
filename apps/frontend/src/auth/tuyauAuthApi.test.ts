import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTuyauAuthApi } from './tuyauAuthApi'

const tuyau = vi.hoisted(() => ({
  csrf: vi.fn(),
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@tuyau/core/client', () => ({
  createTuyau: () => ({
    api: {
      auth: {
        csrf: tuyau.csrf,
        newAccount: { store: tuyau.signUp },
        sessions: { store: tuyau.signIn },
      },
      account: {
        sessions: { destroy: tuyau.signOut },
      },
    },
  }),
}))

describe('Tuyau auth adapter', () => {
  beforeEach(() => {
    tuyau.csrf.mockResolvedValue(undefined)
  })

  it('LC-001/S1/R4-S3 classifies a throttled signup response as rate limited', async () => {
    tuyau.signUp.mockRejectedValue({ status: 429 })
    const api = createTuyauAuthApi('http://frontend.example.test')

    await expect(
      api.signUp({
        email: 'member@example.com',
        password: 'correct horse',
        passwordConfirmation: 'correct horse',
      })
    ).rejects.toMatchObject({
      code: 'rate-limited',
      message: 'Too many account creation attempts. Wait a few minutes and try again.',
    })
  })

  it('LC-001/S1/R4-S3 classifies throttled CSRF bootstrap before signup as rate limited', async () => {
    tuyau.csrf.mockRejectedValue({ status: 429 })
    const api = createTuyauAuthApi('http://frontend.example.test')

    await expect(
      api.signUp({
        email: 'member@example.com',
        password: 'correct horse',
        passwordConfirmation: 'correct horse',
      })
    ).rejects.toMatchObject({
      code: 'rate-limited',
      message: 'Too many account creation attempts. Wait a few minutes and try again.',
    })
    expect(tuyau.signUp).not.toHaveBeenCalled()
  })

  it('translates server signup validation into field guidance', async () => {
    tuyau.signUp.mockRejectedValue({
      status: 422,
      response: {
        errors: [
          { field: 'password', message: 'The password field must not exceed 128 characters' },
        ],
      },
    })
    const api = createTuyauAuthApi('http://frontend.example.test')

    await expect(
      api.signUp({
        email: 'member@example.com',
        password: 'x'.repeat(129),
        passwordConfirmation: 'x'.repeat(129),
      })
    ).rejects.toMatchObject({
      code: 'validation',
      message: 'Correct the highlighted fields.',
      fieldErrors: {
        password: 'Use 12 to 128 characters.',
      },
    })
  })

  it('LC-001/S1/R4-S1 classifies an expired signup CSRF token with recovery guidance', async () => {
    tuyau.signUp.mockRejectedValue({
      status: 403,
      response: { errors: [{ code: 'INVALID_CSRF_TOKEN' }] },
    })
    const api = createTuyauAuthApi('http://frontend.example.test')

    await expect(
      api.signUp({
        email: 'member@example.com',
        password: 'correct horse',
        passwordConfirmation: 'correct horse',
      })
    ).rejects.toMatchObject({
      code: 'csrf-expired',
      message: 'Your secure signup form expired. Refresh the page and try again.',
    })
  })

  it('LC-001/S2/R4-S3 classifies a throttled sign-in response as rate limited', async () => {
    tuyau.signIn.mockRejectedValue({ status: 429 })
    const api = createTuyauAuthApi('http://frontend.example.test')

    await expect(
      api.signIn({ email: 'member@example.com', password: 'correct horse' })
    ).rejects.toMatchObject({
      code: 'rate-limited',
      message: 'Too many sign-in attempts. Wait a few minutes and try again.',
    })
  })

  it('LC-001/S2/R4-S3 classifies throttled CSRF bootstrap before sign-in as rate limited', async () => {
    tuyau.csrf.mockRejectedValue({ status: 429 })
    const api = createTuyauAuthApi('http://frontend.example.test')

    await expect(
      api.signIn({ email: 'member@example.com', password: 'correct horse' })
    ).rejects.toMatchObject({
      code: 'rate-limited',
      message: 'Too many sign-in attempts. Wait a few minutes and try again.',
    })
    expect(tuyau.signIn).not.toHaveBeenCalled()
  })

  it('LC-001/S2/R4-S1 classifies an expired sign-in CSRF token with recovery guidance', async () => {
    tuyau.signIn.mockRejectedValue({
      status: 403,
      response: { errors: [{ code: 'INVALID_CSRF_TOKEN' }] },
    })
    const api = createTuyauAuthApi('http://frontend.example.test')

    await expect(
      api.signIn({ email: 'member@example.com', password: 'correct horse' })
    ).rejects.toMatchObject({
      code: 'csrf-expired',
      message: 'Your secure sign-in form expired. Refresh the page and try again.',
    })
  })

  it('LC-001/S3/R2-S3 classifies a throttled sign-out response as rate limited', async () => {
    tuyau.signOut.mockRejectedValue({ status: 429 })
    const api = createTuyauAuthApi('http://frontend.example.test')

    await expect(api.signOut()).rejects.toMatchObject({
      code: 'rate-limited',
      message: 'Too many sign-out attempts. Wait a few minutes and try again.',
    })
  })

  it('LC-001/S3/R2-S3 classifies throttled CSRF bootstrap before sign-out as rate limited', async () => {
    tuyau.csrf.mockRejectedValue({ status: 429 })
    const api = createTuyauAuthApi('http://frontend.example.test')

    await expect(api.signOut()).rejects.toMatchObject({
      code: 'rate-limited',
      message: 'Too many sign-out attempts. Wait a few minutes and try again.',
    })
    expect(tuyau.signOut).not.toHaveBeenCalled()
  })

  it('LC-001/S3/R2-S3 classifies an expired sign-out CSRF token with recovery guidance', async () => {
    tuyau.signOut.mockRejectedValue({
      status: 403,
      response: { errors: [{ code: 'INVALID_CSRF_TOKEN' }] },
    })
    const api = createTuyauAuthApi('http://frontend.example.test')

    await expect(api.signOut()).rejects.toMatchObject({
      code: 'csrf-expired',
      message: 'Your secure session could not be verified. Refresh the page and try again.',
    })
  })

  it('LC-001/S2/R4-S2 translates server sign-in validation into field guidance', async () => {
    tuyau.signIn.mockRejectedValue({
      status: 422,
      response: {
        errors: [{ field: 'email', message: 'The email field must be a valid email address' }],
      },
    })
    const api = createTuyauAuthApi('http://frontend.example.test')

    await expect(api.signIn({ email: 'invalid', password: 'short' })).rejects.toMatchObject({
      code: 'validation',
      message: 'Correct the highlighted fields.',
      fieldErrors: {
        email: 'Enter a valid email address.',
      },
    })
  })
})
