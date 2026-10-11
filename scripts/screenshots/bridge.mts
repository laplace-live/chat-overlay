// The LAPLACE Event Bridge a run talks to, behaving as the bridge's own server does towards a client: it
// welcomes each connection, then relays the showcase's events as LAPLACE Chat would push them through.

import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { createServer, type IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'
import type { LaplaceEvent } from '@laplace.live/event-types'

/** Loopback only; the harness points the overlay here. */
export const BRIDGE_HOST = '127.0.0.1'
/** RFC 6455's handshake suffix. */
const HANDSHAKE_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

/** Serves `events` to every client that connects to `port`, once it listens. */
export async function startBridge(port: number, events: LaplaceEvent[]): Promise<void> {
  let connections = 0
  const server = createServer((_request, response) => {
    // What the bridge says to anything but a WebSocket, `/info` included.
    response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' }).end('Bad Request')
  })
  server.on('upgrade', (request: IncomingMessage, socket: Duplex) => {
    socket.on('error', () => undefined)
    const key = request.headers['sec-websocket-key']
    if (request.headers.upgrade?.toLowerCase() !== 'websocket' || typeof key !== 'string') {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
      return
    }
    connections += 1
    socket.write(
      [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${createHash('sha1').update(`${key}${HANDSHAKE_GUID}`).digest('base64')}`,
        '',
        '',
      ].join('\r\n')
    )
    const path = new URL(request.url ?? '/', 'ws://bridge').pathname
    const welcome = {
      type: 'established',
      clientId: `client-${String(connections)}`,
      isServer: false,
      message: `Connected to LAPLACE Event Bridge: ws://${request.headers.host ?? ''}${path}`,
    }
    for (const message of [welcome, ...events]) socket.write(textFrame(JSON.stringify(message)))
    // A client only ever sends control frames here; a close gets one back.
    socket.on('data', (chunk: Buffer) => {
      if ((chunk[0] & 0x0f) === 0x8) socket.end(Buffer.from([0x88, 0x00]))
    })
  })
  server.listen(port, BRIDGE_HOST)
  await once(server, 'listening')
}

/** A port free on the bridge's host. */
export async function freePort(): Promise<number> {
  const server = createServer().listen(0, BRIDGE_HOST)
  await once(server, 'listening')
  const address = server.address()
  server.close()
  if (address === null || typeof address === 'string') throw new Error(`no free port on ${BRIDGE_HOST}`)
  return address.port
}

/** One final, unmasked text frame, as a server sends it. */
function textFrame(text: string): Buffer {
  const payload = Buffer.from(text)
  const { length } = payload
  let header: Buffer
  if (length < 126) {
    header = Buffer.from([0x81, length])
  } else if (length < 0x10000) {
    header = Buffer.from([0x81, 126, length >> 8, length & 0xff])
  } else {
    header = Buffer.alloc(10)
    header[0] = 0x81
    header[1] = 127
    header.writeBigUInt64BE(BigInt(length), 2)
  }
  return Buffer.concat([header, payload])
}
