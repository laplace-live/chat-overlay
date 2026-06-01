/**
 * Dev-only debug dropdown for simulating chat events.
 *
 * Rendered only behind `import.meta.env.DEV` in `renderer.tsx`, so this whole
 * module (and its `mock-events` dependency graph) is tree-shaken out of
 * production builds. A title-bar flask button opens a popover with a start/stop
 * control and per-type toggles.
 */
import { IconFlask, IconFlaskFilled, IconPlayerPlayFilled, IconPlayerStopFilled } from '@tabler/icons-react'

import { Button } from '../components/ui/button'
import { Checkbox } from '../components/ui/checkbox'
import { Label } from '../components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { MOCK_EVENT_TYPES } from './mock-events'
import { useMockSimulator } from './useMockSimulator'

export function DebugMenu() {
  const { isRunning, toggleRunning, enabledTypes, toggleType } = useMockSimulator()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon-sm'
          tint='white'
          type='button'
          id='debug-menu-btn'
          title='Simulate events (dev only)'
        >
          {isRunning ? <IconFlaskFilled size={14} /> : <IconFlask size={14} />}
        </Button>
      </PopoverTrigger>

      <PopoverContent align='end' className='w-60 bg-bg/90'>
        <Button
          variant='solid'
          tint={isRunning ? 'red' : 'accent'}
          size='sm'
          type='button'
          className='w-full'
          onClick={toggleRunning}
        >
          {isRunning ? <IconPlayerStopFilled size={14} /> : <IconPlayerPlayFilled size={14} />}
          {isRunning ? 'Stop simulation' : 'Start simulation'}
        </Button>

        <hr className='border-fg/15' />

        <div className='mb-1.5 text-xs text-fg/50'>Event types</div>
        <div className='grid grid-cols-2 gap-x-3 gap-y-1.5'>
          {MOCK_EVENT_TYPES.map(meta => (
            <div key={meta.type} className='flex items-center'>
              <Checkbox
                id={`mock-${meta.type}`}
                checked={enabledTypes[meta.type]}
                onCheckedChange={() => toggleType(meta.type)}
              />
              <Label className='pl-1' htmlFor={`mock-${meta.type}`}>
                {meta.label}
              </Label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
