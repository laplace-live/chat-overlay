# Dev event simulator (mock chat events) — design

**Date:** 2026-06-01
**Status:** Approved
**Branch:** `feat/dev-event-simulator`

## Problem

There is no mock data to test the visual appearance of the overlay. A developer
needs a way to simulate realistic live-stream chat events on demand. The control
must exist **only in development builds** and be absent from production builds.

## Goals

- A dev-only control to start/stop a continuous stream of simulated events.
- A dropdown menu to toggle which event types are simulated.
- Event mix resembles a real Bilibili live room: chat dominates; gifts,
  superchats, and toasts (大航海) are comparatively rare.
- Random content, username, and UID per event.
- Fully removed (tree-shaken) from production builds — not merely hidden.

## Non-goals

- No persistence of dev preferences across launches (in-memory only).
- No configurable cadence UI (a sensible randomized interval is hardcoded).
- No new test framework (repo has none today; verify by running the app).

## Approach

**Reuse the real event pipeline.** The simulator builds genuine `LaplaceEvent`
objects and pushes them through `useRuntimeStore.addMessage` — the exact path
real WebSocket events take in [useLaplaceClient.ts](../../../src/hooks/useLaplaceClient.ts).
This gives the truest visual fidelity: auto-scroll, the 100-message cap, and
every display gate (free-gift hiding, entry-effect toggle, guard-type coloring)
are all exercised. No changes to `useLaplaceClient`, and it works with no server
connected.

Rejected alternatives: injecting at the SDK/client layer (couples to SDK
internals, harder to tree-shake) and a separate dev-only message list
(duplicates render wiring, diverges from the real path).

## Dev-only guarantee

All new code lives under `src/dev/`. In [renderer.tsx](../../../src/renderer.tsx)
the control renders as `{import.meta.env.DEV && <DebugMenu />}`. Vite statically
replaces `import.meta.env.DEV` with `false` in production; the minifier folds the
dead branch and Rollup tree-shakes the entire `src/dev/` module graph (button,
popover, generators, name/message pools) out of the production bundle. Verified
by building for production and grepping the output for a sentinel string.

## Components (small, focused units)

- **`src/dev/mock-events.ts`** — pure, no React. `generateMockEvent(type)`
  factory + random helpers (uid, username, message, avatar, medal, price,
  guardType) + the word/name pools + `MOCK_EVENT_TYPES` metadata (label,
  default-enabled, weight) + `pickWeightedType()` + `randomEventDelay()`.
- **`src/dev/useMockSimulator.ts`** — React hook owning `isRunning`,
  `enabledTypes`, and a self-rescheduling `setTimeout`. Each tick weighted-picks
  an enabled type, generates an event, and calls `addMessage`. Uses refs for the
  current selection so changing types does not restart the timer. Cleans up on
  stop/unmount.
- **`src/dev/debug-menu.tsx`** — title-bar flask icon `Button` (reused) wrapped
  in a Radix `Popover` (reused `popover.tsx`, `checkbox.tsx`, `label.tsx`,
  `button.tsx`) containing the Start/Stop button and per-type checkboxes.

State lives in `DebugMenu` (always mounted in dev), not in the popover content,
so the stream keeps running while the popover is closed (Radix unmounts closed
popover content).

## Event coverage & defaults

The dropdown lists the 8 types the overlay actually renders. Others render
nothing and are excluded.

| type          | default | rough weight |
| ------------- | ------- | ------------ |
| message (chat)| ON      | 70           |
| interaction   | ON      | 14           |
| gift          | ON      | 7            |
| superchat     | ON      | 2.5          |
| toast (guard) | ON      | 1            |
| like-click    | OFF     | 4            |
| entry-effect  | OFF     | 1.5          |
| system        | OFF     | 1            |

Weights renormalize over whatever is enabled, so disabling chat does not stop
the stream. Cadence: a self-rescheduling timer fires every ~350–1400 ms
(randomized jitter).

## Random data

- **UID:** random 5–10 digit int. **Username:** pool of CJK/latin nicks, often
  with a numeric suffix. **Message:** realistic danmaku pool for chat; longer
  well-wishes for superchats; a gift name for gifts.
- **Avatar** (only `message`/`entry-effect` render one): a generated
  `data:image/svg+xml` URI — a uid-colored square with the name's first letter.
  No network calls, deterministic per user.
- **Prices:** SC `30/50/100/200/500/1000`; toast guard prices `138/1998/19998`;
  gifts mostly `coinType: 'gold'` so they show under default settings
  (occasionally silver).
- **guardType:** mostly `0`, ~11% 舰长, rare 提督/总督 — to exercise the
  username-color variants.
- Unique `id` per event (`mock-<type>-<timestamp>-<counter>`) to avoid React key
  collisions.

## Known caveats (faithful behavior, not bugs)

- Enabling `entry-effect` or silver gifts in the simulator still respects the
  overlay's own display toggles (entry-effects / free gifts hidden by default),
  so those may not appear unless the corresponding setting is on. This is the
  intended consequence of reusing the real render path.
- If the dev has click-through enabled (off by default), the portaled popover may
  not receive clicks. Acceptable for a dev-only tool.

## Testing / verification

Repo has no test runner. Generators are written as pure functions (test-ready).
Verification is manual: run the app (`pnpm start`), start the stream, confirm the
mix and rendering; then run a production build and confirm the debug code and its
sentinel strings are absent from the renderer bundle. `pnpm lint` must pass.
