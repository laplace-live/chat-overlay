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

  // CSS Editor methods
  openCSSEditor: (currentCSS: string) => ipcRenderer.send('open-css-editor', currentCSS),
  onCustomCSSUpdated: (callback: (css: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, css: string) => callback(css)
    ipcRenderer.on('custom-css-updated', handler)

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener('custom-css-updated', handler)
    }
  },

  // CSS Editor window methods
  updateCustomCSS: (css: string) => ipcRenderer.send('update-custom-css', css),
  closeCSSEditor: () => ipcRenderer.send('close-css-editor'),
  onLoadCSS: (callback: (css: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, css: string) => callback(css)
    ipcRenderer.on('load-css', handler)

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener('load-css', handler)
    }
  },
})
