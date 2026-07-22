import { createServer } from 'node:http'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'

const port = Number(process.env.FAKE_STORY_PROVIDER_PORT ?? 4315)
const responseDelayMs = Number(process.env.FAKE_STORY_PROVIDER_DELAY_MS ?? 350)
const opening =
  'Rain drums against the chapel doors as you step beneath the cracked lintel. Mira watches from the aisle while Brother Alden steadies the lantern, and somewhere above them the bell sounds once without a hand on its rope.'
const actTurn =
  'The bell answers your question with a second, hollow toll. Mira leads you through the side door into the vestry.'
const guideTurn =
  'Brother Alden opens the ledger at last, and a faded name catches the lantern light before the storm swallows the sound outside.'
const passTurn =
  'The silence lengthens. Rain keeps time against the shutters until Mira finally turns toward the altar.'
const failedTurnAttempts = new Map()
let npcRefreshExtractionPending = false

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
    const messages = body.messages ?? []
    const context = JSON.stringify(messages)
    const system = messages.find((message) => message.role === 'system')?.content ?? ''

    if (system.includes('Extract only supported Adventure state proposals')) {
      const refreshNpcState = npcRefreshExtractionPending
      npcRefreshExtractionPending = false
      await delay(responseDelayMs)
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify({
          id: 'fake-turn-extraction',
          choices: [
            {
              message: {
                role: 'assistant',
                content: refreshNpcState
                  ? JSON.stringify({
                      proposals: [
                        {
                          type: 'character_state',
                          characterKey: 'mira',
                          mood: 'Watchful after the bell.',
                          currentStatus: 'Waiting beside the altar.',
                          summarizedMemory: 'The player asked about the second bell toll.',
                        },
                      ],
                    })
                  : context.includes(actTurn)
                  ? '{"proposals":[{"type":"player_location","locationKey":"vestry"}]}'
                  : '{"proposals":[]}',
              },
            },
          ],
        })
      )
      return
    }

    if (context.includes('[CURRENT_ACT]') && context.includes('E2E_FAIL_ALWAYS')) {
      await delay(responseDelayMs)
      response.writeHead(503, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'intentional_turn_failure' }))
      return
    }
    if (context.includes('[CURRENT_ACT]') && context.includes('E2E_FAIL_TWICE')) {
      const attempts = failedTurnAttempts.get(context) ?? 0
      failedTurnAttempts.set(context, attempts + 1)
      if (attempts < 2) {
        await delay(responseDelayMs)
        response.writeHead(503, { 'content-type': 'application/json' })
        response.end(JSON.stringify({ error: 'intentional_turn_failure' }))
        return
      }
    }

    let content = opening
    if (context.includes('[CURRENT_ACT]')) {
      npcRefreshExtractionPending = context.includes('E2E_NPC_REFRESH')
      content = actTurn
    }
    else if (context.includes('[PRIVATE_CURRENT_GUIDE]')) content = guideTurn
    else if (context.includes('[CURRENT_PASS]')) content = passTurn
    else if (
      !context.includes('Stormbound Chapel') ||
      !context.includes('[STARTING_POINT]') ||
      !context.includes('The player reaches Stormbound Chapel as a midnight storm closes the road.')
    ) {
      response.writeHead(422, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'missing_frozen_opening_context' }))
      return
    }

    await delay(context.includes('E2E_SLOW_TURN') ? 1_500 : responseDelayMs)
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(
      JSON.stringify({
        id: 'fake-story',
        choices: [{ message: { role: 'assistant', content } }],
      })
    )
  } catch {
    response.writeHead(400, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'invalid_json' }))
  }
})

server.listen(port, 'localhost', () => {
  process.stdout.write(`Fake story provider listening on http://localhost:${port}\n`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close())
}
