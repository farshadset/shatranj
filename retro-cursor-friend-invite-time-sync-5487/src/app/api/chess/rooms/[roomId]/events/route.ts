import { NextRequest } from 'next/server'
import { getRoomStore } from '@/lib/chess/room-store'
import { asApiError, jsonResponse } from '@/lib/chess/http'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
): Promise<Response> {
  try {
    const roomId = params.roomId.toUpperCase()
    const store = getRoomStore()

    // Extract token from query param to know who is connecting
    const token = request.nextUrl.searchParams.get('token') ?? ''
    let playerId = ''

    // Resolve playerId from token
    if (token) {
      try {
        const session = store.getSession(roomId, token)
        if (session) {
          playerId = session.playerId
        }
      } catch {
        // Token invalid, continue without tracking
      }
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (eventName: string, payload: unknown): void => {
          controller.enqueue(encoder.encode(`event: ${eventName}\n`))
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        }

        // Notify server that this player connected
        if (playerId) {
          store.onPlayerConnected(roomId, playerId)
        }

        send('connected', { ok: true, roomId })
        send('snapshot', store.getRoomSnapshot(roomId))

        const unsubscribe = store.subscribe(roomId, (event) => {
          send(event.type, event.snapshot)
        })

        const heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(': ping\n\n'))
        }, 15_000)

        const close = (): void => {
          clearInterval(heartbeat)
          unsubscribe()
          // Notify server that this player disconnected
          if (playerId) {
            try {
              store.onPlayerDisconnected(roomId, playerId)
            } catch {
              // Room may have been cleaned up
            }
          }
          try {
            controller.close()
          } catch {
            // Ignore if already closed
          }
        }

        request.signal.addEventListener('abort', close)
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (error: unknown) {
    const apiError = asApiError(error)
    return jsonResponse({ error: { code: apiError.code, message: apiError.message } }, apiError.status)
  }
}