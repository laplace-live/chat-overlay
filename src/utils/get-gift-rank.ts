// source: laplace-chat

/**
 * 根据礼物实际金额决定礼物等级，用于颜色区分
 */
export function getGiftRank(price: number | undefined) {
  if (price) {
    if (price >= 30 && price < 50) {
      return '1'
    } else if (price >= 50 && price < 100) {
      return '2'
    } else if (price >= 100 && price < 500) {
      return '3'
    } else if (price >= 500 && price < 1000) {
      return '4'
    } else if (price >= 1000 && price < 2000) {
      return '5'
    } else if (price >= 2000) {
      return '6'
    }
  }
  return '1'
}
