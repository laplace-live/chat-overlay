import React, { useEffect } from 'react'
import { ConnectionState } from '@laplace.live/event-bridge-sdk'
import { useSettingsStore } from '../store/useSettingsStore'
import { useRuntimeStore } from '../store/useRuntimeStore'

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

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

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

  return (
    <div
      id='settings-modal'
      className={`modal ${isOpen ? 'show' : ''}`}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className='modal-content'>
        <div className='modal-header'>
          <h3>Settings</h3>
          <button id='close-modal-btn' className='modal-close' onClick={onClose}>
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
  )
}
