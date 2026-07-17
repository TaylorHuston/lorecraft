import { createServer } from 'node:http'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'

const port = Number(process.env.FAKE_STORY_PROVIDER_PORT ?? 4315)
const responseDelayMs = Number(process.env.FAKE_STORY_PROVIDER_DELAY_MS ?? 350)
const opening =
  'Rain drums against the chapel doors as you step beneath the cracked lintel. Mira watches from the aisle while Brother Alden steadies the lantern, and somewhere above them the bell sounds once without a hand on its rope.'

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    response.writeHead(204).end()
    return
  }

  if (request.method !== 'POST' || request.url !== '/v1/chat/completions') {
    response.writeHead(404, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'not_found' }))
    return
  }

  let rawBody = ''
  for await (const chunk of request) rawBody += chunk

  try {
    const body = JSON.parse(rawBody)
    const context = JSON.stringify(body.messages ?? [])
    if (
      !context.includes('Stormbound Chapel') ||
      !context.includes('[STARTING_POINT]') ||
      !context.includes('The player reaches Stormbound Chapel as a midnight storm closes the road.')
    ) {
      response.writeHead(422, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'missing_frozen_opening_context' }))
      return
    }
  } catch {
    response.writeHead(400, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'invalid_json' }))
    return
  }

  await delay(responseDelayMs)

  response.writeHead(200, { 'content-type': 'application/json' })
  response.end(
    JSON.stringify({
      id: 'fake-opening',
      choices: [{ message: { role: 'assistant', content: opening } }],
    })
  )
})

server.listen(port, 'localhost', () => {
  process.stdout.write(`Fake story provider listening on http://localhost:${port}\n`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close())
}
