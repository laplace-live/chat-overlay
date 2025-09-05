import { useEffect, useRef } from 'react'
import { ConnectionState, LaplaceEventBridgeClient } from '@laplace.live/event-bridge-sdk'
import type { LaplaceEvent } from '@laplace.live/event-types'
import { useRuntimeStore } from '../store/useRuntimeStore'
import { useSettingsStore } from '../store/useSettingsStore'

export function useLaplaceClient() {
  const clientRef = useRef<LaplaceEventBridgeClient | null>(null)

  const { serverHost, serverPort, serverPassword, allowedOrigins } = useSettingsStore()
  const { setConnectionState, setOnlineUserCount, addMessage, clearMessages } = useRuntimeStore()

  // Use ref for allowedOrigins to avoid stale closures
  const allowedOriginsRef = useRef(allowedOrigins)
  useEffect(() => {
    allowedOriginsRef.current = allowedOrigins
  }, [allowedOrigins])

  useEffect(() => {
    // Disconnect previous client if exists
    if (clientRef.current) {
      clientRef.current.disconnect()
      clientRef.current = null
    }

    // Initialize the event bridge client
    const client = new LaplaceEventBridgeClient({
      url: `ws://${serverHost}:${serverPort}`,
      token: serverPassword,
      reconnect: true,
    })

    // Handle incoming events
    const handleEvent = (event: LaplaceEvent) => {
      console.log('Received event:', event)

      // Filter by allowed origins if specified
      if (allowedOriginsRef.current) {
        const allowedOriginsList = allowedOriginsRef.current
          .split(',')
          .map(o => o.trim())
          .filter(o => o)

        if (allowedOriginsList.length > 0 && 'origin' in event) {
          const eventOrigin = String(event.origin)
          if (!allowedOriginsList.includes(eventOrigin)) {
            console.log(
              `Filtered out event from origin ${eventOrigin} (not in allowed list: ${allowedOriginsList.join(', ')})`
            )
            return
          }
        }
      }

      // Handle online-update event separately
      if (event.type === 'online-update') {
        setOnlineUserCount(event.online)
        return // Don't add to messages
      }

      // Add other events to messages
      addMessage(event)
    }

    // Handle connection state changes
    const handleConnectionStateChange = (state: ConnectionState) => {
      console.log(`Connection state changed to: ${state}`)
      setConnectionState(state)
      // Broadcast the state to all windows via IPC
      window.electronAPI.broadcastConnectionState(state)
    }

    // Set up event listeners
    client.onAny(handleEvent)
    client.onConnectionStateChange(handleConnectionStateChange)

    // Connect to the event bridge
    client.connect().catch(err => {
      console.error('Failed to connect to event bridge:', err)
    })

    clientRef.current = client

    // Cleanup on unmount or when server settings change
    return () => {
      client.offAny(handleEvent)
      client.offConnectionStateChange(handleConnectionStateChange)
      client.disconnect()
      clientRef.current = null
      clearMessages()
    }
  }, [serverHost, serverPort, serverPassword, setConnectionState, setOnlineUserCount, addMessage, clearMessages])

  // Return the client instance if needed for direct access
  return clientRef.current
}
