import React, { useEffect, useState } from 'react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { nf } from '../../utils/numberFormat'

export const CustomCssTab: React.FC = () => {
  const { customCSS, setCustomCSS } = useSettingsStore()
  const [css, setCss] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  // Debounce CSS changes for auto-update (400ms delay)
  const [debouncedCSS] = useDebouncedValue(css, 400)

  // Load initial CSS when component mounts
  useEffect(() => {
    setCss(customCSS)
    setHasChanges(false)
  }, [customCSS])

  // Auto-update CSS when debounced value changes
  useEffect(() => {
    // Only auto-update if we have changes and debounced value is different from what was initially loaded
    if (hasChanges && debouncedCSS === css) {
      setIsApplying(true)

      // Update the store
      setCustomCSS(debouncedCSS)

      // Also notify the main window via IPC so it updates its styles
      window.electronAPI.updateCustomCSS(debouncedCSS)

      // Show applying state briefly
      setTimeout(() => {
        setIsApplying(false)
        setHasChanges(false)
      }, 200)
    }
  }, [debouncedCSS, css, hasChanges, setCustomCSS])

  const handleCSSChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setCss(newValue)
    setHasChanges(true)
  }

  return (
    <div className='space-y-4 h-full flex flex-col p-4'>
      <div className='space-y-1'>
        <Label>Custom CSS</Label>
        <p className='text-fg/60 text-xs'>
          Customize the chat overlay appearance. Compatible with LAPLACE Chat templates. Changes auto-apply.
        </p>
      </div>

      <div className='flex-1 flex flex-col min-h-0'>
        <Textarea
          value={css}
          onChange={handleCSSChange}
          className='flex-1 font-mono text-sm resize-none'
          placeholder={`/* Add your custom CSS here */
.event.message {
  background-color: rgba(0, 255, 0, 0.1);
  border-left: 3px solid #00ff00;
}

.username {
  color: #ff6b6b !important;
  font-weight: bold;
}

/* Available classes:
   .event.message - Chat messages
   .event.gift - Gift events
   .event.superchat - Super chat messages
   .event.interaction - User interactions
   .event.entry-effect - VIP entry effects
   .username - Usernames
   .text - Message text
   .price - Price displays
   .avatar - User avatars
   .guard-type-1, .guard-type-2, .guard-type-3 - VIP levels
*/`}
        />
      </div>

      <div className='text-xs text-fg/60 flex justify-between items-center pt-2 border-t border-fg/20'>
        <div>
          {isApplying && <span className='text-blue-400'>Applying…</span>}
          {hasChanges && !isApplying && <span className='text-yellow-400'>Pending changes</span>}
          {!hasChanges && !isApplying && <span className='text-green-400'>Saved</span>}
        </div>
        <span>
          {nf.format(css.split('\n').length)} lines • {nf.format(css.length)} characters
        </span>
      </div>
    </div>
  )
}
