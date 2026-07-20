import { spawn } from 'node:child_process'

const children = [
  spawn(process.execPath, ['ace', 'serve', '--hmr'], { stdio: 'inherit' }),
  spawn(process.execPath, ['ace', 'adventures:openings:work'], { stdio: 'inherit' }),
  spawn(process.execPath, ['ace', 'adventures:turns:work'], { stdio: 'inherit' }),
]
let stopping = false

function stopChildren(signal = 'SIGTERM') {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill(signal)
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => stopChildren(signal))
}

for (const child of children) {
  child.once('error', () => {
    process.exitCode = 1
    stopChildren()
  })
  child.once('exit', (code, signal) => {
    if (!stopping) {
      process.exitCode = code ?? (signal ? 1 : 0)
      stopChildren()
    }
  })
}

await Promise.all(
  children.map(
    (child) =>
      new Promise((resolve) => {
        child.once('close', resolve)
      })
  )
)
