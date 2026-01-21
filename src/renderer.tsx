import { ConnectionState } from '@laplace.live/event-bridge-sdk'
import { IconHandFingerOff, IconSettings, IconX } from '@tabler/icons-react'
import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'

import { ChatEvents } from './components/events'
import PreferencesWindow from './components/preferences'
import { Button } from './components/ui/button'
import { useLaplaceClient } from './hooks/useLaplaceClient'
import { cn } from './lib/cn'
import { useRuntimeStore } from './store/useRuntimeStore'
import { useSettingsStore } from './store/useSettingsStore'
import AnimatedNumber from './utils/animated-numbers'
import { setupContextMenu } from './utils/context-menu'

import './index.css'

import type { Settings } from './store/useSettingsStore'

// TypeScript declaration for the electronAPI
declare global {
  interface Window {
    electronAPI: {
      // Settings API (electron-store)
      settings: {
        getAll: () => Promise<Settings>
        get: <K extends keyof Settings>(key: K) => Promise<Settings[K]>
        set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
        onChange: (callback: (key: string, value: unknown) => void) => () => void
      }

      // Window control
      setWindowOpacity: (opacity: number) => void
      setAlwaysOnTop: (enabled: boolean) => void
      setClickThrough: (enabled: boolean) => void
      setIgnoreMouseEvents: (ignore: boolean) => void
      onClickThroughEnabled: (callback: (enabled: boolean) => void) => () => void
      getAppVersion: () => Promise<string>
      getPlatform: () => string
      openPreferences: () => void
      closePreferences: () => void
      broadcastConnectionState: (state: ConnectionState) => void
      requestConnectionState: () => Promise<ConnectionState>
      onConnectionStateUpdate: (callback: (state: ConnectionState) => void) => () => void
      showContextMenu: (params: { selectionText: string; isEditable: boolean; inputType: string }) => void
    }
  }
}

const App: React.FC = () => {
  // Check if this is the CSS editor window
  const isCSSEditor = window.location.hash === '#css-editor'
  // Check if this is the preferences window
  const isPreferences = window.location.hash === '#preferences'

  // If this is the CSS editor window, redirect to preferences (legacy support)
  if (isCSSEditor) {
    // Redirect legacy CSS editor to preferences with CSS tab
    window.location.hash = '#preferences'
    return <PreferencesWindow />
  }

  // If this is the preferences window, render only the preferences
  if (isPreferences) {
    return <PreferencesWindow />
  }

  // Get settings from zustand store
  const { opacity, alwaysOnTop, clickThrough, baseFontSize, customCSS } = useSettingsStore()

  // Get runtime state from runtime store
  const { connectionState, onlineUserCount } = useRuntimeStore()

  // Initialize Laplace client
  useLaplaceClient()

  const rootRef = useRef<HTMLDivElement>(null)
  const titleBarRef = useRef<HTMLDivElement>(null)

  // Apply saved alwaysOnTop setting on mount and when it changes
  useEffect(() => {
    window.electronAPI.setAlwaysOnTop(alwaysOnTop)
  }, [alwaysOnTop])

  // Apply saved clickThrough setting when it changes
  useEffect(() => {
    window.electronAPI.setClickThrough(clickThrough)
  }, [clickThrough])

  // Initialize CSS variable for event font size on mount
  useEffect(() => {
    document.documentElement.style.setProperty('--event-font-size', `${baseFontSize}px`)
  }, [baseFontSize])

  // Initialize custom CSS on mount and when it changes
  // Settings sync is now handled automatically by electron-store
  useEffect(() => {
    let styleElement = document.getElementById('dynamic-custom-css')

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'dynamic-custom-css'
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = customCSS
  }, [customCSS])

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
      // Only process if click-through is enabled
      if (!clickThrough) {
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
      if (!enabled) {
        window.electronAPI.setIgnoreMouseEvents(false)
      }
    })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      window.electronAPI.setIgnoreMouseEvents(false)
      unsubscribe() // Clean up the IPC listener
    }
  }, [clickThrough])

  const handleClose = () => {
    window.close()
  }

  return (
    <div className='h-[100vh] bg-[rgba(20,20,20,0.9)] overflow-hidden rounded-lg' ref={rootRef}>
      <div
        id={'title-bar'}
        className={cn('sticky z-10 top-0 h-12 text-white flex items-start pt-1.5 pl-2 pr-1.5 drag')}
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
          <div className='flex items-center text-shadow-xs no-drag'>
            {clickThrough && (
              <Button variant='link' size='icon' tint='white' type='button' disabled>
                <IconHandFingerOff size={14} />
              </Button>
            )}
            <Button
              variant='link'
              size='icon'
              tint='white'
              type='button'
              id='settings-btn'
              title='Settings'
              onClick={() => window.electronAPI.openPreferences()}
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

      <ChatEvents />
    </div>
  )
}

// Initialize React
const container = document.getElementById('root')
if (container) {
  const root = ReactDOM.createRoot(container)
  root.render(<App />)
}

// Setup context menu for input/textarea elements
setupContextMenu()

console.log('👋 Chat overlay is now running with LAPLACE Event Bridge integration!')
