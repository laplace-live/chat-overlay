// Runs in Electron's main process ahead of the app's own entry, preloaded with `-r`: boots the real main
// bundle on a throwaway profile, feeds it the showcase through a made-up Event Bridge, and saves each shot.
// The app's code runs unchanged; the bridge, the pictures its events link to and the page's focus are the
// only stand-ins.

import { execFile } from 'node:child_process'
import { once } from 'node:events'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { promisify } from 'node:util'
import {
  app,
  BrowserWindow,
  type NativeImage,
  nativeImage,
  protocol,
  screen,
  session,
  type WebContents,
} from 'electron'

import { nf } from '../../src/utils/number-format.ts'
import { BRIDGE_HOST, startBridge } from './bridge.mts'
import { CONFIG_ENV, type HarnessConfig } from './config.mts'
import { SHOTS, type Shot, WINDOW } from './shots.mts'
import { createShowcase, ONLINE } from './showcase.mts'

const BOOT_TIMEOUT_MS = 60_000
const LOAD_TIMEOUT_MS = 30_000
/** Readiness checks are a round trip to the page each; a menu shows within a frame or two of a press. */
const POLL_MS = 25
/** The whole run; a wedged page must not keep a window on the user's screen forever. */
const RUN_TIMEOUT_MS = 10 * 60_000
/** Captures are 2× so a 1× display can't quietly halve what's committed. */
const SCALE_FACTOR = 2
/** Share of pixels a recapture may differ by and still leave the committed file alone; a changed digit is a change. */
const NOISE = 0.00002
/** Pixels whose channels all lie within this of the committed file's are the same pixel. */
const CHANNEL_TOLERANCE = 8

const SRGB_PROFILE = '/System/Library/ColorSync/Profiles/sRGB Profile.icc'
/** Where the overlay's settings store persists itself in localStorage. */
const SETTINGS_KEY = 'overlay-settings'

const run = promisify(execFile)

const rawConfig = process.env[CONFIG_ENV]
if (rawConfig === undefined) {
  console.error(`${CONFIG_ENV} is unset — run \`pnpm screenshots\``)
  process.exit(1)
}
const config: HarnessConfig = JSON.parse(rawConfig)

const showcase = createShowcase()
const bridge = startBridge(config.port, showcase.events)
// Awaited, and so reported, once the window is up; this only keeps Node from calling it unhandled first.
bridge.catch(() => undefined)

// Before main reads it: userData, and with it the overlay's settings, is derived from appData.
app.setPath('appData', config.appData)
// Render in sRGB, so captures don't carry the colours of the display they were taken on.
app.commandLine.appendSwitch('force-color-profile', 'srgb')
// Ahead of main's own `ready` handler, which opens the window.
app.on('ready', () => {
  protocol.handle('https', showcase.serve)
  // The bridge and the showcase's pictures are all the page may reach: anything else is refused and named.
  const bridgeHost = `${BRIDGE_HOST}:${String(config.port)}`
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ['http://*/*', 'ws://*/*', 'wss://*/*'] },
    (details, callback) => {
      const allowed = new URL(details.url).host === bridgeHost
      if (!allowed) showcase.unanswered.push(details.url)
      callback({ cancel: !allowed })
    }
  )
  seedBridge()
})

void app.whenReady().then(async () => {
  const watchdog = setTimeout(() => {
    console.error(`screenshots: no result after ${String(RUN_TIMEOUT_MS / 60_000)} minutes`)
    app.exit(1)
  }, RUN_TIMEOUT_MS)
  try {
    await takeShots()
    clearTimeout(watchdog)
    app.exit(0)
  } catch (err) {
    console.error('screenshots:', err)
    app.exit(1)
  }
})

/**
 * Points the overlay at the bridge before its own scripts run, on every load: a session preload writes the
 * bridge's address into the settings the overlay persists, which its store reads as a user's saved ones.
 */
function seedBridge(): void {
  const file = join(config.appData, 'seed-settings.js')
  const settings = JSON.stringify({ state: { serverHost: BRIDGE_HOST, serverPort: String(config.port) }, version: 0 })
  mkdirSync(config.appData, { recursive: true })
  writeFileSync(file, `localStorage.setItem(${JSON.stringify(SETTINGS_KEY)}, ${JSON.stringify(settings)})\n`)
  session.defaultSession.registerPreloadScript({ type: 'frame', filePath: file })
}

/** The overlay's window, once its page's first load has finished. */
async function mainWindow(): Promise<BrowserWindow> {
  const deadline = Date.now() + BOOT_TIMEOUT_MS
  for (;;) {
    const win = BrowserWindow.getAllWindows().find(
      w => !w.webContents.isLoading() && w.webContents.getURL().endsWith('/index.html')
    )
    if (win) return win
    if (Date.now() > deadline) throw new Error('the overlay window never loaded')
    await sleep(POLL_MS)
  }
}

async function takeShots(): Promise<void> {
  const win = await mainWindow()
  const page = win.webContents
  place(win)
  // The page goes on behaving as focused whichever app the user brings forward: Radix closes an open
  // menu when its window blurs. Over the DevTools protocol, so the app's code is untouched.
  page.debugger.attach('1.3')
  await page.debugger.sendCommand('Emulation.setFocusEmulationEnabled', { enabled: true })
  await bridge

  const shots = SHOTS.filter(s => config.only.length === 0 || config.only.includes(s.name))
  mkdirSync(config.out, { recursive: true })
  const work = mkdtempSync(join(config.appData, 'shots-'))
  for (const shot of shots) {
    await stage(win, shot)
    const raw = join(work, `${shot.name}.raw.png`)
    await capture(page, raw)
    const file = join(work, `${shot.name}.png`)
    await run('sips', ['--matchTo', SRGB_PROFILE, raw, '--out', file])
    console.log(`screenshots: ${shot.name}.png ${keep(file, join(config.out, `${shot.name}.png`))}`)
  }

  // A full run owns the folder: pictures of shots no longer listed go with it.
  if (config.only.length === 0) {
    const listed = new Set(SHOTS.map(s => `${s.name}.png`))
    for (const file of readdirSync(config.out)) {
      if (!file.endsWith('.png') || listed.has(file)) continue
      unlinkSync(join(config.out, file))
      console.log(`screenshots: ${file} removed`)
    }
  }
}

/**
 * Sizes the window for the shots on the 2× display it opened on, and keeps the user out of them: the page
 * goes on drawing when covered, and takes no clicks or keys. The harness's own presses go to the page directly.
 */
function place(win: BrowserWindow): void {
  const display = screen.getDisplayMatching(win.getBounds())
  if (display.scaleFactor !== SCALE_FACTOR) {
    throw new Error(`the overlay opened on a ${String(display.scaleFactor)}× display — move it to a Retina (2×) one`)
  }
  const area = display.workArea
  const top = area.y + Math.max(0, Math.round((area.height - WINDOW.height) / 2))
  win.setBounds({ x: area.x + 40, y: top, ...WINDOW })
  const { width, height } = win.getBounds()
  if (width !== WINDOW.width || height !== WINDOW.height) {
    throw new Error(`the screen can't fit a ${String(WINDOW.width)}×${String(WINDOW.height)} window`)
  }
  win.webContents.setBackgroundThrottling(false)
  // Behind main's back, whose click-through state stays off for the run, so nothing resets it.
  win.setIgnoreMouseEvents(true)
  win.webContents.on('before-input-event', event => {
    event.preventDefault()
  })
}

/** Reloads the page, so the bridge sends the stream afresh, waits for all of it, and opens what the shot shows. */
async function stage(win: BrowserWindow, shot: Shot): Promise<void> {
  const page = win.webContents
  const loaded = once(page, 'did-finish-load')
  page.reload()
  await loaded
  // Every line of the stream below the bridge's welcome, and the room's online count in the title bar.
  await until(page, `${shot.name}: the stream`, streamShown, showcase.rows + 1, nf.format(ONLINE))
  // Above the user's windows until the capture: a covered window rasters its avatars a shade differently.
  // Again on every load, once the page is up, as the overlay restores its own saved setting when it mounts.
  win.setAlwaysOnTop(true)
  await inPage(page, landChat)
  if (shot.settings) await openSettings(page, shot)
  const settled = await inPage(page, settlePage)
  if (settled !== true) throw new Error(`${shot.name}: the page never settled: ${settled}${unansweredNote()}`)
  if (showcase.unanswered.length > 0) throw new Error(`${shot.name}:${unansweredNote()}`)
}

/** Opens Settings from the title bar's menu, with presses as a mouse makes them. */
async function openSettings(page: WebContents, shot: Shot): Promise<void> {
  press(page, await until(page, `${shot.name}: the title bar's menu button`, centre, '#settings-btn'))
  const item = await until(
    page,
    `${shot.name}: the menu's Settings item`,
    centre,
    '[data-slot=dropdown-menu-item]',
    'Settings'
  )
  press(page, item)
  await until(page, `${shot.name}: Settings`, centre, '[data-slot=dialog-content]')
}

const unansweredNote = (): string =>
  showcase.unanswered.length === 0
    ? ''
    : ` — nothing in the showcase answers ${[...new Set(showcase.unanswered)].join(', ')}`

/** Runs `fn` in the page, sent as source with JSON arguments, so it may reach nothing outside itself. */
function inPage<A extends unknown[], R>(page: WebContents, fn: (...args: A) => R, ...args: A): Promise<Awaited<R>> {
  return page.executeJavaScript(`(${fn.toString()})(${args.map(arg => JSON.stringify(arg)).join(', ')})`)
}

/** Polls `fn` in the page until it returns something truthy, and resolves to that. */
async function until<A extends unknown[], R>(
  page: WebContents,
  what: string,
  fn: (...args: A) => R,
  ...args: A
): Promise<NonNullable<Awaited<R>>> {
  const deadline = Date.now() + LOAD_TIMEOUT_MS
  for (;;) {
    const result = await inPage(page, fn, ...args)
    if (result) return result
    if (Date.now() > deadline) throw new Error(`${what} never showed${unansweredNote()}`)
    await sleep(POLL_MS)
  }
}

/** A left click at page px `at`, as a mouse makes it. Not `click()`: the menu opens on a pointer press. */
function press(page: WebContents, [x, y]: [number, number]): void {
  page.sendInputEvent({ type: 'mouseDown', x, y, button: 'left', clickCount: 1 })
  page.sendInputEvent({ type: 'mouseUp', x, y, button: 'left', clickCount: 1 })
}

/**
 * Runs in the page: the centre, in page px, of the first `selector` match whose text is `text`, if given,
 * once it is on screen. Radix holds a menu off screen until it has placed it.
 */
function centre(selector: string, text?: string): [number, number] | null {
  const el = [...document.querySelectorAll(selector)].find(e => text === undefined || e.textContent?.trim() === text)
  if (!el) return null
  const r = el.getBoundingClientRect()
  const [x, y] = [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]
  return x >= 0 && y >= 0 && x < innerWidth && y < innerHeight ? [x, y] : null
}

/** Runs in the page: `rows` events in the chat, a green status dot, and `online` in the title bar. */
function streamShown(rows: number, online: string): boolean {
  const title = document.getElementById('title-bar')
  return (
    document.querySelectorAll('[data-slot=event]').length === rows &&
    title !== null &&
    (title.textContent ?? '').includes(online) &&
    title.querySelector('.bg-emerald-300') !== null
  )
}

/**
 * Runs in the page: the chat scrolled to its end, set outright until it stays. A stopgap: the overlay's own
 * follow can stop short when rows land during its smooth scroll, which it takes for the user scrolling up.
 */
async function landChat(): Promise<void> {
  const chat = document.getElementById('chat-messages')
  if (!chat) return
  for (let still = 0, i = 0; i < 50; i++) {
    const before = chat.scrollTop
    chat.scrollTo({ top: chat.scrollHeight, behavior: 'instant' })
    still = Math.abs(chat.scrollTop - before) < 1 ? still + 1 : 0
    if (still === 3) return
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
  }
}

/**
 * Runs in the page: resolves once every picture on screen has drawn, no spinner turns, and the page has
 * gone still; or the reasons it hasn't, after 20 seconds.
 */
async function settlePage(): Promise<true | string> {
  const wait = (ms: number): Promise<void> =>
    new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  const started = performance.now()
  const late = (): boolean => performance.now() - started > 20_000
  await document.fonts.ready
  const onScreen = (el: Element): boolean => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth
  }
  const pending = (): string[] => [
    ...[...document.images].filter(i => onScreen(i) && (!i.complete || i.naturalWidth === 0)).map(i => i.src),
    ...[...document.querySelectorAll('.animate-spin')].filter(onScreen).map(() => 'a spinner'),
  ]
  for (let left = pending(); left.length > 0; left = pending()) {
    if (late()) return [...new Set(left)].join(', ')
    await wait(100)
  }
  let changed = performance.now()
  const observer = new MutationObserver(() => {
    changed = performance.now()
  })
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true })
  // Transitions run out; a loop never does, so one is held at capture instead.
  const moving = (): boolean =>
    document
      .getAnimations()
      .some(a => a.playState === 'running' && a.effect?.getComputedTiming().iterations !== Infinity)
  while (performance.now() - changed < 300 || moving()) {
    if (late()) {
      observer.disconnect()
      return 'the page kept changing'
    }
    await wait(50)
  }
  observer.disconnect()
  return true
}

/** Runs in the page just before a capture: no caret blinking, and any looping animation at its first frame. */
function holdStill(): void {
  const active = document.activeElement
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) active.blur()
  for (const animation of document.getAnimations()) {
    if (animation.effect?.getComputedTiming().iterations !== Infinity) continue
    animation.pause()
    animation.currentTime = 0
  }
}

/** The page as it draws, transparency kept: the overlay is frameless and shadowless, so that is all of it. */
async function capture(page: WebContents, file: string): Promise<void> {
  await inPage(page, holdStill)
  // A pointer resting on the page would hover whatever is under it.
  page.sendInputEvent({ type: 'mouseLeave', x: -1, y: -1 })
  // Two frames, so the held page is the one drawn.
  await page.executeJavaScript('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))')
  const image = await page.capturePage()
  const { width, height } = image.getSize()
  if (width !== WINDOW.width * SCALE_FACTOR || height !== WINDOW.height * SCALE_FACTOR) {
    throw new Error(`the capture came out ${String(width)}×${String(height)}, not at ${String(SCALE_FACTOR)}×`)
  }
  writeFileSync(file, image.toPNG())
}

/** Copy `file` over `dest` unless the committed one differs by no more than {@link NOISE}; says which. */
function keep(file: string, dest: string): string {
  if (!existsSync(dest)) {
    copyFileSync(file, dest)
    return 'new'
  }
  const share = changedShare(nativeImage.createFromPath(file), nativeImage.createFromPath(dest))
  const percent = `${(share * 100).toFixed(3)}% of pixels`
  if (share <= NOISE) return `unchanged (${percent} within noise)`
  copyFileSync(file, dest)
  return `updated (${percent})`
}

/** The share of pixels that moved by more than {@link CHANNEL_TOLERANCE} in any channel; 1 when sizes differ. */
function changedShare(a: NativeImage, b: NativeImage): number {
  const size = a.getSize()
  const other = b.getSize()
  if (size.width !== other.width || size.height !== other.height) return 1
  const pa = a.toBitmap()
  const pb = b.toBitmap()
  let changed = 0
  for (let i = 0; i < pa.length; i += 4) {
    if (
      Math.abs(pa[i] - pb[i]) > CHANNEL_TOLERANCE ||
      Math.abs(pa[i + 1] - pb[i + 1]) > CHANNEL_TOLERANCE ||
      Math.abs(pa[i + 2] - pb[i + 2]) > CHANNEL_TOLERANCE ||
      Math.abs(pa[i + 3] - pb[i + 3]) > CHANNEL_TOLERANCE
    ) {
      changed++
    }
  }
  return changed / (size.width * size.height)
}
