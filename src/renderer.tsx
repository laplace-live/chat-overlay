import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ConnectionState, LaplaceEventBridgeClient } from '@laplace.live/event-bridge-sdk'
import type { LaplaceEvent } from '@laplace.live/event-types'
import { IconArrowDownDashed, IconHandFingerOff, IconSettings, IconX } from '@tabler/icons-react'

import AnimatedNumber from './utils/animated-numbers'
import { useSettingsStore } from './store/useSettingsStore'

import { cn } from './lib/cn'
import { Button } from './components/ui/button'

import './index.css'

// TypeScript declaration for the electronAPI
declare global {
  interface Window {
    electronAPI: {
      setWindowOpacity: (opacity: number) => void
      setAlwaysOnTop: (enabled: boolean) => void
      setClickThrough: (enabled: boolean) => void
      setIgnoreMouseEvents: (ignore: boolean) => void
      onClickThroughEnabled: (callback: (enabled: boolean) => void) => () => void
    }
  }
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<LaplaceEvent[]>([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Get settings from zustand store
  const {
    opacity,
    alwaysOnTop,
    clickThrough,
    showInteractionEvents,
    serverHost,
    serverPort,
    serverPassword,
    allowedOrigins,
    setOpacity,
    setAlwaysOnTop,
    setClickThrough,
    setShowInteractionEvents,
    setServerHost,
    setServerPort,
    setServerPassword,
    setAllowedOrigins,
  } = useSettingsStore()
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED)
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false)
  const [onlineUserCount, setOnlineUserCount] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const titleBarRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const clickThroughEnabledRef = useRef(false)
  const isSettingsOpenRef = useRef(false)
  const clientRef = useRef<LaplaceEventBridgeClient | null>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const allowedOriginsRef = useRef(allowedOrigins)

  // Keep refs in sync with state
  useEffect(() => {
    clickThroughEnabledRef.current = clickThrough
  }, [clickThrough])

  useEffect(() => {
    isSettingsOpenRef.current = isSettingsOpen
  }, [isSettingsOpen])

  useEffect(() => {
    allowedOriginsRef.current = allowedOrigins
  }, [allowedOrigins])

  // Apply saved alwaysOnTop setting on mount
  useEffect(() => {
    window.electronAPI.setAlwaysOnTop(alwaysOnTop)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle scroll to bottom button click
  const handleScrollToBottom = () => {
    scrollToBottom()
    setIsAutoScrollPaused(false)
  }

  // Check if user is at the bottom of the chat
  const isAtBottom = () => {
    const chatMessages = chatMessagesRef.current
    if (!chatMessages) return true

    const threshold = 160 // pixels from bottom to consider "at bottom"
    return chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < threshold
  }

  // Handle scroll event to detect manual scrolling
  const handleScroll = () => {
    const chatMessages = chatMessagesRef.current
    if (!chatMessages) return

    if (isAtBottom()) {
      // Resume auto-scroll if user scrolls back to bottom
      setIsAutoScrollPaused(false)
    } else {
      // Pause auto-scroll if user scrolls up
      setIsAutoScrollPaused(true)
    }
  }

  useEffect(() => {
    // Only auto-scroll if not paused
    if (!isAutoScrollPaused) {
      scrollToBottom()
    }
  }, [messages, isAutoScrollPaused])

  // Add scroll event listener
  useEffect(() => {
    const chatMessages = chatMessagesRef.current
    if (!chatMessages) return

    chatMessages.addEventListener('scroll', handleScroll)
    return () => {
      chatMessages.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    // Disconnect previous client if exists
    if (clientRef.current) {
      clientRef.current.disconnect()
      clientRef.current = null
    }

    // Initialize the event bridge client
    const eventBridgeClient = new LaplaceEventBridgeClient({
      url: `ws://${serverHost}:${serverPort}`,
      token: serverPassword,
      reconnect: true,
    })

    // Create event handlers
    const handleEvent = (event: LaplaceEvent) => {
      console.log('Received event:', event)

      // Filter by allowed origins if specified
      if (allowedOriginsRef.current) {
        // Parse allowed origins (comma-separated)
        const allowedOriginsList = allowedOriginsRef.current
          .split(',')
          .map(o => o.trim())
          .filter(o => o)

        // Check if event has origin and if it's in the allowed list
        if (allowedOriginsList.length > 0 && 'origin' in event) {
          const eventOrigin = String(event.origin)
          if (!allowedOriginsList.includes(eventOrigin)) {
            console.log(
              `Filtered out event from origin ${eventOrigin} (not in allowed list: ${allowedOriginsList.join(', ')})`
            )
            return // Skip this event
          }
        }
      }

      // Handle online-update event
      if (event.type === 'online-update') {
        setOnlineUserCount(event.online)
        return // Don't add online-update events to messages
      }

      // setMessages(prev => [...prev, event])
      setMessages(prev => {
        const keep = 500

        // Keep only the most recent events for performance
        const newMessages = [...prev, event]
        if (newMessages.length > keep) {
          return newMessages.slice(newMessages.length - keep)
        }
        return newMessages
      })
    }

    const handleConnectionStateChange = (state: ConnectionState) => {
      console.log(`Connection state changed to: ${state}`)
      setConnectionState(state)
    }

    // Listen for all events
    eventBridgeClient.onAny(handleEvent)

    // Listen for connection state changes
    eventBridgeClient.onConnectionStateChange(handleConnectionStateChange)

    // Connect to the event bridge
    eventBridgeClient.connect().catch(err => {
      console.error('Failed to connect to event bridge:', err)
    })

    clientRef.current = eventBridgeClient

    // Cleanup on unmount or when server settings change
    return () => {
      // Remove event listeners before disconnecting
      eventBridgeClient.offAny(handleEvent)
      eventBridgeClient.offConnectionStateChange(handleConnectionStateChange)
      eventBridgeClient.disconnect()
      clientRef.current = null
      // Clear messages when disconnecting to avoid confusion
      setMessages([])
    }
  }, [serverHost, serverPort, serverPassword])

  // Update the background opacity
  useEffect(() => {
    const root = rootRef.current
    const guardedOpacity = Math.max(0.15, opacity / 100)

    if (root) {
      root.style.backgroundColor = `rgba(20, 20, 20, ${guardedOpacity})`
    }
  }, [opacity])

  useEffect(() => {
    // Set up mouse tracking for click-through functionality
    const handleMouseMove = (e: MouseEvent) => {
      // Only process if click-through is enabled and settings modal is not open
      if (!clickThroughEnabledRef.current || isSettingsOpenRef.current) {
        window.electronAPI.setIgnoreMouseEvents(false)
        return
      }

      const titleBar = titleBarRef.current
      if (!titleBar) return

      const titleBarRect = titleBar.getBoundingClientRect()
      const isOverTitleBar = e.clientY <= titleBarRect.bottom

      // Only ignore mouse events when NOT over the title bar
      window.electronAPI.setIgnoreMouseEvents(!isOverTitleBar)
    }

    // Add mouse move listener
    document.addEventListener('mousemove', handleMouseMove)

    // Listen for click-through state changes from main process
    const unsubscribe = window.electronAPI.onClickThroughEnabled(enabled => {
      clickThroughEnabledRef.current = enabled
      if (!enabled) {
        window.electronAPI.setIgnoreMouseEvents(false)
      }
    })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      window.electronAPI.setIgnoreMouseEvents(false)
      unsubscribe() // Clean up the IPC listener
    }
  }, [])

  // Ensure click-through is disabled when settings modal is open
  useEffect(() => {
    if (isSettingsOpen && clickThrough) {
      window.electronAPI.setIgnoreMouseEvents(false)
    }
  }, [isSettingsOpen, clickThrough])

  const handleClose = () => {
    window.close()
  }

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseInt(e.target.value, 10)
    setOpacity(newOpacity)
  }

  const handleAlwaysOnTopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked
    setAlwaysOnTop(enabled)
    window.electronAPI.setAlwaysOnTop(enabled)
  }

  const handleClickThroughChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked
    setClickThrough(enabled)
    window.electronAPI.setClickThrough(enabled)
  }

  const handleShowInteractionEventsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked
    setShowInteractionEvents(enabled)
  }

  const handleServerHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setServerHost(value)
  }

  const handleServerPortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setServerPort(value)
  }

  const handleServerPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setServerPassword(value)
  }

  const handleAllowedOriginsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAllowedOrigins(value)
  }

  // Update body class when click-through mode changes
  useEffect(() => {
    if (clickThrough) {
      document.body.classList.add('click-through')
    } else {
      document.body.classList.remove('click-through')
    }
  }, [clickThrough])

  const closeSettings = () => {
    setIsSettingsOpen(false)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        setIsSettingsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSettingsOpen])

  // Function to render a message based on its type
  const renderMessage = (event: LaplaceEvent, index: number) => {
    if (event.type === 'system') {
      return (
        <div key={index} className='event system'>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'interaction') {
      if (!showInteractionEvents) {
        return null
      }

      const actionMap: { [key: number]: string } = {
        1: '进入直播间',
        2: '关注',
        3: '分享',
        4: '特别关注',
        5: '互相关注',
      }

      return (
        <div key={index} className={cn('event interaction', `guard-type-${event.guardType}`)}>
          <span className='username'>{event.username}</span>
          <span className='text'>{actionMap[event.action]}</span>
        </div>
      )
    }

    if (event.type === 'like-click') {
      return (
        <div key={index} className={'event like-click'}>
          <span className='username'>{event.username}:</span>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'message') {
      return (
        <div key={index} className={cn('event message', `guard-type-${event.guardType}`)}>
          <img src={event.avatar} alt='avatar' className='avatar' referrerPolicy='no-referrer' />
          <div>
            <span className='username'>{event.username}:</span>
            <span className='text'>{event.message}</span>
          </div>
        </div>
      )
    }

    if (event.type === 'superchat') {
      return (
        <div key={index} className={cn('event superchat', `guard-type-${event.guardType}`)}>
          <span className='username'>{event.username}:</span>
          <span className='price'>[¥{event.priceNormalized}]</span>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'gift') {
      return (
        <div key={index} className={cn('event gift', `guard-type-${event.guardType}`)}>
          <span className='username'>{event.username}:</span>
          <span className='price'>[¥{event.priceNormalized}]</span>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'toast') {
      return (
        <div key={index} className='event toast'>
          <span className='username'>{event.username}:</span>
          <span className='price'>[¥{event.priceNormalized}]</span>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'entry-effect') {
      // Remove special markers <%...%> but keep the text inside
      const message = event.message.replace(/<%([^%>]+)%>/g, '$1').trim()

      return (
        <div key={index} className={cn('event entry-effect', `guard-type-${event.guardType}`)}>
          <img src={event.avatar} alt='avatar' className='avatar' referrerPolicy='no-referrer' />
          <span className='text'>{message}</span>
        </div>
      )
    }

    return null
  }

  return (
    <div className='h-[100vh] bg-[rgba(20,20,20,0.9)] overflow-hidden rounded-lg' ref={rootRef}>
      <div
        id={'title-bar'}
        className={cn(
          'sticky z-10 top-0 h-12 text-white flex items-start pt-1.5 pl-2 pr-1.5',
          '[-webkit-app-region:drag]'
        )}
        ref={titleBarRef}
      >
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-1 text-shadow-xs'>
            <span className='flex items-center gap-1 text-xs font-medium'>
              LAPLACE Chat Overlay
              {onlineUserCount !== null && (
                <span className='font-normal'>
                  <AnimatedNumber value={onlineUserCount} /> online
                </span>
              )}
            </span>

            {/* Status dot */}
            <div className='flex items-center'>
              <span
                className={cn('size-2 rounded-full bg-red-300 transition-colors', {
                  'bg-emerald-300': connectionState === ConnectionState.CONNECTED,
                  'bg-yellow-300 animate-pulse': connectionState === ConnectionState.CONNECTING,
                  'bg-orange-300 animate-pulse': connectionState === ConnectionState.RECONNECTING,
                })}
              ></span>
            </div>
          </div>
          <div className='flex items-center text-shadow-xs [-webkit-app-region:no-drag]'>
            {clickThrough && (
              <Button variant='link' size='icon' tint='white' type='button' disabled>
                <IconHandFingerOff size={14} />
              </Button>
            )}
            {isAutoScrollPaused && (
              <Button
                variant='link'
                size='icon'
                tint='white'
                type='button'
                id='scroll-to-bottom-btn'
                title='Scroll to bottom'
                onClick={handleScrollToBottom}
              >
                <IconArrowDownDashed size={14} />
              </Button>
            )}
            <Button
              variant='link'
              size='icon'
              tint='white'
              type='button'
              id='settings-btn'
              title='Settings'
              onClick={() => setIsSettingsOpen(true)}
            >
              <IconSettings size={14} />
            </Button>
            <Button
              variant='link'
              size='icon'
              tint='white'
              type='button'
              id='close-btn'
              title='Close'
              onClick={handleClose}
            >
              <IconX size={14} />
            </Button>
          </div>
        </div>
      </div>

      <div
        id='content'
        className={cn(
          'h-[100vh] flex flex-col',
          '[mask-image:linear-gradient(to_bottom,transparent,rgba(0,0,0,0.1)_24px,black_48px,black_100%,transparent)]'
        )}
        ref={contentRef}
      >
        <div id='chat-messages' className='p-2 pt-8 space-y-2 overflow-y-auto scroll-smooth' ref={chatMessagesRef}>
          {messages.length === 0 ? (
            <div className='text-center py-4 text-white/50'>
              {connectionState === ConnectionState.CONNECTED
                ? 'Waiting for messages…'
                : 'Connecting to LAPLACE Event Bridge…'}
            </div>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Settings Modal */}
      <div
        id='settings-modal'
        className={`modal ${isSettingsOpen ? 'show' : ''}`}
        onClick={e => {
          if (e.target === e.currentTarget) {
            closeSettings()
          }
        }}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h3>Settings</h3>
            <button id='close-modal-btn' className='modal-close' onClick={closeSettings}>
              ×
            </button>
          </div>
          <div className='modal-body'>
            <div className='setting-item'>
              <label htmlFor='opacity-slider'>Background Opacity:</label>
              <div className='slider-container'>
                <input
                  type='range'
                  id='opacity-slider'
                  min='0'
                  max='100'
                  value={opacity}
                  onChange={handleOpacityChange}
                />
                <span id='opacity-value'>{opacity}%</span>
              </div>
            </div>
            <div className='setting-item'>
              <label className='checkbox-label'>
                <input type='checkbox' id='always-on-top' checked={alwaysOnTop} onChange={handleAlwaysOnTopChange} />
                <span>Always on Top</span>
              </label>
              <p className='setting-description'>Keep the overlay window above all other windows</p>
            </div>
            <div className='setting-item'>
              <label className='checkbox-label'>
                <input type='checkbox' id='click-through' checked={clickThrough} onChange={handleClickThroughChange} />
                <span>Click Pass-Through</span>
              </label>
              <p className='setting-description'>
                Make the chat area click-through while keeping the title bar interactive
              </p>
            </div>
            <div className='setting-item'>
              <label className='checkbox-label'>
                <input
                  type='checkbox'
                  id='show-interaction-events'
                  checked={showInteractionEvents}
                  onChange={handleShowInteractionEventsChange}
                />
                <span>Show Interaction Events</span>
              </label>
              <p className='setting-description'>
                Display interaction events like user entering the room, following, sharing, etc.
              </p>
            </div>

            <div className='setting-separator'></div>

            <h4>Server Settings</h4>
            <div className='setting-item'>
              <label htmlFor='server-host'>Server Host:</label>
              <input
                type='text'
                id='server-host'
                className='text-input'
                value={serverHost}
                onChange={handleServerHostChange}
                placeholder='localhost'
              />
              <p className='input-description'>The host address of the LAPLACE Event Bridge server</p>
            </div>

            <div className='setting-item'>
              <label htmlFor='server-port'>Server Port:</label>
              <input
                type='text'
                id='server-port'
                className='text-input'
                value={serverPort}
                onChange={handleServerPortChange}
                placeholder='9696'
              />
              <p className='input-description'>The port number of the LAPLACE Event Bridge server</p>
            </div>

            <div className='setting-item'>
              <label htmlFor='server-password'>Server Password:</label>
              <input
                type='password'
                id='server-password'
                className='text-input'
                value={serverPassword}
                onChange={handleServerPasswordChange}
                placeholder='Optional'
              />
              <p className='input-description'>Authentication token for the server (if required)</p>
            </div>

            <div className='setting-item'>
              <label htmlFor='allowed-origins'>Allowed Rooms:</label>
              <input
                type='text'
                id='allowed-origins'
                className='text-input'
                value={allowedOrigins}
                onChange={handleAllowedOriginsChange}
                placeholder='e.g., 12345, 67890 (leave empty to allow all)'
              />
              <p className='input-description'>
                Filter events by room numbers (comma-separated). Leave empty to receive events from all rooms.
              </p>
            </div>

            <div className='setting-item'>
              <p className='setting-info'>
                Connection Status: <strong>{connectionState}</strong>
                <br />
                {connectionState === ConnectionState.CONNECTED && (
                  <span className='connected-to'>
                    Connected to {serverHost}:{serverPort}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Initialize React
const container = document.getElementById('root')
if (container) {
  const root = ReactDOM.createRoot(container)
  root.render(<App />)
}

console.log('👋 Chat overlay is now running with LAPLACE Event Bridge integration!')
