import Store from 'electron-store'

// Settings schema - defines the shape and defaults for all settings
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

// Default values for all settings
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

// Create the electron-store instance with schema
// Use type assertion to work around TypeScript version compatibility
const store = new Store<Settings>({
  name: 'settings',
  defaults,
}) as Store<Settings> & {
  store: Settings
  get<K extends keyof Settings>(key: K): Settings[K]
  set<K extends keyof Settings>(key: K, value: Settings[K]): void
  set(object: Partial<Settings>): void
}

// Helper to get all settings at once
export function getAllSettings(): Settings {
  return store.store
}

// Helper to get a specific setting
export function getSetting<K extends keyof Settings>(key: K): Settings[K] {
  return store.get(key)
}

// Helper to set a specific setting
export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  store.set(key, value)
}

// Helper to set multiple settings at once
export function setSettings(settings: Partial<Settings>): void {
  store.set(settings)
}

// Export the store for direct access if needed
export { store as settingsStore }
export default store
