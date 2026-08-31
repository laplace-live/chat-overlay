---
name: debug-on-ubuntu-vm
description: Remote-debug this overlay on the LAN Ubuntu VM over SSH + Chrome DevTools Protocol, and verify Linux window behavior against X11 ground truth. Use when testing always-on-top, click pass-through, the title-bar sensor, Wayland/XWayland behavior, or any .deb packaging change that has to be checked on real Linux.
---

# Debug on the Ubuntu VM

macOS cannot exercise the Linux window paths: always-on-top, click pass-through
and the title-bar sensor all depend on X11/XWayland. Verify them on the VM.

## Connecting

This is a public repo, so no host or username appears in it. The connection
details live in `.claude/vm.env`, which is gitignored. Source it first:

```bash
source .claude/vm.env   # VM_HOST, VM_USER, VM_UID
```

If it is missing, ask for the values and recreate it — do not inline them into
any command you leave behind in a tracked file, a commit message, or this skill.

|                 |                                                                                |
| --------------- | ------------------------------------------------------------------------------ |
| Host            | `ssh $VM_HOST` (key auth, no password)                                         |
| Project         | `/home/$VM_USER/Git/chat-overlay`                                              |
| Desktop session | **GNOME on Wayland**, `/run/user/$VM_UID`                                      |
| Node            | fnm, `/home/$VM_USER/.local/share/fnm/node-versions/v24.20.0/installation/bin` |
| Installed app   | `/usr/bin/chat-overlay` → `/usr/lib/chat-overlay/`                             |

Helper scripts already live in `/home/$VM_USER/`: `start-dev.sh`, `start-pkg.sh`,
`sb.sh` (shape probe), `shape.py`. Recreate from the snippets below if missing.

Every launcher must export the session env by hand — an SSH shell has none:

```bash
export HOME=/home/$VM_USER XDG_RUNTIME_DIR=/run/user/$VM_UID
export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$VM_UID/bus
export DISPLAY=:0 XAUTHORITY=$(ls /run/user/$VM_UID/.mutter-Xwaylandauth.* | head -1)
```

Set `XDG_SESSION_TYPE=x11` to test with the flag already applied, or
`XDG_SESSION_TYPE=wayland WAYLAND_DISPLAY=wayland-0` to exercise the self-relaunch.

## Sync

Never sync `.env` — it holds Apple signing credentials.

```bash
rsync -az --delete \
  --exclude node_modules --exclude .git --exclude out --exclude .vite \
  --exclude .env --exclude '.claude/vm.env' \
  ./ "$VM_HOST:/home/$VM_USER/Git/chat-overlay/"
```

Confirm parity with `md5 -q <file>` against `md5sum` on the VM — rsync reporting
"no transfer" is not proof the file you edited is the one being built.

**Never `chown -R` the project on the VM.** It resets
`node_modules/electron/dist/chrome-sandbox`, which must stay `root:root 4755` or
Electron refuses to start.

## Run with debuggers attached

```bash
# on the VM, as $VM_USER, from the project dir
pnpm start -- --ozone-platform=x11 --remote-debugging-port=9229 --remote-allow-origins='*' --inspect=9230
```

Then tunnel both from the Mac:

```bash
ssh -N -L 9229:127.0.0.1:9229 -L 9230:127.0.0.1:9230 "$VM_HOST" &
```

9229 is the renderer (CDP), 9230 the main process (Node inspector).
**`--inspect` is dead on packaged builds** — `EnableNodeCliInspectArguments: false`
in `forge.config.ts`. Packaged debugging is renderer-only; use the X11 probe for
main-process state.

## Drive the renderer

```js
// cdp-eval.mjs — usage: node cdp-eval.mjs <probe.js | "<expression>">
import { readFileSync } from 'node:fs'
const arg = process.argv[2]
const expression = arg.endsWith('.js') ? readFileSync(arg, 'utf8') : arg
const targets = await (await fetch('http://127.0.0.1:9229/json')).json()
// MUST exclude the sensor: it is a second page with no buttons and no handlers
const page = targets.find(t => t.type === 'page' && !t.url.includes('sensor=1'))
const ws = new WebSocket(page.webSocketDebuggerUrl)
let id = 0
const pending = new Map()
const send = (m, p = {}) =>
  new Promise(r => {
    const i = ++id
    pending.set(i, r)
    ws.send(JSON.stringify({ id: i, method: m, params: p }))
  })
ws.onmessage = e => {
  const m = JSON.parse(e.data)
  if (pending.has(m.id)) {
    pending.get(m.id)(m)
    pending.delete(m.id)
  }
}
await new Promise(r => {
  ws.onopen = r
})
await send('Runtime.enable')
const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
console.log(JSON.stringify(r.result?.result?.value ?? r.result?.exceptionDetails))
ws.close()
```

Swap the target filter to `t.url.includes('sensor=1')` to drive the sensor window.
Synthesize input with `Input.dispatchMouseEvent` / `Input.dispatchKeyEvent`;
`document.getElementById(...).click()` also works, React picks it up.

Pass expressions **via a file**, not inline — shell quoting mangles nested quotes.

## Ground truth: measure, don't trust the UI

The toggle state and the actual window behavior can disagree — that is the shape
of nearly every bug here. The authority is the **XShape Input region**:
`400x800` = interactive, `1x1` = passing through. `setShape()` only changes the
Bounding region, so a visual check proves nothing.

```bash
# sb.sh — one line per overlay window
export DISPLAY=:0 XAUTHORITY=$(ls /run/user/$VM_UID/.mutter-Xwaylandauth.* | head -1)
for wid in $(xdotool search --name "LAPLACE Chat Overlay" | sort -u); do
  echo "  win $wid $(xdotool getwindowgeometry $wid | grep Geometry | tr -d ' ') \
input=$(python3 ~/shape.py $wid | grep Input | sed 's/.*total area //;s/px.*//')px"
done
```

```python
# shape.py <window-id> — needs python3-xlib
import sys
from Xlib import display
from Xlib.ext import shape
w = display.Display().create_resource_object('window', int(sys.argv[1]))
for name, kind in (('Bounding', 0), ('Clip', 1), ('Input', 2)):
    rects = w.shape_get_rectangles(kind).rectangles
    print(f'{name:9s}: {len(rects)} rect(s), total area {sum(r.width*r.height for r in rects)}px')
```

Always-on-top is `xprop -id <wid> _NET_WM_STATE` containing `_NET_WM_STATE_ABOVE`.
A healthy pass-through state is main `input=1px` **and** a second 400x48 sensor
window at `input=19200px`.

## Packaged (.deb) builds

Build on the Mac — but with **Node 22**, since `extract-zip@2.0.1` hangs on Node 24
and packaging exits 0 with no output:

```bash
PATH="/opt/homebrew/opt/node@22/bin:$PATH" pnpm exec electron-forge make --platform=linux --arch=x64 --targets=deb
```

`--targets` matches the maker's `name` (`deb`), **not** the package name. Getting
this wrong silently instantiates a default `MakerDeb` with none of the configured
options.

Install with `dpkg -i`, never `apt install` — apt skips a same-version reinstall
and leaves you testing the old build. Then **prove** the new code shipped before
trusting any result: extract the renderer bundle from
`/usr/lib/chat-overlay/resources/app.asar` and grep it. `strings` on the asar
finds nothing useful; the minified bundle is one enormous line.

## Gotchas that cost real time

- **`pkill -f` kills its own SSH session.** The pattern matches the `bash -c`
  command line carrying it, so the connection dies with exit 255. Use
  `pkill -x chat-overlay` (exact process name) or `pkill -f "[e]lectron-forge"` —
  and note the bracket trick still fails if the literal string appears elsewhere
  in your command, e.g. a `.desktop` path.
- **Stale port 9229** → `bind() failed: Address already in use` and no CDP at all.
  The app still starts, so this looks like a code failure. Check
  `ss -lntp | grep 9229` and kill leftovers before relaunching.
- **A real mouse pointer sitting over the overlay corrupts hover tests.** Genuine
  pointer events arrive and correctly revert a handoff you just made. Park it
  first: `xdotool mousemove 50 700`.
- **You cannot synthesize real pointer input on this VM.** XTEST and uinput
  (ydotool, custom evdev) both deliver zero events to XWayland clients. CDP's
  input layer is the only working path — it exercises the renderer faithfully but
  does not prove the compositor routes a physical mouse. Say so when reporting.
- **Dev mode does not self-relaunch onto X11** (by design — it would outlive the
  Vite dev server). Pass `--ozone-platform=x11` yourself when starting dev.
