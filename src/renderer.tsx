import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ConnectionState, LaplaceEventBridgeClient } from '@laplace.live/event-bridge-sdk'
import type { LaplaceEvent } from '@laplace.live/event-types'

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
  const [opacity, setOpacity] = useState(90)
  const [alwaysOnTop, setAlwaysOnTop] = useState(true)
  const [clickThrough, setClickThrough] = useState(false)
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED)
  const [client, setClient] = useState<LaplaceEventBridgeClient | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const titleBarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const clickThroughEnabledRef = useRef(false)
  const isSettingsOpenRef = useRef(false)

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

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize the event bridge client
    const eventBridgeClient = new LaplaceEventBridgeClient({
      url: 'ws://localhost:9696',
      reconnect: true,
    })

    // Listen for all events
    eventBridgeClient.onAny(event => {
      console.log('Received event:', event)
      setMessages(prev => [...prev, event])
    })

    // Listen for connection state changes
    eventBridgeClient.onConnectionStateChange(state => {
      console.log(`Connection state changed to: ${state}`)
      setConnectionState(state)
    })

    // Connect to the event bridge
    eventBridgeClient.connect().catch(err => {
      console.error('Failed to connect to event bridge:', err)
    })

    setClient(eventBridgeClient)

    // Cleanup on unmount
    return () => {
      eventBridgeClient.disconnect()
    }
  }, [])

  useEffect(() => {
    // Update the background opacity
    const content = document.querySelector('.content') as HTMLElement
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
        <div key={index} className='message system-message'>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'interaction') {
      const actionMap: { [key: number]: string } = {
        1: '进入直播间',
        2: '关注',
        3: '分享',
        4: '特别关注',
        5: '互相关注',
      }

      return (
        <div key={index} className='message interaction-message'>
          <span className='text'>
            {event.username} {actionMap[event.action]}
          </span>
        </div>
      )
    }

    if (event.type === 'message') {
      return (
        <div key={index} className='message'>
          <span className='username'>{event.username}:</span>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'superchat') {
      return (
        <div key={index} className='message superchat-message'>
          <span className='username'>{event.username}:</span>
          <span className='price'>[¥{event.priceNormalized}]</span>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'gift') {
      return (
        <div key={index} className='message gift-message'>
          <span className='username'>{event.username}:</span>
          <span className='price'>[¥{event.priceNormalized}]</span>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'entry-effect') {
      return (
        <div key={index} className='message entry-effect'>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    return null
  }

  return (
    <>
      <div className='title-bar' ref={titleBarRef}>
        <span>LAPLACE Chat Overlay</span>
        <div className='title-bar-buttons'>
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
          <div className='chat-header'>
            <h2>Chat Messages</h2>
            <div className='connection-status'>
              <span className={`status-dot ${connectionState}`}></span>
              <span className='status-text'>{connectionState}</span>
            </div>
          </div>
          <div className='chat-messages'>
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
