// source: laplace-chat
import { guardMap, interactionTypeMap } from '@/utils/map'

export function toastCopywriting(text: string) {
  const msgMetaRegex = /.*(开通|续费)(?:.*的第(\d+)天)?/
  const msgMeta = text.match(msgMetaRegex)

  const totalDays = msgMeta?.[2] ? Number(msgMeta[2]) : 0
  const toastActionType = msgMeta?.[1] ? msgMeta[1] : '开通'

  return {
    totalDays,
    /** 开通、续费 */
    toastActionType,
  }
}

/**
 * Get interaction type details from action ID
 * @param defaultName - Used when actionId is unrecognized
 */
export function interactionCopywriting(actionId: number, defaultName = '未知互动') {
  const defaultType = {
    action: 'unknown',
    name: defaultName,
  }

  return interactionTypeMap[actionId] ?? defaultType
}

/**
 * Get guard type details from guard type ID
 * @param defaultName - Used when guardType is unrecognized
 */
export function guardCopywriting(guardType: number, defaultName = '') {
  const defaultType = {
    name: defaultName,
    price: 0,
  }

  return guardMap[guardType] ?? defaultType
}
