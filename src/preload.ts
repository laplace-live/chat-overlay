// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
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

  // CSS updates from preferences window
  onCustomCSSUpdated: (callback: (css: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, css: string) => callback(css)
    ipcRenderer.on('custom-css-updated', handler)

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener('custom-css-updated', handler)
    }
  },

  // CSS Editor window methods (for preferences window)
  updateCustomCSS: (css: string) => ipcRenderer.send('update-custom-css', css),

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
