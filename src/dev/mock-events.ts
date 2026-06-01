/**
 * Dev-only mock event generators.
 *
 * Pure functions (no React) that build realistic, fully-typed `LaplaceEvent`
 * objects for testing the overlay's appearance without a live connection. This
 * whole module is tree-shaken out of production builds (it is only imported
 * behind `import.meta.env.DEV`).
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

/** Event types the overlay actually renders. Anything else renders nothing. */
export type MockEventType =
  | 'message'
  | 'gift'
  | 'superchat'
  | 'toast'
  | 'interaction'
  | 'like-click'
  | 'entry-effect'
  | 'system'

export interface MockEventTypeMeta {
  type: MockEventType
  label: string
  /** Whether this type is simulated by default. */
  defaultEnabled: boolean
  /** Relative frequency when picking the next event among enabled types. */
  weight: number
}

/** Source of truth for the dropdown order, labels, defaults, and frequency. */
export const MOCK_EVENT_TYPES: MockEventTypeMeta[] = [
  { type: 'message', label: 'Chat', defaultEnabled: true, weight: 70 },
  { type: 'interaction', label: 'Interaction', defaultEnabled: true, weight: 14 },
  { type: 'gift', label: 'Gift', defaultEnabled: true, weight: 7 },
  { type: 'superchat', label: 'Super Chat', defaultEnabled: true, weight: 2.5 },
  { type: 'toast', label: 'Toast (Guard)', defaultEnabled: true, weight: 1 },
  { type: 'like-click', label: 'Like', defaultEnabled: false, weight: 4 },
  { type: 'entry-effect', label: 'Entry Effect', defaultEnabled: false, weight: 1.5 },
  { type: 'system', label: 'System', defaultEnabled: false, weight: 1 },
]

/** Cadence bounds (ms) for the self-rescheduling simulator timer. */
export const MIN_EVENT_DELAY_MS = 350
export const MAX_EVENT_DELAY_MS = 1400

const MOCK_ROOM = 12345
const STREAMER_UID = 99999999
const STREAMER_NAME = '主播'

// --- random helpers ---------------------------------------------------------

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function chance(probability: number): boolean {
  return Math.random() < probability
}

let idCounter = 0
function nextId(type: string): string {
  idCounter += 1
  return `mock-${type}-${Date.now()}-${idCounter}`
}

function randomUid(): number {
  return randInt(10000, 9999999999)
}

// --- data pools -------------------------------------------------------------

const USERNAMES = [
  '路过的小猫',
  '奶茶不加糖',
  '夜行性动物',
  '一只咕咕鸽',
  '摸鱼大师',
  '今天也要加油鸭',
  '咸鱼翻不了身',
  '柠檬精本精',
  '隔壁老王',
  '快乐肥宅水',
  '秋刀鱼罐头',
  '麻辣香锅不要辣',
  '电子竹鼠',
  '熬夜冠军',
  '不想上班星人',
  '芜湖起飞',
  'Neko',
  'mochi',
  'starlight',
  'KFCthursday',
  'xX_Sniper_Xx',
  'definitely_not_a_bot',
  'lurker_no7',
  'CaffeineAddict',
] as const

const CHAT_MESSAGES = [
  '草',
  '草草草',
  '哈哈哈哈哈',
  '哈哈哈',
  'awsl',
  '2333',
  '233333',
  '前排',
  '前排围观',
  '晚上好',
  '主播好可爱',
  '好听！',
  '牛哇牛哇',
  '泪目了',
  'respect',
  '6666',
  '666',
  '蹲一个',
  '说得好',
  '笑死',
  '绷不住了',
  'gkd',
  '保重身体',
  '+1',
  '同感',
  '啊这',
  '好家伙',
  '可以的',
  '太强了',
  '坐等',
  '催更',
  '让我看看',
  '？？？',
  '到点了家人们',
  'emo了',
  '蚌埠住了',
  '原神，启动！',
  '😂',
  '🎉🎉🎉',
  '👍',
  '🥰',
] as const

const SUPERCHAT_MESSAGES = [
  '主播今天的直播太棒了，感谢你带来的快乐！',
  '第一次发SC，支持一下，加油！',
  '点歌《晴天》可以吗？谢谢主播~',
  '辛苦啦，记得多喝水多休息！',
  '从第一期看到现在，会一直支持你的！',
  '生日快乐！祝你天天开心！',
  '今天的妆容好好看！',
  '潜水很久的老粉了，求翻牌！',
] as const

const GOLD_GIFTS = [
  { name: '辣条', price: 0.1 },
  { name: '牛哇牛哇', price: 1 },
  { name: '干杯', price: 5 },
  { name: '情书', price: 5.2 },
  { name: '为爱发电', price: 9.9 },
  { name: '礼花', price: 28 },
  { name: '小电视飞船', price: 1245 },
] as const

const SILVER_GIFTS = [
  { name: '小花花', price: 0 },
  { name: '小心心', price: 0 },
] as const

const MEDAL_NAMES = ['奶茶', '星星', '小熊', '锦鲤', '阿绿', '月光', '团子', '柠檬'] as const

const SYSTEM_MESSAGES = [
  '[模拟] 已连接到直播间',
  '[模拟] 欢迎来到直播间',
  '[模拟] 房管已上线',
  '[模拟] 直播间开启了弹幕慢速模式',
] as const

// --- field builders ---------------------------------------------------------

function randomUsername(): string {
  const base = pick(USERNAMES)
  return chance(0.3) ? `${base}${randInt(1, 9999)}` : base
}

function randomChatMessage(): string {
  return pick(CHAT_MESSAGES)
}

/** Mostly normal users, occasionally guards, so username-color variants show. */
function randomGuardType(): number {
  const r = Math.random()
  if (r < 0.85) return 0
  if (r < 0.96) return 3 // 舰长
  if (r < 0.99) return 2 // 提督
  return 1 // 总督
}

function randomMedal() {
  if (chance(0.3)) {
    return { level: 0, name: '', room: 0, guardType: 0, lightened: 0 }
  }
  return {
    level: randInt(1, 40),
    name: pick(MEDAL_NAMES),
    room: randInt(1000, 9999999),
    guardType: 0,
    lightened: 1,
  }
}

/** Inline SVG avatar so `message`/`entry-effect` render something with no network. */
function randomAvatar(seed: number, label: string): string {
  const hue = seed % 360
  const first = label.trim().charAt(0).replace(/[<>&"']/g, '') || '?'
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">` +
    `<rect width="64" height="64" fill="hsl(${hue}, 60%, 55%)"/>` +
    `<text x="32" y="32" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="sans-serif" font-size="34" fill="#fff">${first}</text>` +
    `</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// --- per-type generators ----------------------------------------------------

function generateMessage(): Message {
  const uid = randomUid()
  const username = randomUsername()
  const ts = Date.now()
  return {
    type: 'message',
    id: nextId('message'),
    origin: MOCK_ROOM,
    originIdx: 0,
    uid,
    username,
    avatar: randomAvatar(uid, username),
    nameColor: '',
    message: randomChatMessage(),
    userType: 0,
    userLvl: randInt(0, 40),
    userLvlBorder: 0,
    currentRank: 0,
    phoneVerified: 1,
    guardType: randomGuardType(),
    sendType: 0,
    medal: randomMedal(),
    reply: {},
    idStr: nextId('msgstr'),
    wealthMedalLevel: chance(0.3) ? randInt(1, 30) : 0,
    timestamp: ts,
    timestampNormalized: ts,
    read: false,
  }
}

function generateGift(): Gift {
  const uid = randomUid()
  const username = randomUsername()
  const ts = Date.now()
  const gold = chance(0.85)
  const g = gold ? pick(GOLD_GIFTS) : pick(SILVER_GIFTS)
  const amount = gold ? pick([1, 1, 1, 2, 5, 10, 30]) : pick([1, 5, 10, 66])
  const priceNormalized = Number((g.price * amount).toFixed(2))
  return {
    type: 'gift',
    id: nextId('gift'),
    origin: MOCK_ROOM,
    originIdx: 0,
    uid,
    username,
    avatar: randomAvatar(uid, username),
    message: `投喂 ${g.name} x${amount}`,
    price: Math.round(priceNormalized * 1000),
    priceNormalized,
    duration: 0,
    coinType: gold ? 'gold' : 'silver',
    guardType: randomGuardType(),
    giftType: 0,
    giftAction: '投喂',
    giftAmount: amount,
    giftId: randInt(1, 99999),
    giftName: g.name,
    giftRemain: 0,
    giftIcon: '',
    bizSource: 'Live',
    receiver: { uid: STREAMER_UID, uname: STREAMER_NAME, master: null },
    blindGift: null,
    timestamp: ts,
    timestampNormalized: ts,
    medal: randomMedal(),
    wealthMedalLevel: chance(0.3) ? randInt(1, 30) : 0,
    read: false,
  }
}

function generateSuperchat(): SuperChat {
  const uid = randomUid()
  const username = randomUsername()
  const ts = Date.now()
  const priceNormalized = pick([30, 30, 50, 50, 100, 100, 200, 500, 1000])
  return {
    type: 'superchat',
    id: nextId('superchat'),
    origin: MOCK_ROOM,
    originIdx: 0,
    uid,
    username,
    avatar: randomAvatar(uid, username),
    avatarFrame: '',
    message: pick(SUPERCHAT_MESSAGES),
    messageColor: '#ffffff',
    messageTrans: '',
    transMark: 0,
    isAudited: 0,
    price: priceNormalized * 1000,
    priceNormalized,
    token: '',
    rate: 1000,
    duration: 60,
    timestamp: ts,
    timestampNormalized: ts,
    guardType: randomGuardType(),
    guardBackground: '',
    scId: randInt(1, 999999),
    scName: 'SC',
    scAmount: priceNormalized,
    medal: randomMedal(),
    read: false,
    deleted: false,
  }
}

function generateToast(): Toast {
  const uid = randomUid()
  const username = randomUsername()
  const ts = Date.now()
  const guard = pick([
    { type: 3, name: '舰长', price: 138 },
    { type: 3, name: '舰长', price: 138 },
    { type: 3, name: '舰长', price: 138 },
    { type: 2, name: '提督', price: 1998 },
    { type: 1, name: '总督', price: 19998 },
  ])
  const months = pick([1, 1, 1, 3, 6, 12])
  return {
    type: 'toast',
    id: nextId('toast'),
    origin: MOCK_ROOM,
    originIdx: 0,
    uid,
    username,
    avatar: randomAvatar(uid, username),
    message: `${chance(0.5) ? '开通了' : '续费了'}${guard.name}`,
    price: guard.price * 1000 * months,
    priceNormalized: guard.price * months,
    mockPrice: false,
    duration: 0,
    color: '#ffffff',
    toastType: guard.type,
    toastAmount: months,
    toastAmountUnit: '月',
    toastName: guard.name,
    toastTotalCount: randInt(1, 5000),
    toastId: randInt(1, 999999),
    effectId: 0,
    timestamp: ts,
    timestampNormalized: ts,
    read: false,
  }
}

function generateInteraction(): Interaction {
  const uid = randomUid()
  const username = randomUsername()
  const ts = Date.now()
  // Mostly "entered the room", some follows.
  const action = pick([1, 1, 1, 1, 1, 2, 2, 4, 5])
  return {
    type: 'interaction',
    id: nextId('interaction'),
    origin: MOCK_ROOM,
    originIdx: 0,
    uid,
    username,
    action,
    guardType: randomGuardType(),
    avatar: randomAvatar(uid, username),
    relation: { type: 0, icon: '', text: '' },
    wealthMedalLevel: 0,
    medal: randomMedal(),
    timestamp: ts,
    timestampNormalized: ts,
    read: false,
  }
}

function generateLikeClick(): LikeClick {
  const uid = randomUid()
  const username = randomUsername()
  const ts = Date.now()
  return {
    type: 'like-click',
    id: nextId('like-click'),
    origin: MOCK_ROOM,
    originIdx: 0,
    uid,
    username,
    avatar: randomAvatar(uid, username),
    message: '为主播点赞了',
    medal: randomMedal(),
    guardType: randomGuardType(),
    timestamp: ts,
    timestampNormalized: ts,
    read: false,
  }
}

function generateEntryEffect(): EntryEffect {
  const uid = randomUid()
  const username = randomUsername()
  const ts = Date.now()
  const guardType = pick([3, 3, 2, 1])
  const guardName = guardType === 1 ? '总督' : guardType === 2 ? '提督' : '舰长'
  return {
    type: 'entry-effect',
    id: nextId('entry-effect'),
    origin: MOCK_ROOM,
    originIdx: 0,
    uid,
    username,
    avatar: randomAvatar(uid, username),
    message: `欢迎 ${guardName} <%${username}%> 进入直播间`,
    effectId: randInt(1, 999),
    textColor: '#ffffff',
    nameColor: '#ffd700',
    duration: 4,
    background: '',
    backgroundAnimated: '',
    business: 1,
    guardType,
    wealthMedalLevel: 0,
    showAvatar: 1,
    showWealthMedal: false,
    medal: randomMedal(),
    timestamp: ts,
    timestampNormalized: ts,
    read: false,
  }
}

function generateSystem(): System {
  const ts = Date.now()
  return {
    type: 'system',
    uid: 0,
    username: 'System',
    message: pick(SYSTEM_MESSAGES),
    origin: MOCK_ROOM,
    originIdx: 0,
    id: nextId('system'),
    timestamp: ts,
    timestampNormalized: ts,
    read: false,
  }
}

// --- public API -------------------------------------------------------------

/** Build a single fully-typed mock event of the given type. */
export function generateMockEvent(type: MockEventType): LaplaceEvent {
  switch (type) {
    case 'message':
      return generateMessage()
    case 'gift':
      return generateGift()
    case 'superchat':
      return generateSuperchat()
    case 'toast':
      return generateToast()
    case 'interaction':
      return generateInteraction()
    case 'like-click':
      return generateLikeClick()
    case 'entry-effect':
      return generateEntryEffect()
    case 'system':
      return generateSystem()
  }
}

/** Weighted-pick the next event type among the currently enabled ones. */
export function pickWeightedType(enabled: MockEventType[]): MockEventType | null {
  const metas = MOCK_EVENT_TYPES.filter(m => enabled.includes(m.type))
  if (metas.length === 0) return null

  const total = metas.reduce((sum, m) => sum + m.weight, 0)
  let r = Math.random() * total
  for (const m of metas) {
    r -= m.weight
    if (r <= 0) return m.type
  }
  return metas[metas.length - 1].type
}

/** Randomized inter-event delay so the stream feels organic, not metronomic. */
export function randomEventDelay(): number {
  return randInt(MIN_EVENT_DELAY_MS, MAX_EVENT_DELAY_MS)
}
