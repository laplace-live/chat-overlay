import { useEffect, useState } from 'react'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { Textarea } from './ui/textarea'
import { isMacOS } from '../utils/platform'
import { cn } from '../lib/cn'

const CSSEditor: React.FC = () => {
  const [css, setCss] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  // Debounce CSS changes for auto-update (1 second delay)
  const [debouncedCSS] = useDebouncedValue(css, 400)

  // Load initial CSS when component mounts
  useEffect(() => {
    const unsubscribe = window.electronAPI.onLoadCSS((initialCSS: string) => {
      setCss(initialCSS)
      setHasChanges(false)
    })

    return unsubscribe
  }, [])

  // Auto-update CSS when debounced value changes
  useEffect(() => {
    // Only auto-update if we have changes and debounced value is different from what was initially loaded
    if (hasChanges && debouncedCSS === css) {
      setIsApplying(true)
      window.electronAPI.updateCustomCSS(debouncedCSS)

      // Show applying state briefly
      setTimeout(() => {
        setIsApplying(false)
        setHasChanges(false)
      }, 200)
    }
  }, [debouncedCSS, css, hasChanges])

  const handleCSSChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setCss(newValue)
    setHasChanges(true)
  }

  return (
    <div className='h-screen bg-bg text-white flex flex-col'>
      {/* Header */}
      <div className={cn('flex items-center justify-between px-4 drag', isMacOS() && 'pt-8')}>
        <div>You can edit the CSS here</div>
      </div>

      {/* Editor */}
      <div className='flex-1 p-4 pt-2'>
        <div className='h-full flex flex-col'>
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
      </div>

      {/* Footer */}
      <div className='px-4 py-3 border-t border-fg/40 text-xs text-fg/60 drag'>
        <div className='flex justify-between'>
          <div className='text-sm text-fg/60'>
            Changes auto-apply
            {isApplying && <span className='ml-2 text-blue-400'>• Applying...</span>}
            {hasChanges && !isApplying && <span className='ml-2 text-yellow-400'>• Pending changes</span>}
          </div>

          <span>
            {css.split('\n').length} lines • {css.length} characters
          </span>
        </div>
      </div>
    </div>
  )
}

export default CSSEditor
