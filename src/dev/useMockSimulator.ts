/**
 * Dev-only hook driving the mock event stream.
 *
 * Owns the running state and the per-type enabled flags, and runs a
 * self-rescheduling timer that pushes generated events through the same
 * `addMessage` path real events use. Also exposes `loadPreview`, a one-shot that
 * clears the list and injects the fixed preview fixtures. Tree-shaken out of
 * production (only imported behind `import.meta.env.DEV`).
 */
import { useCallback, useEffect, useRef, useState } from 'react'

import { useRuntimeStore } from '../store/useRuntimeStore'
import {
  generateMockEvent,
  MOCK_EVENT_TYPES,
  type MockEventType,
  pickWeightedType,
  randomEventDelay,
} from './mock-events'
import { buildPreviewEvents } from './preview-events'

type EnabledMap = Record<MockEventType, boolean>

function defaultEnabledTypes(): EnabledMap {
  return MOCK_EVENT_TYPES.reduce((acc, meta) => {
    acc[meta.type] = meta.defaultEnabled
    return acc
  }, {} as EnabledMap)
}

export function useMockSimulator() {
  const addMessage = useRuntimeStore(state => state.addMessage)
  const clearMessages = useRuntimeStore(state => state.clearMessages)
  const [isRunning, setIsRunning] = useState(false)
  const [enabledTypes, setEnabledTypes] = useState<EnabledMap>(defaultEnabledTypes)

  // Refs so the running timer always reads the latest values without restarting.
  const enabledRef = useRef(enabledTypes)
  useEffect(() => {
    enabledRef.current = enabledTypes
  }, [enabledTypes])

  const addMessageRef = useRef(addMessage)
  useEffect(() => {
    addMessageRef.current = addMessage
  }, [addMessage])

  const clearMessagesRef = useRef(clearMessages)
  useEffect(() => {
    clearMessagesRef.current = clearMessages
  }, [clearMessages])

  useEffect(() => {
    if (!isRunning) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const tick = () => {
      if (cancelled) return
      const enabled = (Object.keys(enabledRef.current) as MockEventType[]).filter(t => enabledRef.current[t])
      const type = pickWeightedType(enabled)
      if (type) {
        addMessageRef.current(generateMockEvent(type))
      }
      timer = setTimeout(tick, randomEventDelay())
    }

    // Fire one immediately for instant feedback, then keep rescheduling.
    tick()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [isRunning])

  const toggleRunning = useCallback(() => setIsRunning(v => !v), [])
  const toggleType = useCallback((type: MockEventType) => {
    setEnabledTypes(prev => ({ ...prev, [type]: !prev[type] }))
  }, [])

  // One-shot: stop any running stream, clear the list, then inject the fixed
  // deterministic preview set. Clearing first means the stable fixture ids never
  // collide as React keys across repeated clicks.
  const loadPreview = useCallback(() => {
    setIsRunning(false)
    clearMessagesRef.current()
    for (const event of buildPreviewEvents()) {
      addMessageRef.current(event)
    }
  }, [])

  return { isRunning, toggleRunning, enabledTypes, toggleType, loadPreview }
}
