// The live room a run shows: a made-up streamer's first-anniversary singing stream, as the Event Bridge
// relays it to the overlay. Every event is typed with the app's own event types, so a renamed field fails
// `tsc` instead of drifting a picture. Everyone in it is made up.

import type {
  Gift,
  Interaction,
  LaplaceEvent,
  Message,
  OnlineUpdate,
  SuperChat,
  Toast,
} from '@laplace.live/event-types'

import { avatar, giftIcon } from './art.mts'

/** When the stream happens, Sunday 4 October 2026, 21:15 in Beijing; the overlay never shows it. */
const SHOWCASE_NOW = Date.UTC(2026, 9, 4, 13, 15)

/** `.invalid` never resolves, so a picture the showcase can't answer can't leave the machine either. */
const PICTURE_ORIGIN = 'https://showcase.invalid'

const STREAMER = { uid: 25034104, name: '魔兽初见' }
const ROOM = 31415

/** What the title bar counts as online. */
export const ONLINE = 2333

/** `guardType`: 0 for none, then 1 总督, 2 提督 and 3 舰长. */
const GUARD = { none: 0, governor: 1, admiral: 2, captain: 3 } as const
type Guard = (typeof GUARD)[keyof typeof GUARD]

type Face = [emoji: string, from: string, to: string]

interface Viewer {
  uid: number
  name: string
  face: Face
  /** Their 大航海 tier as the stream starts. */
  guard: Guard
}

const VIEWERS = {
  yuzu: { uid: 1414213562, name: 'アイノラパス', face: ['🐢', '#fde68a', '#fb923c'], guard: GUARD.admiral },
  boat: { uid: 1732050807, name: '夜航船', face: ['⛵', '#1e3a8a', '#38bdf8'], guard: GUARD.captain },
  momo: { uid: 2236067977, name: 'Momo', face: ['🍑', '#fce7f3', '#f472b6'], guard: GUARD.governor },
  studio: { uid: 6022140760, name: '星海音乐工作室', face: ['🎵', '#38bdf8', '#6366f1'], guard: GUARD.none },
  matcha: { uid: 2997924580, name: '抹茶拿铁', face: ['🍵', '#d9f99d', '#16a34a'], guard: GUARD.none },
  sleepy: { uid: 6626070150, name: '早睡早起身体好', face: ['😴', '#ede9fe', '#a78bfa'], guard: GUARD.none },
  cat: { uid: 1380649000, name: '路过的猫', face: ['🐱', '#f5f5f4', '#a8a29e'], guard: GUARD.none },
  qing: { uid: 1602176634, name: '阿青', face: ['🌿', '#ccfbf1', '#0d9488'], guard: GUARD.none },
  star: { uid: 1097373156, name: '星星收集者', face: ['⭐', '#fef9c3', '#eab308'], guard: GUARD.captain },
} satisfies Record<string, Viewer>

/** Gifts at their ¥ price each; the icons are drawn in `art.mts`. */
const GIFTS = {
  cake: { id: 31001, name: '周年蛋糕', icon: '🎂', price: 52 },
  star: { id: 31002, name: '小星星', icon: '🌟', price: 1 },
} satisfies Record<string, { id: number; name: string; icon: string; price: number }>

/** 舰长, the one 大航海 tier the stream sees bought, at its monthly price. */
const CAPTAIN = { name: '舰长', type: GUARD.captain, price: 138 }

type Line = { from: keyof typeof VIEWERS; guard?: Guard } & (
  | { say: string }
  | { gift: keyof typeof GIFTS; amount: number }
  | { superchat: number; text: string }
  | {
      captain: true
      /** Makes it a renewal, on this day of following. */
      day?: number
    }
  | { action: 'enter' | 'follow' | 'share' }
)

/** The stream as the overlay receives it, oldest first; the window shows the latest. */
const STREAM: Line[] = [
  { from: 'cat', action: 'enter' },
  { from: 'sleepy', say: '居然赶上开播了！' },
  { from: 'matcha', say: '晚上好～' },
  { from: 'qing', say: '来了来了' },
  { from: 'cat', action: 'follow' },
  { from: 'cat', say: '新人报到，从粉丝团过来的！' },
  { from: 'yuzu', say: '电台一周年快乐！🎉' },
  { from: 'yuzu', gift: 'cake', amount: 1 },
  { from: 'matcha', captain: true },
  { from: 'matcha', guard: GUARD.captain, say: '一周年当然要上舰！' },
  { from: 'boat', superchat: 50, text: '一周年快乐！谢谢你每个周日的陪伴，今晚的新歌一定要好好听 🎤' },
  { from: 'momo', say: '前排！' },
  { from: 'momo', action: 'share' },
  { from: 'boat', captain: true, day: 365 },
  { from: 'star', say: '365 天，老舰长了！' },
  { from: 'qing', gift: 'star', amount: 20 },
  { from: 'sleepy', say: '这首新歌好上头，已经会哼副歌了' },
  { from: 'studio', superchat: 100, text: '恭喜星屑电台一周年！新歌的编曲有我们一份，祝电台越来越好 ✨' },
  { from: 'momo', say: '单曲循环预定' },
  { from: 'cat', say: '第一次来就赶上首唱，运气太好了' },
  { from: 'yuzu', say: '奶宝宝真的好可爱！✨' },
  { from: 'boat', say: '副歌那段太绝了' },
]

const NO_MEDAL: Message['medal'] = { level: 0, name: '', room: 0, guardType: 0, lightened: 0 }

const facePath = (key: string): string => `/face/${key}.svg`
const giftPath = (key: string): string => `/gift/${key}.svg`

/** Every picture the renderer may ask for, by path. */
const PICTURES = new Map<string, string>([
  ...Object.entries(VIEWERS).map(([key, v]): [string, string] => [facePath(key), avatar(...v.face)]),
  ...Object.entries(GIFTS).map(([key, g]): [string, string] => [giftPath(key), giftIcon(g.icon)]),
])

/** One stream line as the event LAPLACE Chat pushes through the bridge. */
function event(line: Line, index: number): LaplaceEvent {
  const viewer = VIEWERS[line.from]
  const common = {
    id: `showcase-${String(index)}`,
    origin: ROOM,
    originIdx: 0,
    uid: viewer.uid,
    username: viewer.name,
    avatar: `${PICTURE_ORIGIN}${facePath(line.from)}`,
    timestamp: SHOWCASE_NOW,
    timestampNormalized: SHOWCASE_NOW,
    read: false,
  }
  const guardType = line.guard ?? viewer.guard

  if ('say' in line) {
    return {
      ...common,
      type: 'message',
      nameColor: '',
      message: line.say,
      userType: 0,
      userLvl: 0,
      userLvlBorder: 0,
      currentRank: 0,
      phoneVerified: 1,
      guardType,
      sendType: 0,
      medal: NO_MEDAL,
      reply: {},
      idStr: `showcase-message-${String(index)}`,
      wealthMedalLevel: 0,
    } satisfies Message
  }
  if ('gift' in line) {
    const gift = GIFTS[line.gift]
    const priceNormalized = gift.price * line.amount
    return {
      ...common,
      type: 'gift',
      message: `投喂 ${gift.name}`,
      price: priceNormalized * 1000,
      priceNormalized,
      duration: 0,
      coinType: 'gold',
      guardType,
      giftType: 0,
      giftAction: '投喂',
      giftAmount: line.amount,
      giftId: gift.id,
      giftName: gift.name,
      giftRemain: 0,
      giftIcon: `${PICTURE_ORIGIN}${giftPath(line.gift)}`,
      bizSource: 'Live',
      receiver: { uid: STREAMER.uid, uname: STREAMER.name, master: null },
      blindGift: null,
      medal: NO_MEDAL,
      wealthMedalLevel: 0,
    } satisfies Gift
  }
  if ('superchat' in line) {
    return {
      ...common,
      type: 'superchat',
      avatarFrame: '',
      message: line.text,
      messageColor: '#ffffff',
      messageTrans: '',
      transMark: 0,
      isAudited: 0,
      price: line.superchat * 1000,
      priceNormalized: line.superchat,
      token: '',
      rate: 1000,
      duration: 60,
      guardType,
      guardBackground: '',
      scId: 31415000 + index,
      scName: '醒目留言',
      scAmount: line.superchat,
      medal: NO_MEDAL,
      deleted: false,
    } satisfies SuperChat
  }
  if ('captain' in line) {
    return {
      ...common,
      type: 'toast',
      message:
        line.day === undefined
          ? `<%${viewer.name}%> 开通了${CAPTAIN.name}`
          : `<%${viewer.name}%> 续费了${CAPTAIN.name}，今天是TA陪伴主播的第${String(line.day)}天`,
      price: CAPTAIN.price * 1000,
      priceNormalized: CAPTAIN.price,
      mockPrice: false,
      duration: 0,
      color: '#00d1f1',
      toastType: CAPTAIN.type,
      toastAmount: 1,
      toastAmountUnit: '月',
      toastName: CAPTAIN.name,
      toastTotalCount: 233,
      toastId: 0,
      effectId: 0,
    } satisfies Toast
  }
  return {
    ...common,
    type: 'interaction',
    action: { enter: 1, follow: 2, share: 3 }[line.action],
    guardType,
    relation: { type: 0, icon: '', text: '' },
    wealthMedalLevel: 0,
    medal: NO_MEDAL,
  } satisfies Interaction
}

interface Showcase {
  /** What the bridge relays to every client, in order: the room's online count, then the stream. */
  events: LaplaceEvent[]
  /** How many rows the stream draws in the overlay. */
  rows: number
  /** Answers the renderer's picture requests. */
  serve: (request: Request) => Response
  /** Every request the showcase had no answer for; a run fails on any. */
  unanswered: string[]
}

export function createShowcase(): Showcase {
  const unanswered: string[] = []
  const online = {
    type: 'online-update',
    id: 'showcase-online',
    origin: ROOM,
    originIdx: 0,
    uid: 0,
    username: '',
    timestamp: SHOWCASE_NOW,
    timestampNormalized: SHOWCASE_NOW,
    message: '',
    count: ONLINE,
    online: ONLINE,
    read: false,
  } satisfies OnlineUpdate

  return {
    events: [online, ...STREAM.map(event)],
    rows: STREAM.length,
    serve: request => {
      const url = new URL(request.url)
      const svg = url.origin === PICTURE_ORIGIN ? PICTURES.get(url.pathname) : undefined
      if (svg === undefined) {
        unanswered.push(request.url)
        return new Response(null, { status: 404 })
      }
      return new Response(svg, { headers: { 'content-type': 'image/svg+xml' } })
    },
    unanswered,
  }
}
