import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import ReactDOM from 'react-dom/client'
import { ConnectionState, LaplaceEventBridgeClient } from '@laplace.live/event-bridge-sdk'
import type { LaplaceEvent } from '@laplace.live/event-types'

import AnimatedNumber from './utils/animated-numbers'

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
  const [opacity, setOpacity] = useState(() => {
    const saved = localStorage.getItem('overlay-opacity')
    return saved ? parseInt(saved) : 90
  })
  const [alwaysOnTop, setAlwaysOnTop] = useState(() => {
    const saved = localStorage.getItem('overlay-alwaysOnTop')
    return saved ? saved === 'true' : true
  })
  const [clickThrough, setClickThrough] = useState(() => {
    const saved = localStorage.getItem('overlay-clickThrough')
    return saved ? saved === 'true' : false
  })
  const [showInteractionEvents, setShowInteractionEvents] = useState(() => {
    const saved = localStorage.getItem('overlay-showInteractionEvents')
    return saved ? saved === 'true' : true
  })
  const [serverHost, setServerHost] = useState(() => {
    const saved = localStorage.getItem('overlay-serverHost')
    return saved || 'localhost'
  })
  const [serverPort, setServerPort] = useState(() => {
    const saved = localStorage.getItem('overlay-serverPort')
    return saved || '9696'
  })
  const [serverPassword, setServerPassword] = useState(() => {
    const saved = localStorage.getItem('overlay-serverPassword')
    return saved || ''
  })
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED)
  const [client, setClient] = useState<LaplaceEventBridgeClient | null>(null)
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false)
  const [onlineUserCount, setOnlineUserCount] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const titleBarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const clickThroughEnabledRef = useRef(false)
  const isSettingsOpenRef = useRef(false)
  const clientRef = useRef<LaplaceEventBridgeClient | null>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  // Keep refs in sync with state
  useEffect(() => {
    clickThroughEnabledRef.current = clickThrough
  }, [clickThrough])

  useEffect(() => {
    isSettingsOpenRef.current = isSettingsOpen
  }, [isSettingsOpen])

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

    setClient(eventBridgeClient)
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

  useEffect(() => {
    // Update the background opacity
    const titleBar = document.querySelector('.title-bar') satisfies HTMLElement
    const content = document.querySelector('.content') satisfies HTMLElement

    if (titleBar) {
      titleBar.style.backgroundColor = `rgba(20, 20, 20, ${opacity / 100})`
    }

    if (content) {
      content.style.backgroundColor = `rgba(20, 20, 20, ${opacity / 100})`
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
    const newOpacity = parseInt(e.target.value)
    setOpacity(newOpacity)
    localStorage.setItem('overlay-opacity', newOpacity.toString())
  }

  const handleAlwaysOnTopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked
    setAlwaysOnTop(enabled)
    localStorage.setItem('overlay-alwaysOnTop', enabled.toString())
    window.electronAPI.setAlwaysOnTop(enabled)
  }

  const handleClickThroughChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked
    setClickThrough(enabled)
    localStorage.setItem('overlay-clickThrough', enabled.toString())
    window.electronAPI.setClickThrough(enabled)
  }

  const handleShowInteractionEventsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked
    setShowInteractionEvents(enabled)
    localStorage.setItem('overlay-showInteractionEvents', enabled.toString())
  }

  const handleServerHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setServerHost(value)
    localStorage.setItem('overlay-serverHost', value)
  }

  const handleServerPortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setServerPort(value)
    localStorage.setItem('overlay-serverPort', value)
  }

  const handleServerPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setServerPassword(value)
    localStorage.setItem('overlay-serverPassword', value)
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
        <div key={index} className={clsx('event interaction', `guard-type-${event.guardType}`)}>
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
        <div key={index} className={clsx('event message', `guard-type-${event.guardType}`)}>
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
        <div key={index} className={clsx('event superchat', `guard-type-${event.guardType}`)}>
          <span className='username'>{event.username}:</span>
          <span className='price'>[¥{event.priceNormalized}]</span>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'gift') {
      return (
        <div key={index} className={clsx('event gift', `guard-type-${event.guardType}`)}>
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
      return (
        <div key={index} className={clsx('event entry-effect', `guard-type-${event.guardType}`)}>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    return null
  }

  return (
    <>
      <div className='title-bar' ref={titleBarRef}>
        <div className='title-bar-left'>
          <div className='connection-status'>
            <span className={`status-dot ${connectionState}`}></span>
          </div>
          <span className='title-bar-title'>
            LAPLACE Chat Overlay
            {onlineUserCount !== null && (
              <span className='online-count'>
                <AnimatedNumber value={onlineUserCount} /> online
              </span>
            )}
          </span>
        </div>
        <div className='title-bar-buttons'>
          <div>{clickThrough && <div className='click-through-indicator'>⇣</div>}</div>
          {isAutoScrollPaused && (
            <button
              id='scroll-to-bottom-btn'
              className='scroll-to-bottom-btn'
              title='Scroll to bottom'
              onClick={handleScrollToBottom}
            >
              ⬇
            </button>
          )}
          <button id='settings-btn' title='Settings' onClick={() => setIsSettingsOpen(true)}>
            ⚙
          </button>
          <button id='close-btn' title='Close' onClick={handleClose}>
            ×
          </button>
        </div>
      </div>

      <div className='content' ref={contentRef}>
        <div className='chat-container'>
          <div className='chat-messages' ref={chatMessagesRef}>
            {messages.length === 0 ? (
              <div className='no-messages'>
                {connectionState === ConnectionState.CONNECTED
                  ? 'Waiting for messages...'
                  : 'Connecting to LAPLACE Event Bridge...'}
              </div>
            ) : (
              messages.map((message, index) => renderMessage(message, index))
            )}
            <div ref={messagesEndRef} />
          </div>
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
    </>
  )
}

// Initialize React
const container = document.getElementById('root')
if (container) {
  const root = ReactDOM.createRoot(container)
  root.render(<App />)
}

console.log('👋 Chat overlay is now running with LAPLACE Event Bridge integration!')
