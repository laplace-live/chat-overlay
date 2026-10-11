// The showcase's pictures, drawn here so no one's real avatar or a real gift's artwork ships in a screenshot.
//
// Each emoji is set with `text-rendering="geometricPrecision"`, so Chromium measures it at its own size. Otherwise it
// measures SVG text at its size in CSS pixels, where a small Apple Color Emoji runs wider than the one a 2× display
// draws, and `text-anchor` leaves the emoji a few pixels left of centre.

/** An avatar: `emoji` centred on a diagonal gradient, lit from the top left. */
export function avatar(emoji: string, from: string, to: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>
<radialGradient id="lit" cx="0.3" cy="0.22" r="0.75"><stop offset="0" stop-color="#fff" stop-opacity="0.38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="lift" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.18"/></filter>
</defs>
<rect width="120" height="120" fill="url(#bg)"/>
<rect width="120" height="120" fill="url(#lit)"/>
<text x="60" y="64" font-size="60" text-anchor="middle" dominant-baseline="middle" font-family="Apple Color Emoji" text-rendering="geometricPrecision" filter="url(#lift)">${emoji}</text>
</svg>`
}

/** A gift icon: `emoji` alone, filling its square as Bilibili's gift artwork does. */
export function giftIcon(emoji: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<text x="32" y="35" font-size="54" text-anchor="middle" dominant-baseline="middle" font-family="Apple Color Emoji" text-rendering="geometricPrecision">${emoji}</text>
</svg>`
}
