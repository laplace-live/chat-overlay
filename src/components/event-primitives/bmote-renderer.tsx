import type { SimpleEmotesList } from '@laplace.live/internal'

interface BmoteProps {
  text: string
  bmotes: SimpleEmotesList
}

export function BmoteRenderer({ text, bmotes }: BmoteProps) {
  const regex = /(\[[^\]]+\])|([^[\]]+)/g

  const replaceEmotes = (inputText: string) => {
    const matches = [...inputText.matchAll(regex)]

    return matches.map(match => {
      const part = match[0]
      const offset = match.index
      if (Object.hasOwn(bmotes, part)) {
        return (
          <picture key={offset} className='bmote-wrap inline-flex'>
            <img
              className='bmote'
              src={bmotes[part]?.url}
              alt={part}
              // NOTE: b豆目前返回的尺寸基本都是 20 x 20 固定的
              // width={bmotes[part].width || 24}
              // height={bmotes[part].height || 24}
              referrerPolicy='no-referrer'
              loading='lazy'
            />
          </picture>
        )
      }
      return part
    })
  }

  return <>{replaceEmotes(text)}</>
}
