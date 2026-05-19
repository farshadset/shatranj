import { getRoomStore } from '@/lib/chess/room-store'
import { asApiError, jsonResponse, parseJson } from '@/lib/chess/http'

interface AcceptBody {
  token: string
}

interface Params {
  params: {
    roomId: string
  }
}

export async function POST(request: Request, { params }: Params): Promise<Response> {
  try {
    const body = await parseJson<AcceptBody>(request)
    const store = getRoomStore()
    const result = store.acceptRematch({
      roomId: params.roomId,
      token: body.token ?? '',
    })
    return jsonResponse({
      snapshot: result.snapshot,
      session: {
        token: result.session.token,
        playerId: result.session.playerId,
        color: result.session.color,
        name: result.session.name,
      },
    })
  } catch (error: unknown) {
    const apiError = asApiError(error)
    return jsonResponse({ error: { code: apiError.code, message: apiError.message } }, apiError.status)
  }
}
