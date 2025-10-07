import React, { useEffect, useState } from 'react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { MonacoEditor } from '../ui/monaco-editor'
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

  const handleCSSChange = (value: string | undefined) => {
    const newValue = value || ''
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
        <MonacoEditor value={css} onChange={handleCSSChange} language='css' theme='vs-dark' className='flex-1' />
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
