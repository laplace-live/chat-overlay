import { create } from 'zustand'

// Settings interface - must match the one in electronStore.ts
export interface Settings {
  // UI Settings
  opacity: number
  baseFontSize: number
  alwaysOnTop: boolean
  clickThrough: boolean
  showInteractionEvents: boolean
  showGiftFree: boolean
  showEntryEffect: boolean
  customCSS: string

  // Server Settings
  serverHost: string
  serverPort: string
  serverPassword: string
  allowedOrigins: string
}

// Default values (fallback before hydration)
const defaults: Settings = {
  opacity: 80,
  baseFontSize: 20,
  alwaysOnTop: false,
  clickThrough: false,
  showInteractionEvents: true,
  showGiftFree: false,
  showEntryEffect: false,
  customCSS: '',
  serverHost: 'localhost',
  serverPort: '9696',
  serverPassword: '',
  allowedOrigins: '',
}

interface SettingsState extends Settings {
  // Hydration state
  _hydrated: boolean

  // Actions - each setter syncs to electron-store automatically
  setOpacity: (opacity: number) => void
  setBaseFontSize: (fontSize: number) => void
  setAlwaysOnTop: (enabled: boolean) => void
  setClickThrough: (enabled: boolean) => void
  setShowInteractionEvents: (enabled: boolean) => void
  setShowGiftFree: (enabled: boolean) => void
  setShowEntryEffect: (enabled: boolean) => void
  setCustomCSS: (css: string) => void
  setServerHost: (host: string) => void
  setServerPort: (port: string) => void
  setServerPassword: (password: string) => void
  setAllowedOrigins: (origins: string) => void

  // Internal: update a single setting from external source (e.g., another window)
  _updateFromExternal: (key: keyof Settings, value: unknown) => void
}

// Helper to create a setter that syncs to electron-store
const createSetter = <K extends keyof Settings>(key: K) => {
  return (set: (partial: Partial<SettingsState>) => void) => (value: Settings[K]) => {
    set({ [key]: value } as Partial<SettingsState>)
    // Sync to electron-store via IPC
    window.electronAPI.settings.set(key, value)
  }
}

export const useSettingsStore = create<SettingsState>()(set => ({
  // Default values (will be overwritten by hydration)
  ...defaults,
  _hydrated: false,

  // Actions with automatic sync to electron-store
  setOpacity: createSetter('opacity')(set),
  setBaseFontSize: createSetter('baseFontSize')(set),
  setAlwaysOnTop: createSetter('alwaysOnTop')(set),
  setClickThrough: createSetter('clickThrough')(set),
  setShowInteractionEvents: createSetter('showInteractionEvents')(set),
  setShowGiftFree: createSetter('showGiftFree')(set),
  setShowEntryEffect: createSetter('showEntryEffect')(set),
  setCustomCSS: createSetter('customCSS')(set),
  setServerHost: createSetter('serverHost')(set),
  setServerPort: createSetter('serverPort')(set),
  setServerPassword: createSetter('serverPassword')(set),
  setAllowedOrigins: createSetter('allowedOrigins')(set),

  // Update from external source (another window changed a setting)
  _updateFromExternal: (key, value) => {
    set({ [key]: value } as Partial<SettingsState>)
  },
}))

// Hydrate settings from electron-store on startup
if (typeof window !== 'undefined') {
  // Load initial settings
  window.electronAPI.settings.getAll().then((settings: Settings) => {
    useSettingsStore.setState({ ...settings, _hydrated: true })
  })

  // Listen for settings changes from other windows
  window.electronAPI.settings.onChange((key: string, value: unknown) => {
    useSettingsStore.getState()._updateFromExternal(key as keyof Settings, value)
  })
}
