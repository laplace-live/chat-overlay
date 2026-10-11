// Marketing screenshots: every shot in scripts/screenshots/shots.mts, into screenshots/.
//   pnpm screenshots                  # every shot
//   pnpm screenshots --only=settings  # shots by name, comma-separated
// Builds the app, then runs it for a few seconds on a throwaway profile against a made-up Event Bridge; the
// overlay takes no clicks or keys meanwhile. docs/screenshots.md has the rest.

import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createWriteStream, mkdtempSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { VitePlugin } from '@electron-forge/plugin-vite'
import type { ForgeConfig } from '@electron-forge/shared-types'
import { createJiti } from 'jiti'

import { freePort } from './screenshots/bridge.mts'
import { CONFIG_ENV, type HarnessConfig } from './screenshots/config.mts'
import { SHOTS } from './screenshots/shots.mts'

const { values } = parseArgs({ options: { only: { type: 'string' } } })
const only = (values.only ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(s => s !== '')
const unknown = only.filter(name => !SHOTS.some(s => s.name === name))
if (unknown.length > 0) {
  console.error(`unknown shot ${unknown.join(', ')} — one of ${SHOTS.map(s => s.name).join(', ')}`)
  process.exit(1)
}

const projectDir = resolve(import.meta.dirname, '..')

// The bundles `pnpm package` makes, from the same Forge config and by Forge's own build worker, plus the
// harness beside them; a stale .vite would picture old UI.
const forgeConfig = await createJiti(import.meta.url).import<ForgeConfig>(join(projectDir, 'forge.config.ts'), {
  default: true,
})
const vite = forgeConfig.plugins?.find((plugin): plugin is VitePlugin => plugin instanceof VitePlugin)
if (vite === undefined) throw new Error('forge.config.ts has no VitePlugin to build with')
const harness = {
  entry: 'scripts/screenshots/harness.mts',
  config: 'vite.main.config.mts',
  target: 'main',
} satisfies (typeof vite.config.build)[number]
const build = [...vite.config.build, harness]
const { renderer } = vite.config
// `@electron-forge/plugin-vite` runs this worker per target when packaging; it isn't a public entry.
const worker = join(dirname(fileURLToPath(import.meta.resolve('@electron-forge/plugin-vite'))), 'subprocess-worker.js')
rmSync(join(projectDir, '.vite'), { recursive: true, force: true })
await Promise.all([
  ...build.map((_, index) => viteBuild('build', index)),
  ...renderer.map((_, index) => viteBuild('renderer', index)),
])

const root = mkdtempSync(join(tmpdir(), 'chat-overlay-screenshots-'))
const config: HarnessConfig = {
  appData: join(root, 'appdata'),
  out: join(projectDir, 'screenshots'),
  only,
  port: await freePort(),
}
const electron: unknown = createRequire(import.meta.url)('electron')
if (typeof electron !== 'string') throw new Error('electron did not resolve to a binary path')
const env: NodeJS.ProcessEnv = { ...process.env, [CONFIG_ENV]: JSON.stringify(config) }
// A leaked ELECTRON_RUN_AS_NODE makes the app's `require('electron')` a path string.
delete env.ELECTRON_RUN_AS_NODE
const log = join(root, 'electron.log')
const logStream = createWriteStream(log)
// The checkout runs as is, its main bundle after the harness that `-r` preloads; the mock keychain keeps
// Chromium's storage keys off the user's real keychain.
const harnessBundle = join(projectDir, '.vite/build', `${basename(harness.entry, '.mts')}.cjs`)
const child = spawn(electron, ['-r', harnessBundle, projectDir, '--use-mock-keychain'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env,
})
// The app logs plenty; the terminal gets the harness's own lines, the file gets everything.
for (const stream of [child.stdout, child.stderr]) {
  createInterface({ input: stream }).on('line', line => {
    logStream.write(`${line}\n`)
    const at = line.indexOf('screenshots:')
    if (at !== -1) console.log(line.slice(at))
  })
}
const [code]: unknown[] = await once(child, 'close')
logStream.end()
if (code !== 0) {
  console.error(`screenshots: failed (${String(code)}) — app log in ${log}, profile in ${config.appData}`)
  process.exit(typeof code === 'number' ? code : 1)
}
rmSync(root, { recursive: true, force: true })

/** One Forge target through Forge's worker, which writes it under `.vite/`. */
async function viteBuild(kind: 'build' | 'renderer', index: number): Promise<void> {
  const child = spawn(process.execPath, [worker], {
    cwd: projectDir,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: {
      ...process.env,
      FORGE_VITE_PROJECT_DIR: projectDir,
      FORGE_VITE_KIND: kind,
      FORGE_VITE_INDEX: String(index),
      FORGE_VITE_CONFIG: JSON.stringify({ build, renderer }),
    },
  })
  const [code]: unknown[] = await once(child, 'close')
  if (code !== 0) throw new Error(`the Vite ${kind} build #${String(index)} exited with ${String(code)}`)
}
