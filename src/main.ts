import { spawn } from 'node:child_process'
import path from 'node:path'
import { app, BrowserWindow, ipcMain, nativeTheme, shell } from 'electron'
import started from 'electron-squirrel-startup'
import { updateElectronApp } from 'update-electron-app'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit()
}

const OZONE_PLATFORM_SWITCH = '--ozone-platform='

// Always on top and click pass-through both need an X11 client on Linux:
//
// - Wayland gives clients no control over z-order, so `setAlwaysOnTop` is a
//   silent no-op there and always will be (electron/electron#50403).
// - Electron's `setIgnoreMouseEvents` is gated behind `IsX11()`; the Wayland
//   implementation is still an unmerged PR (electron/electron#51769).
//
// Under XWayland both work, because Mutter honors `_NET_WM_STATE_ABOVE` and the
// XShape input region for X11 clients. Since Electron 38.2 the ozone platform is
// picked from `XDG_SESSION_TYPE` during `PreEarlyInitialization()` — long before
// this script runs — so `app.commandLine.appendSwitch` is too late and the flag
// has to be on the real process argv. Packaged builds get it from their
// `.desktop` entry; every other launch path relaunches once through here.
//
// Set `CHAT_OVERLAY_ALLOW_WAYLAND=1` to opt out (e.g. no XWayland installed),
// accepting that both features go inert.
const isWaylandWithoutOverride =
  process.platform === 'linux' &&
  process.env.XDG_SESSION_TYPE === 'wayland' &&
  process.env.CHAT_OVERLAY_ALLOW_WAYLAND !== '1' &&
  !process.argv.some(arg => arg.startsWith(OZONE_PLATFORM_SWITCH))

if (isWaylandWithoutOverride) {
  // Development is left alone: the replacement outlives the electron-forge
  // parent, which takes the Vite dev server down with its own child, so the
  // relaunched app would come up pointing at a dead server.
  if (app.isPackaged) {
    // Not `app.relaunch()`: it queues the respawn onto `Browser::Shutdown()`,
    // but `app.exit()` this early hits Electron's "message loop is not ready,
    // quit directly" branch — a raw exit() that skips shutdown entirely, so the
    // replacement is silently never spawned. Spawning it here also lets us
    // detach, so the new process survives this one.
    spawn(process.execPath, [...process.argv.slice(1), `${OZONE_PLATFORM_SWITCH}x11`], {
      detached: true,
      stdio: 'ignore',
    }).unref()
    app.exit(0)
  } else {
    console.warn(
      'Running on Wayland: always on top and click pass-through will do nothing. ' +
        'Restart with `pnpm start -- --ozone-platform=x11` to develop against XWayland.'
    )
  }
}

// Configure auto-updates
updateElectronApp({
  notifyUser: false,
  logger: console,
})

// Force dark theme
nativeTheme.themeSource = 'dark'

// Store reference to main window
let mainWindow: BrowserWindow | null = null

// While pass-through is on, the chat area lets clicks fall through but the title
// bar stays live. macOS and Windows get that from `setIgnoreMouseEvents(true,
// { forward: true })`, which keeps delivering mousemove so the renderer can tell
// when the cursor comes back over the title bar.
//
// Linux has no `forward`, and nothing else fills the gap: an ignored window
// receives no pointer events at all, so `screen.getCursorScreenPoint()` — which
// is only refreshed by events our own windows receive — freezes, and `setShape()`
// constrains the bounding region (what is drawn), not the input region.
//
// What does work is a second window. `titleBarSensor` is a transparent, always
// on top strip covering exactly the title bar; it is the one thing still able to
// notice the cursor arriving while the main window is blind. On entry it hands
// control back — the main window stops ignoring the pointer and the sensor steps
// aside — so the title bar behaves natively: hover, drag and buttons all work
// because the real window is genuinely receiving the events. The renderer's
// existing mousemove handler then re-engages pass-through on the way out.
const usesTitleBarSensor = process.platform === 'linux'

// Click pass-through state. `suspended` covers title-bar overlays (settings,
// about, the menu) that have to keep capturing input while they are open.
let clickThroughEnabled = false
let clickThroughSuspended = false
let ignoringMouseEvents = false
let titleBarSensor: BrowserWindow | null = null
let titleBarHeight = 48

const isPassThroughActive = () => clickThroughEnabled && !clickThroughSuspended

// Park the sensor exactly over the main window's title bar.
const syncSensorBounds = () => {
  if (!mainWindow || mainWindow.isDestroyed() || !titleBarSensor || titleBarSensor.isDestroyed()) return

  const { x, y, width } = mainWindow.getBounds()
  titleBarSensor.setBounds({ x, y, width, height: Math.round(titleBarHeight) })
}

// Single choke point for the window's mouse handling, so the platform paths
// can't disagree about the current state. Toggling is a round trip to the
// window server, so skip no-op writes.
const applyIgnoreMouseEvents = (ignore: boolean) => {
  if (!mainWindow || mainWindow.isDestroyed() || ignore === ignoringMouseEvents) return

  ignoringMouseEvents = ignore
  mainWindow.setIgnoreMouseEvents(ignore, { forward: true })

  // The sensor is only useful while the main window cannot see the pointer
  // itself; once it can, the sensor has to get out of the way of real clicks.
  if (titleBarSensor && !titleBarSensor.isDestroyed()) {
    titleBarSensor.setIgnoreMouseEvents(!ignore)
    if (ignore) titleBarSensor.moveTop()
  }
}

const destroyTitleBarSensor = () => {
  if (!titleBarSensor) return

  const sensor = titleBarSensor
  titleBarSensor = null
  if (!sensor.isDestroyed()) sensor.destroy()
}

const createTitleBarSensor = () => {
  if (!mainWindow || mainWindow.isDestroyed() || titleBarSensor) return

  const { x, y, width } = mainWindow.getBounds()
  titleBarSensor = new BrowserWindow({
    x,
    y,
    width,
    height: Math.round(titleBarHeight),
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    // Never take focus from the overlay it is standing in front of
    focusable: false,
    acceptFirstMouse: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Same bundle as the overlay, in a mode that renders only a hover sensor
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    titleBarSensor.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}?sensor=1`)
  } else {
    titleBarSensor.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), {
      query: { sensor: '1' },
    })
  }

  titleBarSensor.on('closed', () => {
    titleBarSensor = null
  })
}

// Bring the window in line with the current pass-through state.
const syncClickThrough = () => {
  if (!mainWindow || mainWindow.isDestroyed()) return

  if (!clickThroughEnabled) {
    applyIgnoreMouseEvents(false)
    destroyTitleBarSensor()
    return
  }

  // Suspended is temporary — a dialog is open — so the sensor is only parked,
  // not torn down: rebuilding it would spin up a whole renderer process again.
  if (clickThroughSuspended) {
    applyIgnoreMouseEvents(false)
    titleBarSensor?.hide()
    return
  }

  // macOS/Windows drive the whole thing from the renderer's mousemove handler.
  if (!usesTitleBarSensor) return

  createTitleBarSensor()
  syncSensorBounds()
  titleBarSensor?.showInactive()
  // Start out passing through; the sensor hands control back on hover. This is
  // also what gives a freshly created sensor its armed state, which is sound
  // because every path that clears the sensor leaves the window interactive.
  applyIgnoreMouseEvents(true)
}

// Turning pass-through off is normally a click on the title bar, which is not
// available when it covers the whole window. Key events still reach a window
// that ignores the pointer, so Escape on the focused overlay is the way back —
// reachable with the window switcher even when every click falls through.
const setClickThroughEnabled = (enabled: boolean) => {
  clickThroughEnabled = enabled
  mainWindow?.webContents.send('click-through-enabled', enabled)
  syncClickThrough()
}

const disableClickThroughOnEscape = () => {
  if (!usesTitleBarSensor || !mainWindow) return

  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.type !== 'keyDown' || input.key !== 'Escape' || !clickThroughEnabled) return

    setClickThroughEnabled(false)
  })
}

// Register all IPC handlers once at startup
const registerIpcHandlers = () => {
  // Handle opacity changes
  ipcMain.on('set-window-opacity', (_event, opacity) => {
    mainWindow?.setOpacity(opacity)
  })

  // Handle always on top toggle
  ipcMain.on('set-always-on-top', (_event, enabled) => {
    mainWindow?.setAlwaysOnTop(enabled)
  })

  // Handle click pass-through toggle
  ipcMain.on('set-click-through', (_event, enabled) => {
    setClickThroughEnabled(Boolean(enabled))
  })

  // A title-bar overlay opened or closed; pause pass-through while one is up.
  ipcMain.on('set-click-through-suspended', (_event, suspended) => {
    clickThroughSuspended = Boolean(suspended)
    syncClickThrough()
  })

  // The renderer owns the title bar's layout, so it reports how tall the
  // interactive strip is; the sensor has to cover exactly that.
  ipcMain.on('set-title-bar-height', (_event, height) => {
    if (typeof height !== 'number' || !Number.isFinite(height) || height <= 0) return

    titleBarHeight = height
    syncSensorBounds()
  })

  // The sensor saw the cursor reach the title bar: give the pointer back to the
  // real window so the title bar behaves like it does everywhere else.
  ipcMain.on('title-bar-hovered', () => {
    if (!isPassThroughActive()) return

    applyIgnoreMouseEvents(false)
  })

  // Handle mouse enter/leave events for click-through mode
  ipcMain.on('set-ignore-mouse-events', (_event, ignore) => {
    // Only meaningful while pass-through is engaged; otherwise the window stays
    // interactive and the renderer's reports are noise.
    if (!isPassThroughActive()) return

    applyIgnoreMouseEvents(Boolean(ignore))
  })

  // Handle get app version request
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  // Open external links in the system's default browser
  ipcMain.on('open-external', (_event, url) => {
    // Only allow well-formed http(s) URLs to avoid opening arbitrary protocols
    if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
      shell.openExternal(url)
    }
  })
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 800,
    minWidth: 320,
    minHeight: 64,
    transparent: true,
    frame: false,
    alwaysOnTop: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: process.env.NODE_ENV === 'development',
    },
  })

  // A fresh window starts out interactive, so drop any state from a previous one
  ignoringMouseEvents = false
  disableClickThroughOnEscape()

  // Load the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on('move', syncSensorBounds)
  mainWindow.on('resize', syncSensorBounds)

  // Clean up reference when window is closed
  mainWindow.on('closed', () => {
    destroyTitleBarSensor()
    mainWindow = null
  })
}

// Initialize app
app.whenReady().then(() => {
  // Register IPC handlers once
  registerIpcHandlers()

  // Create initial window
  createWindow()

  // Handle app activation (macOS)
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
