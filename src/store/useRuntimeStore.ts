import { create } from 'zustand'
import { ConnectionState } from '@laplace.live/event-bridge-sdk'
import type { LaplaceEvent } from '@laplace.live/event-types'

interface RuntimeState {
  // Connection State
  connectionState: ConnectionState
  onlineUserCount: number | null

  // Events
  messages: LaplaceEvent[]

  // Actions
  setConnectionState: (state: ConnectionState) => void
  setOnlineUserCount: (count: number | null) => void
  addMessage: (event: LaplaceEvent) => void
  clearMessages: () => void
}

const MAX_MESSAGES = 100

export const useRuntimeStore = create<RuntimeState>()(set => ({
  // Default values
  connectionState: ConnectionState.DISCONNECTED,
  onlineUserCount: null,
  messages: [],

  // Actions
  setConnectionState: connectionState => set({ connectionState }),
  setOnlineUserCount: (onlineUserCount: number | null) => set({ onlineUserCount }),
  addMessage: event =>
    set(state => {
      const newMessages = [...state.messages, event]
      // Keep only the most recent messages for performance
      if (newMessages.length > MAX_MESSAGES) {
        return { messages: newMessages.slice(-MAX_MESSAGES) }
      }
      return { messages: newMessages }
    }),
  clearMessages: () => set({ messages: [] }),
}))
