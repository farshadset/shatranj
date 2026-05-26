import { asProfileApiError, getUserStore } from '@/lib/profile/user-store'
import { writeSnapshotToFile } from '@/lib/profile/file-persistence'

export async function POST(request: Request): Promise<Response> {
  try {
    let body: {
      username: string
      skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    }
    try {
      body = (await request.json()) as typeof body
    } catch {
      return Response.json(
        { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
        { status: 400 }
      )
    }

    if (!body.username) {
      return Response.json(
        { error: { code: 'INVALID_USERNAME', message: 'نام کاربری الزامی است.' } },
        { status: 400 }
      )
    }

    if (!body.skillLevel) {
      return Response.json(
        { error: { code: 'INVALID_SKILL_LEVEL', message: 'سطح مهارت الزامی است.' } },
        { status: 400 }
      )
    }

    const result = getUserStore().setSkillLevel({
      username: body.username,
      skillLevel: body.skillLevel,
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