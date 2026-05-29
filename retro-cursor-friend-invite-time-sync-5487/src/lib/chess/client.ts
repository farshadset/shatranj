import { RoomSession, RoomSnapshot } from './types'

interface ApiErrorPayload {
  error?: {
    code?: string
    message?: string
  }
}

interface SessionResponse {
  snapshot: RoomSnapshot
  session: RoomSession
}

interface SnapshotResponse {
  snapshot: RoomSnapshot
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_CHESS_API_BASE_URL ?? '').trim().replace(/\/$/, '')
const CLIENT_ID_STORAGE_KEY = 'realtime-chess-client-id'

function getEffectiveApiBaseUrl(): string {
  if (!API_BASE_URL) {
    return ''
  }

  if (typeof window !== 'undefined') {
    try {
      const parsed = new URL(API_BASE_URL)
      // اگر localhost هست، از مسیر نسبی Next.js استفاده کن
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return ''
      }
      // اگر اسم دامنه "مثالی/آموزشی" هست (مثل your-domain.ir یا example.com)،
      // احتمالاً در محیط dev محلی هستیم. از مسیر نسبی استفاده کن.
      if (
        parsed.hostname.includes('your-domain') ||
        parsed.hostname.includes('example.com') ||
        parsed.hostname === 'example.com'
      ) {
        return ''
      }
    } catch {
      return ''
    }
  }

  return API_BASE_URL
}

function apiUrl(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error('API path must start with "/".')
  }
  const baseUrl = getEffectiveApiBaseUrl()
  return `${baseUrl}${path}`
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & ApiErrorPayload
  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Request failed.')
  }
  return payload
}

function getClientId(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  const existing = window.localStorage.getItem(CLIENT_ID_STORAGE_KEY)?.trim() ?? ''
  if (existing) {
    return existing
  }
  const generated = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  window.localStorage.setItem(CLIENT_ID_STORAGE_KEY, generated)
  return generated
}

export async function createRoom(input: {
  name: string
  timeControlMinutes: number
  incrementSeconds: number
  quickMatch?: boolean
  excludeRoomId?: string
  clientId?: string | null
}): Promise<SessionResponse> {
  const clientId = input.clientId?.trim() || getClientId()
  const response = await fetch(apiUrl('/api/chess/rooms'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...input,
      clientId,
    }),
  })
  return parseApiResponse<SessionResponse>(response)
}

export async function joinRoom(input: { roomId: string; name: string; clientId?: string | null }): Promise<SessionResponse> {
  const clientId = input.clientId?.trim() || getClientId()
  const response = await fetch(apiUrl(`/api/chess/rooms/${input.roomId}/join`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: input.name,
      clientId,
    }),
  })
  return parseApiResponse<SessionResponse>(response)
}

export async function fetchRoom(roomId: string): Promise<SnapshotResponse> {
  const response = await fetch(apiUrl(`/api/chess/rooms/${roomId}`), {
    method: 'GET',
    cache: 'no-store',
  })
  return parseApiResponse<SnapshotResponse>(response)
}

export async function makeMove(input: {
  roomId: string
  token: string
  from: string
  to: string
  promotion?: 'q' | 'r' | 'b' | 'n'
}): Promise<SnapshotResponse> {
  const response = await fetch(apiUrl(`/api/chess/rooms/${input.roomId}/move`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: input.token,
      from: input.from,
      to: input.to,
      promotion: input.promotion,
    }),
  })
  return parseApiResponse<SnapshotResponse>(response)
}

export async function resign(input: { roomId: string; token: string }): Promise<SnapshotResponse> {
  const response = await fetch(apiUrl(`/api/chess/rooms/${input.roomId}/resign`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: input.token }),
  })
  return parseApiResponse<SnapshotResponse>(response)
}

export async function sendChatMessage(input: {
  roomId: string
  token: string
  kind: 'text' | 'sticker'
  value: string
}): Promise<SnapshotResponse> {
  const response = await fetch(apiUrl(`/api/chess/rooms/${input.roomId}/chat`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: input.token,
      kind: input.kind,
      value: input.value,
    }),
  })
  return parseApiResponse<SnapshotResponse>(response)
}

export async function offerDraw(input: { roomId: string; token: string }): Promise<SnapshotResponse> {
  const response = await fetch(apiUrl(`/api/chess/rooms/${input.roomId}/draw`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: input.token }),
  })
  return parseApiResponse<SnapshotResponse>(response)
}

export async function offerRematch(input: { roomId: string; token: string }): Promise<SnapshotResponse> {
  const response = await fetch(apiUrl(`/api/chess/rooms/${input.roomId}/rematch`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: input.token }),
  })
  return parseApiResponse<SnapshotResponse>(response)
}

export async function acceptRematch(input: { roomId: string; token: string }): Promise<SessionResponse> {
  const response = await fetch(apiUrl(`/api/chess/rooms/${input.roomId}/rematch/accept`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: input.token }),
  })
  return parseApiResponse<SessionResponse>(response)
}

export function roomEventsUrl(roomId: string, token?: string): string {
  const baseUrl = apiUrl(`/api/chess/rooms/${roomId}/events`)
  if (token) {
    return `${baseUrl}?token=${encodeURIComponent(token)}`
  }
  return baseUrl
}

export async function rejoinRoom(input: { roomId: string; token: string }): Promise<SessionResponse> {
  const response = await fetch(apiUrl(`/api/chess/rooms/${input.roomId}/rejoin`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: input.token }),
  })
  return parseApiResponse<SessionResponse>(response)
}

