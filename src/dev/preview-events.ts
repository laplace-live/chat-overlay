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

// These mirror the values in mock-events.ts. They are not rendered (origin /
// receiver fields), so keeping them as local copies is fine.
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
    message: `投喂 ${opts.giftName}`,
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
    buildMessage({
      slug: 'normal-short',
      uid: 1001,
      username: '路过的小猫',
      message: '草',
      guardType: 0,
      userLvl: 0,
      medal: NO_MEDAL,
    }),
    buildMessage({
      slug: 'normal-long',
      uid: 1002,
      username: '话痨观众',
      message: '这是一条特别长的弹幕，用来测试主题在遇到超长文本时的换行、断行和整体排版效果是否正常显示～',
      guardType: 0,
      userLvl: 35,
      medal: medal(21, '奶茶'),
      wealthMedalLevel: 18,
    }),
    buildMessage({
      slug: 'emoji',
      uid: 1003,
      username: 'emoji爱好者',
      message: '🎉🎉🎉😂😂👍🥰🔥🔥🔥',
      guardType: 0,
      userLvl: 12,
      medal: NO_MEDAL,
    }),
    buildMessage({
      slug: 'guard-captain',
      uid: 1004,
      username: '甲板上的舰长',
      message: '舰长前来报到！',
      guardType: 3,
      userLvl: 22,
      medal: medal(25, '团子'),
    }),
    buildMessage({
      slug: 'guard-admiral',
      uid: 1005,
      username: '提督大人',
      message: '提督路过，给主播撑个场子',
      guardType: 2,
      userLvl: 28,
      medal: medal(30, '月光'),
    }),
    buildMessage({
      slug: 'guard-governor',
      uid: 1006,
      username: '总督本督',
      message: '总督驾到，全场最佬',
      guardType: 1,
      userLvl: 40,
      medal: medal(40, '阿绿'),
    }),

    // superchat × price/tier
    buildSuperchat({
      slug: 'low',
      uid: 2001,
      username: '萌新SC',
      message: '第一次发SC，支持一下，加油！',
      guardType: 0,
      priceNormalized: 30,
    }),
    buildSuperchat({
      slug: 'mid',
      uid: 2002,
      username: '甲板上的舰长',
      message: '点歌《晴天》可以吗？谢谢主播~',
      guardType: 3,
      priceNormalized: 50,
    }),
    buildSuperchat({
      slug: 'mid',
      uid: 2002,
      username: '甲板上的舰长',
      message:
        '主播你听我的吧，给维阿同事都去打打招呼，小团体加一圈，多联动，多敬酒，熬几年3d也有了，老公也有了，安安稳稳收米不香吗',
      guardType: 3,
      priceNormalized: 100,
    }),
    buildSuperchat({
      slug: 'mid',
      uid: 2002,
      username: '甲板上的舰长',
      message:
        '美国不安全，直播间的美✌🏻你们听我的，回来吧，分期买套房，整个新能源车，炒点股，轰轰烈烈办一场婚礼，婚后生俩大胖小子，这日子不和和美美吗，我算求你了',
      guardType: 3,
      priceNormalized: 500,
    }),
    buildSuperchat({
      slug: 'high',
      uid: 2003,
      username: '总督本督',
      message: '人生有梦，各自精彩，冬眠不是为了离开，而是为了更好的归来，祝奶绿福暖四季、顺遂安康',
      guardType: 1,
      priceNormalized: 1000,
    }),
    buildSuperchat({
      slug: 'high',
      uid: 2003,
      username: '总督本督',
      message:
        '妈妈，人生要是星露谷就好了。随时可以到达的海边，送出礼物就能获得的友谊，付出努力就一定会有收获，失败了也只是掉东西，永远有再来的机会。而且就算什么也不干每天躺在床上，评定等级的时候爷爷也只是希望你开心',
      guardType: 1,
      priceNormalized: 2000,
    }),

    // gift × coin/price
    buildGift({
      slug: 'gold-cheap',
      uid: 3001,
      username: '抠门土豪',
      guardType: 0,
      giftName: '辣条',
      giftAmount: 1,
      unitPrice: 0.1,
      coinType: 'gold',
      medal: NO_MEDAL,
    }),
    buildGift({
      slug: 'gold-pricey',
      uid: 3002,
      username: '真·壕',
      guardType: 3,
      giftName: '小电视飞船',
      giftAmount: 2,
      unitPrice: 1245,
      coinType: 'gold',
      medal: medal(26, '锦鲤'),
    }),
    buildGift({
      slug: 'silver-free',
      uid: 3003,
      username: '白嫖怪',
      guardType: 0,
      giftName: '小花花',
      giftAmount: 1,
      unitPrice: 0,
      coinType: 'silver',
      medal: NO_MEDAL,
    }),

    // toast (guard) × tiers
    buildToast({
      slug: 'captain',
      uid: 4001,
      username: '新晋舰长',
      toastType: 3,
      toastName: '舰长',
      unitPrice: 138,
      months: 1,
    }),
    buildToast({
      slug: 'admiral',
      uid: 4002,
      username: '提督大人',
      toastType: 2,
      toastName: '提督',
      unitPrice: 1998,
      months: 1,
    }),
    buildToast({
      slug: 'governor',
      uid: 4003,
      username: '总督本督',
      toastType: 1,
      toastName: '总督',
      unitPrice: 19998,
      months: 1,
    }),

    // interaction × actions + tier
    buildInteraction({ slug: 'enter', uid: 5001, username: '路人甲', action: 1, guardType: 0, medal: NO_MEDAL }),
    buildInteraction({ slug: 'follow', uid: 5002, username: '新粉丝', action: 2, guardType: 0, medal: NO_MEDAL }),
    buildInteraction({ slug: 'share', uid: 5006, username: '分享达人', action: 3, guardType: 0, medal: NO_MEDAL }),
    buildInteraction({
      slug: 'special-follow',
      uid: 5003,
      username: '真爱粉',
      action: 4,
      guardType: 0,
      medal: medal(15, '柠檬'),
    }),
    buildInteraction({
      slug: 'mutual-follow',
      uid: 5004,
      username: '老朋友',
      action: 5,
      guardType: 0,
      medal: medal(18, '星星'),
    }),
    buildInteraction({
      slug: 'enter-captain',
      uid: 5005,
      username: '甲板上的舰长',
      action: 1,
      guardType: 3,
      medal: medal(25, '团子'),
    }),

    // like-click
    buildLikeClick({ slug: 'normal', uid: 6001, username: '点赞狂魔', guardType: 0, medal: NO_MEDAL }),

    // entry-effect × tiers
    buildEntryEffect({ slug: 'captain', uid: 7001, username: '甲板上的舰长', guardType: 3, guardName: '舰长' }),
    buildEntryEffect({ slug: 'admiral', uid: 7002, username: '提督大人', guardType: 2, guardName: '提督' }),
    buildEntryEffect({ slug: 'governor', uid: 7003, username: '总督本督', guardType: 1, guardName: '总督' }),
  ]
}
