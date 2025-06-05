// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  setWindowOpacity: (opacity: number) => ipcRenderer.send('set-window-opacity', opacity),
  setAlwaysOnTop: (enabled: boolean) => ipcRenderer.send('set-always-on-top', enabled),
  setClickThrough: (enabled: boolean) => ipcRenderer.send('set-click-through', enabled),
  setIgnoreMouseEvents: (ignore: boolean) => ipcRenderer.send('set-ignore-mouse-events', ignore),
  onClickThroughEnabled: (callback: (enabled: boolean) => void) => {
    const handler = (event: Electron.IpcRendererEvent, enabled: boolean) => callback(enabled)
    ipcRenderer.on('click-through-enabled', handler)

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener('click-through-enabled', handler)
    }
  },
})
