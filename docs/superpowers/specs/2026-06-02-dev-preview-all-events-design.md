# Dev "preview all events" showcase — design

**Date:** 2026-06-02
**Status:** Approved
**Branch:** `feat/dev-preview-all-events`

## Problem

The dev event simulator
([2026-06-01-dev-event-simulator-design.md](./2026-06-01-dev-event-simulator-design.md))
emits a **random, streaming** mix of events. That is good for a "does it feel
like a real room" check, but bad for theme work: a designer styling a particular
case (e.g. a 总督 superchat, or a chat message with a long wrapping body) has to
wait for the right random event to appear, and the content/colors differ every
run.

Theme designers and developers building event styles need a **fixed,
deterministic** set of every event variant — all renderable types across the
membership/guard tiers, user levels, price tiers, and medal states — injected
**all at once**, so each case can be styled side-by-side against a reproducible
canvas. Like the simulator, this must be dev-only and tree-shaken from
production.

## Goals

- A dev-only **"Preview all events"** button inside the existing debug popover.
- One click clears the current message list and injects a fixed, curated set
  covering the **per-tier matrix** (~26 events) — every renderable type, sampled
  across guard tiers (normal / 舰长 / 提督 / 总督), user levels, price tiers, and
  medal present/absent.
- **Deterministic:** identical output on every click — stable IDs, content,
  avatars, and ordering — so designers iterate CSS against a reproducible layout.
- Reuses the real render path (`useRuntimeStore.addMessage`), same as the
  simulator, for truest visual fidelity.
- Stops any running random stream first, so the fixed set is not polluted by
  interleaved random events.
- Fully removed (tree-shaken) from production builds — not merely hidden.

## Non-goals

- **No change to existing display settings.** The preview reflects the current
  `showInteractionEvents` / `showGiftFree` / `showEntryEffect` toggles; it does
  not flip them. Some rows may therefore be hidden (see Caveats). _(Decided
  during brainstorming.)_
- **No per-type filtering of the preview** — it always builds the full set. The
  per-type checkboxes keep governing only the random stream.
- No exhaustive cartesian matrix (type × tier × medal × level buckets) — rejected
  as too long to scroll and over the 100-message cap.
- No persistence of dev state; no new test framework.

## Approach

**Curated deterministic fixtures, injected through the real pipeline.** A new
`src/dev/preview-events.ts` exports `buildPreviewEvents(): LaplaceEvent[]` — pure,
no React, no `Math.random`, no `Date.now`. `useMockSimulator` gains a
`loadPreview()` action that: stops the stream → `clearMessages()` →
`addMessage` each fixture in order. The debug menu gets one new button.

This reuses the exact path real WebSocket events take (the same choice the
simulator made), so auto-scroll, the 100-message cap, and every display gate are
all exercised, with no changes to `events.tsx` or `useLaplaceClient`.

Rejected alternatives:

- **Seeded-random reuse of the simulator generators.** Deterministic via a seed,
  but still produces arbitrary, hard-to-read content and cannot reliably hit
  specific edge cases (long text, emoji, exact price tiers, each tier exactly
  once). Hand-curated fixtures are more readable and give guaranteed coverage.
- **A separate preview render path in `events.tsx`.** Duplicates render wiring
  and forces a "preview mode" branch into a production component. Reusing
  `addMessage` keeps `events.tsx` untouched.

## Dev-only guarantee

Same mechanism as the simulator. All new code lives under `src/dev/`.
`preview-events.ts` is imported only by `useMockSimulator.ts` (already dev-only),
which is reached only through `DebugMenu`, rendered as
`{import.meta.env.DEV && <DebugMenu />}` in
[renderer.tsx](../../../src/renderer.tsx). Vite replaces `import.meta.env.DEV`
with `false` in production and Rollup tree-shakes the whole `src/dev/` graph
(including the new fixtures) out of the renderer bundle. Verified by building for
production and grepping the output for a sentinel string.

## Components (small, focused units)

- **`src/dev/preview-events.ts`** _(new)_ — pure, no React.
  `buildPreviewEvents(): LaplaceEvent[]` plus small per-type fixture builders.
  Reuses the deterministic avatar helper (see below). Fixed string IDs
  (`preview-<type>-<variant>`) and a single constant base timestamp keep output
  byte-stable across clicks.
- **`src/dev/mock-events.ts`** _(edit)_ — export the existing deterministic
  avatar helper (currently the private `randomAvatar(seed, label)`, which uses no
  randomness) so the preview renders avatars identically to the simulator. No
  behavior change to the simulator.
- **`src/dev/useMockSimulator.ts`** _(edit)_ — add a `loadPreview` callback:
  `setIsRunning(false)` → `clearMessages()` → inject each fixture via the
  existing `addMessage` ref. Pull `clearMessages` from the runtime store. Return
  `loadPreview` alongside the existing API.
- **`src/dev/debug-menu.tsx`** _(edit)_ — a new full-width **"Preview all
  events"** `Button` directly under the Start/Stop button and above the existing
  `hr`, so the per-type checkbox grid stays visually associated with the random
  stream. Icon: `IconLayoutGrid` (or similar) from `@tabler/icons-react`.

State continues to live in `DebugMenu` via `useMockSimulator`; no new store
fields are introduced.

## Preview coverage (the fixed matrix)

Fixtures are grouped by type (so a designer working on one component scans a
contiguous block), led by a system "preview" marker. ~26 events:

| type           | variants                                                                                              | count |
| -------------- | ----------------------------------------------------------------------------------------------------- | ----- |
| system         | a "preview loaded" marker                                                                             | 1     |
| message        | normal short (no medal, lvl 0); normal long-wrap (medal, high lvl); emoji-heavy; 舰长; 提督; 总督      | 6     |
| superchat      | ¥30 normal; ¥100 舰长; ¥1000 总督                                                                      | 3     |
| gift           | gold cheap (辣条); gold expensive (小电视飞船 ¥1245); silver free (小花花)¹                              | 3     |
| toast (guard)  | 舰长 ¥138; 提督 ¥1998; 总督 ¥19998                                                                     | 3     |
| interaction    | enter (normal); follow; share; special-follow; mutual-follow; enter as 舰长 (color)²                   | 6     |
| like-click     | one normal²                                                                                            | 1     |
| entry-effect   | 舰长; 提督; 总督³                                                                                       | 3     |

¹ hidden unless `showGiftFree` is on (off by default).
² hidden unless `showInteractionEvents` is on (on by default).
³ hidden unless `showEntryEffect` is on (off by default).

All fixtures carry intentional, readable usernames that name their tier (e.g.
"普通观众", "甲板上的舰长", "提督大人", "总督本督") so tiers are eyeball-obvious in
the rendered list.

## Known caveats (faithful behavior, not bugs)

- With **default settings** (`showGiftFree: false`, `showEntryEffect: false`),
  the silver-gift and the three entry-effect fixtures will not render until the
  designer turns those toggles on in Settings. `showInteractionEvents` is on by
  default, so interaction/like-click do show. This is the intended consequence of
  not mutating settings.
- Re-clicking clears first, then re-injects the same fixed set, so the stable IDs
  never collide as React keys.
- The preview shares the 100-message cap; ~26 fixtures are well under it.
- Injecting triggers the overlay's auto-scroll to bottom; the designer can scroll
  up to inspect earlier blocks.

## Testing / verification

Repo has no test runner (same as the simulator). `buildPreviewEvents()` is a pure
function (test-ready if a runner is later added). Verification is manual:

1. `pnpm start`, open the flask popover, click **Preview all events**; confirm
   every type/tier block renders (temporarily enable `showGiftFree` and
   `showEntryEffect` in Settings to see those rows).
2. Click again — confirm output is identical and not duplicated, and that a
   running stream is stopped.
3. Production build — confirm `preview-events` and a sentinel string are absent
   from the renderer bundle.
4. `pnpm lint` must pass.
