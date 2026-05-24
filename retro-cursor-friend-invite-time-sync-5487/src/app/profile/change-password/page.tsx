'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PROFILE_USERNAME_STORAGE_KEY } from '@/lib/profile/constants'
import { Toast } from '@/components/ui/toast'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info')

  useEffect(() => {
    const storedUsername = localStorage.getItem(PROFILE_USERNAME_STORAGE_KEY)?.trim() ?? ''
    if (!storedUsername) {
      router.push('/')
      return
    }
    setUsername(storedUsername)
    setIsLoading(false)
  }, [router])

  function handleBack() {
    router.push('/?tab=profile')
  }

  async function handleChangePassword() {
    if (!currentPassword) {
      setToastMessage('رمز عبور فعلی را وارد کنید.')
      setToastType('error')
      return
    }
    if (newPassword.length < 6) {
      setToastMessage('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.')
      setToastType('error')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setToastMessage('تکرار رمز عبور جدید با هم یکسان نیست.')
      setToastType('error')
      return
    }

    setIsChangingPassword(true)
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setToastMessage(data?.error?.message ?? 'خطا در تغییر رمز عبور')
        setToastType('error')
        return
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setToastMessage('رمز عبور با موفقیت تغییر کرد')
      setToastType('success')
    } catch {
      setToastMessage('خطا در ارتباط با سرور')
      setToastType('error')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-slate-400">در حال بارگذاری...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" dir="rtl">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg border border-slate-600 p-2 text-slate-200 transition hover:bg-slate-800"
            aria-label="بازگشت"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-100">تغییر رمز عبور</h1>
        </div>

        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          type={toastType}
        />

        <div id="change-password-section" className="space-y-3 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-sm font-semibold text-slate-200">تغییر رمز عبور</p>
          <label className="block space-y-2">
            <span className="text-xs text-slate-400">رمز عبور فعلی</span>
            <input
              data-testid="profile-current-password-input"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring-2"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs text-slate-400">رمز عبور جدید</span>
            <input
              data-testid="profile-new-password-input"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring-2"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs text-slate-400">تکرار رمز عبور جدید</span>
            <input
              data-testid="profile-confirm-new-password-input"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring-2"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </label>
          <button
            type="button"
            data-testid="profile-change-password-btn"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="w-full rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChangingPassword ? 'در حال تغییر...' : 'تغییر رمز عبور'}
          </button>
        </div>
      </div>
    </div>
  )
}