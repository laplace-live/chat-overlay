import React, { useEffect, useState } from 'react'
import { ConnectionState } from '@laplace.live/event-bridge-sdk'
import { useSettingsStore } from '../store/useSettingsStore'
import { useRuntimeStore } from '../store/useRuntimeStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { ScrollArea } from './ui/scroll-area'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // Get settings from zustand store
  const {
    opacity,
    baseFontSize,
    alwaysOnTop,
    clickThrough,
    showInteractionEvents,
    showGiftFree,
    showEntryEffect,
    customCSS,
    serverHost,
    serverPort,
    serverPassword,
    allowedOrigins,
    setOpacity,
    setBaseFontSize,
    setAlwaysOnTop,
    setClickThrough,
    setShowInteractionEvents,
    setShowGiftFree,
    setShowEntryEffect,

    setServerHost,
    setServerPort,
    setServerPassword,
    setAllowedOrigins,
  } = useSettingsStore()

  // Get connection state from runtime store
  const { connectionState } = useRuntimeStore()

  // State for app version
  const [appVersion, setAppVersion] = useState<string>('')

  // Fetch app version when component mounts
  useEffect(() => {
    window.electronAPI.getAppVersion().then(version => {
      setAppVersion(version)
    })
  }, [])

  const handleOpacityChange = (values: number[]) => {
    const newOpacity = values[0]
    setOpacity(newOpacity)
  }

  const handleEventFontSizeChange = (values: number[]) => {
    const newFontSize = values[0]
    setBaseFontSize(newFontSize)
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

  const handleShowGiftFreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked
    setShowGiftFree(enabled)
  }

  const handleShowEntryEffectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked
    setShowEntryEffect(enabled)
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

  const handleEditCustomCSS = () => {
    // This will open the CSS editor window
    window.electronAPI.openCSSEditor(customCSS)
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='bg-black/90'>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <ScrollArea className='-mx-4 -mb-4 h-[calc(100vh-200px)]'>
          <div className='space-y-4 p-4'>
            <div className='space-y-1'>
              <div className='flex'>
                <Checkbox id='always-on-top' checked={alwaysOnTop} onChange={handleAlwaysOnTopChange} />
                <Label className='pl-1' htmlFor='always-on-top'>
                  Always on Top
                </Label>
              </div>
              <p className='text-fg/60 text-sm ml-5'>Keep the overlay window above all other windows</p>
            </div>

            <div className='space-y-1'>
              <div className='flex'>
                <Checkbox id='click-through' checked={clickThrough} onChange={handleClickThroughChange} />
                <Label className='pl-1' htmlFor='click-through'>
                  Click Pass-Through
                </Label>
              </div>
              <p className='text-fg/60 text-sm ml-5'>
                Make the chat area click-through while keeping the title bar interactive
              </p>
            </div>

            <div className='space-y-1'>
              <div className='flex'>
                <Checkbox id='show-gift-free' checked={showGiftFree} onChange={handleShowGiftFreeChange} />
                <Label className='pl-1' htmlFor='show-gift-free'>
                  Show Free Gifts
                </Label>
              </div>
              <p className='text-fg/60 text-sm ml-5'>Display free gifts (silver coins) in the chat overlay</p>
            </div>

            <div className='space-y-1'>
              <div className='flex'>
                <Checkbox id='show-entry-effect' checked={showEntryEffect} onChange={handleShowEntryEffectChange} />
                <Label className='pl-1' htmlFor='show-entry-effect'>
                  Show Entry Effects
                </Label>
              </div>
              <p className='text-fg/60 text-sm ml-5'>Display entry effects when VIP users enter the room</p>
            </div>

            <div className='space-y-1'>
              <div className='flex'>
                <Checkbox
                  id='show-interaction-events'
                  checked={showInteractionEvents}
                  onChange={handleShowInteractionEventsChange}
                />
                <Label className='pl-1' htmlFor='show-interaction-events'>
                  Show Interaction Events
                </Label>
              </div>
              <p className='text-fg/60 text-sm ml-5'>
                Display interaction events like user entering the room, following, sharing, likes, etc.
              </p>
            </div>

            <div className='space-y-1'>
              <Label>Background Opacity</Label>
              <div>
                <Slider
                  min={10}
                  max={100}
                  marks={[
                    { value: 10, label: '10%' },
                    { value: 20, label: '20%' },
                    { value: 50, label: '50%' },
                    { value: 90, label: '90%' },
                    { value: 100, label: '100%' },
                  ]}
                  value={[opacity]}
                  onValueChange={handleOpacityChange}
                />
              </div>
            </div>

            <div className='space-y-1'>
              <Label>Event Font Size</Label>
              <div>
                <Slider
                  min={12}
                  max={64}
                  marks={[
                    { value: 20, label: 'Default' },
                    { value: 12, label: 'Small' },
                    { value: 32, label: 'Large' },
                  ]}
                  value={[baseFontSize]}
                  onValueChange={handleEventFontSizeChange}
                />
              </div>
            </div>

            <div className='space-y-1'>
              <Label>Custom CSS</Label>
              <div className='flex items-center gap-2'>
                <Button variant='outline' onClick={handleEditCustomCSS} className='flex-1'>
                  Edit Custom CSS
                </Button>
                {customCSS && (
                  <span className='text-xs text-fg/60'>
                    {customCSS.split('\n').filter(line => line.trim()).length} lines
                  </span>
                )}
              </div>
              <p className='text-fg/60 text-xs'>
                Open a dedicated editor to customize the chat overlay appearance. Compatible with LAPLACE Chat
                templates.
              </p>
            </div>

            <h3 className='font-bold'>Server Settings</h3>
            <div className='space-y-1'>
              <Label className='pb-1' htmlFor='server-host'>
                Server Host
              </Label>
              <Input
                type='text'
                id='server-host'
                value={serverHost}
                onChange={handleServerHostChange}
                placeholder='localhost'
              />
              <p className='text-fg/60 text-sm'>The host address of the LAPLACE Event Bridge server</p>
            </div>

            <div className='space-y-1'>
              <Label className='pb-1' htmlFor='server-port'>
                Server Port
              </Label>
              <Input
                type='number'
                min={1}
                max={65535}
                id='server-port'
                value={serverPort}
                onChange={handleServerPortChange}
                placeholder='9696'
              />
              <p className='text-fg/60 text-sm'>The port number of the LAPLACE Event Bridge server</p>
            </div>

            <div className='space-y-1'>
              <Label className='pb-1' htmlFor='server-password'>
                Server Password
              </Label>
              <Input
                type='password'
                id='server-password'
                value={serverPassword}
                onChange={handleServerPasswordChange}
                placeholder='Optional'
              />
              <p className='text-fg/60 text-sm'>Authentication token for the server (if required)</p>
            </div>

            <div className='space-y-1'>
              <Label className='pb-1' htmlFor='allowed-origins'>
                Allowed Rooms
              </Label>
              <Input
                type='text'
                id='allowed-origins'
                value={allowedOrigins}
                onChange={handleAllowedOriginsChange}
                placeholder='e.g., 1234, 5678'
              />
              <p className='text-fg/60 text-sm'>
                Filter events by room numbers (comma-separated). Leave empty to receive events from all rooms.
              </p>
            </div>

            <div>
              <p>
                Connection Status: <strong>{connectionState}</strong>
                <br />
                {connectionState === ConnectionState.CONNECTED && (
                  <span>
                    Connected to {serverHost}:{serverPort}
                  </span>
                )}
              </p>
            </div>

            <div className='border-t border-fg/10 pt-4 mt-4'>
              <p className='text-sm text-fg/60'>Version {appVersion}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
