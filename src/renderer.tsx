import { ConnectionState } from '@laplace.live/event-bridge-sdk'
import {
  IconHandFinger,
  IconHandFingerOff,
  IconInfoCircle,
  IconPin,
  IconPinFilled,
  IconSettings,
  IconX,
} from '@tabler/icons-react'
import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { AboutModal } from './components/about-modal'
import { ChatEvents } from './components/events'
import { SettingsModal } from './components/settings-modal'
import { Button } from './components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown'
import { DebugMenu } from './dev/debug-menu'
import { useLaplaceClient } from './hooks/useLaplaceClient'
import { cn } from './lib/cn'
import { useRuntimeStore } from './store/useRuntimeStore'
import { useSettingsStore } from './store/useSettingsStore'
import AnimatedNumber from './utils/animated-numbers'

import './index.css'

// TypeScript declaration for the electronAPI
declare global {
  interface Window {
    electronAPI: {
      setWindowOpacity: (opacity: number) => void
      setAlwaysOnTop: (enabled: boolean) => void
      setClickThrough: (enabled: boolean) => void
      setClickThroughSuspended: (suspended: boolean) => void
      setIgnoreMouseEvents: (ignore: boolean) => void
      setTitleBarHeight: (height: number) => void
      notifyTitleBarHovered: () => void
      onClickThroughEnabled: (callback: (enabled: boolean) => void) => () => void
      getAppVersion: () => Promise<string>
      openExternal: (url: string) => void
    }
  }
}

// The main process opens a second copy of this bundle in `?sensor=1` mode: a
// transparent strip parked over the title bar, whose only job is to notice the
// cursor arriving while the overlay is passing clicks through. See src/main.ts.
const isTitleBarSensor = new URLSearchParams(window.location.search).has('sensor')

const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Any title-bar overlay (settings/about dialog or the settings menu) that needs
  // to capture mouse events even when click pass-through is enabled.
  const overlayInteractive = isSettingsOpen || isAboutOpen || isMenuOpen

  // Get settings from zustand store
  const { opacity, alwaysOnTop, clickThrough, baseFontSize, customCSS, setAlwaysOnTop, setClickThrough } =
    useSettingsStore()

  // Get runtime state from runtime store
  const { connectionState, onlineUserCount } = useRuntimeStore()

  // Initialize Laplace client
  useLaplaceClient()

  const rootRef = useRef<HTMLDivElement>(null)
  const titleBarRef = useRef<HTMLDivElement>(null)

  // The main process starts each launch at its defaults and has no way to read
  // the persisted store, so every window setting that lives here has to be
  // pushed back on mount — otherwise the toggle reads on while nothing is.
  useEffect(() => {
    window.electronAPI.setAlwaysOnTop(alwaysOnTop)
    window.electronAPI.setClickThrough(clickThrough)
  }, [])

  // Initialize CSS variable for event font size on mount
  useEffect(() => {
    document.documentElement.style.setProperty('--event-font-size', `${baseFontSize}px`)
  }, [baseFontSize])

  // Initialize custom CSS on mount and when it changes
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

  // Title-bar overlays have to capture input, so pause pass-through while one is
  // open. The main process owns the reset, which keeps every platform in sync.
  useEffect(() => {
    window.electronAPI.setClickThroughSuspended(overlayInteractive)
  }, [overlayInteractive])

  // The sensor strip has to cover exactly the interactive part of the title bar,
  // and only the renderer knows how tall that is.
  useEffect(() => {
    const titleBar = titleBarRef.current
    if (!titleBar) return

    const report = () => window.electronAPI.setTitleBarHeight(titleBar.getBoundingClientRect().height)
    report()

    const observer = new ResizeObserver(report)
    observer.observe(titleBar)

    return () => observer.disconnect()
  }, [])

  // The main process can turn pass-through off on its own (Escape on Linux), so
  // mirror its state back into the store to keep the toggle honest.
  useEffect(() => {
    return window.electronAPI.onClickThroughEnabled(enabled => {
      if (!enabled) setClickThrough(false)
    })
  }, [setClickThrough])

  useEffect(() => {
    // Set up mouse tracking for click-through functionality
    const handleMouseMove = (e: MouseEvent) => {
      // Only process if click-through is enabled and no title-bar overlay is open
      if (!clickThrough || overlayInteractive) {
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

    // No reset on teardown: this effect re-runs the moment `clickThrough` flips,
    // and a reset here would immediately undo the pass-through the main process
    // has just engaged. Main owns that reset, and does it when pass-through ends.
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [clickThrough, overlayInteractive])

  const handleClose = () => {
    window.close()
  }

  return (
    <div className='h-screen bg-[rgba(20,20,20,0.9)] overflow-hidden rounded-lg' ref={rootRef}>
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
            {/* Dev-only event simulator; tree-shaken out of production builds */}
            {import.meta.env.DEV && <DebugMenu />}
            <Button
              variant='ghost'
              size='icon-sm'
              tint='white'
              type='button'
              id='click-through-btn'
              title={clickThrough ? 'Disable Click Pass-Through' : 'Enable Click Pass-Through'}
              onClick={() => {
                const next = !clickThrough
                setClickThrough(next)
                window.electronAPI.setClickThrough(next)
              }}
            >
              {clickThrough ? <IconHandFingerOff size={14} /> : <IconHandFinger size={14} />}
            </Button>
            <Button
              variant='ghost'
              size='icon-sm'
              tint='white'
              type='button'
              id='always-on-top-btn'
              title={alwaysOnTop ? 'Disable Always on Top' : 'Enable Always on Top'}
              onClick={() => {
                const next = !alwaysOnTop
                setAlwaysOnTop(next)
                window.electronAPI.setAlwaysOnTop(next)
              }}
            >
              {alwaysOnTop ? <IconPinFilled size={14} /> : <IconPin size={14} />}
            </Button>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon-sm' tint='white' type='button' id='settings-btn' title='Menu'>
                  <IconSettings size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='bg-bg/90'>
                <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)}>
                  <IconSettings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsAboutOpen(true)}>
                  <IconInfoCircle />
                  About
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant='ghost'
              size='icon-sm'
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

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  )
}

// Nothing visible: a bare hit area that reports the cursor reaching the title
// bar, so the main process can hand the pointer back to the real window.
const TitleBarSensor: React.FC = () => {
  useEffect(() => {
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'
  }, [])

  return (
    <div
      className='fixed inset-0'
      onMouseEnter={() => window.electronAPI.notifyTitleBarHovered()}
      onMouseMove={() => window.electronAPI.notifyTitleBarHovered()}
    />
  )
}

// Initialize React
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(isTitleBarSensor ? <TitleBarSensor /> : <App />)
}

if (!isTitleBarSensor) {
  console.log('👋 Chat overlay is now running with LAPLACE Event Bridge integration!')
}
