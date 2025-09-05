import React, { useEffect, useState } from 'react'
import { ConnectionState } from '@laplace.live/event-bridge-sdk'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useRuntimeStore } from '../../store/useRuntimeStore'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

export const GeneralTab: React.FC = () => {
  // Get settings from zustand store
  const {
    serverHost,
    serverPort,
    serverPassword,
    allowedOrigins,
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

  // Sync connection state with main window
  useEffect(() => {
    const { setConnectionState } = useRuntimeStore.getState()

    window.electronAPI.requestConnectionState().then(setConnectionState)
    return window.electronAPI.onConnectionStateUpdate(setConnectionState)
  }, [])

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
    <div className='space-y-4 p-4 @container/general'>
      <div className='grid grid-cols-1 gap-4 @xl:grid-cols-2'>
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
  )
}
