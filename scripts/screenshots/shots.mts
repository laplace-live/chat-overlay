// The website's shots of the overlay: its window full of a live room's chat, and the same with Settings open.

/** Logical px: the size the overlay opens at. */
export const WINDOW = { width: 400, height: 800 }

export interface Shot {
  /** File name, without `.png`. */
  name: string
  /** Opens Settings over the chat, from the title bar's menu as a user does. */
  settings?: boolean
}

export const SHOTS: Shot[] = [{ name: 'hero' }, { name: 'settings', settings: true }]
