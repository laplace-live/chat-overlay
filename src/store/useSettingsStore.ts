import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
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

  // Actions
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
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      // Default values
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

      // Actions
      setOpacity: opacity => set({ opacity }),
      setBaseFontSize: baseFontSize => set({ baseFontSize }),
      setAlwaysOnTop: alwaysOnTop => set({ alwaysOnTop }),
      setClickThrough: clickThrough => set({ clickThrough }),
      setShowInteractionEvents: showInteractionEvents => set({ showInteractionEvents }),
      setShowGiftFree: showGiftFree => set({ showGiftFree }),
      setShowEntryEffect: showEntryEffect => set({ showEntryEffect }),
      setCustomCSS: customCSS => set({ customCSS }),
      setServerHost: serverHost => set({ serverHost }),
      setServerPort: serverPort => set({ serverPort }),
      setServerPassword: serverPassword => set({ serverPassword }),
      setAllowedOrigins: allowedOrigins => set({ allowedOrigins }),
    }),
    {
      name: 'overlay-settings', // unique name for localStorage key
    }
  )
)
