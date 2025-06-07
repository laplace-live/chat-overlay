# LAPLACE Chat Overlay

A modern, transparent chat overlay application for live streaming built with Electron, React, and TypeScript. This overlay connects to the LAPLACE Event Bridge to display real-time chat messages, interactions, and viewer engagement metrics.

## Features

- **Transparent Overlay**: Seamlessly integrates with your streaming setup
- **Always-on-Top Mode**: Keeps the overlay visible above other windows
- **Click-Through Mode**: Interact with applications beneath the overlay
- **Real-time Chat Display**: Shows messages, interactions, and special events
- **Online User Count**: Displays current viewer count with smooth animations
- **Persistent Settings**: Saves your preferences locally

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

MIT
