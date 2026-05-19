'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Chess, Square } from 'chess.js'
import { ChessBoard } from './chess-board'
import { MoveList } from './move-list'
import { createRoom, fetchRoom, joinRoom, makeMove, offerDraw, offerRematch, acceptRematch, resign, roomEventsUrl, sendChatMessage } from '@/lib/chess/client'
import { ChatMessage, PlayerColor, RoomSession, RoomSnapshot, RoomStatus } from '@/lib/chess/types'
import { PROFILE_USERNAME_STORAGE_KEY } from '@/lib/profile/constants'

function formatTimer(ms: number): string {
  const clampedMs = Math.max(0, Math.floor(ms))
  const totalSeconds = Math.floor(clampedMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((clampedMs % 1000) / 10)
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const minutesRemainder = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(minutesRemainder).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  if (minutes < 1) {
    return `${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

type PromotionPiece = 'q' | 'r' | 'b' | 'n'
type ChatComposerTab = 'text' | 'sticker'
type ChatStickerCategoryId = 'general' | 'reaction' | 'chess'

interface StoredSession {
  roomId: string
  session: RoomSession
}

interface PendingPromotion {
  from: Square
  to: Square
  options: PromotionPiece[]
}

const PROMOTION_PIECE_IMAGE: Record<PlayerColor, Record<PromotionPiece, string>> = {
  white: {
    q: '/chess/pieces/cburnett/wQ.svg',
    r: '/chess/pieces/cburnett/wR.svg',
    b: '/chess/pieces/cburnett/wB.svg',
    n: '/chess/pieces/cburnett/wN.svg',
  },
  black: {
    q: '/chess/pieces/cburnett/bQ.svg',
    r: '/chess/pieces/cburnett/bR.svg',
    b: '/chess/pieces/cburnett/bB.svg',
    n: '/chess/pieces/cburnett/bN.svg',
  },
}

const SESSION_STORAGE_KEY = 'realtime-chess-session'
const CHAT_QUICK_MESSAGES = ['ایول', 'عجب حرکتی بود', 'دمت گرم', 'نوبت تو', 'آفرین', 'حرکت خوبی بود', 'خوبه!']
const CHAT_STICKER_CATEGORIES: Array<{ id: ChatStickerCategoryId; label: string; stickers: string[] }> = [
  {
    id: 'general',
    label: 'عمومی',
    stickers: ['👍', '🔥', '👏', '😀', '😍', '😂', '✨', '🎯'],
  },
  {
    id: 'reaction',
    label: 'واکنش سریع',
    stickers: ['😮', '😅', '😎', '🤯', '🤝', '🙏', '🙌', '💪'],
  },
  {
    id: 'chess',
    label: 'شطرنجی',
    stickers: ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'],
  },
]

function statusLabel(status: RoomStatus): string {
  switch (status) {
    case 'waiting':
      return 'در انتظار حریف'
    case 'active':
      return 'در حال بازی'
    case 'checkmate':
      return 'مات'
    case 'draw':
      return 'مساوی'
    case 'timeout':
      return 'پایان زمان'
    default:
      return status
  }
}

function gameResultText(snapshot: RoomSnapshot): string {
  if (snapshot.status === 'draw') {
    return snapshot.drawReason ? `تساوی — ${snapshot.drawReason}` : 'تساوی'
  }
  if (snapshot.status === 'timeout') {
    return `${snapshot.winner === 'white' ? 'سفید' : 'مشکی'} برنده شد (پایان زمان)`
  }
  if (snapshot.status === 'checkmate') {
    if (snapshot.drawReason?.includes('resigned')) {
      return snapshot.drawReason
    }
    return `${snapshot.winner === 'white' ? 'سفید' : 'مشکی'} با مات برنده شد`
  }
  return ''
}

function normalizeRoomId(roomId: string): string {
  return roomId.trim().toUpperCase()
}

function formatChatMessageTime(createdAt: number): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(createdAt)
  } catch {
    return ''
  }
}

function lastChatPreview(chatMessages: ChatMessage[]): string {
  if (chatMessages.length === 0) {
    return 'پیام آماده یا استیکر بفرست.'
  }
  const lastMessage = chatMessages[chatMessages.length - 1]
  const prefix = lastMessage.senderName ? `${lastMessage.senderName}: ` : ''
  return `${prefix}${lastMessage.value}`
}

export function ChessRoom() {
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null)
  const [session, setSession] = useState<RoomSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [moveTargets, setMoveTargets] = useState<Square[]>([])
  const [isMakingMove, setIsMakingMove] = useState(false)
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null)
  const [isRetryingMatch, setIsRetryingMatch] = useState(false)
  const [isSearchingGame, setIsSearchingGame] = useState(false)
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false)
  const [isSendingChat, setIsSendingChat] = useState(false)
  const [reviewMoveIndex, setReviewMoveIndex] = useState<number | null>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [drawOfferOpen, setDrawOfferOpen] = useState(false)
  const [gameOverModalOpen, setGameOverModalOpen] = useState(false)
  const [rematchOfferOpen, setRematchOfferOpen] = useState(false)
  const [rematchReceived, setRematchReceived] = useState<{ timeControlMs: number } | null>(null)
  const [rematchError, setRematchError] = useState<string | null>(null)
  const [activeComposerTab, setActiveComposerTab] = useState<ChatComposerTab>('text')
  const [activeStickerCategory, setActiveStickerCategory] = useState<ChatStickerCategoryId>('general')
  const [nowTick, setNowTick] = useState(Date.now())
  const eventSourceRef = useRef<EventSource | null>(null)
  const clockIntervalRef = useRef<number | null>(null)
  const chatListRef = useRef<HTMLDivElement | null>(null)
  const autoBootstrappingRef = useRef(false)
  const autoPlayerNameRef = useRef<string>('')
  const sessionRef = useRef<RoomSession | null>(null)

  const playerColor = session?.color ?? 'white'
  const isPlayerTurn = Boolean(snapshot && session?.color && snapshot.turn === session.color && snapshot.status === 'active')

  const reconstructedChess = useMemo(() => {
    if (!snapshot) return null
    return new Chess(snapshot.fen)
  }, [snapshot])

  const hydratedSnapshot = useMemo(() => {
    if (!snapshot || snapshot.status !== 'active' || snapshot.activeSince === null) return snapshot
    const elapsed = Math.max(0, nowTick - snapshot.activeSince)
    if (snapshot.turn === 'white') {
      return { ...snapshot, whiteTimeMs: Math.max(0, snapshot.whiteTimeMs - elapsed) }
    }
    return { ...snapshot, blackTimeMs: Math.max(0, snapshot.blackTimeMs - elapsed) }
  }, [snapshot, nowTick])
  const chatMessages = useMemo(() => hydratedSnapshot?.chatMessages ?? [], [hydratedSnapshot?.chatMessages])
  const selectedStickerCategory =
    CHAT_STICKER_CATEGORIES.find((category) => category.id === activeStickerCategory) ?? CHAT_STICKER_CATEGORIES[0]

  const moveReviewCount = hydratedSnapshot?.moves.length ?? 0
  const reviewBoardFen = useMemo(() => {
    if (!hydratedSnapshot) return ''
    if (reviewMoveIndex === null) return hydratedSnapshot.fen
    const chess = new Chess()
    const movesToApply = hydratedSnapshot.moves.slice(0, reviewMoveIndex)
    movesToApply.forEach((move) => {
      chess.move(move.san)
    })
    return chess.fen()
  }, [hydratedSnapshot, reviewMoveIndex])

  const canGoFirst = moveReviewCount > 0 && (reviewMoveIndex === null || reviewMoveIndex > 0)
  const canGoPrevious = moveReviewCount > 0 && (reviewMoveIndex === null || reviewMoveIndex > 0)
  const canGoNext = moveReviewCount > 0 && reviewMoveIndex !== null && reviewMoveIndex < moveReviewCount
  const canGoLast = moveReviewCount > 0 && reviewMoveIndex !== null

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false)
  }, [])

  const goToFirstMove = useCallback(() => {
    stopAutoPlay()
    setReviewMoveIndex(0)
  }, [stopAutoPlay])

  const goToPreviousMove = useCallback(() => {
    stopAutoPlay()
    setReviewMoveIndex((current) => {
      const start = current === null ? moveReviewCount : current
      return Math.max(0, start - 1)
    })
  }, [moveReviewCount, stopAutoPlay])

  const goToNextMove = useCallback(() => {
    stopAutoPlay()
    setReviewMoveIndex((current) => {
      if (current === null) return null
      const next = current + 1
      return next >= moveReviewCount ? null : next
    })
  }, [moveReviewCount, stopAutoPlay])

  const goToLastMove = useCallback(() => {
    stopAutoPlay()
    setReviewMoveIndex(null)
  }, [stopAutoPlay])

  const canAutoPlay = moveReviewCount > 0 && reviewMoveIndex !== null && reviewMoveIndex < moveReviewCount
  const handleToggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false)
      return
    }
    if (!canAutoPlay) return
    goToNextMove()
    setIsAutoPlaying(true)
  }, [canAutoPlay, goToNextMove, isAutoPlaying])

  useEffect(() => {
    if (!isAutoPlaying || reviewMoveIndex === null) return
    const timer = window.setTimeout(() => {
      setReviewMoveIndex((current) => {
        if (current === null) return null
        const next = current + 1
        if (next >= moveReviewCount) {
          setIsAutoPlaying(false)
          return null
        }
        return next
      })
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [isAutoPlaying, moveReviewCount, reviewMoveIndex])

  const clearSelection = useCallback(() => {
    console.info('[ChessRoom] clearSelection called', { stack: new Error().stack?.split('\n').slice(1, 4).join('\n') })
    setSelectedSquare(null)
    setMoveTargets([])
  }, [])

  const clearSelectionAndPromotion = useCallback(() => {
    setSelectedSquare(null)
    setMoveTargets([])
    setPendingPromotion(null)
  }, [])

    const submitMove = useCallback(
    async (move: { from: Square; to: Square; promotion?: PromotionPiece }) => {
      if (!snapshot || !session) return
      console.info('[ChessRoom] submitMove', {
        roomId: snapshot.roomId,
        from: move.from,
        to: move.to,
        promotion: move.promotion,
        sessionColor: session.color,
        snapshotTurn: snapshot.turn,
      })
      setIsMakingMove(true)
      try {
        const response = await makeMove({
          roomId: snapshot.roomId,
          token: session.token,
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        })
        console.info('[ChessRoom] move succeeded', {
          roomId: snapshot.roomId,
          move: `${move.from}-${move.to}`,
          promotion: move.promotion,
          nextTurn: response.snapshot.turn,
          nextStatus: response.snapshot.status,
        })
        setSnapshot(response.snapshot)
        setError(null)
        // Selection will be cleared by useEffect on FEN change
      } catch (cause) {
        console.error('[ChessRoom] move failed', cause)
        setError(cause instanceof Error ? cause.message : 'Move failed.')
      } finally {
        setIsMakingMove(false)
        // Note: no clearSelection here - let useEffect handle it
        setPendingPromotion(null)
      }
    },
    [session, snapshot]
  )

  const persistSession = useCallback((nextRoomId: string, nextSession: RoomSession) => {
    const payload: StoredSession = { roomId: nextRoomId, session: nextSession }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload))
  }, [])

  const clearPersistedSession = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }, [])

  const resolveSessionColor = useCallback(
    (nextSnapshot: RoomSnapshot, nextSession: RoomSession) => {
      const playerColor =
        nextSnapshot.players.white?.id === nextSession.playerId
          ? 'white'
          : nextSnapshot.players.black?.id === nextSession.playerId
          ? 'black'
          : nextSession.color

      console.debug('[ChessRoom] resolveSessionColor', {
        roomId: nextSnapshot.roomId,
        sessionPlayerId: nextSession.playerId,
        nextSessionColor: nextSession.color,
        resolvedColor: playerColor,
        players: nextSnapshot.players,
      })

      if (playerColor === nextSession.color) {
        return nextSession
      }

      const updatedSession = { ...nextSession, color: playerColor }
      persistSession(nextSnapshot.roomId, updatedSession)
      return updatedSession
    },
    [persistSession]
  )

  const resolveAutoPlayerName = useCallback((): string => {
    if (autoPlayerNameRef.current) {
      return autoPlayerNameRef.current
    }
    const storedProfileName = localStorage.getItem(PROFILE_USERNAME_STORAGE_KEY)?.trim() ?? ''
    if (storedProfileName.length >= 2) {
      autoPlayerNameRef.current = storedProfileName.slice(0, 32)
      return autoPlayerNameRef.current
    }
    autoPlayerNameRef.current = `Guest-${Math.floor(1000 + Math.random() * 9000)}`
    return autoPlayerNameRef.current
  }, [])

  const disconnectEvents = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (clockIntervalRef.current) {
      window.clearInterval(clockIntervalRef.current)
      clockIntervalRef.current = null
    }
  }, [])

  const connectEvents = useCallback(
    (roomId: string) => {
      disconnectEvents()
      const source = new EventSource(roomEventsUrl(roomId))

      const applySnapshot = (rawPayload: string) => {
        try {
          const nextSnapshot = JSON.parse(rawPayload) as RoomSnapshot
          console.debug('[ChessRoom] SSE event received', {
            roomId,
            status: nextSnapshot.status,
            turn: nextSnapshot.turn,
            lastMove: nextSnapshot.lastMove,
            players: nextSnapshot.players,
          })
          setSnapshot(nextSnapshot)
          // Show game over modal when game ends
          if (nextSnapshot.status !== 'active' && nextSnapshot.status !== 'waiting') {
            setGameOverModalOpen(true)
          }
          // Hide searching overlay when game becomes active
          if (nextSnapshot.status === 'active') {
            setIsSearchingGame(false)
          }
          // sync session color using ref instead of closure
          const currentSession = sessionRef.current
          if (currentSession) {
            const playerColor =
              nextSnapshot.players.white?.id === currentSession.playerId
                ? 'white'
                : nextSnapshot.players.black?.id === currentSession.playerId
                ? 'black'
                : currentSession.color
            if (playerColor !== currentSession.color) {
              const updatedSession = { ...currentSession, color: playerColor }
              const payload: StoredSession = { roomId: nextSnapshot.roomId, session: updatedSession }
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload))
              setSession(updatedSession)
            }
          }
        } catch {
          setError('Failed to parse live game event.')
        }
      }

      source.addEventListener('snapshot', (event) => {
        applySnapshot((event as MessageEvent<string>).data)
      })
      source.addEventListener('move', (event) => {
        applySnapshot((event as MessageEvent<string>).data)
      })
      source.addEventListener('player-joined', (event) => {
        applySnapshot((event as MessageEvent<string>).data)
      })
      source.addEventListener('game-over', (event) => {
        applySnapshot((event as MessageEvent<string>).data)
      })
      source.addEventListener('resigned', (event) => {
        applySnapshot((event as MessageEvent<string>).data)
      })
      source.addEventListener('chat', (event) => {
        applySnapshot((event as MessageEvent<string>).data)
      })
      source.addEventListener('rematch-offer', (event) => {
        const data = (event as MessageEvent<string>).data
        try {
          const nextSnapshot = JSON.parse(data) as RoomSnapshot
          if (nextSnapshot.rematchOffer && sessionRef.current && nextSnapshot.rematchOffer.fromPlayerId !== sessionRef.current.playerId) {
            setRematchReceived({
              timeControlMs: nextSnapshot.rematchOffer.timeControlMs,
            })
          }
          setSnapshot(nextSnapshot)
        } catch {
          // ignore
        }
      })
      source.addEventListener('rematch-accepted', (event) => {
        // Another room was created - we'll let the acceptor navigate there
        // The acceptor gets the session directly from the API response
        const data = (event as MessageEvent<string>).data
        try {
          const parsed = JSON.parse(data) as RoomSnapshot & { newRoomId?: string; newRoomSnapshot?: RoomSnapshot; newSession?: RoomSession }
          setSnapshot(parsed)
          setRematchReceived(null)
          // If we are the offerer (we have newRoomId and newSession), navigate to new room
          if (parsed.newRoomId && parsed.newRoomSnapshot && parsed.newSession && sessionRef.current) {
            const offererPlayerId = parsed.rematchOffer?.fromPlayerId ?? ''
            // Check if this offerer matches current session
            if (offererPlayerId === sessionRef.current.playerId) {
              const newSession: RoomSession = {
                token: parsed.newSession.token,
                playerId: parsed.newSession.playerId,
                color: parsed.newSession.color,
                name: parsed.newSession.name,
              }
              window.history.replaceState({}, '', `/online?room=${parsed.newRoomId}`)
              enterGame(parsed.newRoomSnapshot, newSession)
            }
          }
        } catch {
          // ignore
        }
      })
      source.onerror = () => {
        source.close()
        setTimeout(() => {
          connectEvents(roomId)
        }, 1200)
      }
      eventSourceRef.current = source

      clockIntervalRef.current = window.setInterval(() => {
        setNowTick(Date.now())
      }, 100)
    },
    [disconnectEvents]
  )

  // Keep sessionRef in sync with session state
  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const enterGame = useCallback(
    (nextSnapshot: RoomSnapshot, nextSession: RoomSession) => {
      const syncedSession = resolveSessionColor(nextSnapshot, nextSession)
      sessionRef.current = syncedSession  // update ref immediately
      setSnapshot(nextSnapshot)
      setSession(syncedSession)
      setError(null)
      setNowTick(Date.now())
      clearSelection()
      persistSession(nextSnapshot.roomId, syncedSession)
      connectEvents(nextSnapshot.roomId)
    },
    [clearSelection, connectEvents, persistSession, resolveSessionColor]
  )

  useEffect(() => {
    let cancelled = false

    const bootstrapGame = async () => {
      const roomIdFromQuery = normalizeRoomId(new URLSearchParams(window.location.search).get('room') ?? '')
      const raw = localStorage.getItem(SESSION_STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as StoredSession
          if (parsed?.roomId && parsed?.session?.token) {
            const response = await fetchRoom(parsed.roomId)
            if (cancelled) return
            enterGame(response.snapshot, parsed.session)
            return
          }
        } catch {
          clearPersistedSession()
        }
      }

      if (autoBootstrappingRef.current) {
        return
      }
      autoBootstrappingRef.current = true
      setIsSubmitting(true)
      setError(null)

      try {
        const autoName = resolveAutoPlayerName()
        const response = roomIdFromQuery
          ? await joinRoom({ roomId: roomIdFromQuery, name: autoName })
          : await createRoom({
              name: autoName,
              timeControlMinutes: 10,
              incrementSeconds: 2,
              quickMatch: true,
            })
        if (cancelled) return
        window.history.replaceState({}, '', `/online?room=${response.snapshot.roomId}`)
        enterGame(response.snapshot, response.session)
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Could not start online game.')
        }
      } finally {
        autoBootstrappingRef.current = false
        if (!cancelled) {
          setIsSubmitting(false)
        }
      }
    }

    void bootstrapGame()
    return () => {
      cancelled = true
    }
  }, [clearPersistedSession, enterGame, resolveAutoPlayerName])

  useEffect(() => {
    return () => disconnectEvents()
  }, [disconnectEvents])

  useEffect(() => {
    console.debug('[ChessRoom] useEffect triggered', {
      fen: snapshot?.fen,
      reason: 'fen change',
    })
    // Only clear selection when FEN actually changes (move was made)
    setSelectedSquare(null)
    setMoveTargets([])
    setPendingPromotion(null)
  }, [snapshot?.fen])

  useEffect(() => {
    if (!isChatPanelOpen) return
    const chatContainer = chatListRef.current
    if (!chatContainer) return
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: 'smooth',
    })
  }, [chatMessages, isChatPanelOpen])

  const handleSquareClick = async (square: Square) => {
    console.info('[ChessRoom] handleSquareClick', {
      square,
      selectedSquare,
      pendingPromotion,
      snapshotStatus: snapshot?.status,
      snapshotTurn: snapshot?.turn,
      sessionColor: session?.color,
      sessionId: session?.playerId,
    })
    if (!snapshot || !session || !reconstructedChess) {
      console.warn('[ChessRoom] click ignored: missing state', { square, snapshot, session })
      return
    }
    if (!session.color || snapshot.status !== 'active' || snapshot.turn !== session.color) {
      console.warn('[ChessRoom] click ignored: not active turn or no color', {
        square,
        snapshotStatus: snapshot.status,
        snapshotTurn: snapshot.turn,
        sessionColor: session.color,
      })
      return
    }
    if (pendingPromotion) {
      console.warn('[ChessRoom] click ignored: waiting for promotion', { square, pendingPromotion })
      return
    }

    if (!selectedSquare) {
      const piece = reconstructedChess.get(square)
      if (!piece || piece.color !== (session.color === 'white' ? 'w' : 'b')) {
        console.warn('[ChessRoom] piece selection blocked', {
          square,
          piece,
          expectedColor: session.color === 'white' ? 'w' : 'b',
        })
        return
      }
      const legalTargets = reconstructedChess.moves({ square, verbose: true }).map((move) => move.to as Square)
      console.info('[ChessRoom] piece selected', { square, piece, legalTargets })
      setSelectedSquare(square)
      setMoveTargets(legalTargets)
      return
    }

    if (square === selectedSquare) {
      console.info('[ChessRoom] same square clicked, deselecting', { square })
      setSelectedSquare(null)
      setMoveTargets([])
      return
    }

    if (!moveTargets.includes(square)) {
      const piece = reconstructedChess.get(square)
      console.warn('[ChessRoom] destination not in legal moves', {
        square,
        selectedSquare,
        moveTargets,
        piece: piece ? `${piece.color}${piece.type}` : null,
      })
      if (piece && piece.color === (session.color === 'white' ? 'w' : 'b')) {
        console.info('[ChessRoom] selecting different piece', { square })
        setSelectedSquare(square)
        const legalTargets = reconstructedChess
          .moves({ square, verbose: true })
          .map((move) => move.to as Square)
        setMoveTargets(legalTargets)
      } else {
        console.info('[ChessRoom] clearing selection - invalid target', { square, piece })
        setSelectedSquare(null)
        setMoveTargets([])
      }
      return
    }

    console.info('[ChessRoom] valid move destination', { square, selectedSquare, moveTargets })
    const matchingMoves = reconstructedChess
      .moves({ square: selectedSquare, verbose: true })
      .filter((move) => move.to === square)
    const promotionOptions = matchingMoves
      .map((move) => move.promotion as PromotionPiece | undefined)
      .filter((promotion): promotion is PromotionPiece => Boolean(promotion))
    const uniquePromotionOptions = Array.from(new Set(promotionOptions))
    if (uniquePromotionOptions.length > 0) {
      setPendingPromotion({
        from: selectedSquare,
        to: square,
        options: uniquePromotionOptions,
      })
      return
    }
    console.info('[ChessRoom] executing move', {
      from: selectedSquare,
      to: square,
      needsPromotion: uniquePromotionOptions.length === 0,
    })
    await submitMove({
      from: selectedSquare,
      to: square,
      promotion: uniquePromotionOptions[0],
    })
  }

  const handlePromotionChoice = async (promotion: PromotionPiece) => {
    if (!pendingPromotion) return
    await submitMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion,
    })
  }

  const handleResign = async () => {
    if (!snapshot || !session) return
    if (!session.color) return
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await resign({
        roomId: snapshot.roomId,
        token: session.token,
      })
      setSnapshot(response.snapshot)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not resign.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetryMatch = async () => {
    if (!snapshot || !session || session.color !== 'white' || snapshot.status !== 'waiting') {
      return
    }
    setIsRetryingMatch(true)
    setError(null)
    try {
      const response = await createRoom({
        name: session.name,
        timeControlMinutes: Math.max(1, Math.round(snapshot.timeControlMs / 60_000)),
        incrementSeconds: Math.max(0, Math.round(snapshot.incrementMs / 1_000)),
        quickMatch: true,
        excludeRoomId: snapshot.roomId,
      })
      window.history.replaceState({}, '', `/online?room=${response.snapshot.roomId}`)
      enterGame(response.snapshot, response.session)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not retry matchmaking.')
    } finally {
      setIsRetryingMatch(false)
    }
  }

  const handleShareRoom = async () => {
    if (!hydratedSnapshot) return
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: 'Chess room',
          text: 'برای بازی آنلاین شطرنج با من وارد این لینک شو.',
          url: roomShareUrl,
        })
        return
      }
      await navigator.clipboard.writeText(roomShareUrl)
    } catch (cause) {
      const shareError = cause as { name?: string } | undefined
      if (shareError?.name === 'AbortError') {
        return
      }
      setError('Could not share room link.')
    }
  }

  const handleSendChat = async (kind: 'text' | 'sticker', value: string) => {
    if (!snapshot || !session || !session.color || !value.trim()) {
      return
    }
    setIsSendingChat(true)
    try {
      const response = await sendChatMessage({
        roomId: snapshot.roomId,
        token: session.token,
        kind,
        value: value.trim(),
      })
      setSnapshot(response.snapshot)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send chat message.')
    } finally {
      setIsSendingChat(false)
    }
  }

  const handleDrawOffer = async () => {
    if (!snapshot || !session) return
    try {
      const response = await offerDraw({ roomId: snapshot.roomId, token: session.token })
      setSnapshot(response.snapshot)
      setDrawOfferOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not offer draw.')
    }
  }

  const handleNewGame = async () => {
    if (!session || !snapshot) return
    setGameOverModalOpen(false)
    setIsSearchingGame(true)
    setError(null)
    try {
      const response = await createRoom({
        name: session.name,
        timeControlMinutes: Math.max(1, Math.round(snapshot.timeControlMs / 60_000)),
        incrementSeconds: Math.max(0, Math.round(snapshot.incrementMs / 1_000)),
        quickMatch: true,
      })
      window.history.replaceState({}, '', `/online?room=${response.snapshot.roomId}`)
      enterGame(response.snapshot, response.session)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not start new game.')
      setIsSearchingGame(false)
    }
  }

  const handleCancelSearch = () => {
    setIsSearchingGame(false)
    disconnectEvents()
    clearPersistedSession()
  }

  const handleRematchOffer = async () => {
    if (!snapshot || !session) return
    setRematchError(null)
    try {
      const response = await offerRematch({ roomId: snapshot.roomId, token: session.token })
      setSnapshot(response.snapshot)
      setRematchOfferOpen(true)
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : 'Could not offer rematch.'
      setRematchError(msg)
    }
  }

  const handleAcceptRematch = async () => {
    if (!snapshot || !session) return
    try {
      const response = await acceptRematch({ roomId: snapshot.roomId, token: session.token })
      window.history.replaceState({}, '', `/online?room=${response.snapshot.roomId}`)
      enterGame(response.snapshot, response.session)
      setRematchReceived(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not accept rematch.')
    }
  }

  const handleDeclineRematch = () => {
    setRematchReceived(null)
  }

  const isWaitingForOpponent = hydratedSnapshot?.status === 'waiting' && session?.color === 'white'
  const isBoardDisabled = !hydratedSnapshot || !session || hydratedSnapshot.status !== 'active'
  
  const gameResultLabel = useMemo<string | null>(() => {
    if (!snapshot || !session) return null
    const s = snapshot
    if (s.status === 'active' || s.status === 'waiting') return null
    if (s.status === 'draw') return '0'
    if (s.winner === session.color) return '+3'
    if (s.winner && s.winner !== session.color) return '-3'
    return null
  }, [snapshot, session])

  const isGameOver = hydratedSnapshot && hydratedSnapshot.status !== 'active' && hydratedSnapshot.status !== 'waiting'
  const boardDisabledReason = (() => {
    if (!hydratedSnapshot) return 'بازی در حال بارگذاری است.'
    if (!session) return 'فعلاً امکان حرکت وجود ندارد.'
    if (hydratedSnapshot.status !== 'active') {
      if (hydratedSnapshot.status === 'waiting') {
        return session.color === 'white'
          ? 'در انتظار حریف. وقتی حریف وارد شد، می‌توانید بازی را ادامه دهید.'
          : 'در انتظار حریف. بازی هنوز شروع نشده است.'
      }
      return null
    }
    if (hydratedSnapshot.turn !== session.color) {
      return null
    }
    return null
  })()

  const leaveGame = () => {
    disconnectEvents()
    clearPersistedSession()
    setSession(null)
    setSnapshot(null)
    window.location.assign('/')
  }

  if (!hydratedSnapshot || !session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 text-slate-100">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-center backdrop-blur">
            <h1 className="text-xl font-black text-slate-100">در حال آماده‌سازی بازی آنلاین...</h1>
            <p className="mt-2 text-sm text-slate-300">
              {isSubmitting ? 'در حال ساخت یا ورود خودکار به اتاق. لطفاً کمی صبر کنید.' : 'در حال تلاش مجدد برای اتصال.'}
            </p>
            {error ? <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-200">{error}</p> : null}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
            >
              تلاش مجدد
            </button>
          </section>
        </div>
      </main>
    )
  }

  const roomShareUrl = `${window.location.origin}/online?room=${hydratedSnapshot.roomId}`

  return (
    <main className="min-h-screen bg-[#1f1d1b] px-2 py-5 text-slate-100 sm:px-5 sm:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        {error ? <p className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-200">{error}</p> : null}

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-[min(96vw,680px)]">
              {/* Opponent info bar above board */}
              <div className="flex items-center justify-between rounded-t-md border border-[#3a3734] bg-[#2a2826] px-4 py-2">
                <div className="flex items-center gap-2 text-sm text-[#cbc7c2]">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#9f9a93]" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-100">
                      {playerColor === 'white'
                        ? hydratedSnapshot.players.black?.name ?? 'Waiting...'
                        : hydratedSnapshot.players.white?.name ?? 'Waiting...'}
                    </span>
                    {(() => {
                      const s = hydratedSnapshot
                      if (s.status === 'active' || s.status === 'waiting') return null
                      const opponentColor = playerColor === 'white' ? 'black' : 'white'
                      if (s.status === 'draw') return <span className="text-[10px] text-yellow-400">مساوی</span>
                      if (s.winner === opponentColor) return <span className="text-[10px] font-bold text-green-400">+3</span>
                      if (s.winner && s.winner !== opponentColor) return <span className="text-[10px] font-bold text-red-400">-3</span>
                      return null
                    })()}
                  </div>
                </div>
                <span className="rounded-md bg-[#3a3937] px-3 py-1 text-lg font-bold tabular-nums text-[#f0ede6]">
                  {playerColor === 'white'
                    ? formatTimer(hydratedSnapshot.blackTimeMs)
                    : formatTimer(hydratedSnapshot.whiteTimeMs)}
                </span>
              </div>
              <ChessBoard
                fen={reviewBoardFen}
                lastMove={reviewMoveIndex === null ? hydratedSnapshot.lastMove : null}
                perspective={(session.color ?? 'white') as PlayerColor}
                selectedSquare={selectedSquare}
                highlightedMoves={moveTargets}
                onSquareClick={handleSquareClick}
                disabled={isBoardDisabled}
              />
              {/* Current user info bar below board */}
              <div className="flex items-center justify-between rounded-b-md border border-[#3a3734] bg-[#2a2826] px-4 py-2">
                <div className="flex items-center gap-2 text-sm text-[#cbc7c2]">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#9f9a93]" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-100">
                      {playerColor === 'white'
                        ? hydratedSnapshot.players.white?.name ?? 'You'
                        : hydratedSnapshot.players.black?.name ?? 'You'}
                    </span>
                    {(() => {
                      const s = hydratedSnapshot
                      if (s.status === 'active' || s.status === 'waiting') return null
                      if (s.status === 'draw') return <span className="text-[10px] text-yellow-400">مساوی</span>
                      if (s.winner === session.color) return <span className="text-[10px] font-bold text-green-400">+3</span>
                      if (s.winner && s.winner !== session.color) return <span className="text-[10px] font-bold text-red-400">-3</span>
                      return null
                    })()}
                  </div>
                </div>
                <span className="rounded-md bg-[#171716] px-3 py-1 text-lg font-bold tabular-nums text-[#f0ede6]">
                  {playerColor === 'white'
                    ? formatTimer(hydratedSnapshot.whiteTimeMs)
                    : formatTimer(hydratedSnapshot.blackTimeMs)}
                </span>
              </div>
              {boardDisabledReason ? (
                <p className="mt-2 text-sm text-[#d1d0cc]">{boardDisabledReason}</p>
              ) : null}
              {isWaitingForOpponent ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-black/55 px-4 text-center text-sm font-semibold text-slate-100">
                  هنوز حریفی پیدا نشده است. وقتی حریف وارد شد، سفید می‌تواند حرکت کند.
                </div>
              ) : null}
            </div>
            <p className="text-sm text-[#bfb9b1]">
              {session.color
                ? isWaitingForOpponent
                  ? 'در انتظار حریف...'
                  : isPlayerTurn
                    ? isMakingMove
                      ? 'در حال ارسال حرکت...'
                      : pendingPromotion
                        ? 'مهره ارتقا را انتخاب کن'
                        : null
      : null
                : 'حالت تماشاچی'}
            </p>
            {isWaitingForOpponent ? (
              <section
                className="w-full max-w-[min(96vw,680px)] rounded-md border border-[#3a3734] bg-[#262421] p-3"
                data-testid="waiting-actions-panel"
              >
                <p className="mb-3 text-sm text-[#dcd6ce]" data-testid="waiting-actions-text">
                  هنوز حریفی پیدا نشده. می‌تونی دوباره تلاش کنی یا لینک اتاقت رو برای دوستت بفرستی.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleRetryMatch()}
                    disabled={isRetryingMatch}
                    data-testid="waiting-retry-btn"
                    className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRetryingMatch ? 'در حال تلاش...' : 'تلاش مجدد'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleShareRoom()}
                    data-testid="waiting-share-btn"
                    className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
                  >
                    اشتراک‌گذاری لینک
                  </button>
                </div>
              </section>
            ) : null}
            {pendingPromotion ? (
              <section className="w-full max-w-[min(96vw,680px)] rounded-md border border-[#3a3734] bg-[#262421] p-3">
                <p className="mb-3 text-sm font-semibold text-[#f3efe8]" data-testid="promotion-picker-title">
                  مهره ارتقا را انتخاب کن:
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {pendingPromotion.options.map((promotion) => {
                    return (
                      <button
                        key={promotion}
                        type="button"
                        onClick={() => void handlePromotionChoice(promotion)}
                        data-testid={`promotion-option-${promotion}`}
                        className="flex items-center justify-center rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 transition hover:bg-cyan-500/20"
                      >
                        <img
                          src={PROMOTION_PIECE_IMAGE[session.color ?? 'white'][promotion]}
                          alt=""
                          aria-hidden="true"
                          className="h-11 w-11"
                        />
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setPendingPromotion(null)}
                  className="mt-3 rounded-md border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  انصراف
                </button>
              </section>
            ) : null}
          </div>

          <aside className="flex flex-col gap-4">
            <section className="overflow-hidden rounded-xl border border-[#3a3734] bg-gradient-to-b from-[#2c2926] to-[#24211e] shadow-[0_18px_45px_-28px_rgba(15,23,42,0.85)]">
              <div className="border-b border-[#3a3734] px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChatPanelOpen((prev) => !prev)}
                      data-testid="chat-toggle-btn"
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-2 text-right text-xs text-cyan-100 transition hover:bg-cyan-500/20"
                    >
                      <span className="text-base leading-none">
                        <img src="/icons/chat.png" alt="chat" className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-semibold sm:text-xs">چت بازی</span>
                        <span className="block truncate text-[10px] text-cyan-50/75 sm:text-[11px]">{lastChatPreview(chatMessages)}</span>
                      </span>
                    </button>
                    <div className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-800/70 p-0.5">
                      <button
                        type="button"
                        onClick={goToFirstMove}
                        disabled={!canGoFirst}
                        title="حرکت اول"
                        className="rounded-md px-2 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {'|<'}
                      </button>
                      <button
                        type="button"
                        onClick={goToPreviousMove}
                        disabled={!canGoPrevious}
                        title="حرکت قبلی"
                        className="rounded-md px-2 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {'<'}
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleAutoPlay}
                        disabled={!canAutoPlay}
                        title={isAutoPlaying ? 'توقف پخش خودکار' : 'پخش خودکار تا آخر'}
                        className={['rounded-md px-2 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50', isAutoPlaying ? 'bg-cyan-500/20' : 'bg-slate-700/30'].join(' ')}
                      >
                        {'▶'}
                      </button>
                      <button
                        type="button"
                        onClick={goToNextMove}
                        disabled={!canGoNext}
                        title="حرکت بعدی"
                        className="rounded-md px-2 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {'>'}
                      </button>
                      <button
                        type="button"
                        onClick={goToLastMove}
                        disabled={!canGoLast}
                        title="حرکت آخر"
                        className="rounded-md px-2 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {'>|'}
                      </button>
                    </div>
                  </div>
                  {hydratedSnapshot.status === 'active' || hydratedSnapshot.status === 'waiting' ? (
                    <>
                      <button
                        type="button"
                        disabled={!session.color || hydratedSnapshot.status !== 'active' || isSendingChat}
                        onClick={() => setDrawOfferOpen(true)}
                        data-testid="chat-draw-btn"
                        className="rounded-lg border border-slate-500/45 bg-slate-500/10 px-2.5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        title="درخواست مساوی"
                      >
                        <img src="/icons/mosavi.png" alt="draw" className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        disabled={!session.color || hydratedSnapshot.status !== 'active' || isSubmitting}
                        onClick={handleResign}
                        data-testid="chat-resign-btn"
                        className="rounded-lg border border-red-500/45 bg-red-500/10 px-2.5 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        title="انصراف"
                      >
                        <img src="/icons/enseraf.png" alt="resign" className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleRematchOffer()}
                        disabled={isSubmitting || rematchOfferOpen}
                        className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        title="بازی مجدد"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <polyline points="1 4 1 10 7 10" />
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleNewGame()}
                        className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                        title="بازی جدید"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
              {isChatPanelOpen ? (
                <div className="space-y-3 p-3" data-testid="chat-panel">
                  <div
                    ref={chatListRef}
                    className="h-44 space-y-2 overflow-y-auto rounded-xl border border-[#47413a] bg-[#1e1b18] p-2.5 sm:h-52"
                    data-testid="chat-message-list"
                  >
                    {chatMessages.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-center text-xs text-[#9f9a93]">هنوز پیامی ارسال نشده.</p>
                      </div>
                    ) : (
                      chatMessages.map((message) => {
                        const isMine = session.color === message.senderColor
                        return (
                          <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`} data-testid={`chat-message-${message.id}`}>
                            <div
                              className={[
                                'max-w-[84%] rounded-2xl px-3 py-2 shadow-sm',
                                isMine ? 'rounded-br-md bg-cyan-500/16 text-cyan-50' : 'rounded-bl-md bg-slate-700/35 text-slate-100',
                              ].join(' ')}
                            >
                              {!isMine ? <p className="mb-0.5 text-[10px] font-semibold text-slate-300">{message.senderName}</p> : null}
                              <p className={message.type === 'sticker' ? 'text-xl leading-6' : 'text-xs leading-5'}>{message.value}</p>
                              <p className="mt-1 text-[10px] text-slate-300/70">{formatChatMessageTime(message.createdAt)}</p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  <div className="rounded-lg bg-[#1f1d1b] p-1">
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveComposerTab('text')}
                        data-testid="chat-composer-tab-text"
                        className={[
                          'rounded-md px-2.5 py-1.5 text-xs font-semibold transition',
                          activeComposerTab === 'text'
                            ? 'bg-cyan-500/25 text-cyan-100'
                            : 'text-[#bfb9b1] hover:bg-slate-700/35 hover:text-slate-100',
                        ].join(' ')}
                      >
                        پیام سریع
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveComposerTab('sticker')}
                        data-testid="chat-composer-tab-sticker"
                        className={[
                          'rounded-md px-2.5 py-1.5 text-xs font-semibold transition',
                          activeComposerTab === 'sticker'
                            ? 'bg-cyan-500/25 text-cyan-100'
                            : 'text-[#bfb9b1] hover:bg-slate-700/35 hover:text-slate-100',
                        ].join(' ')}
                      >
                        استیکر
                      </button>
                    </div>
                  </div>

                  {activeComposerTab === 'text' ? (
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                      {CHAT_QUICK_MESSAGES.map((message) => (
                        <button
                          key={message}
                          type="button"
                          onClick={() => void handleSendChat('text', message)}
                          disabled={isSendingChat || !session.color}
                          data-testid={`chat-quick-${message}`}
                          className="rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-2 py-1.5 text-[11px] font-medium text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {message}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        {CHAT_STICKER_CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => setActiveStickerCategory(category.id)}
                            data-testid={`chat-sticker-category-${category.id}`}
                            className={[
                              'shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold transition',
                              activeStickerCategory === category.id
                                ? 'bg-emerald-500/25 text-emerald-100'
                                : 'bg-[#302c28] text-[#c9c2ba] hover:bg-[#393430] hover:text-slate-100',
                            ].join(' ')}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
                        {selectedStickerCategory.stickers.map((sticker) => (
                          <button
                            key={sticker}
                            type="button"
                            onClick={() => void handleSendChat('sticker', sticker)}
                            disabled={isSendingChat || !session.color}
                            data-testid={`chat-sticker-${encodeURIComponent(sticker)}`}
                            className="rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-1 py-1.5 text-lg text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {sticker}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isSendingChat ? <p className="text-[11px] text-cyan-100/80">در حال ارسال...</p> : null}
                </div>
              ) : null}
            </section>
            <MoveList moves={hydratedSnapshot.moves} />
            {drawOfferOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                <div className="w-full max-w-sm rounded-xl border border-[#3a3734] bg-[#262421] p-6 shadow-2xl">
                  <p className="mb-4 text-center text-sm font-semibold text-[#f3efe8]">
                    درخواست مساوی را تایید میکنید؟
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => void handleDrawOffer()}
                      className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
                    >
                      بله، مساوی
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawOfferOpen(false)}
                      className="rounded-lg border border-[#57524c] bg-[#34312e] px-5 py-2 text-sm font-semibold text-[#e6e2da] transition hover:bg-[#3f3b38]"
                    >
                      لغو
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        </section>
      </div>

      {/* Searching for opponent overlay */}
      {isSearchingGame ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#3a3734] bg-[#262421] p-8 shadow-2xl text-center">
            <div className="mb-4">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-400/30 border-t-emerald-400" />
            </div>
            <p className="mb-1 text-base font-semibold text-[#f3efe8]">در حال پیدا کردن حریف...</p>
            <p className="mb-6 text-xs text-[#9f9a93]">منتظر بمانید تا حریفی با آمادگی شما پیدا شود.</p>
            <button
              type="button"
              onClick={handleCancelSearch}
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
            >
              لغو جستجو
            </button>
          </div>
        </div>
      ) : null}

      {/* Game Over Modal */}
      {gameOverModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-40 rounded-xl border border-[#3a3734] bg-[#262421] p-5 shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setGameOverModalOpen(false)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[#57524c] bg-[#34312e] text-sm font-bold text-[#e6e2da] transition hover:bg-[#3f3b38]"
            >
              ✕
            </button>
            {/* Result */}
            <p className="text-center text-lg font-black">
              {(() => {
                const s = hydratedSnapshot
                if (!s || !session) return null
                if (s.status === 'draw') return <span className="text-[#f3efe8]">0</span>
                if (s.winner === session.color) return <span className="text-green-400">+3</span>
                if (s.winner && s.winner !== session.color) return <span className="text-red-400">-3</span>
                return null
              })()}
            </p>
          </div>
        </div>
      ) : null}

      {/* Rematch request received modal */}
      {rematchReceived ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#3a3734] bg-[#262421] p-6 shadow-2xl">
            <p className="mb-4 text-center text-sm font-semibold text-[#f3efe8]">
              حریف درخواست بازی مجدد را دارد. می‌پذیرید؟
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void handleAcceptRematch()}
                className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
              >
                بله
              </button>
              <button
                type="button"
                onClick={handleDeclineRematch}
                className="rounded-lg border border-[#57524c] bg-[#34312e] px-5 py-2 text-sm font-semibold text-[#e6e2da] transition hover:bg-[#3f3b38]"
              >
                خیر
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
