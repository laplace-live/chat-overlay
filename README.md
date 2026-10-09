# LAPLACE Chat Overlay

A modern, transparent chat overlay application for Bilibili live streaming built with Electron, React, and TypeScript. This overlay connects to the LAPLACE Event Bridge to display real-time chat messages, interactions, and viewer engagement metrics.

![image](https://github.com/user-attachments/assets/4b36bee7-8944-4ce1-9a85-77a62e4fd9d7)

## Features

- **Transparent Overlay**: Seamlessly integrates with your streaming setup
- **Always-on-Top Mode**: Keeps the overlay visible above other windows
- **Click-Through Mode**: Interact with applications beneath the overlay
- **Real-time Chat Display**: Shows messages, interactions, and special events
- **Online User Count**: Displays current viewer count with smooth animations
- **Persistent Settings**: Saves your preferences locally

## Download

### Stable Releases

> [!IMPORTANT]
> All stable releases are signed and notarized. Do not download or run these from untrusted sources. If your system prompts that the app is from unknown sources without a signature, remove it immediately and report in our Discord.
>
> 所有稳定版本均已签名和公证。请勿从不受信任的来源下载或安装。如果系统提示该应用来自未知来源且未签名，请立即删除并在我们的 Discord 中报告。

Download the latest stable version from our GitHub releases:

[📦 Download Latest Release](https://github.com/laplace-live/chat-overlay/releases/latest)

Available for:

- **macOS**: `*.darwin-arm64-*.zip` package for Apple Silicon Macs
- **Windows**: `*.Setup.exe` installer for 64-bit systems
- **Linux**: `*.rpm` and `*.deb` packages for most distributions

### Nightly Builds

Get the latest development builds with cutting-edge features:

[🌙 Download Nightly Builds](https://github.com/laplace-live/chat-overlay/actions)

1. Click on the latest workflow run with a ✅ status
2. Scroll down to "Artifacts" section
3. Download the build for your platform

> [!CAUTION]
> Nightly builds are automatically generated from the latest code and may contain experimental features or bugs. Use stable releases for production streaming.
>
> All nightly builds are not signed or notarized.

## Usage

### Development

Run the application in development mode:

```bash
pnpm start
```

### Production Build

Package the application for your platform:

```bash
pnpm make
```

The packaged applications will be available in the `out` directory.

### Linux: Wayland and XWayland

Always-on-top and click pass-through both require an X11 client. Wayland gives
applications no control over where their windows sit or how they stack, which
rules out always-on-top as well as the title-bar sensor that click pass-through
relies on (see below), so on a native Wayland session both toggles do nothing at
all.

The overlay therefore launches itself under XWayland on Wayland sessions — the
`.deb` and `.rpm` desktop entries pass `--ozone-platform=x11`, and any other
launch path (a terminal, autostart) relaunches once with the same flag. The
trade-off is that Linux loses native-Wayland fractional scaling, which can look
softer on HiDPI displays.

To stay on native Wayland — for instance if XWayland isn't installed — set
`CHAT_OVERLAY_ALLOW_WAYLAND=1`, accepting that both features become inert.

In development the relaunch is skipped, because the replacement process would
outlive the Vite dev server that electron-forge tears down with its own child.
Start it on X11 directly instead:

```bash
pnpm start -- --ozone-platform=x11
```

#### How click pass-through keeps the title bar alive on Linux

On macOS and Windows the chat area passes clicks through while the title bar
stays interactive, because `setIgnoreMouseEvents(true, { forward: true })` keeps
delivering mousemove so the renderer can tell when the cursor comes back.

Linux has no `forward`, and nothing else fills the gap — an ignored window gets
no pointer events at all, so `screen.getCursorScreenPoint()` freezes, and
`setShape()` constrains only what is drawn, not what is clickable.

So on Linux the app opens a second window: a transparent, always-on-top strip
parked exactly over the title bar, running this same bundle in `?sensor=1` mode.
While the overlay is passing clicks through, that strip is the only thing that
can still notice the cursor arriving. When it does, it hands control back — the
overlay stops ignoring the pointer and the strip steps aside — so the title bar
behaves natively, with working hover, dragging and buttons. The renderer's own
mousemove handler re-engages pass-through when the cursor leaves again.

As a safety net, pressing Escape with the overlay focused always turns
pass-through off.

## Releasing

Versions and the changelog are managed by [Changesets](https://changesets.dev).
Never bump `version` in `package.json`, push a `v*` tag, or edit
`CHANGELOG.md` by hand.

1. Every user-facing change ships with a changeset in the same commit. Run
   `pnpm exec changeset`, or add a file under `.changeset/` yourself:

   ```md
   ---
   'chat-overlay': minor
   ---

   feat: Add a font size setting for chat messages
   ```

   Use `minor` for new features and substantial behavior changes, `patch` for
   fixes and small changes. Start the summary with `feat:`, `fix:`, `perf:` or
   `chore:`, then one capitalized sentence written for users — the prefix is
   stripped, and the rest lands verbatim in `CHANGELOG.md` and the GitHub
   Release. CI, docs, and refactors with no user-visible effect need no
   changeset; `pnpm exec changeset status` lists what is pending.
2. While changesets sit on `master`, the Release workflow keeps a
   `chore: version packages` PR open that bumps the version and updates
   `CHANGELOG.md`.
3. Merging that PR tags `v<version>` and creates the GitHub Release from the
   new changelog entry. The tag triggers Build and Release, which signs every
   platform and attaches the installers to that release, where macOS and
   Windows installs pick up the update.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Add a changeset if the change is user-facing (`pnpm exec changeset`, see
   [Releasing](#releasing))
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

AGPL-3.0
