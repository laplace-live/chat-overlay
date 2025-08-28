import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  // UI Settings
  opacity: number
  alwaysOnTop: boolean
  clickThrough: boolean
  showInteractionEvents: boolean

  // Server Settings
  serverHost: string
  serverPort: string
  serverPassword: string
  allowedOrigins: string

  // Actions
  setOpacity: (opacity: number) => void
  setAlwaysOnTop: (enabled: boolean) => void
  setClickThrough: (enabled: boolean) => void
  setShowInteractionEvents: (enabled: boolean) => void
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
      alwaysOnTop: false,
      clickThrough: false,
      showInteractionEvents: true,
      serverHost: 'localhost',
      serverPort: '9696',
      serverPassword: '',
      allowedOrigins: '',

      // Actions
      setOpacity: opacity => set({ opacity }),
      setAlwaysOnTop: alwaysOnTop => set({ alwaysOnTop }),
      setClickThrough: clickThrough => set({ clickThrough }),
      setShowInteractionEvents: showInteractionEvents => set({ showInteractionEvents }),
      setServerHost: serverHost => set({ serverHost }),
      setServerPort: serverPort => set({ serverPort }),
      setServerPassword: serverPassword => set({ serverPassword }),
      setAllowedOrigins: allowedOrigins => set({ allowedOrigins }),
    }),
    {
      name: 'overlay-settings', // unique name for localStorage key
      // Optional: You can specify which fields to persist
      // partialize: (state) => ({
      //   opacity: state.opacity,
      //   alwaysOnTop: state.alwaysOnTop,
      //   // ... etc
      // }),
    }
  )
)
