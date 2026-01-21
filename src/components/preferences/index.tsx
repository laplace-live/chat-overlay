import React from 'react'

import { cn } from '../../lib/cn'
import { isMacOS } from '../../utils/platform'
import { ScrollArea } from '../ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { CustomCssTab } from './custom-css'
import { GeneralTab } from './general'
import { InterfaceTab } from './interface'

const PreferencesWindow: React.FC = () => {
  return (
    <div className='h-screen bg-bg text-white flex flex-col'>
      {/* Header */}
      <div className={cn('flex items-center justify-between px-4 drag', isMacOS() ? 'pt-8' : 'pt-4')}>
        <div>
          <h1 className='text-lg font-semibold'>Preferences</h1>
          <p className='text-sm text-fg/60'>Configure your LAPLACE Chat Overlay settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={cn('flex-1 min-h-0')}>
        <Tabs defaultValue='general' className='h-full flex flex-col'>
          <TabsList className='px-4 drag pt-2'>
            <TabsTrigger className='no-drag' value='general'>
              General
            </TabsTrigger>
            <TabsTrigger className='no-drag' value='interface'>
              Interface
            </TabsTrigger>
            <TabsTrigger className='no-drag' value='custom-css'>
              Custom CSS
            </TabsTrigger>
          </TabsList>

          <div className='flex-1 min-h-0'>
            <TabsContent value='general' className='h-full'>
              <ScrollArea className='h-full' offsetScrollbars>
                <GeneralTab />
              </ScrollArea>
            </TabsContent>

            <TabsContent value='interface' className='h-full'>
              <ScrollArea className='h-full' offsetScrollbars>
                <InterfaceTab />
              </ScrollArea>
            </TabsContent>

            <TabsContent value='custom-css' className='h-full'>
              <CustomCssTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

export default PreferencesWindow
