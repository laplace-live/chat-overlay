import dayjs, { extend, locale } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import 'dayjs/locale/zh-cn'

type RelativeTimeProps = {
  locale?: string
}

export function timeFromNow(time: number, { locale: loc = 'zh-CN' }: RelativeTimeProps = {}) {
  locale(loc)
  extend(relativeTime)
  return dayjs(time).fromNow()

  // const relativeTimeFormat = new Intl.RelativeTimeFormat(
  //   locale,
  //   {
  //     numeric: 'auto'
  //   }
  // );
  // const offset = time - Date.now()
  // const offsetInSec = offset / 1000
  // let unit: Intl.RelativeTimeFormatUnit = 'second'
  // if (offsetInSec > 60) {
  //   unit = 'minute'
  // } else if (offsetInSec > 3600) {
  //   unit = 'hour'
  // } else if (offsetInSec > 86400) {
  //   unit = 'day'
  // }

  // return relativeTimeFormat.format(offset, unit)
}
