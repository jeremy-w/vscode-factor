import { ChildProcess, spawn } from 'child_process'
import { join } from 'path'
import { workspace, window } from 'vscode'

let lastUnsetPathError = new Date(0)
const MINUTES = 60 /* seconds per minute */ * 1000 /* ms per second */

const promptRegex = /^IN: [^ ]+( auto-use)? /
const eotMarker = '<~FUEL~>'
const initStanza = 'USE: fuel fuel-retort'

export class FuelListener {
  static get shared(): FuelListener {
    if (this._shared) {
      return this._shared
    }

    this._shared = startProcess()
    return this._shared
  }
  private static _shared: FuelListener | undefined

  constructor(public child: ChildProcess) {
    child.on('error', (err) => {
      this.onProcessError(err)
    })
    child.on('spawn', () => {
      console.log(`factor: successfully spawned listener process`)
      // TODO: wait for prompt, then send init stanza.
    })
  }

  onProcessError(err: Error) {
    window.showErrorMessage(
      `Factor: Listener process error: ${err}. Double-check the factor.rootDir setting.`,
    )
    if (this === FuelListener._shared) {
      FuelListener._shared = undefined
    }
  }
}

export const factorRootPath = (): string | undefined => {
  const explicitPath = workspace
    .getConfiguration('factor')
    .get<string>('rootDir')
  if (explicitPath) {
    return explicitPath
  }

  const now = new Date()
  const elapsed = now.getTime() - lastUnsetPathError.getTime()
  if (elapsed > 5 * MINUTES) {
    window.showErrorMessage(
      'Factor: The factor.rootDir setting must be set to provide context-aware help.',
    )
  }
  return
}

export const factorBinaryPath = (): string => {
  const explicitPath = workspace
    .getConfiguration('factor')
    .get<string>('binary')
  if (explicitPath) {
    return explicitPath
  }

  let filenamePerPlatform =
    (
      {
        win32: 'factor.com',
        darwin: 'Factor.app/Contents/MacOS/factor',
      } as Record<string, string>
    )[process.platform] ?? 'factor'
  const root = factorRootPath()
  const inferredPath = root
    ? join(root, filenamePerPlatform)
    : filenamePerPlatform
  return inferredPath
}

export const factorImagePath = (): string | undefined => {
  const root = factorRootPath()
  return root ? join(root, 'factor.image') : undefined
}

export const run = async (text: string): Promise<string> => {
  const child = spawn(factorBinaryPath(), [`-e=${text}`])
  child.stdout.setEncoding('utf8')
  return new Promise((res, rej) => {
    let reply = ''
    child.stdout.on('data', (chunk: string) => {
      reply += chunk
    })
    child.stdout.on('end', () => {
      res(reply)
    })
    child.on('error', (err) => {
      rej(err)
    })
  })
}

export const startProcess = () => {
  const factor = factorBinaryPath()
  const args = ['-run=fuel.listener']
  const image = factorImagePath()
  if (image) {
    args.push(`-i=${image}`)
  }
  const child = spawn(factor, args)
  return new FuelListener(child)
}
