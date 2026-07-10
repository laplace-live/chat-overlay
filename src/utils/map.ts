// source: laplace-chat

export const guardMap: {
  [key: number]: {
    name: string
    price: number
  }
} = {
  // 通常不会有 0 的情况，此处的 0 用来放宽 typing 检查限制
  0: {
    name: '',
    price: 0,
  },
  1: {
    name: '总督',
    price: 19998000,
  },
  2: {
    name: '提督',
    price: 1998000,
  },
  3: {
    name: '舰长',
    price: 138000,
  },
}

export const interactionTypeMap: {
  [key: number]: {
    action: string
    name: string
  }
} = {
  1: {
    action: 'enter',
    name: '进入',
  },
  2: {
    action: 'follow',
    name: '关注',
  },
  3: {
    action: 'share',
    name: '分享',
  },
  4: {
    action: 'follow-special',
    name: '特别关注',
  },
  5: {
    action: 'follow-mutual',
    name: '互相关注',
  },
}

export const userTypeMap: {
  [key: number]: {
    type: string
    name: string
  }
} = {
  0: {
    type: 'user',
    name: '用户',
  },
  1: {
    type: 'mod',
    name: '房管',
  },
  100: {
    type: 'streamer',
    name: '主播',
  },
}
