// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // === Settings API (electron-store) ===
  settings: {
    // Get all settings
    getAll: () => ipcRenderer.invoke('settings:getAll'),

    // Get a specific setting
    get: (key: string) => ipcRenderer.invoke('settings:get', key),

    // Set a specific setting (broadcasts to all windows automatically)
    set: (key: string, value: unknown) => ipcRenderer.send('settings:set', key, value),

    // Listen for settings changes from other windows
    onChange: (callback: (key: string, value: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, key: string, value: unknown) => callback(key, value)
      ipcRenderer.on('settings-changed', handler)

      // Return unsubscribe function
      return () => {
        ipcRenderer.removeListener('settings-changed', handler)
      }
    },
  },

  // === Window control ===
  setWindowOpacity: (opacity: number) => ipcRenderer.send('set-window-opacity', opacity),
  setAlwaysOnTop: (enabled: boolean) => ipcRenderer.send('set-always-on-top', enabled),
  setClickThrough: (enabled: boolean) => ipcRenderer.send('set-click-through', enabled),
  setIgnoreMouseEvents: (ignore: boolean) => ipcRenderer.send('set-ignore-mouse-events', ignore),
  onClickThroughEnabled: (callback: (enabled: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, enabled: boolean) => callback(enabled)
    ipcRenderer.on('click-through-enabled', handler)

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener('click-through-enabled', handler)
    }
  },
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => process.platform,

  // Preferences window methods
  openPreferences: () => ipcRenderer.send('open-preferences'),
  closePreferences: () => ipcRenderer.send('close-preferences'),

  // Connection state synchronization
  broadcastConnectionState: (state: string) => ipcRenderer.send('broadcast-connection-state', state),
  requestConnectionState: () => ipcRenderer.invoke('request-connection-state'),
  onConnectionStateUpdate: (callback: (state: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: string) => callback(state)
    ipcRenderer.on('connection-state-updated', handler)

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener('connection-state-updated', handler)
    }
  },

  // Context menu for input/textarea elements
  showContextMenu: (params: { selectionText: string; isEditable: boolean; inputType: string }) => {
    ipcRenderer.send('show-context-menu', params)
  },
})
