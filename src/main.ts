import path from 'node:path'
import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import started from 'electron-squirrel-startup'
import { updateElectronApp } from 'update-electron-app'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit()
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

// Register all IPC handlers once at startup
const registerIpcHandlers = () => {
  // Handle opacity changes
  ipcMain.on('set-window-opacity', (_event, opacity) => {
    mainWindow.setOpacity(opacity)
  })

  // Handle always on top toggle
  ipcMain.on('set-always-on-top', (_event, enabled) => {
    mainWindow.setAlwaysOnTop(enabled)
  })

  // Handle click pass-through toggle
  ipcMain.on('set-click-through', (_event, enabled) => {
    if (enabled) {
      // Don't make the entire window click-through immediately
      // Instead, let the renderer handle mouse tracking
      mainWindow.webContents.send('click-through-enabled', true)
    } else {
      // Disable click pass-through
      mainWindow.setIgnoreMouseEvents(false)
      mainWindow.webContents.send('click-through-enabled', false)
    }
  })

  // Handle mouse enter/leave events for click-through mode
  ipcMain.on('set-ignore-mouse-events', (_event, ignore) => {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true })
  })

  // Handle get app version request
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
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
    },
  })

  // Load the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Clean up reference when window is closed
  mainWindow.on('closed', () => {
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
