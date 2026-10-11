# Marketing screenshots

`pnpm screenshots` ([`scripts/screenshots.mts`](../scripts/screenshots.mts)) takes laplace.live's pictures of the overlay
and writes them to [`screenshots/<shot>.png`](../screenshots), which are committed. The app speaks one language, so there
is one set.

```sh
pnpm screenshots                  # every shot
pnpm screenshots --only=settings  # shots by name, comma-separated
```

Run it on a Mac with a Retina display. It needs no Screen Recording permission, and a run takes about five seconds, build
included. Electron comes forward when the overlay opens, as any app does with a new window, and gives focus back when the
run ends; nothing you do meanwhile reaches a shot.

## The shots

- **`hero`**, the overlay at the 400 × 800 it opens at, full of a live room's chat: Super Chats at two tiers, a gift, a
  舰长 renewal, an interaction, and the 提督 and 舰长 name colours. The 800 × 1600 file is transparent outside the
  window's rounded corners, and the panel keeps the overlay's 80% background, so whatever sits behind it on the page
  shows through, as a stream does.
- **`settings`**, the same with Settings open over the chat, from the title bar's menu.

The showcase ([`showcase.mts`](../scripts/screenshots/showcase.mts)) is 星屑电台's first-anniversary singing stream, with a
提督, a few 舰长, a studio and a newcomer in its chat. Everyone in it is made up, and their avatars and the gift icons are
drawn in [`art.mts`](../scripts/screenshots/art.mts), so no one's real face, name or message ships in a screenshot. Each
line becomes the event LAPLACE Chat would push, typed with `@laplace.live/event-types`, so a renamed field fails
`pnpm exec tsc --noEmit` instead of drifting a picture.

## How a run works

- **A fresh build on a throwaway profile.** The script builds what `pnpm package` builds, from `forge.config.ts` and by
  the Vite worker Forge runs per target, plus the harness ([`harness.mts`](../scripts/screenshots/harness.mts)) beside it
  in `.vite/build`. It starts Electron on the checkout with the harness preloaded (`-r`), ahead of the app's own
  `main.cjs`; the harness moves `appData` into a temporary folder, so your settings and Chromium profile stay untouched.
  It is the production build, so the debug menu isn't in the title bar.
- **The Event Bridge is the showcase's.** [`bridge.mts`](../scripts/screenshots/bridge.mts) listens on a free loopback
  port, so it never meets a bridge of your own, and behaves as the bridge's own server does towards a client: it welcomes
  each connection with its `established` message, then relays the room's online count and the stream. A session preload
  writes its address into the overlay's saved settings before each load, as a user's own server settings; neither shot
  shows them.
- **Nothing else answers.** The events' avatars and gift icons point at `showcase.invalid`, which the harness serves
  through `protocol.handle`, and every other request the page makes is refused. A request the showcase has no answer for
  fails the run, naming it.
- **Staged per shot.** Each shot reloads the page, so the bridge sends the stream afresh, and waits for all of it: every
  row, a green status dot and the online count. It then sets the chat's scroll to its end (see Pitfalls), and for
  `settings` presses the title bar's menu button and, once Radix has placed the menu, its Settings item, as a user does;
  Radix opens the menu on a pointer press, which `click()` doesn't make.
- **Captured as the page draws**, with `capturePage()`: the overlay has no frame or shadow of its own, so the page is all
  of it, transparency included. From each load until its capture the window floats above your windows, since a covered
  window rasters its avatars a shade differently; the overlay restores its own saved always-on-top as it mounts, so the
  harness pins it again once the page is up. It takes no clicks or keys, so nothing you do can hover or type into a
  shot; the harness's presses go to the page directly. The page goes on drawing when covered all the same, and goes on
  behaving as focused, over the DevTools protocol, whichever app you bring forward, since Radix closes an open menu when
  its window blurs. Chromium renders in sRGB for the run and `sips` tags every PNG so.
- **Only real changes are written.** Each capture is compared with the committed file, which stays when they differ in
  no more than the harness's `NOISE` share of pixels, so a rerun after an unrelated change leaves git clean. A full run
  deletes the PNGs of shots no longer listed.

## Adding a shot

Add an entry to `SHOTS` in [`shots.mts`](../scripts/screenshots/shots.mts) and stage what it opens in `stage()`. New
people, gifts or lines go in the showcase; a picture an event links to needs an answer there too, or the run fails naming
it.

## Keeping shots still

Two runs must draw the same pixels, or every rerun rewrites the PNGs. The stream is the same every run and the overlay
shows no times, so there is no clock to hold. Before each capture an input gives up focus so no caret blinks, any looping
animation is held at its first frame, and the pointer leaves the page.

## When to run it

Before merging a Version Packages PR whose changes show in a shot, so the website pictures what users download, and after
editing a shot or the showcase. Commit the PNGs it rewrites.

## Pitfalls

- It rebuilds `.vite/` the way `pnpm package` does, so don't run it beside `pnpm start`, which builds there too.
- Which row the title bar's fade cuts depends on the height of everything below it, so adding, removing or rewording a
  line can leave a half-faded row behind the title text. Look at the top of `hero` after editing the stream; the current
  lines put the gap between two rows where the fade begins, so the row above it all but disappears.
- The overlay draws the bridge's `established` message as a row, as it does for users. The stream is long enough to
  scroll it out of view, which is also where the port it names would show.
- The harness sets the chat's scroll itself as a stopgap for a bug in the overlay: `ChatEvents`
  ([`events.tsx`](../src/components/events.tsx)) takes its own smooth scroll towards new rows for the user scrolling up,
  so rows that land mid-scroll can leave following paused short of the end. Once that's fixed, check the end position
  instead of setting it.
