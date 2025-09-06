import path from 'node:path'
import { app, BrowserWindow, ipcMain, nativeTheme, Menu } from 'electron'
import started from 'electron-squirrel-startup'
import { updateElectronApp } from 'update-electron-app'
import { ConnectionState } from '@laplace.live/event-bridge-sdk'

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
let preferencesWindow: BrowserWindow | null = null

// Store current connection state
let currentConnectionState: ConnectionState = ConnectionState.DISCONNECTED

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

  // Handle CSS updates from preferences window
  ipcMain.on('update-custom-css', (_event, css) => {
    // Send the updated CSS to the main window
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('custom-css-updated', css)
    }
  })

  // Handle open preferences window
  ipcMain.on('open-preferences', () => {
    createPreferencesWindow()
  })

  // Handle close preferences window
  ipcMain.on('close-preferences', () => {
    if (preferencesWindow && !preferencesWindow.isDestroyed()) {
      preferencesWindow.close()
    }
  })

  // Handle connection state broadcasts
  ipcMain.on('broadcast-connection-state', (_event, state) => {
    // Store the current state
    currentConnectionState = state

    // Send the connection state to all windows
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('connection-state-updated', state)
    }

    if (preferencesWindow && !preferencesWindow.isDestroyed()) {
      preferencesWindow.webContents.send('connection-state-updated', state)
    }
  })

  // Handle connection state requests
  ipcMain.handle('request-connection-state', () => {
    return currentConnectionState
  })

  // Handle context menu for input/textarea elements
  ipcMain.on('show-context-menu', (_event, { isEditable }) => {
    const template: Electron.MenuItemConstructorOptions[] = []

    // Add menu items based on context
    // By only specifying 'role' without 'label', Electron automatically
    // uses the system's localized labels (matching OS language)
    // and manages the enabled/disabled state based on actual context

    if (isEditable) {
      // For editable elements, show full menu
      template.push(
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        { role: 'selectAll' }
      )
    } else {
      // For non-editable contexts (selected text), only show copy
      template.push({ role: 'copy' })
    }

    const menu = Menu.buildFromTemplate(template)
    menu.popup()
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

const createPreferencesWindow = () => {
  // Don't create multiple preferences windows
  if (preferencesWindow && !preferencesWindow.isDestroyed()) {
    preferencesWindow.focus()
    return
  }

  // Create the preferences window
  preferencesWindow = new BrowserWindow({
    width: 800,
    height: 560,
    minWidth: 480,
    minHeight: 480,
    title: 'Preferences - LAPLACE Chat Overlay',
    parent: mainWindow,
    modal: false,
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: process.env.NODE_ENV === 'development',
    },
  })

  // Completely hide the menu bar
  preferencesWindow.setMenuBarVisibility(false)

  // Load the preferences HTML
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    preferencesWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}#preferences`)
  } else {
    preferencesWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), {
      hash: 'preferences',
    })
  }

  // Show window when ready
  preferencesWindow.webContents.once('did-finish-load', () => {
    preferencesWindow.show()
  })

  // Clean up reference when window is closed
  preferencesWindow.on('closed', () => {
    preferencesWindow = null
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
