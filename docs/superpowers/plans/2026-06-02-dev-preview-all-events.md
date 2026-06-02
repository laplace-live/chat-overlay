# Dev "preview all events" showcase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dev-only "Preview all events" button to the debug popover that injects a fixed, deterministic set of every renderable event variant so theme designers can style all cases at once.

**Architecture:** A new pure module `src/dev/preview-events.ts` builds ~26 fully-typed `LaplaceEvent` fixtures (no randomness). The existing `useMockSimulator` hook gains a `loadPreview()` action (stop stream → `clearMessages()` → inject fixtures via the real `addMessage` path). The debug menu gets one new button. All code lives under `src/dev/` and is tree-shaken from production exactly like the existing simulator.

**Tech Stack:** TypeScript, React 19, Zustand, Vite, `@laplace.live/event-types`, `@tabler/icons-react`.

**Testing note:** This repo has **no test runner** (only `pnpm lint`), and the approved spec lists "no new test framework" as a non-goal. Per the user's explicit instruction, verification gates are: `pnpm exec tsc --noEmit -p tsconfig.json` (must be clean), `pnpm lint` (0 errors; 2 pre-existing warnings are expected), and manual runtime checks. `buildPreviewEvents()` is written as a pure function so it stays test-ready if a runner is added later.

**Reference spec:** [docs/superpowers/specs/2026-06-02-dev-preview-all-events-design.md](../specs/2026-06-02-dev-preview-all-events-design.md)

---

## File Structure

- **Create** `src/dev/preview-events.ts` — pure fixture builders + `buildPreviewEvents(): LaplaceEvent[]`. One responsibility: produce the deterministic event matrix.
- **Modify** `src/dev/mock-events.ts` — export the existing deterministic avatar helper so the fixtures reuse it. One-line change.
- **Modify** `src/dev/useMockSimulator.ts` — add a `loadPreview` action and expose it.
- **Modify** `src/dev/debug-menu.tsx` — add the "Preview all events" button.

No changes to `events.tsx`, `useRuntimeStore.ts`, `renderer.tsx`, or any production component.

---

## Task 1: Export the deterministic avatar helper from `mock-events.ts`

**Files:**
- Modify: `src/dev/mock-events.ts` (the `randomAvatar` declaration, ~line 227)

- [ ] **Step 1: Add `export` to `randomAvatar`**

Find this line in `src/dev/mock-events.ts`:

```ts
/** Inline SVG avatar so `message`/`entry-effect` render something with no network. */
function randomAvatar(seed: number, label: string): string {
```

Change it to:

```ts
/** Inline SVG avatar so `message`/`entry-effect` render something with no network. */
export function randomAvatar(seed: number, label: string): string {
```

This helper uses no `Math.random` (hue is `seed % 360`, glyph is the label's first char), so it is fully deterministic and safe to reuse for fixed fixtures. No other lines change; existing internal call sites keep working.

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: exits 0, no output.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: `0 errors` (the 2 pre-existing `import/no-named-as-default-member` warnings in `scroll-area.tsx` and `renderer.tsx` are unrelated and expected).

- [ ] **Step 4: Commit**

```bash
git add src/dev/mock-events.ts
git commit -m "refactor(dev): export deterministic avatar helper for reuse"
```

---

## Task 2: Create the deterministic fixtures module `preview-events.ts`

**Files:**
- Create: `src/dev/preview-events.ts`

- [ ] **Step 1: Write the full fixtures module**

Create `src/dev/preview-events.ts` with exactly this content:

```ts
/**
 * Dev-only fixed event fixtures for theme development.
 *
 * Unlike the random simulator, these are fully deterministic: the same events
 * with identical content, ids, avatars, and ordering on every call. They let
 * theme designers and developers see every renderable event variant at once —
 * each type across guard tiers, user levels, price tiers, and medal states — so
 * each case can be styled against a stable, reproducible canvas. Tree-shaken out
 * of production builds (only imported behind `import.meta.env.DEV` via the debug
 * menu).
 */
import type {
  EntryEffect,
  Gift,
  Interaction,
  LaplaceEvent,
  LikeClick,
  Message,
  SuperChat,
  System,
  Toast,
} from '@laplace.live/event-types'

import { randomAvatar } from './mock-events'

const ROOM = 12345
const STREAMER_UID = 99999999
const STREAMER_NAME = '主播'

/** Fixed timestamp so fixtures are byte-stable; the overlay never renders it. */
const TS = 1_700_000_000_000

// --- shared field helpers ---------------------------------------------------

/** Structural shape of the `medal` field shared by the event types. */
interface PreviewMedal {
  level: number
  name: string
  room: number
  guardType: number
  lightened: number
}

function medal(level: number, name: string): PreviewMedal {
  return { level, name, room: 100000, guardType: 0, lightened: 1 }
}

const NO_MEDAL: PreviewMedal = { level: 0, name: '', room: 0, guardType: 0, lightened: 0 }

// --- per-type fixture builders ----------------------------------------------

function buildSystem(slug: string, message: string): System {
  return {
    type: 'system',
    uid: 0,
    username: 'System',
    message,
    origin: ROOM,
    originIdx: 0,
    id: `preview-system-${slug}`,
    timestamp: TS,
    timestampNormalized: TS,
    read: false,
  }
}

function buildMessage(opts: {
  slug: string
  uid: number
  username: string
  message: string
  guardType: number
  userLvl: number
  medal: PreviewMedal
  wealthMedalLevel?: number
}): Message {
  return {
    type: 'message',
    id: `preview-message-${opts.slug}`,
    origin: ROOM,
    originIdx: 0,
    uid: opts.uid,
    username: opts.username,
    avatar: randomAvatar(opts.uid, opts.username),
    nameColor: '',
    message: opts.message,
    userType: 0,
    userLvl: opts.userLvl,
    userLvlBorder: 0,
    currentRank: 0,
    phoneVerified: 1,
    guardType: opts.guardType,
    sendType: 0,
    medal: opts.medal,
    reply: {},
    idStr: `preview-msgstr-${opts.slug}`,
    wealthMedalLevel: opts.wealthMedalLevel ?? 0,
    timestamp: TS,
    timestampNormalized: TS,
    read: false,
  }
}

function buildSuperchat(opts: {
  slug: string
  uid: number
  username: string
  guardType: number
  message: string
  priceNormalized: number
}): SuperChat {
  return {
    type: 'superchat',
    id: `preview-superchat-${opts.slug}`,
    origin: ROOM,
    originIdx: 0,
    uid: opts.uid,
    username: opts.username,
    avatar: randomAvatar(opts.uid, opts.username),
    avatarFrame: '',
    message: opts.message,
    messageColor: '#ffffff',
    messageTrans: '',
    transMark: 0,
    isAudited: 0,
    price: opts.priceNormalized * 1000,
    priceNormalized: opts.priceNormalized,
    token: '',
    rate: 1000,
    duration: 60,
    timestamp: TS,
    timestampNormalized: TS,
    guardType: opts.guardType,
    guardBackground: '',
    scId: 100000,
    scName: 'SC',
    scAmount: opts.priceNormalized,
    medal: NO_MEDAL,
    read: false,
    deleted: false,
  }
}

function buildGift(opts: {
  slug: string
  uid: number
  username: string
  guardType: number
  giftName: string
  giftAmount: number
  unitPrice: number
  coinType: 'gold' | 'silver'
  medal: PreviewMedal
}): Gift {
  const priceNormalized = Number((opts.unitPrice * opts.giftAmount).toFixed(2))
  return {
    type: 'gift',
    id: `preview-gift-${opts.slug}`,
    origin: ROOM,
    originIdx: 0,
    uid: opts.uid,
    username: opts.username,
    avatar: randomAvatar(opts.uid, opts.username),
    message: `投喂 ${opts.giftName} x${opts.giftAmount}`,
    price: Math.round(priceNormalized * 1000),
    priceNormalized,
    duration: 0,
    coinType: opts.coinType,
    guardType: opts.guardType,
    giftType: 0,
    giftAction: '投喂',
    giftAmount: opts.giftAmount,
    giftId: 30000,
    giftName: opts.giftName,
    giftRemain: 0,
    giftIcon: '',
    bizSource: 'Live',
    receiver: { uid: STREAMER_UID, uname: STREAMER_NAME, master: null },
    blindGift: null,
    timestamp: TS,
    timestampNormalized: TS,
    medal: opts.medal,
    wealthMedalLevel: 0,
    read: false,
  }
}

function buildToast(opts: {
  slug: string
  uid: number
  username: string
  toastType: number
  toastName: string
  unitPrice: number
  months: number
}): Toast {
  return {
    type: 'toast',
    id: `preview-toast-${opts.slug}`,
    origin: ROOM,
    originIdx: 0,
    uid: opts.uid,
    username: opts.username,
    avatar: randomAvatar(opts.uid, opts.username),
    message: `开通了${opts.toastName}`,
    price: opts.unitPrice * 1000 * opts.months,
    priceNormalized: opts.unitPrice * opts.months,
    mockPrice: false,
    duration: 0,
    color: '#ffffff',
    toastType: opts.toastType,
    toastAmount: opts.months,
    toastAmountUnit: '月',
    toastName: opts.toastName,
    toastTotalCount: 100,
    toastId: 40000,
    effectId: 0,
    timestamp: TS,
    timestampNormalized: TS,
    read: false,
  }
}

function buildInteraction(opts: {
  slug: string
  uid: number
  username: string
  action: number
  guardType: number
  medal: PreviewMedal
}): Interaction {
  return {
    type: 'interaction',
    id: `preview-interaction-${opts.slug}`,
    origin: ROOM,
    originIdx: 0,
    uid: opts.uid,
    username: opts.username,
    action: opts.action,
    guardType: opts.guardType,
    avatar: randomAvatar(opts.uid, opts.username),
    relation: { type: 0, icon: '', text: '' },
    wealthMedalLevel: 0,
    medal: opts.medal,
    timestamp: TS,
    timestampNormalized: TS,
    read: false,
  }
}

function buildLikeClick(opts: {
  slug: string
  uid: number
  username: string
  guardType: number
  medal: PreviewMedal
}): LikeClick {
  return {
    type: 'like-click',
    id: `preview-like-click-${opts.slug}`,
    origin: ROOM,
    originIdx: 0,
    uid: opts.uid,
    username: opts.username,
    avatar: randomAvatar(opts.uid, opts.username),
    message: '为主播点赞了',
    medal: opts.medal,
    guardType: opts.guardType,
    timestamp: TS,
    timestampNormalized: TS,
    read: false,
  }
}

function buildEntryEffect(opts: {
  slug: string
  uid: number
  username: string
  guardType: number
  guardName: string
}): EntryEffect {
  return {
    type: 'entry-effect',
    id: `preview-entry-effect-${opts.slug}`,
    origin: ROOM,
    originIdx: 0,
    uid: opts.uid,
    username: opts.username,
    avatar: randomAvatar(opts.uid, opts.username),
    message: `欢迎 ${opts.guardName} <%${opts.username}%> 进入直播间`,
    effectId: 700,
    textColor: '#ffffff',
    nameColor: '#ffd700',
    duration: 4,
    background: '',
    backgroundAnimated: '',
    business: 1,
    guardType: opts.guardType,
    wealthMedalLevel: 0,
    showAvatar: 1,
    showWealthMedal: false,
    medal: NO_MEDAL,
    timestamp: TS,
    timestampNormalized: TS,
    read: false,
  }
}

// --- public API -------------------------------------------------------------

/**
 * Build the full, fixed set of preview events (deterministic order & content).
 * Grouped by type so a designer working on one component scans a contiguous
 * block. 26 events covering every renderable type across guard tiers, levels,
 * price tiers, and medal states.
 */
export function buildPreviewEvents(): LaplaceEvent[] {
  return [
    buildSystem('marker', '[预览] 已加载全部事件示例 / Preview: all event types'),

    // message × tiers + edge cases
    buildMessage({ slug: 'normal-short', uid: 1001, username: '路过的小猫', message: '草', guardType: 0, userLvl: 0, medal: NO_MEDAL }),
    buildMessage({ slug: 'normal-long', uid: 1002, username: '话痨观众', message: '这是一条特别长的弹幕，用来测试主题在遇到超长文本时的换行、断行和整体排版效果是否正常显示～', guardType: 0, userLvl: 35, medal: medal(21, '奶茶'), wealthMedalLevel: 18 }),
    buildMessage({ slug: 'emoji', uid: 1003, username: 'emoji爱好者', message: '🎉🎉🎉😂😂👍🥰🔥🔥🔥', guardType: 0, userLvl: 12, medal: NO_MEDAL }),
    buildMessage({ slug: 'guard-captain', uid: 1004, username: '甲板上的舰长', message: '舰长前来报到！', guardType: 3, userLvl: 22, medal: medal(25, '团子') }),
    buildMessage({ slug: 'guard-admiral', uid: 1005, username: '提督大人', message: '提督路过，给主播撑个场子', guardType: 2, userLvl: 28, medal: medal(30, '月光') }),
    buildMessage({ slug: 'guard-governor', uid: 1006, username: '总督本督', message: '总督驾到，全场最佬', guardType: 1, userLvl: 40, medal: medal(40, '阿绿') }),

    // superchat × price/tier
    buildSuperchat({ slug: 'low', uid: 2001, username: '萌新SC', message: '第一次发SC，支持一下，加油！', guardType: 0, priceNormalized: 30 }),
    buildSuperchat({ slug: 'mid', uid: 2002, username: '甲板上的舰长', message: '点歌《晴天》可以吗？谢谢主播~', guardType: 3, priceNormalized: 100 }),
    buildSuperchat({ slug: 'high', uid: 2003, username: '总督本督', message: '从第一期看到现在，会一直支持你的！这条SC祝你越来越火！', guardType: 1, priceNormalized: 1000 }),

    // gift × coin/price
    buildGift({ slug: 'gold-cheap', uid: 3001, username: '抠门土豪', guardType: 0, giftName: '辣条', giftAmount: 1, unitPrice: 0.1, coinType: 'gold', medal: NO_MEDAL }),
    buildGift({ slug: 'gold-pricey', uid: 3002, username: '真·壕', guardType: 3, giftName: '小电视飞船', giftAmount: 1, unitPrice: 1245, coinType: 'gold', medal: medal(26, '锦鲤') }),
    buildGift({ slug: 'silver-free', uid: 3003, username: '白嫖怪', guardType: 0, giftName: '小花花', giftAmount: 1, unitPrice: 0, coinType: 'silver', medal: NO_MEDAL }),

    // toast (guard) × tiers
    buildToast({ slug: 'captain', uid: 4001, username: '新晋舰长', toastType: 3, toastName: '舰长', unitPrice: 138, months: 1 }),
    buildToast({ slug: 'admiral', uid: 4002, username: '提督大人', toastType: 2, toastName: '提督', unitPrice: 1998, months: 1 }),
    buildToast({ slug: 'governor', uid: 4003, username: '总督本督', toastType: 1, toastName: '总督', unitPrice: 19998, months: 1 }),

    // interaction × actions + tier
    buildInteraction({ slug: 'enter', uid: 5001, username: '路人甲', action: 1, guardType: 0, medal: NO_MEDAL }),
    buildInteraction({ slug: 'follow', uid: 5002, username: '新粉丝', action: 2, guardType: 0, medal: NO_MEDAL }),
    buildInteraction({ slug: 'share', uid: 5006, username: '分享达人', action: 3, guardType: 0, medal: NO_MEDAL }),
    buildInteraction({ slug: 'special-follow', uid: 5003, username: '真爱粉', action: 4, guardType: 0, medal: medal(15, '柠檬') }),
    buildInteraction({ slug: 'mutual-follow', uid: 5004, username: '老朋友', action: 5, guardType: 0, medal: medal(18, '星星') }),
    buildInteraction({ slug: 'enter-captain', uid: 5005, username: '甲板上的舰长', action: 1, guardType: 3, medal: medal(25, '团子') }),

    // like-click
    buildLikeClick({ slug: 'normal', uid: 6001, username: '点赞狂魔', guardType: 0, medal: NO_MEDAL }),

    // entry-effect × tiers
    buildEntryEffect({ slug: 'captain', uid: 7001, username: '甲板上的舰长', guardType: 3, guardName: '舰长' }),
    buildEntryEffect({ slug: 'admiral', uid: 7002, username: '提督大人', guardType: 2, guardName: '提督' }),
    buildEntryEffect({ slug: 'governor', uid: 7003, username: '总督本督', guardType: 1, guardName: '总督' }),
  ]
}
```

- [ ] **Step 2: Typecheck (this is the real test — fixtures must satisfy the event-types interfaces)**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: exits 0, no output. If a field is missing/mistyped, `tsc` reports the exact property here. (The field sets above mirror the working generators in `mock-events.ts`, so a clean compile confirms every required field is present and correctly typed.)

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: `0 errors` (only the 2 pre-existing warnings).

- [ ] **Step 4: Commit**

```bash
git add src/dev/preview-events.ts
git commit -m "feat(dev): add deterministic preview-all-events fixtures"
```

---

## Task 3: Add `loadPreview` to `useMockSimulator`

**Files:**
- Modify: `src/dev/useMockSimulator.ts`

- [ ] **Step 1: Replace the file contents**

Overwrite `src/dev/useMockSimulator.ts` with exactly this (adds the `buildPreviewEvents` import, a `clearMessages` selector + ref, and the `loadPreview` callback; everything else is unchanged):

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: exits 0, no output.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: `0 errors`.

- [ ] **Step 4: Commit**

```bash
git add src/dev/useMockSimulator.ts
git commit -m "feat(dev): expose loadPreview action from useMockSimulator"
```

---

## Task 4: Add the "Preview all events" button to `debug-menu.tsx`

**Files:**
- Modify: `src/dev/debug-menu.tsx`

- [ ] **Step 1: Replace the file contents**

Overwrite `src/dev/debug-menu.tsx` with exactly this (adds the `IconLayoutGrid` import, destructures `loadPreview`, and renders a full-width outline button between Start/Stop and the `hr`):

```tsx
/**
 * Dev-only debug dropdown for simulating chat events.
 *
 * Rendered only behind `import.meta.env.DEV` in `renderer.tsx`, so this whole
 * module (and its `mock-events` / `preview-events` dependency graph) is
 * tree-shaken out of production builds. A title-bar flask button opens a popover
 * with a start/stop control, a fixed "preview all events" showcase, and per-type
 * toggles.
 */
import {
  IconFlask,
  IconFlaskFilled,
  IconLayoutGrid,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
} from '@tabler/icons-react'

import { Button } from '../components/ui/button'
import { Checkbox } from '../components/ui/checkbox'
import { Label } from '../components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { MOCK_EVENT_TYPES } from './mock-events'
import { useMockSimulator } from './useMockSimulator'

export function DebugMenu() {
  const { isRunning, toggleRunning, enabledTypes, toggleType, loadPreview } = useMockSimulator()

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

      <PopoverContent align='end' className='w-64 bg-bg/90'>
        <Button
          variant='solid'
          tint={isRunning ? 'red' : 'accent'}
          type='button'
          className='w-full'
          onClick={toggleRunning}
        >
          {isRunning ? <IconPlayerStopFilled size={14} /> : <IconPlayerPlayFilled size={14} />}
          {isRunning ? 'Stop simulation' : 'Start simulation'}
        </Button>

        <Button
          variant='outline'
          tint='white'
          type='button'
          className='mt-1.5 w-full'
          onClick={loadPreview}
          title='Inject one fixed example of every event type/tier (ignores the checkboxes below)'
        >
          <IconLayoutGrid size={14} />
          Preview all events
        </Button>

        <hr className='border-fg/15' />

        <div className='mb-1.5 text-xs text-fg/50'>Event Types</div>
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
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: exits 0, no output.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: `0 errors`.

- [ ] **Step 4: Commit**

```bash
git add src/dev/debug-menu.tsx
git commit -m "feat(dev): add Preview all events button to debug menu"
```

---

## Task 5: Manual acceptance + production tree-shake verification

**Files:** none (verification only)

- [ ] **Step 1: Run the app and load the preview**

Run: `pnpm start`
Then in the overlay title bar, click the flask icon → click **Preview all events**.
Expected: the chat list is replaced by the fixed showcase. With **default settings** you see **22 of 26** events — grouped by type: a system marker, 6 chat messages (normal/long/emoji/舰长/提督/总督), 3 super chats (¥30/¥100/¥1000), 2 gold gifts (辣条/小电视飞船), 3 toasts (舰长/提督/总督), 6 interactions (enter/follow/share/special/mutual/舰长 enter), 1 like. The silver gift (小花花) and the 3 entry-effects are hidden by the default display settings.

- [ ] **Step 2: Enable the gated display settings and reload preview**

In the overlay, open the menu → **Settings**, turn on **Show Free Gifts** (`showGiftFree`) and **Show Entry Effects** (`showEntryEffect`), close Settings, then click **Preview all events** again.
Expected: all **26** events now render, including the silver 小花花 gift and the 3 entry-effect banners (舰长/提督/总督).

- [ ] **Step 3: Verify determinism + no key warnings**

Click **Preview all events** several more times. Open DevTools console (View → Toggle Developer Tools).
Expected: the list looks identical every time (same content, avatars, order); **no** React "duplicate key" warnings appear (clearing-before-inject prevents id collisions).

- [ ] **Step 4: Verify it interrupts a running stream**

Click **Start simulation**, let events stream for a few seconds, then click **Preview all events**.
Expected: the random stream stops, the flask icon returns to its outline (not-running) state, and the list is replaced by exactly the fixed preview set (no random events mixed in).

- [ ] **Step 5: Verify production tree-shaking**

Run a production renderer build and grep the output for fixture-only sentinels:

```bash
pnpm exec vite build --config vite.renderer.config.mts
grep -rn "总督本督\|buildPreviewEvents" dist && echo "FAIL: dev fixtures present in production bundle" || echo "PASS: dev fixtures tree-shaken from production"
```

Expected: prints `PASS: dev fixtures tree-shaken from production`. (Vite builds in production mode, so `import.meta.env.DEV` is `false`, `DebugMenu` is dead-code-eliminated, and the entire `src/dev/` graph — including `preview-events.ts` — is dropped.)

- [ ] **Step 6: Final lint gate**

Run: `pnpm lint`
Expected: `0 errors` (2 pre-existing warnings).

- [ ] **Step 7: Clean up the build artifact (optional)**

```bash
rm -rf dist
```

---

## Done

The feature is complete when all tasks are committed, `pnpm exec tsc --noEmit -p tsconfig.json` and `pnpm lint` are clean, the manual checks in Task 5 pass, and the production bundle contains no dev fixtures. Final integration (merge / PR) is handled separately via the finishing-a-development-branch skill.
