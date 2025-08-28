import React, { useEffect, useRef, useState } from 'react'
import type { LaplaceEvent } from '@laplace.live/event-types'
import { IconArrowDownDashed } from '@tabler/icons-react'
import { ConnectionState } from '@laplace.live/event-bridge-sdk'
import { Button } from './ui/button'
import { cn } from '../lib/cn'
import { useSettingsStore } from '../store/useSettingsStore'
import { useRuntimeStore } from '../store/useRuntimeStore'

export function ChatEvents() {
  const { showInteractionEvents } = useSettingsStore()
  const { connectionState, messages } = useRuntimeStore()
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatEventsRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle scroll to bottom button click
  const handleScrollToBottom = () => {
    scrollToBottom()
    setIsAutoScrollPaused(false)
  }

  // Check if user is at the bottom of the chat
  const isAtBottom = () => {
    const chatEvents = chatEventsRef.current
    if (!chatEvents) return true

    const threshold = 160 // pixels from bottom to consider "at bottom"
    return chatEvents.scrollHeight - chatEvents.scrollTop - chatEvents.clientHeight < threshold
  }

  // Handle scroll event to detect manual scrolling
  const handleScroll = () => {
    const chatEvents = chatEventsRef.current
    if (!chatEvents) return

    if (isAtBottom()) {
      // Resume auto-scroll if user scrolls back to bottom
      setIsAutoScrollPaused(false)
    } else {
      // Pause auto-scroll if user scrolls up
      setIsAutoScrollPaused(true)
    }
  }

  useEffect(() => {
    // Only auto-scroll if not paused
    if (!isAutoScrollPaused) {
      scrollToBottom()
    }
  }, [messages, isAutoScrollPaused])

  // Add scroll event listener
  useEffect(() => {
    const chatEvents = chatEventsRef.current
    if (!chatEvents) return

    chatEvents.addEventListener('scroll', handleScroll)
    return () => {
      chatEvents.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Function to render a message based on its type
  const renderMessage = (event: LaplaceEvent, index: number) => {
    if (event.type === 'system') {
      return (
        <div key={index} className='event system'>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'interaction') {
      if (!showInteractionEvents) {
        return null
      }

      const actionMap: { [key: number]: string } = {
        1: '进入直播间',
        2: '关注',
        3: '分享',
        4: '特别关注',
        5: '互相关注',
      }

      return (
        <div key={index} className={cn('event interaction', `guard-type-${event.guardType}`)}>
          <span className='username'>{event.username}</span>
          <span className='text'>{actionMap[event.action]}</span>
        </div>
      )
    }

    if (event.type === 'like-click') {
      return (
        <div key={index} className={'event like-click'}>
          <span className='username'>{event.username}:</span>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'message') {
      return (
        <div key={index} className={cn('event message', `guard-type-${event.guardType}`)}>
          <img src={event.avatar} alt='avatar' className='avatar' referrerPolicy='no-referrer' />
          <div>
            <span className='username'>{event.username}:</span>
            <span className='text'>{event.message}</span>
          </div>
        </div>
      )
    }

    if (event.type === 'superchat') {
      return (
        <div key={index} className={cn('event superchat', `guard-type-${event.guardType}`)}>
          <span className='username'>{event.username}:</span>
          <span className='price'>[¥{event.priceNormalized}]</span>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'gift') {
      return (
        <div key={index} className={cn('event gift', `guard-type-${event.guardType}`)}>
          <span className='username'>{event.username}:</span>
          <span className='price'>[¥{event.priceNormalized}]</span>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'toast') {
      return (
        <div key={index} className='event toast'>
          <span className='username'>{event.username}:</span>
          <span className='price'>[¥{event.priceNormalized}]</span>
          <span className='text'>{event.message}</span>
        </div>
      )
    }

    if (event.type === 'entry-effect') {
      // Remove special markers <%...%> but keep the text inside
      const message = event.message.replace(/<%([^%>]+)%>/g, '$1').trim()

      return (
        <div key={index} className={cn('event entry-effect', `guard-type-${event.guardType}`)}>
          <img src={event.avatar} alt='avatar' className='avatar' referrerPolicy='no-referrer' />
          <span className='text'>{message}</span>
        </div>
      )
    }

    return null
  }

  return (
    <>
      {isAutoScrollPaused && (
        <div className='absolute top-12 right-[52px] z-10'>
          <Button
            variant='link'
            size='icon'
            tint='white'
            type='button'
            id='scroll-to-bottom-btn'
            title='Scroll to bottom'
            onClick={handleScrollToBottom}
          >
            <IconArrowDownDashed size={14} />
          </Button>
        </div>
      )}

      <div
        id='content'
        className={cn(
          'h-[100vh] flex flex-col',
          '[mask-image:linear-gradient(to_bottom,transparent,rgba(0,0,0,0.1)_24px,black_48px,black_100%,transparent)]'
        )}
      >
        <div id='chat-messages' className='p-2 pt-8 space-y-2 overflow-y-auto scroll-smooth' ref={chatEventsRef}>
          {messages.length === 0 ? (
            <div className='text-center py-4 text-white/50'>
              {connectionState === ConnectionState.CONNECTED
                ? 'Waiting for messages…'
                : 'Connecting to LAPLACE Event Bridge…'}
            </div>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </>
  )
}
