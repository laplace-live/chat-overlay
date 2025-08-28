import React from 'react'
import { ConnectionState } from '@laplace.live/event-bridge-sdk'
import { useSettingsStore } from '../store/useSettingsStore'
import { useRuntimeStore } from '../store/useRuntimeStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Input } from './ui/input'
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

  // Get connection state from runtime store
  const { connectionState } = useRuntimeStore()

  const handleOpacityChange = (values: number[]) => {
    const newOpacity = values[0]
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
                Display interaction events like user entering the room, following, sharing, etc.
              </p>
            </div>
            <div className='space-y-1'>
              <Label>Background Opacity</Label>
              <div>
                <Slider min={10} max={100} value={[opacity]} onValueChange={handleOpacityChange} />
                <div className='text-sm text-fg/60'>{opacity}%</div>
              </div>
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
