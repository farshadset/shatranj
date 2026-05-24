import { asProfileApiError, getUserStore } from '@/lib/profile/user-store'
import { writeSnapshotToFile } from '@/lib/profile/file-persistence'

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username') ?? ''

    if (!username) {
      return Response.json(
        { error: { code: 'INVALID_USERNAME', message: 'نام کاربری الزامی است.' } },
        { status: 400 }
      )
    }

    const result = getUserStore().getGameStats({ username })
    return Response.json(result, { status: 200 })
  } catch (error: unknown) {
    const apiError = asProfileApiError(error)
    return Response.json(
      { error: { code: apiError.code, message: apiError.message } },
      { status: apiError.status }
    )
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    let body: {
      username: string
      result: 'win' | 'loss' | 'draw'
      timeControlMinutes: number
      incrementSeconds: number
    }
    try {
      body = (await request.json()) as typeof body
    } catch {
      return Response.json(
        { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
        { status: 400 }
      )
    }

    const result = getUserStore().recordGameResult({
      username: body.username ?? '',
      result: body.result,
      timeControlMinutes: Number(body.timeControlMinutes ?? 0),
      incrementSeconds: Number(body.incrementSeconds ?? 0),
    })

    // Save to file persistence
    const snapshot = getUserStore().exportSnapshot()
    await writeSnapshotToFile(snapshot)

    return Response.json(result, { status: 200 })
  } catch (error: unknown) {
    const apiError = asProfileApiError(error)
    return Response.json(
      { error: { code: apiError.code, message: apiError.message } },
      { status: apiError.status }
    )
  }
}