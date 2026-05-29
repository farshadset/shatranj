'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createRoom, joinRoom, roomEventsUrl, rejoinRoom } from '@/lib/chess/client'
import type { RoomSession, RoomSnapshot } from '@/lib/chess/types'
import { PROFILE_USERNAME_STORAGE_KEY } from '@/lib/profile/constants'
import { Toast } from '@/components/ui/toast'

type FooterTab = 'home' | 'profile' | 'puzzle' | 'news'
type ProfileMode = 'login' | 'register'
type FriendRelation = 'none' | 'friend' | 'incoming' | 'outgoing'
type ProfilePanel = 'friends' | 'notifications'
type HomePanel = 'menu' | 'friend-play'
type NewsSection = 'news' | 'video' | 'education'
type NotificationType =
  | 'friend_request_received'
  | 'friend_request_accepted'
  | 'friend_request_rejected'
  | 'friend_request_canceled'
  | 'friend_removed'
  | 'game_invite_received'
  | 'game_invite_accepted'
  | 'game_invite_rejected'

interface FriendPresenceItem {
  username: string
  online: boolean
}

interface NotificationItem {
  id: string
  type: NotificationType
  actorUsername: string
  message: string
  createdAt: number
  read: boolean
}

interface GameInviteItem {
  id: string
  fromUsername: string
  roomId: string
  timeControlMinutes: number
  incrementSeconds: number
  createdAt: number
}

interface FooterItem {
  id: FooterTab
  icon: string
  rotate?: string
}

interface OnlineTimeControlOption {
  id: string
  label: string
  timeControlMinutes: number
  incrementSeconds: number
  category: 'bullet' | 'blitz' | 'rapid'
  displayTime: string
  displayIncrement: string
}

interface ApiResponse {
  status?: string
  persistence?: string
  user?: { username: string }
  friends?: string[]
  friendPresence?: FriendPresenceItem[]
  incomingRequests?: string[]
  outgoingRequests?: string[]
  incomingCount?: number
  incomingGameInvites?: GameInviteItem[]
  users?: Array<{ username: string; relation: FriendRelation }>
  notifications?: NotificationItem[]
  unreadCount?: number
  invite?: { toUsername: string; inviteId: string }
  response?: { inviteId: string; action: 'accept' | 'reject' }
  error?: { code?: string; message?: string }
}

function getOrCreateChessClientId(): string {
  const storageKey = 'realtime-chess-client-id'
  const existing = localStorage.getItem(storageKey)?.trim() ?? ''
  if (existing) {
    return existing
  }
  const generated = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  localStorage.setItem(storageKey, generated)
  return generated
}

interface GameInviteApiResponse {
  invite?: { toUsername: string; inviteId: string }
  response?: { inviteId: string; action: 'accept' | 'reject' }
  error?: { code?: string; message?: string }
}

const FOOTER_ITEMS: FooterItem[] = [
  { id: 'home', icon: '/icons/footer/home.png' },
  { id: 'profile', icon: '/icons/footer/profile.png' },
  { id: 'puzzle', icon: '/icons/footer/pazel.png', rotate: 'rotate-90' },
  { id: 'news', icon: '/icons/footer/news.png' },
]

const CHESS_SESSION_STORAGE_KEY = 'realtime-chess-session'
const ONLINE_TIME_CONTROL_STORAGE_KEY = 'realtime-chess-online-time-control'
const ONLINE_TIME_CONTROL_DEFAULT_ID = '3-2'
const ONLINE_TIME_CONTROL_OPTIONS: OnlineTimeControlOption[] = [
  // Bullet
  { id: '1-0', label: '1 | 0', timeControlMinutes: 1, incrementSeconds: 0, category: 'bullet', displayTime: '1', displayIncrement: '0' },
  { id: '1-1', label: '1 | 1', timeControlMinutes: 1, incrementSeconds: 1, category: 'bullet', displayTime: '1', displayIncrement: '1' },
  { id: '2-1', label: '2 | 1', timeControlMinutes: 2, incrementSeconds: 1, category: 'bullet', displayTime: '2', displayIncrement: '1' },
  // Blitz
  { id: '3-0', label: '3 | 0', timeControlMinutes: 3, incrementSeconds: 0, category: 'blitz', displayTime: '3', displayIncrement: '0' },
  { id: '3-2', label: '3 | 2', timeControlMinutes: 3, incrementSeconds: 2, category: 'blitz', displayTime: '3', displayIncrement: '2' },
  { id: '5-0', label: '5 | 0', timeControlMinutes: 5, incrementSeconds: 0, category: 'blitz', displayTime: '5', displayIncrement: '0' },
  // Rapid
  { id: '10-0', label: '10 | 0', timeControlMinutes: 10, incrementSeconds: 0, category: 'rapid', displayTime: '10', displayIncrement: '0' },
  { id: '10-2', label: '10 | 2', timeControlMinutes: 10, incrementSeconds: 2, category: 'rapid', displayTime: '10', displayIncrement: '2' },
  { id: '15-10', label: '15 | 10', timeControlMinutes: 15, incrementSeconds: 10, category: 'rapid', displayTime: '15', displayIncrement: '10' },
  { id: '30-0', label: '30 | 0', timeControlMinutes: 30, incrementSeconds: 0, category: 'rapid', displayTime: '30', displayIncrement: '0' },
]
const FRIEND_INVITE_TIME_OPTIONS = ONLINE_TIME_CONTROL_OPTIONS

async function parseJsonSafe(response: Response): Promise<ApiResponse> {
  try {
    return (await response.json()) as ApiResponse
  } catch {
    return {}
  }
}

function formatNotificationTime(timestamp: number): string {
  const now = Date.now()
  const diffMs = Math.max(0, now - timestamp)
  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) {
    return 'همین الان'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} دقیقه پیش`
  }
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} ساعت پیش`
  }
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return `${diffDays} روز پیش`
  }
  return new Date(timestamp).toLocaleDateString('fa-IR')
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-2.79Z"
        fill="currentColor"
      />
    </svg>
  )
}

function KebabIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" fill="currentColor" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" fill="currentColor" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="m19 6.4-1.4-1.4L12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z" fill="currentColor" />
    </svg>
  )
}

function HomeContent({
  onStartOnline,
  onOpenFriendPlay,
  onStartBotGame,
  onStartPersonalGame,
  onOpenInviteModal,
  onRespondGameInvite,
  onBackToMenu,
  onToggleTimeControlOptions,
  onSelectTimeControl,
  homePanel,
  friendPresence,
  incomingGameInvites,
  isInviteActionLoading,
  selectedTimeControlLabel,
  isTimeControlOptionsOpen,
  timeControlOptions,
  isStartingOnline,
  isGuestMode,
  selectedTimeControlId,
}: {
  onStartOnline: () => void
  onOpenFriendPlay: () => void
  onStartBotGame: () => void
  onStartPersonalGame: () => void
  onOpenInviteModal: (targetUsername: string) => void
  onRespondGameInvite: (invite: GameInviteItem, action: 'accept' | 'reject') => void
  onBackToMenu: () => void
  onToggleTimeControlOptions: () => void
  onSelectTimeControl: (optionId: string) => void
  homePanel: HomePanel
  friendPresence: FriendPresenceItem[]
  incomingGameInvites: GameInviteItem[]
  isInviteActionLoading: boolean
  selectedTimeControlLabel: string
  isTimeControlOptionsOpen: boolean
  timeControlOptions: OnlineTimeControlOption[]
  isStartingOnline: boolean
  isGuestMode: boolean
  selectedTimeControlId: string
}) {
  if (homePanel === 'friend-play') {
    return (
      <section
        className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg"
        data-testid="friend-play-panel"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-100">انتخاب دوست برای بازی</h2>
          <button
            type="button"
            onClick={onBackToMenu}
            data-testid="friend-play-back-btn"
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            بازگشت
          </button>
        </div>
        <p className="text-sm text-slate-300">وضعیت آنلاین دوستانت را اینجا می‌بینی.</p>
        <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-950/50 p-3">
          <p className="text-xs text-slate-300">درخواست‌های بازی دریافتی</p>
          {incomingGameInvites.length === 0 ? (
            <p className="text-xs text-slate-500" data-testid="friend-play-invite-empty">
              فعلاً درخواست بازی جدیدی نداری.
            </p>
          ) : (
            <div className="space-y-2">
              {incomingGameInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="space-y-2 rounded-md border border-slate-700 bg-slate-900/75 px-2 py-2"
                  data-testid={`friend-play-invite-row-${invite.id}`}
                >
                  <p className="text-xs text-slate-100">
                    <span className="font-semibold text-cyan-200">{invite.fromUsername}</span>
                    {' '}شما را به بازی {' '}
                    <span className="font-semibold text-cyan-100">
                      {invite.timeControlMinutes}+{invite.incrementSeconds}
                    </span>
                    {' '}دعوت کرده است.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onRespondGameInvite(invite, 'accept')}
                      disabled={isInviteActionLoading}
                      data-testid={`friend-play-invite-accept-${invite.id}`}
                      className="rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      قبول
                    </button>
                    <button
                      type="button"
                      onClick={() => onRespondGameInvite(invite, 'reject')}
                      disabled={isInviteActionLoading}
                      data-testid={`friend-play-invite-reject-${invite.id}`}
                      className="rounded-md bg-rose-500 px-2.5 py-1 text-xs font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      رد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {friendPresence.length === 0 ? (
          <p className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-slate-400" data-testid="friend-play-empty">
            هنوز دوستی نداری. اول از تب پروفایل دوست اضافه کن.
          </p>
        ) : (
          <div className="space-y-2" data-testid="friend-play-list">
            {friendPresence.map((friend) => (
              <div
                key={friend.username}
                data-testid={`friend-play-row-${friend.username}`}
                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/65 px-3 py-2"
              >
                <p className="text-sm font-semibold text-slate-100">{friend.username}</p>
                <div className="inline-flex items-center gap-2 text-xs">
                  <span
                    data-testid={`friend-play-status-dot-${friend.username}`}
                    className={[
                      'h-2.5 w-2.5 rounded-full',
                      friend.online ? 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]' : 'bg-slate-500',
                    ].join(' ')}
                  />
                  <span className={friend.online ? 'text-emerald-300' : 'text-slate-400'}>
                    {friend.online ? 'آنلاین' : 'آفلاین'}
                  </span>
                  {friend.online ? (
                    <button
                      type="button"
                      onClick={() => onOpenInviteModal(friend.username)}
                      data-testid={`friend-play-start-${friend.username}`}
                      className="rounded-md bg-cyan-400 px-2.5 py-1 text-[11px] font-bold text-slate-950 transition hover:bg-cyan-300"
                    >
                      بازی
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
      <div className="flex justify-center py-2">
        <img src="/icons/logo/logo.png" alt="Logo" className="h-28 w-auto object-contain" />
      </div>
      {isGuestMode ? (
        <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-3 text-center text-sm text-cyan-100">
          شما به عنوان مهمان وارد شده‌اید. فقط بازی آنلاین قابل اجراست.
        </div>
      ) : null}
      <div className="space-y-3">
        <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-950/55 p-3">
          
          {/* Category: Bullet */}
          <div>
            <p className="mb-2 flex items-center gap-2 text-lg font-bold text-cyan-300/80" dir="ltr">
              <img src="/icons/time-controls/bullet.png" alt="Bullet" className="w-6 h-6" />
              <span>Bullet</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {timeControlOptions.filter((o) => o.category === 'bullet').map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectTimeControl(option.id)}
                  data-testid={`online-time-option-${option.id}`}
                  className={`flex items-center justify-center rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                    selectedTimeControlId === option.id
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100 shadow-[0_0_10px_rgba(52,211,153,0.15)]'
                      : 'border-slate-600 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  {option.incrementSeconds > 0 ? (
                    <span className="text-sm font-bold"><span dir="ltr">{option.displayTime}|{option.displayIncrement}</span></span>
                  ) : (
                    <span className="text-sm font-bold"><span dir="ltr">{option.displayTime} min</span></span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Category: Blitz */}
          <div>
            <p className="mb-2 flex items-center gap-2 text-lg font-bold text-cyan-300/80" dir="ltr">
              <img src="/icons/time-controls/blitz.png" alt="Blitz" className="w-6 h-6" />
              <span>Blitz</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {timeControlOptions.filter((o) => o.category === 'blitz').map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectTimeControl(option.id)}
                  data-testid={`online-time-option-${option.id}`}
                  className={`flex items-center justify-center rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                    selectedTimeControlId === option.id
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100 shadow-[0_0_10px_rgba(52,211,153,0.15)]'
                      : 'border-slate-600 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  {option.incrementSeconds > 0 ? (
                    <span className="text-sm font-bold"><span dir="ltr">{option.displayTime}|{option.displayIncrement}</span></span>
                  ) : (
                    <span className="text-sm font-bold"><span dir="ltr">{option.displayTime} min</span></span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Category: Rapid */}
          <div>
            <p className="mb-2 flex items-center gap-2 text-lg font-bold text-cyan-300/80" dir="ltr">
              <img src="/icons/time-controls/rapid.png" alt="Rapid" className="w-6 h-6" />
              <span>Rapid</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {timeControlOptions.filter((o) => o.category === 'rapid').map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectTimeControl(option.id)}
                  data-testid={`online-time-option-${option.id}`}
                  className={`flex items-center justify-center rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                    selectedTimeControlId === option.id
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100 shadow-[0_0_10px_rgba(52,211,153,0.15)]'
                      : 'border-slate-600 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  {option.incrementSeconds > 0 ? (
                    <span className="text-sm font-bold"><span dir="ltr">{option.displayTime}|{option.displayIncrement}</span></span>
                  ) : (
                    <span className="text-sm font-bold"><span dir="ltr">{option.displayTime} min</span></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onStartOnline}
          disabled={isStartingOnline}
          data-testid="online-play-btn"
          className="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-base font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStartingOnline ? 'در حال ورود...' : 'بازی آنلاین'}
        </button>
        <button
          type="button"
          onClick={onOpenFriendPlay}
          data-testid="friend-play-btn"
          className="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-base font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
        >
          بازی با دوست
        </button>
        <button
          type="button"
          onClick={onStartBotGame}
          data-testid="offline-play-btn"
          className="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-base font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
        >
          بازی با بات
        </button>
        <button
          type="button"
          onClick={onStartPersonalGame}
          data-testid="personal-play-btn"
          className="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-base font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
        >
          بازی شخصی
        </button>
      </div>
    </section>
  )
}

interface ProfileContentProps {
  isAuthenticated: boolean
  mode: ProfileMode
  onModeChange: (mode: ProfileMode) => void
  profileName: string
  draftName: string
  password: string
  confirmPassword: string
  onDraftNameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  usernameEditValue: string
  onUsernameEditValueChange: (value: string) => void
  isEditingUsername: boolean
  onToggleUsernameEdit: () => void
  onSaveUsername: () => void
  friends: string[]
  incomingRequests: string[]
  outgoingRequests: string[]
  incomingRequestCount: number
  friendSearchQuery: string
  onFriendSearchQueryChange: (value: string) => void
  friendSearchResults: Array<{ username: string; relation: FriendRelation }>
  onSendFriendRequest: (targetUsername: string) => void
  onRespondFriendRequest: (fromUsername: string, action: 'accept' | 'reject') => void
  onCancelOutgoingRequest: (toUsername: string) => void
  onRemoveFriend: (friendUsername: string) => void
  activePanel: ProfilePanel
  onPanelChange: (panel: ProfilePanel) => void
  notifications: NotificationItem[]
  notificationUnreadCount: number
  onMarkNotificationsRead: (notificationIds?: string[]) => void
  onLogout: () => void
  onPlayAsGuest: () => void
  isStartingOnline: boolean
  friendsLoading: boolean
  avatar: string
  selectedLevel: string
  onSelectedLevelChange: (value: string) => void
}

function ProfileContent(props: ProfileContentProps) {
  const router = useRouter()
  const {
    isAuthenticated,
    mode,
    onModeChange,
    profileName,
    draftName,
    password,
    confirmPassword,
    onDraftNameChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
    isSubmitting,
    usernameEditValue,
    onUsernameEditValueChange,
    isEditingUsername,
    onToggleUsernameEdit,
    onSaveUsername,
    friends,
    incomingRequests,
    outgoingRequests,
    incomingRequestCount,
    friendSearchQuery,
    onFriendSearchQueryChange,
    friendSearchResults,
    onSendFriendRequest,
    onRespondFriendRequest,
    onCancelOutgoingRequest,
    onRemoveFriend,
    activePanel,
    onPanelChange,
    notifications,
    notificationUnreadCount,
    onMarkNotificationsRead,
    onLogout,
    onPlayAsGuest,
    isStartingOnline,
    friendsLoading,
    selectedLevel,
    onSelectedLevelChange,
  } = props

  const isRegisterMode = mode === 'register'
  const [isKebabOpen, setIsKebabOpen] = useState(false)
  const [totalPlayedGames, setTotalPlayedGames] = useState(0)
  const [bulletRating, setBulletRating] = useState(isRegisterMode ? parseInt(selectedLevel, 10) : 1000)
  const [blitzRating, setBlitzRating] = useState(isRegisterMode ? parseInt(selectedLevel, 10) : 1000)
  const [rapidRating, setRapidRating] = useState(isRegisterMode ? parseInt(selectedLevel, 10) : 1000)

  useEffect(() => {
    if (!profileName.trim()) return
    fetch('/api/profile/game-stats?username=' + encodeURIComponent(profileName.trim()))
      .then(res => res.json())
      .then(data => {
        if (data.gameStats?.total?.played !== undefined) {
          setTotalPlayedGames(data.gameStats.total.played)
        }
        if (data.gameStats?.bullet?.rating !== undefined) {
          setBulletRating(data.gameStats.bullet.rating)
        }
        if (data.gameStats?.blitz?.rating !== undefined) {
          setBlitzRating(data.gameStats.blitz.rating)
        }
        if (data.gameStats?.rapid?.rating !== undefined) {
          setRapidRating(data.gameStats.rapid.rating)
        }
        // If no existing data and this is a new user, set initial ratings based on selected level
        if ((data.gameStats?.total?.played === undefined || data.gameStats.total.played === 0) && isRegisterMode) {
          const levelValue = parseInt(selectedLevel, 10);
          setBulletRating(levelValue);
          setBlitzRating(levelValue);
          setRapidRating(levelValue);
        }
      })
      .catch(() => {
        // If fetch fails and this is a new user registration, set initial ratings based on selected level
        if (isRegisterMode) {
          const levelValue = parseInt(selectedLevel, 10);
          setBulletRating(levelValue);
          setBlitzRating(levelValue);
          setRapidRating(levelValue);
        }
      });
  }, [profileName, isRegisterMode, selectedLevel]);

  const onToggleKebab = useCallback(() => {
    setIsKebabOpen(prev => !prev)
  }, [])

  if (isAuthenticated) {
    return (
      <section className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={onToggleKebab}
              data-testid="profile-kebab-btn"
              className="inline-flex items-center justify-center rounded-lg border border-slate-600 p-2 text-slate-200 transition hover:bg-slate-800"
              aria-label="منوی بیشتر"
            >
              <KebabIcon />
            </button>
            {isKebabOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={onToggleKebab}
                />
                <div className="absolute right-0 top-full mt-2 z-20 w-48 overflow-hidden rounded-xl border border-slate-600 bg-slate-900 shadow-xl">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleKebab()
                        router.push('/profile/edit')
                      }}
                      data-testid="profile-kebab-edit-btn"
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
                    >
                      <PencilIcon />
                      ویرایش پروفایل
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onToggleKebab()
                        router.push('/profile/change-password')
                      }}
                      data-testid="profile-kebab-password-btn"
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2Z" />
                      </svg>
                      تغییر رمز عبور
                    </button>
                    <div className="border-t border-slate-700" />
                    <button
                      type="button"
                      onClick={() => {
                        onToggleKebab()
                        onLogout()
                      }}
                      data-testid="profile-kebab-logout-btn"
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-300 transition hover:bg-slate-800"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5Z" />
                      </svg>
                      خروج از حساب
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-slate-100">{profileName}</span>
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-slate-500 bg-slate-800">
              {props.avatar ? (
                <img src={props.avatar} alt="تصویر پروفایل" className="h-full w-full object-cover" />
              ) : (
                <img src="/icons/logo/logo.png" alt="لوگو" className="h-full w-full object-cover" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 py-3">
          <div className="flex flex-col items-center gap-1">
            <img src="/icons/games.png" alt="games" className="h-24 w-24 object-contain" />
            <span className="text-[10px] text-slate-400">بازی‌ها</span>
            <span className="text-xs font-bold text-slate-300">{totalPlayedGames.toLocaleString('fa-IR')}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <img src="/icons/footer/pazel.png" alt="puzzle" className="h-24 w-24 rotate-90" />
            <span className="text-[10px] text-slate-400">پازل</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-400">ریتینگ بازی‌ها</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/50 py-2">
              <img src="/icons/time-controls/bullet.png" alt="Bullet" className="w-8 h-8" />
              <span className="text-[10px] text-slate-400">Bullet</span>
              <span className="text-xs font-bold text-cyan-300">{bulletRating}</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/50 py-2">
              <img src="/icons/time-controls/blitz.png" alt="Blitz" className="w-8 h-8" />
              <span className="text-[10px] text-slate-400">Blitz</span>
              <span className="text-xs font-bold text-cyan-300">{blitzRating}</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/50 py-2">
              <img src="/icons/time-controls/rapid.png" alt="Rapid" className="w-8 h-8" />
              <span className="text-[10px] text-slate-400">Rapid</span>
              <span className="text-xs font-bold text-cyan-300">{rapidRating}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-900/80 p-1">
            <button
              type="button"
              onClick={() => onPanelChange('friends')}
              data-testid="profile-panel-friends"
              className={[
                'rounded-lg px-3 py-2 text-sm font-semibold transition',
                activePanel === 'friends' ? 'bg-cyan-400 text-slate-950' : 'text-slate-200 hover:bg-slate-800',
              ].join(' ')}
            >
              دوستان
            </button>
            <button
              type="button"
              onClick={() => onPanelChange('notifications')}
              data-testid="profile-panel-notifications"
              className={[
                'relative rounded-lg px-3 py-2 text-sm font-semibold transition',
                activePanel === 'notifications' ? 'bg-cyan-400 text-slate-950' : 'text-slate-200 hover:bg-slate-800',
              ].join(' ')}
            >
              نوتیف‌ها
              {notificationUnreadCount > 0 ? (
                <span className="mr-2 rounded-full bg-rose-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white" data-testid="notifications-unread-count">
                  {notificationUnreadCount}
                </span>
              ) : null}
            </button>
          </div>

          {activePanel === 'friends' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-200">مدیریت دوستان</p>
                {incomingRequestCount > 0 ? (
                  <span
                    data-testid="friends-incoming-count"
                    className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-200"
                  >
                    {incomingRequestCount} درخواست جدید
                  </span>
                ) : null}
              </div>

              <label className="block space-y-2">
                <span className="text-xs text-slate-400">جستجوی کاربران</span>
                <input
                  value={friendSearchQuery}
                  onChange={(event) => onFriendSearchQueryChange(event.target.value)}
                  data-testid="friends-search-input"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring-2"
                  placeholder="نام کاربری دوستت را جستجو کن"
                />
              </label>

              {friendSearchQuery.trim().length >= 2 ? (
                <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/70 p-2">
                  {friendSearchResults.length === 0 ? (
                    <p className="text-xs text-slate-400" data-testid="friends-search-empty">
                      کاربری پیدا نشد.
                    </p>
                  ) : (
                    friendSearchResults.map((result) => (
                      <div
                        key={result.username}
                        className="flex items-center justify-between rounded-md border border-slate-700 px-2 py-1.5"
                        data-testid={`friends-search-row-${result.username}`}
                      >
                        <p className="text-sm text-slate-100">{result.username}</p>
                        {result.relation === 'none' ? (
                          <button
                            type="button"
                            onClick={() => onSendFriendRequest(result.username)}
                            disabled={friendsLoading}
                            data-testid={`friends-send-request-${result.username}`}
                            className="inline-flex items-center justify-center rounded-md bg-emerald-500 p-1.5 text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`ارسال درخواست دوستی برای ${result.username}`}
                          >
                            <PlusIcon />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300">
                            {result.relation === 'friend'
                              ? 'دوست'
                              : result.relation === 'incoming'
                                ? 'درخواست از او'
                                : 'درخواست ارسال شده'}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-xs text-slate-400">درخواست‌های دریافتی</p>
                {incomingRequests.length === 0 ? (
                  <p className="text-xs text-slate-500" data-testid="friends-incoming-empty">
                    فعلاً درخواستی نداری.
                  </p>
                ) : (
                  incomingRequests.map((requester) => (
                    <div
                      key={requester}
                      className="flex items-center justify-between rounded-md border border-slate-700 px-2 py-1.5"
                      data-testid={`friends-incoming-row-${requester}`}
                    >
                      <p className="text-sm text-slate-100">{requester} درخواست دوستی ارسال کرده است.</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onRespondFriendRequest(requester, 'accept')}
                          disabled={friendsLoading}
                          data-testid={`friends-accept-${requester}`}
                          className="inline-flex items-center justify-center rounded-md bg-emerald-500 p-1.5 text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`تایید درخواست ${requester}`}
                        >
                          <CheckIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRespondFriendRequest(requester, 'reject')}
                          disabled={friendsLoading}
                          data-testid={`friends-reject-${requester}`}
                          className="inline-flex items-center justify-center rounded-md bg-rose-500 p-1.5 text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`رد درخواست ${requester}`}
                        >
                          <CrossIcon />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400">لیست دوستان</p>
                {friends.length === 0 ? (
                  <p className="text-xs text-slate-500" data-testid="friends-list-empty">
                    هنوز دوستی اضافه نشده است.
                  </p>
                ) : (
                  <div className="space-y-1" data-testid="friends-list">
                    {friends.map((friend) => (
                      <div
                        key={friend}
                        className="flex items-center justify-between rounded-md border border-slate-700 px-2 py-1.5"
                        data-testid={`friends-list-row-${friend}`}
                      >
                        <p className="text-sm text-slate-100">{friend}</p>
                        <button
                          type="button"
                          onClick={() => onRemoveFriend(friend)}
                          disabled={friendsLoading}
                          data-testid={`friends-remove-${friend}`}
                          className="rounded-md border border-rose-400/60 px-2 py-1 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          حذف دوست
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {outgoingRequests.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">درخواست‌های ارسالی شما</p>
                  <div className="space-y-1">
                    {outgoingRequests.map((target) => (
                      <div
                        key={target}
                        className="flex items-center justify-between rounded-md border border-slate-700 px-2 py-1.5"
                        data-testid={`friends-outgoing-row-${target}`}
                      >
                        <p className="text-xs text-slate-300">{target}</p>
                        <button
                          type="button"
                          onClick={() => onCancelOutgoingRequest(target)}
                          disabled={friendsLoading}
                          data-testid={`friends-cancel-request-${target}`}
                          className="rounded-md border border-slate-500 px-2 py-1 text-xs text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          لغو
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-200">نوتیف‌ها</p>
                <button
                  type="button"
                  onClick={() => onMarkNotificationsRead()}
                  disabled={friendsLoading || notifications.length === 0}
                  data-testid="notifications-mark-all-read"
                  className="rounded-md border border-slate-500 px-2 py-1 text-xs text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  علامت خوانده‌شده برای همه
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500" data-testid="notifications-empty">
                  هنوز نوتیفی وجود ندارد.
                </p>
              ) : (
                <div className="space-y-2" data-testid="notifications-list">
                  {notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      onClick={() => {
                        if (!notification.read) {
                          onMarkNotificationsRead([notification.id])
                        }
                      }}
                      data-testid={`notification-item-${notification.id}`}
                      className={[
                        'w-full rounded-md border px-3 py-2 text-right transition',
                        notification.read
                          ? 'border-slate-700 bg-slate-900/70 text-slate-300'
                          : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-100',
                      ].join(' ')}
                    >
                      <p className="text-sm">{notification.message}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{formatNotificationTime(notification.createdAt)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
      <h2 className="text-center text-xl font-bold text-slate-100">ورود / ثبت‌نام</h2>
      <p className="text-center text-sm text-slate-300">
        برای بازی با نام کاربری خودت، ابتدا وارد شو یا حساب جدید بساز.
      </p>
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-950/60 p-1">
        <button
          type="button"
          onClick={() => onModeChange('login')}
          data-testid="profile-mode-login"
          className={[
            'rounded-lg px-3 py-2 text-sm font-semibold transition',
            !isRegisterMode ? 'bg-cyan-400 text-slate-950' : 'text-slate-200 hover:bg-slate-800',
          ].join(' ')}
        >
          ورود
        </button>
        <button
          type="button"
          onClick={() => onModeChange('register')}
          data-testid="profile-mode-register"
          className={[
            'rounded-lg px-3 py-2 text-sm font-semibold transition',
            isRegisterMode ? 'bg-cyan-400 text-slate-950' : 'text-slate-200 hover:bg-slate-800',
          ].join(' ')}
        >
          ثبت‌نام
        </button>
      </div>
      <label className="block space-y-2">
        <span className="text-sm text-slate-200">نام اکانت</span>
        <input
          value={draftName}
          onChange={(event) => onDraftNameChange(event.target.value)}
          data-testid="profile-name-input"
          className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring-2"
          placeholder="مثال: ali_chess"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-slate-200">رمز عبور</span>
        <input
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          data-testid="profile-password-input"
          className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring-2"
          placeholder="حداقل ۶ کاراکتر"
        />
      </label>
{isRegisterMode ? (
  <>
    <label className="block space-y-2">
      <span className="text-sm text-slate-200">تکرار رمز عبور</span>
      <input
        type="password"
        value={confirmPassword}
        onChange={(event) => onConfirmPasswordChange(event.target.value)}
        data-testid="profile-confirm-password-input"
        className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring-2"
        placeholder="دوباره وارد کنید"
      />
    </label>
    
    {/* Level selection for new users */}
    <label className="block space-y-2">
      <span className="text-sm text-slate-200">سطح کاربری</span>
      <select
        value={selectedLevel}
        onChange={(event) => onSelectedLevelChange(event.target.value)}
        data-testid="profile-level-select"
        className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring-2"
      >
        <option value="200">تازه وارد = 200</option>
        <option value="400">مبتدی = 400</option>
        <option value="800">متوسط = 800</option>
        <option value="1200">پیشرفته = 1200</option>
      </select>
    </label>
  </>
) : null}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        data-testid={isRegisterMode ? 'profile-register-btn' : 'profile-login-btn'}
        className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'در حال پردازش...' : isRegisterMode ? 'ثبت‌نام' : 'ورود'}
      </button>
      <button
        type="button"
        onClick={onPlayAsGuest}
        disabled={isStartingOnline}
        data-testid="profile-guest-btn"
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isStartingOnline ? 'در حال ورود به عنوان مهمان...' : 'ورود به عنوان مهمان'}
      </button>
      {profileName ? (
        <p className="rounded-lg bg-emerald-500/15 px-3 py-2 text-center text-sm text-emerald-200" data-testid="profile-current-name">
          نام ذخیره شده: {profileName}
        </p>
      ) : null}
    </section>
  )
}

function PlaceholderContent({ title }: { title: string }) {
  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-center">
      <h2 className="text-xl font-bold text-slate-100">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">این بخش در مرحله بعدی تکمیل می‌شود.</p>
    </section>
  )
}

function NewsContent({
  activeSection,
  onSectionChange,
}: {
  activeSection: NewsSection
  onSectionChange: (section: NewsSection) => void
}) {
  const tabs: Array<{ id: NewsSection; label: string }> = [
    { id: 'news', label: 'اخبار' },
    { id: 'video', label: 'ویدیو' },
    { id: 'education', label: 'آموزش' },
  ]

  const sectionTitle = activeSection === 'news' ? 'اخبار' : activeSection === 'video' ? 'ویدیو' : 'آموزش'

  return (
    <section className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
      <h2 className="text-center text-xl font-bold text-slate-100">اخبار</h2>
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-950/60 p-1" data-testid="news-section-tabs">
        {tabs.map((tab) => {
          const isActive = activeSection === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSectionChange(tab.id)}
              data-testid={`news-section-tab-${tab.id}`}
              className={[
                'rounded-lg px-2 py-2 text-sm font-semibold transition',
                isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-200 hover:bg-slate-800',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-5 text-center" data-testid="news-section-content">
        <p className="text-lg font-bold text-slate-100" data-testid="news-section-title">
          {sectionTitle}
        </p>
        <p className="mt-2 text-sm text-slate-400">محتوای بخش {sectionTitle} در مرحله بعدی تکمیل می‌شود.</p>
      </div>
    </section>
  )
}

export function HomeShell() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<FooterTab>('home')
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'profile') {
      setActiveTab('profile')
    }
  }, [searchParams])
  const [activeNewsSection, setActiveNewsSection] = useState<NewsSection>('news')
  const [profileMode, setProfileMode] = useState<ProfileMode>('login')
  const [activePanel, setActivePanel] = useState<ProfilePanel>('friends')
  const [homePanel, setHomePanel] = useState<HomePanel>('menu')
  const [profileName, setProfileName] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGuestMode, setIsGuestMode] = useState(false)
const [draftName, setDraftName] = useState('')
const [password, setPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [selectedLevel, setSelectedLevel] = useState('200')
const [usernameEditValue, setUsernameEditValue] = useState('')
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [friends, setFriends] = useState<string[]>([])
  const [incomingRequests, setIncomingRequests] = useState<string[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<string[]>([])
  const [incomingRequestCount, setIncomingRequestCount] = useState(0)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0)
  const [friendPresence, setFriendPresence] = useState<FriendPresenceItem[]>([])
  const [incomingGameInvites, setIncomingGameInvites] = useState<GameInviteItem[]>([])
  const [friendSearchQuery, setFriendSearchQuery] = useState('')
  const [friendSearchResults, setFriendSearchResults] = useState<Array<{ username: string; relation: FriendRelation }>>([])
  const [friendsLoading, setFriendsLoading] = useState(false)
  const [isInviteActionLoading, setIsInviteActionLoading] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [selectedInviteFriendUsername, setSelectedInviteFriendUsername] = useState('')
  const [selectedInviteTimeControlId, setSelectedInviteTimeControlId] = useState<string>(FRIEND_INVITE_TIME_OPTIONS[0]?.id ?? '10-2')
  const [bannerMessage, setBannerMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info')
   const [isStartingOnline, setIsStartingOnline] = useState(false)
   const [isFindingOpponent, setIsFindingOpponent] = useState(false)
   const [matchmakingRoomId, setMatchmakingRoomId] = useState<string | null>(null)
   const [matchmakingSession, setMatchmakingSession] = useState<RoomSession | null>(null)
   const [matchmakingStatusMessage, setMatchmakingStatusMessage] = useState<string | null>(null)
   const [matchmakingError, setMatchmakingError] = useState<string | null>(null)
   const [avatar, setAvatar] = useState('')
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [storageReady, setStorageReady] = useState(false)
  const matchmakingEventSourceRef = useRef<EventSource | null>(null)
  const matchmakingTimeoutRef = useRef<number | null>(null)
  const [selectedTimeControlId, setSelectedTimeControlId] = useState<string>(ONLINE_TIME_CONTROL_DEFAULT_ID)
  const [isTimeControlOptionsOpen, setIsTimeControlOptionsOpen] = useState(false)

  const clearMatchmaking = useCallback((options?: { removeSession?: boolean }) => {
    if (matchmakingEventSourceRef.current) {
      matchmakingEventSourceRef.current.close()
      matchmakingEventSourceRef.current = null
    }
    if (matchmakingTimeoutRef.current !== null) {
      window.clearTimeout(matchmakingTimeoutRef.current)
      matchmakingTimeoutRef.current = null
    }
    setIsFindingOpponent(false)
    setMatchmakingRoomId(null)
    setMatchmakingSession(null)
    setMatchmakingStatusMessage(null)
    setMatchmakingError(null)
    if (options?.removeSession ?? true) {
      localStorage.removeItem(CHESS_SESSION_STORAGE_KEY)
    }
  }, [])

  const clearAuthState = useCallback((message?: string) => {
    if (matchmakingEventSourceRef.current) {
      matchmakingEventSourceRef.current.close()
      matchmakingEventSourceRef.current = null
    }
    localStorage.removeItem(PROFILE_USERNAME_STORAGE_KEY)
    localStorage.removeItem(CHESS_SESSION_STORAGE_KEY)
    setIsAuthenticated(false)
    setProfileName('')
    setDraftName('')
    setUsernameEditValue('')
    setIsEditingUsername(false)
    setFriends([])
    setIncomingRequests([])
    setOutgoingRequests([])
    setIncomingRequestCount(0)
    setFriendPresence([])
    setIncomingGameInvites([])
    setIsInviteModalOpen(false)
    setSelectedInviteFriendUsername('')
    setNotifications([])
    setNotificationUnreadCount(0)
    setHomePanel('menu')
    setActivePanel('friends')
    setFriendSearchQuery('')
    setAvatar('')
    setFriendSearchResults([])
    setIsGuestMode(false)
    if (message) {
      setBannerMessage(message)
    }
  }, [])

  const connectMatchmakingEvents = useCallback(
    (roomId: string, session: RoomSession) => {
      if (matchmakingEventSourceRef.current) {
        matchmakingEventSourceRef.current.close()
      }

      const source = new EventSource(roomEventsUrl(roomId))

      const handleMatchmakingSnapshot = (rawData: string) => {
        try {
          const nextSnapshot = JSON.parse(rawData) as RoomSnapshot
          if (nextSnapshot.status === 'active') {
            const playerColor = nextSnapshot.players.white?.id === session.playerId
              ? 'white'
              : nextSnapshot.players.black?.id === session.playerId
              ? 'black'
              : session.color
            setMatchmakingStatusMessage(
              `حریف پیدا شد. شما ${playerColor === 'white' ? 'سفید' : 'مشکی'} هستید.`
            )
            if (matchmakingTimeoutRef.current !== null) {
              window.clearTimeout(matchmakingTimeoutRef.current)
            }
            matchmakingTimeoutRef.current = window.setTimeout(() => {
              matchmakingTimeoutRef.current = null
              clearMatchmaking({ removeSession: false })
              router.push(`/online?room=${roomId}&mode=ranked`)
            }, 700)
          }
        } catch {
          setMatchmakingError('خطا هنگام دریافت وضعیت مسابقه.')
        }
      }

      const eventHandler = (event: MessageEvent<string>) => {
        handleMatchmakingSnapshot(event.data)
      }

      source.addEventListener('snapshot', eventHandler)
      source.addEventListener('player-joined', eventHandler)
      source.addEventListener('room-created', eventHandler)
      source.onerror = () => {
        setMatchmakingError('اتصال به سرور قطع شد. دوباره تلاش می‌کنیم...')
      }
      matchmakingEventSourceRef.current = source
    },
    [clearMatchmaking, router]
  )

  const loadFriendsOverview = useCallback(async (username: string, silent = false): Promise<boolean> => {
    const normalized = username.trim()
    if (!normalized) {
      return false
    }

    try {
      const response = await fetch(
        `/api/profile?action=friendsOverview&username=${encodeURIComponent(normalized)}`
      )
      const payload = await parseJsonSafe(response)
      if (!response.ok) {
        if (payload.error?.code === 'USER_NOT_FOUND') {
          clearAuthState('برای ادامه دوباره وارد حساب کاربری شوید.')
          return false
        }
        if (!silent) {
          setBannerMessage(payload.error?.message ?? 'دریافت لیست دوستان انجام نشد.')
        }
        return false
      }

      setFriends(payload.friends ?? [])
      const fallbackPresence = (payload.friends ?? []).map((username) => ({ username, online: false }))
      setFriendPresence(payload.friendPresence ?? fallbackPresence)
      setIncomingRequests(payload.incomingRequests ?? [])
      setOutgoingRequests(payload.outgoingRequests ?? [])
      setIncomingGameInvites(payload.incomingGameInvites ?? [])
      setIncomingRequestCount(payload.incomingCount ?? 0)
      return true
    } catch {
      if (!silent) {
        setBannerMessage('خطا در دریافت اطلاعات دوستان.')
      }
      return false
    }
  }, [clearAuthState])

  const loadNotifications = useCallback(async (username: string, silent = false): Promise<boolean> => {
    const normalized = username.trim()
    if (!normalized) {
      return false
    }

    try {
      const response = await fetch(
        `/api/profile?action=notifications&username=${encodeURIComponent(normalized)}`
      )
      const payload = await parseJsonSafe(response)
      if (!response.ok) {
        if (payload.error?.code === 'USER_NOT_FOUND') {
          clearAuthState('برای ادامه دوباره وارد حساب کاربری شوید.')
          return false
        }
        if (!silent) {
          setBannerMessage(payload.error?.message ?? 'دریافت نوتیف‌ها انجام نشد.')
        }
        return false
      }

      setNotifications(payload.notifications ?? [])
      setNotificationUnreadCount(payload.unreadCount ?? 0)
      return true
    } catch {
      if (!silent) {
        setBannerMessage('خطا در دریافت نوتیف‌ها.')
      }
      return false
    }
  }, [clearAuthState])

  const searchUsers = useCallback(async (username: string, query: string, signal?: AbortSignal): Promise<boolean> => {
    const normalizedUsername = username.trim()
    const normalizedQuery = query.trim()
    if (!normalizedUsername || normalizedQuery.length < 2) {
      setFriendSearchResults([])
      return false
    }

    try {
      const response = await fetch(
        `/api/profile?action=searchUsers&username=${encodeURIComponent(normalizedUsername)}&query=${encodeURIComponent(normalizedQuery)}`,
        { signal }
      )
      const payload = await parseJsonSafe(response)
      if (!response.ok) {
        setBannerMessage(payload.error?.message ?? 'جستجوی کاربران انجام نشد.')
        return false
      }

      setFriendSearchResults(payload.users ?? [])
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(PROFILE_USERNAME_STORAGE_KEY)?.trim() ?? ''
    if (!stored) {
      return
    }
    setProfileName(stored)
    setUsernameEditValue(stored)
    setDraftName(stored)
    setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    const checkStorage = async () => {
      try {
        const response = await fetch('/api/profile?action=health')
        const payload = await parseJsonSafe(response)
        if (!cancelled) {
          setStorageReady(response.ok && payload.status === 'ok')
        }
      } catch {
        if (!cancelled) {
          setStorageReady(false)
        }
      }
    }

    void checkStorage()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !profileName.trim()) {
      setFriends([])
      setFriendPresence([])
      setIncomingRequests([])
      setOutgoingRequests([])
      setIncomingRequestCount(0)
      setIncomingGameInvites([])
      setNotifications([])
      setNotificationUnreadCount(0)
      setIsInviteModalOpen(false)
      setSelectedInviteFriendUsername('')
      setHomePanel('menu')
      setAvatar('')
      return
    }
    void loadFriendsOverview(profileName, true)
    void loadNotifications(profileName, true)

    async function loadProfile() {
      try {
        const res = await fetch('/api/profile?action=get-profile&username=' + encodeURIComponent(profileName.trim()))
        const data = await res.json()
        if (data.user?.avatar) {
          setAvatar(data.user.avatar)
        }
      } catch {
        // ignore
      }
    }
    void loadProfile()
  }, [isAuthenticated, loadFriendsOverview, loadNotifications, profileName])

  useEffect(() => {
    if (!isAuthenticated || !profileName.trim()) {
      return
    }

    const interval = setInterval(() => {
      void loadFriendsOverview(profileName, true)
      void loadNotifications(profileName, true)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAuthenticated, loadFriendsOverview, loadNotifications, profileName])

  useEffect(() => {
    if (!isAuthenticated || !profileName.trim() || friendSearchQuery.trim().length < 2) {
      setFriendSearchResults([])
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      void searchUsers(profileName, friendSearchQuery, controller.signal)
    }, 250)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [friendSearchQuery, isAuthenticated, profileName, searchUsers])

  useEffect(() => {
    if (activeTab !== 'home') {
      setHomePanel('menu')
      setIsTimeControlOptionsOpen(false)
    }
  }, [activeTab])

  useEffect(() => {
    const saved = localStorage.getItem(ONLINE_TIME_CONTROL_STORAGE_KEY)?.trim() ?? ''
    if (!saved) {
      setSelectedTimeControlId(ONLINE_TIME_CONTROL_DEFAULT_ID)
      return
    }
    const exists = ONLINE_TIME_CONTROL_OPTIONS.some((option) => option.id === saved)
    if (exists) {
      setSelectedTimeControlId(saved)
    } else {
      setSelectedTimeControlId(ONLINE_TIME_CONTROL_DEFAULT_ID)
    }
  }, [])

  const handleStartOnline = async () => {
    const selectedTimeControl =
      ONLINE_TIME_CONTROL_OPTIONS.find((option) => option.id === selectedTimeControlId) ?? ONLINE_TIME_CONTROL_OPTIONS[0]
    const preferredName = profileName.trim() || 'Guest'
    setIsStartingOnline(true)
    setBannerMessage(null)
    setMatchmakingError(null)

    // Check if there's an existing session to rejoin
    const storedSessionRaw = localStorage.getItem(CHESS_SESSION_STORAGE_KEY)
    if (storedSessionRaw) {
      try {
        const storedSession = JSON.parse(storedSessionRaw) as { roomId: string; session: RoomSession }
        if (storedSession?.roomId && storedSession?.session?.token) {
          // Try to rejoin the existing game
          try {
            const rejoinResponse = await rejoinRoom({ roomId: storedSession.roomId, token: storedSession.session.token })
            // Only rejoin if game is still active or waiting
            if (rejoinResponse.snapshot.status === 'active' || rejoinResponse.snapshot.status === 'waiting') {
              router.push(`/online?room=${storedSession.roomId}`)
              return
            }
            // Game is finished - clear session and start fresh
            localStorage.removeItem(CHESS_SESSION_STORAGE_KEY)
          } catch {
            // Rejoin failed - fall through to create new game
          }
        }
      } catch {
        // Invalid stored session - clear it
        localStorage.removeItem(CHESS_SESSION_STORAGE_KEY)
      }
    }

    try {
      const response = await createRoom({
        name: preferredName,
        timeControlMinutes: selectedTimeControl.timeControlMinutes,
        incrementSeconds: selectedTimeControl.incrementSeconds,
        quickMatch: true,
        clientId: isGuestMode ? null : profileName.trim() || null,
      })
      localStorage.setItem(
        CHESS_SESSION_STORAGE_KEY,
        JSON.stringify({ roomId: response.snapshot.roomId, session: response.session })
      )

      if (response.snapshot.status === 'active') {
        router.push(`/online?room=${response.snapshot.roomId}&mode=ranked`)
        return
      }

      setIsFindingOpponent(true)
      setMatchmakingRoomId(response.snapshot.roomId)
      setMatchmakingSession(response.session)
      setMatchmakingStatusMessage('در حال پیدا کردن حریف...')
      connectMatchmakingEvents(response.snapshot.roomId, response.session)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'شروع بازی آنلاین ممکن نشد.'
      setBannerMessage(message)
    } finally {
      setIsStartingOnline(false)
    }
  }

  const handlePlayAsGuest = () => {
    const preferredName = draftName.trim() || 'Guest'
    if (draftName.trim().length > 0 && draftName.trim().length < 3) {
      setBannerMessage('نام مهمان باید حداقل ۳ کاراکتر باشد.')
      return
    }

    setIsGuestMode(true)
    setProfileName(preferredName)
    setDraftName(preferredName)
    setBannerMessage('شما به عنوان مهمان وارد شدید.')
    setActiveTab('home')
    setHomePanel('menu')
    setIsTimeControlOptionsOpen(false)
  }

  const handleStartBotGame = () => {
    if (isGuestMode) {
      setBannerMessage('برای ادامه باید وارد حساب کاربری شوید.')
      setProfileMode('login')
      setActiveTab('profile')
      return
    }

    router.push('/offline')
  }

  const handleStartPersonalGame = () => {
    if (isGuestMode) {
      setBannerMessage('برای ادامه باید وارد حساب کاربری شوید.')
      setProfileMode('login')
      setActiveTab('profile')
      return
    }

    router.push('/personal')
  }

  const handleOpenFriendPlay = () => {
    if (isGuestMode) {
      setBannerMessage('برای استفاده از بازی با دوست باید وارد حساب کاربری شوید.')
      setProfileMode('login')
      setActiveTab('profile')
      return
    }

    if (!isAuthenticated || !profileName.trim()) {
      setBannerMessage('برای دیدن لیست دوستان اول وارد حساب کاربری شوید.')
      setActiveTab('profile')
      return
    }
    setHomePanel('friend-play')
    void loadFriendsOverview(profileName, true)
  }

  const handleOpenInviteModal = (targetUsername: string) => {
    const normalized = targetUsername.trim()
    if (!normalized) {
      return
    }
    setSelectedInviteFriendUsername(normalized)
    const defaultOption = FRIEND_INVITE_TIME_OPTIONS.find((option) => option.id === '10-2') ?? FRIEND_INVITE_TIME_OPTIONS[0]
    if (defaultOption) {
      setSelectedInviteTimeControlId(defaultOption.id)
    }
    setIsInviteModalOpen(true)
  }

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false)
    setSelectedInviteFriendUsername('')
  }

  const handleSelectInviteTimeControl = (optionId: string) => {
    const selectedOption = FRIEND_INVITE_TIME_OPTIONS.find((option) => option.id === optionId)
    if (!selectedOption) {
      return
    }
    setSelectedInviteTimeControlId(selectedOption.id)
  }

  const handleSendGameInvite = async () => {
    const fromUsername = profileName.trim()
    const toUsername = selectedInviteFriendUsername.trim()
    const selectedTimeControl =
      FRIEND_INVITE_TIME_OPTIONS.find((option) => option.id === selectedInviteTimeControlId) ?? FRIEND_INVITE_TIME_OPTIONS[0]
    if (!fromUsername || !toUsername || !selectedTimeControl) {
      setBannerMessage('ارسال دعوت بازی ممکن نیست.')
      return
    }

    setIsInviteActionLoading(true)
    setBannerMessage(null)
    try {
      const createResponse = await createRoom({
        name: fromUsername,
        timeControlMinutes: selectedTimeControl.timeControlMinutes,
        incrementSeconds: selectedTimeControl.incrementSeconds,
        clientId: fromUsername,
      })
      const roomId = createResponse.snapshot.roomId

      const inviteResponse = await fetch('/api/profile?action=gameInviteSend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUsername,
          toUsername,
          roomId,
          timeControlMinutes: selectedTimeControl.timeControlMinutes,
          incrementSeconds: selectedTimeControl.incrementSeconds,
        }),
      })
      const invitePayload = await parseJsonSafe(inviteResponse)
      if (!inviteResponse.ok) {
        setBannerMessage(invitePayload.error?.message ?? 'ارسال دعوت بازی انجام نشد.')
        return
      }

      localStorage.setItem('realtime-chess-session', JSON.stringify({ roomId, session: createResponse.session }))
      handleCloseInviteModal()
      await loadFriendsOverview(fromUsername, true)
      await loadNotifications(fromUsername, true)
      setBannerMessage(`دعوت بازی ${selectedTimeControl.timeControlMinutes}+${selectedTimeControl.incrementSeconds} برای ${toUsername} ارسال شد.`)
      router.push(`/online?room=${roomId}`)
    } catch {
      setBannerMessage('خطا در ارسال دعوت بازی.')
    } finally {
      setIsInviteActionLoading(false)
    }
  }

  const handleRespondGameInvite = async (invite: GameInviteItem, action: 'accept' | 'reject') => {
    const username = profileName.trim()
    if (!username) {
      setBannerMessage('ابتدا وارد حساب کاربری شوید.')
      return
    }

    setIsInviteActionLoading(true)
    setBannerMessage(null)
    try {
      const response = await fetch('/api/profile?action=gameInviteRespond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          inviteId: invite.id,
          action,
        }),
      })
      const payload = await parseJsonSafe(response)
      if (!response.ok) {
        setBannerMessage(payload.error?.message ?? 'پاسخ به دعوت بازی انجام نشد.')
        return
      }

      await loadFriendsOverview(username, true)
      await loadNotifications(username, true)

      if (action === 'accept') {
        const joinResponse = await joinRoom({ roomId: invite.roomId, name: username, clientId: username })
        localStorage.setItem(
          'realtime-chess-session',
          JSON.stringify({ roomId: invite.roomId, session: joinResponse.session })
        )
        setBannerMessage(`دعوت بازی ${invite.fromUsername} را قبول کردی.`)
        router.push(`/online?room=${invite.roomId}`)
      } else {
        setBannerMessage(`دعوت بازی ${invite.fromUsername} رد شد.`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'خطا در پاسخ به دعوت بازی.'
      setBannerMessage(message)
    } finally {
      setIsInviteActionLoading(false)
    }
  }

  const handleBackToHomeMenu = () => {
    setHomePanel('menu')
  }

  const handleToggleTimeControlOptions = () => {
    setIsTimeControlOptionsOpen((previous) => !previous)
  }

  const handleSelectTimeControl = (optionId: string) => {
    const selectedOption = ONLINE_TIME_CONTROL_OPTIONS.find((option) => option.id === optionId)
    if (!selectedOption) {
      return
    }
    setSelectedTimeControlId(selectedOption.id)
    localStorage.setItem(ONLINE_TIME_CONTROL_STORAGE_KEY, selectedOption.id)
    setIsTimeControlOptionsOpen(false)
    setBannerMessage(null)
  }

  const selectedTimeControlLabel =
    ONLINE_TIME_CONTROL_OPTIONS.find((option) => option.id === selectedTimeControlId)?.label ?? 'Rapid • 10+2'

    const handleSubmitAuth = async () => {
    if (!storageReady) {
      setBannerMessage('ذخیره‌سازی پایدار حساب کاربری روی سرور فعال نیست. لطفاً به ادمین اطلاع دهید.');
      return
    }
    const normalized = draftName.trim()
    if (normalized.length < 3) {
      setBannerMessage('نام اکانت باید حداقل ۳ کاراکتر باشد.')
      return
    }
    if (password.length < 6) {
      setBannerMessage('رمز عبور باید حداقل ۶ کاراکتر باشد.')
      return
    }
    if (profileMode === 'register' && password !== confirmPassword) {
      setBannerMessage('تکرار رمز عبور با رمز عبور یکسان نیست.')
      return
    }

    setIsSubmitting(true)
    setBannerMessage(null)
    try {
      const response = await fetch(`/api/profile?action=${profileMode === 'register' ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          profileMode === 'register'
            ? { username: normalized, password, confirmPassword }
            : { username: normalized, password }
        ),
      })
      const payload = await parseJsonSafe(response)
      if (!response.ok) {
        setBannerMessage(payload.error?.message ?? 'عملیات پروفایل انجام نشد.')
        return
      }

      const savedName = payload.user?.username ?? normalized
      localStorage.setItem(PROFILE_USERNAME_STORAGE_KEY, savedName)
      setProfileName(savedName)
      setDraftName(savedName)
      setIsGuestMode(false)
      setUsernameEditValue(savedName)
      setIsAuthenticated(true)
      setActiveTab('profile')
      setPassword('')
      setConfirmPassword('')
      setFriendSearchQuery('')
      setFriendSearchResults([])
      await loadFriendsOverview(savedName, true)
      setBannerMessage(profileMode === 'register' ? 'ثبت نام با موفقیت انجام شد.' : 'ورود با موفقیت انجام شد.')
      
    } catch {
      setBannerMessage('خطا در ارتباط با سرور پروفایل.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveUsername = async () => {
    const currentUsername = profileName.trim()
    const newUsername = usernameEditValue.trim()

    if (!currentUsername) {
      setBannerMessage('ابتدا وارد حساب کاربری شوید.')
      return
    }
    if (newUsername.length < 3) {
      setBannerMessage('نام کاربری باید حداقل ۳ کاراکتر باشد.')
      return
    }

    setIsSubmitting(true)
    setBannerMessage(null)
    try {
      const response = await fetch('/api/profile?action=updateUsername', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUsername,
          newUsername,
        }),
      })
      const payload = await parseJsonSafe(response)
      if (!response.ok) {
        setBannerMessage(payload.error?.message ?? 'تغییر نام کاربری انجام نشد.')
        return
      }

      const savedName = payload.user?.username ?? newUsername
      localStorage.setItem(PROFILE_USERNAME_STORAGE_KEY, savedName)
      setProfileName(savedName)
      setDraftName(savedName)
      setUsernameEditValue(savedName)
      setIsEditingUsername(false)
      setFriendSearchQuery('')
      setFriendSearchResults([])
      await loadFriendsOverview(savedName, true)
      setBannerMessage('نام کاربری با موفقیت تغییر کرد.')
    } catch {
      setBannerMessage('خطا در ارتباط با سرور پروفایل.')
    } finally {
      setIsSubmitting(false)
    }
  }



  const handleSendFriendRequest = async (targetUsername: string) => {
    const fromUsername = profileName.trim()
    if (!fromUsername) {
      setBannerMessage('ابتدا وارد حساب کاربری شوید.')
      return
    }

    setFriendsLoading(true)
    setBannerMessage(null)
    try {
      const response = await fetch('/api/profile?action=sendFriendRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUsername,
          toUsername: targetUsername,
        }),
      })
      const payload = await parseJsonSafe(response)
      if (!response.ok) {
        setBannerMessage(payload.error?.message ?? 'ارسال درخواست دوستی انجام نشد.')
        return
      }

      await loadFriendsOverview(fromUsername, true)
      await searchUsers(fromUsername, friendSearchQuery)
      setBannerMessage(`درخواست دوستی برای ${targetUsername} ارسال شد.`)
    } catch {
      setBannerMessage('خطا در ارسال درخواست دوستی.')
    } finally {
      setFriendsLoading(false)
    }
  }

  const handleRespondFriendRequest = async (fromUsername: string, action: 'accept' | 'reject') => {
    const username = profileName.trim()
    if (!username) {
      setBannerMessage('ابتدا وارد حساب کاربری شوید.')
      return
    }

    setFriendsLoading(true)
    setBannerMessage(null)
    try {
      const response = await fetch('/api/profile?action=respondFriendRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          fromUsername,
          action,
        }),
      })
      const payload = await parseJsonSafe(response)
      if (!response.ok) {
        setBannerMessage(payload.error?.message ?? 'پاسخ به درخواست دوستی انجام نشد.')
        return
      }

      await loadFriendsOverview(username, true)
      await searchUsers(username, friendSearchQuery)
      setBannerMessage(action === 'accept' ? `درخواست ${fromUsername} تایید شد.` : `درخواست ${fromUsername} رد شد.`)
    } catch {
      setBannerMessage('خطا در ثبت پاسخ درخواست دوستی.')
    } finally {
      setFriendsLoading(false)
    }
  }

  const handleCancelOutgoingRequest = async (toUsername: string) => {
    const username = profileName.trim()
    if (!username) {
      setBannerMessage('ابتدا وارد حساب کاربری شوید.')
      return
    }

    setFriendsLoading(true)
    setBannerMessage(null)
    try {
      const response = await fetch('/api/profile?action=cancelOutgoingRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          toUsername,
        }),
      })
      const payload = await parseJsonSafe(response)
      if (!response.ok) {
        setBannerMessage(payload.error?.message ?? 'لغو درخواست دوستی انجام نشد.')
        return
      }

      await loadFriendsOverview(username, true)
      await searchUsers(username, friendSearchQuery)
      setBannerMessage(`درخواست ارسالی به ${toUsername} لغو شد.`)
    } catch {
      setBannerMessage('خطا در لغو درخواست دوستی.')
    } finally {
      setFriendsLoading(false)
    }
  }

  const handleRemoveFriend = async (friendUsername: string) => {
    const username = profileName.trim()
    if (!username) {
      setBannerMessage('ابتدا وارد حساب کاربری شوید.')
      return
    }

    setFriendsLoading(true)
    setBannerMessage(null)
    try {
      const response = await fetch('/api/profile?action=removeFriend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          friendUsername,
        }),
      })
      const payload = await parseJsonSafe(response)
      if (!response.ok) {
        setBannerMessage(payload.error?.message ?? 'حذف دوست انجام نشد.')
        return
      }

      await loadFriendsOverview(username, true)
      await searchUsers(username, friendSearchQuery)
      setBannerMessage(`${friendUsername} از لیست دوستان حذف شد.`)
    } catch {
      setBannerMessage('خطا در حذف دوست.')
    } finally {
      setFriendsLoading(false)
    }
  }

  const handleMarkNotificationsRead = async (notificationIds?: string[]) => {
    const username = profileName.trim()
    if (!username) {
      return
    }

    setFriendsLoading(true)
    try {
      const response = await fetch('/api/profile?action=markNotificationsRead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          notificationIds: notificationIds ?? [],
        }),
      })
      const payload = await parseJsonSafe(response)
      if (!response.ok) {
        setBannerMessage(payload.error?.message ?? 'به‌روزرسانی نوتیف‌ها انجام نشد.')
        return
      }

      if (typeof payload.unreadCount === 'number') {
        setNotificationUnreadCount(payload.unreadCount)
      }
      await loadNotifications(username, true)
    } catch {
      setBannerMessage('خطا در به‌روزرسانی نوتیف‌ها.')
    } finally {
      setFriendsLoading(false)
    }
  }

  const handleToastClose = useCallback(() => {
    setBannerMessage(null)
  }, [])

  const handleLogout = () => {
    clearAuthState('با موفقیت از حساب کاربری خارج شدید.')
    setProfileMode('login')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100" dir="rtl">
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-4">
          {activeTab === 'home' ? (
            isFindingOpponent ? (
              <section className="rounded-2xl border border-cyan-400/30 bg-slate-900/90 p-6 text-center shadow-xl">
                <h2 className="text-xl font-bold text-slate-100">در حال پیدا کردن حریف...</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {matchmakingStatusMessage ?? 'لطفاً کمی صبر کنید، سیستم در حال جستجوی حریف مناسب با زمان انتخاب‌شده است.'}
                </p>
                {matchmakingError ? (
                  <p className="mt-3 rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {matchmakingError}
                  </p>
                ) : null}
                <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      clearMatchmaking()
                      setBannerMessage('جستجوی حریف لغو شد.')
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                  >
                    لغو جستجو
                  </button>
                </div>
              </section>
            ) : (
              <HomeContent
                onStartOnline={handleStartOnline}
                onOpenFriendPlay={handleOpenFriendPlay}
                onStartBotGame={handleStartBotGame}
                onStartPersonalGame={handleStartPersonalGame}
                onOpenInviteModal={handleOpenInviteModal}
                onRespondGameInvite={handleRespondGameInvite}
                onBackToMenu={handleBackToHomeMenu}
                onToggleTimeControlOptions={handleToggleTimeControlOptions}
                onSelectTimeControl={handleSelectTimeControl}
                homePanel={homePanel}
                friendPresence={friendPresence}
                incomingGameInvites={incomingGameInvites}
                isInviteActionLoading={isInviteActionLoading}
                selectedTimeControlLabel={selectedTimeControlLabel}
                isTimeControlOptionsOpen={isTimeControlOptionsOpen}
                timeControlOptions={ONLINE_TIME_CONTROL_OPTIONS}
                isStartingOnline={isStartingOnline}
                isGuestMode={isGuestMode}
                selectedTimeControlId={selectedTimeControlId}
              />
            )
          ) : null}

          {activeTab === 'profile' ? (
            <ProfileContent
              isAuthenticated={isAuthenticated}
              mode={profileMode}
              onModeChange={(mode) => {
                setProfileMode(mode)
                setPassword('')
                setConfirmPassword('')
                setBannerMessage(null)
              }}
              profileName={profileName}
              draftName={draftName}
              password={password}
              confirmPassword={confirmPassword}
              onDraftNameChange={setDraftName}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              selectedLevel={selectedLevel}
              onSelectedLevelChange={setSelectedLevel}
              onSubmit={handleSubmitAuth}
              isSubmitting={isSubmitting}
              usernameEditValue={usernameEditValue}
              onUsernameEditValueChange={setUsernameEditValue}
              isEditingUsername={isEditingUsername}
              onToggleUsernameEdit={() => {
                setIsEditingUsername(true)
                setUsernameEditValue(profileName)
              }}
              onSaveUsername={handleSaveUsername}
              friends={friends}
              incomingRequests={incomingRequests}
              outgoingRequests={outgoingRequests}
              incomingRequestCount={incomingRequestCount}
              friendSearchQuery={friendSearchQuery}
              onFriendSearchQueryChange={setFriendSearchQuery}
              friendSearchResults={friendSearchResults}
              onSendFriendRequest={handleSendFriendRequest}
              onRespondFriendRequest={handleRespondFriendRequest}
              onCancelOutgoingRequest={handleCancelOutgoingRequest}
              onRemoveFriend={handleRemoveFriend}
              activePanel={activePanel}
              onPanelChange={setActivePanel}
              notifications={notifications}
              notificationUnreadCount={notificationUnreadCount}
              onMarkNotificationsRead={handleMarkNotificationsRead}
              onLogout={handleLogout}
              onPlayAsGuest={handlePlayAsGuest}
              isStartingOnline={isStartingOnline}
              friendsLoading={friendsLoading}
              avatar={avatar}
            />
          ) : null}

          {activeTab === 'puzzle' ? <PlaceholderContent title="پازل" /> : null}
          {activeTab === 'news' ? (
            <NewsContent activeSection={activeNewsSection} onSectionChange={setActiveNewsSection} />
          ) : null}

          {isInviteModalOpen ? (
            <section
              className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4"
              data-testid="friend-invite-modal"
            >
              <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-100">دعوت به بازی با {selectedInviteFriendUsername}</h3>
                  <button
                    type="button"
                    onClick={handleCloseInviteModal}
                    data-testid="friend-invite-close-btn"
                    className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 transition hover:bg-slate-800"
                  >
                    بستن
                  </button>
                </div>
                <label className="block space-y-2">
                  <span className="text-xs text-slate-400">زمان بازی</span>
                  <select
                    value={selectedInviteTimeControlId}
                    onChange={(event) => handleSelectInviteTimeControl(event.target.value)}
                    data-testid="friend-invite-time-select"
                    className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring-2"
                  >
                    {FRIEND_INVITE_TIME_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleSendGameInvite}
                  disabled={isInviteActionLoading}
                  data-testid="friend-invite-send-btn"
                  className="w-full rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isInviteActionLoading ? 'در حال ارسال...' : 'ارسال درخواست بازی'}
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-slate-700 bg-slate-950/95 px-3 pb-4 pt-3 backdrop-blur">
        <nav className="mx-auto grid w-full max-w-md grid-cols-4 gap-2">
          {FOOTER_ITEMS.map((item) => {
            const isActive = item.id === activeTab
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id)
                  if (item.id === 'news') {
                    setActiveNewsSection('news')
                  }
                  if (item.id !== 'home') {
                    setHomePanel('menu')
                  }
                }}
                data-testid={`footer-tab-${item.id}`}
                className={[
                  'flex items-center justify-center rounded-xl p-3 transition',
                  isActive ? 'bg-cyan-400' : 'bg-slate-800 hover:bg-slate-700',
                ].join(' ')}
              >
                <img src={item.icon} alt={item.id} className={['h-12 w-12', item.rotate].filter(Boolean).join(' ')} />
              </button>
            )
          })}
        </nav>
      </footer>

      <Toast
        message={bannerMessage}
        onClose={handleToastClose}
        type={toastType}
      />
    </main>
  )
}
