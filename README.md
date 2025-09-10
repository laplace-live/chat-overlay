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
> All stable releases are signed and notarized. Do not download or run these from untrusted sources.
>
> 所有稳定版本均已签名和公证。请勿从不受信任的来源下载或安装

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

AGPL-3.0
