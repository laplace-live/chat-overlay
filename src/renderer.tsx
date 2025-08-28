import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { IconHandFingerOff, IconSettings, IconX } from '@tabler/icons-react'
import { ConnectionState } from '@laplace.live/event-bridge-sdk'

import AnimatedNumber from './utils/animated-numbers'
import { useSettingsStore } from './store/useSettingsStore'
import { useRuntimeStore } from './store/useRuntimeStore'
import { useLaplaceClient } from './hooks/useLaplaceClient'
import { ChatEvents } from './components/events'
import { SettingsModal } from './components/settings-modal'

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Get settings from zustand store
  const { opacity, alwaysOnTop, clickThrough } = useSettingsStore()

  // Get runtime state from runtime store
  const { connectionState, onlineUserCount } = useRuntimeStore()

  // Initialize Laplace client
  useLaplaceClient()

  const rootRef = useRef<HTMLDivElement>(null)
  const titleBarRef = useRef<HTMLDivElement>(null)

  // Apply saved alwaysOnTop setting on mount
  useEffect(() => {
    window.electronAPI.setAlwaysOnTop(alwaysOnTop)
  }, [])

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
      if (!clickThrough || isSettingsOpen) {
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
  }, [clickThrough, isSettingsOpen])

  // Ensure click-through is disabled when settings modal is open
  useEffect(() => {
    if (isSettingsOpen && clickThrough) {
      window.electronAPI.setIgnoreMouseEvents(false)
    }
  }, [isSettingsOpen, clickThrough])

  const handleClose = () => {
    window.close()
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

      <ChatEvents />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
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
