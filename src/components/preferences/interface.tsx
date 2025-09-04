import React from 'react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'

export const InterfaceTab: React.FC = () => {
  // Get settings from zustand store
  const {
    opacity,
    baseFontSize,
    alwaysOnTop,
    clickThrough,
    showInteractionEvents,
    showGiftFree,
    showEntryEffect,
    setOpacity,
    setBaseFontSize,
    setAlwaysOnTop,
    setClickThrough,
    setShowInteractionEvents,
    setShowGiftFree,
    setShowEntryEffect,
  } = useSettingsStore()

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

  return (
    <div className='space-y-4 p-4 @container'>
      <div className='grid grid-cols-1 gap-4 @xl:grid-cols-2'>
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
          <p className='text-fg/60 text-sm ml-5'>Make the chat area click-through</p>
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
          <p className='text-fg/60 text-sm ml-5'>Display entry effects when VIP users enters</p>
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
          <p className='text-fg/60 text-sm ml-5'>Display events like entering the room, follows, etc.</p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 @xl:grid-cols-2'>
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
      </div>
    </div>
  )
}
