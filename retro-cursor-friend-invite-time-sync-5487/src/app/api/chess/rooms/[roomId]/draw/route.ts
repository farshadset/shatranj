import { getRoomStore } from '@/lib/chess/room-store'
import { asApiError, jsonResponse, parseJson } from '@/lib/chess/http'

interface DrawBody {
  token: string
  accept?: boolean
}

interface Params {
  params: {
    roomId: string
  }
}

export async function POST(request: Request, { params }: Params): Promise<Response> {
  try {
    const body = await parseJson<DrawBody>(request)
    const store = getRoomStore()
    const snapshot = store.offerDraw({
      roomId: params.roomId,
      token: body.token ?? '',
      accept: body.accept ?? false,
    })
    return jsonResponse({ snapshot })
  } catch (error: unknown) {
    const apiError = asApiError(error)
    return jsonResponse({ error: { code: apiError.code, message: apiError.message } }, apiError.status)
  }
}
