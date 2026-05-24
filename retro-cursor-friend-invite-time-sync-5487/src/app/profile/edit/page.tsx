'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PROFILE_USERNAME_STORAGE_KEY } from '@/lib/profile/constants'
import { allProvinces, getCitiesByProvinceId } from '@/data/iran-provinces-cities'
import type { City } from '@/data/iran-provinces-cities'
import { Toast } from '@/components/ui/toast'

export default function EditProfilePage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [nameField, setNameField] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarChanged, setAvatarChanged] = useState(false)
  const [originalAvatar, setOriginalAvatar] = useState('')
  const [citiesForProvince, setCitiesForProvince] = useState<City[]>([])
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editTempValue, setEditTempValue] = useState('')
  const [editOriginalValue, setEditOriginalValue] = useState('')
  const [activeDropdownField, setActiveDropdownField] = useState<string | null>(null)
  const [usernameAvailability, setUsernameAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info')

  const usernameCheckTimeoutRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const avatarRef = useRef('')
  const provinceRef = useRef('')
  const cityRef = useRef('')
  const phoneRef = useRef('')
  const emailRef = useRef('')
  const nameFieldRef = useRef('')

  useEffect(() => {
    const storedUsername = localStorage.getItem(PROFILE_USERNAME_STORAGE_KEY)?.trim() ?? ''
    if (!storedUsername) {
      router.push('/')
      return
    }
    setUsername(storedUsername)
    loadProfile(storedUsername)
  }, [router])

  async function loadProfile(user: string) {
    try {
      const res = await fetch('/api/profile?action=get-profile&username=' + encodeURIComponent(user))
      const data = await res.json()
      if (data.user) {
        const a = data.user.avatar ?? ''
        const n = data.user.username ?? ''
        const p = data.user.province ?? ''
        const c = data.user.city ?? ''
        const ph = data.user.phone ?? ''
        const e = data.user.email ?? ''
        setAvatar(a); avatarRef.current = a
        setOriginalAvatar(a)
        setNameField(n); nameFieldRef.current = n
        setProvince(p); provinceRef.current = p
        setCity(c); cityRef.current = c
        setPhone(ph); phoneRef.current = ph
        setEmail(e); emailRef.current = e
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (province) {
      setCitiesForProvince(getCitiesByProvinceId(province))
    } else {
      setCitiesForProvince([])
    }
  }, [province])

  function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarChanged(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      avatarRef.current = result
      setAvatar(result)
    }
    reader.readAsDataURL(file)
  }

  async function handleAvatarSave() {
    setIsSaving(true)
    setErrors({})
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, action: 'update-profile', avatar: avatarRef.current, province: provinceRef.current, city: cityRef.current, phone: phoneRef.current, email: emailRef.current }),
      })
      const data = await res.json()
      if (!res.ok) {
        setToastMessage(data?.error?.message ?? 'خطا در ذخیره تصویر')
        setToastType('error')
        return
      }
      setAvatarChanged(false)
      setOriginalAvatar(avatar)
      setToastMessage('تصویر پروفایل ذخیره شد')
      setToastType('success')
    } catch {
      setToastMessage('خطا در ارتباط با سرور')
      setToastType('error')
    } finally {
      setIsSaving(false)
    }
  }

  function handleAvatarCancel() {
    setAvatar(originalAvatar)
    setAvatarFile(null)
    setAvatarChanged(false)
  }

  async function handleAvatarDelete() {
    setIsSaving(true)
    setErrors({})
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, action: 'update-profile', avatar: '' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors({ form: data?.error?.message ?? 'خطا در حذف تصویر' })
        return
      }
      setAvatar('')
      avatarRef.current = ''
      setOriginalAvatar('')
      setAvatarFile(null)
      setAvatarChanged(false)
      setSuccessMessage('تصویر پروفایل حذف شد')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch {
      setErrors({ form: 'خطا در ارتباط با سرور' })
    } finally {
      setIsSaving(false)
    }
  }

  function handleBack() {
    router.push('/?tab=profile')
  }

  function getFieldValue(fieldKey: string): string {
    switch (fieldKey) {
      case 'nameField': return nameField
      case 'province': return province
      case 'city': return city
      case 'phone': return phone
      case 'email': return email
      default: return ''
    }
  }

  function handleFieldChange(fieldKey: string, value: string) {
    switch (fieldKey) {
      case 'nameField': setNameField(value); nameFieldRef.current = value; break
      case 'province': setProvince(value); provinceRef.current = value; setCity(''); cityRef.current = ''; break
      case 'city': setCity(value); cityRef.current = value; break
      case 'phone': setPhone(value); phoneRef.current = value; break
      case 'email': setEmail(value); emailRef.current = value; break
    }
  }

  function startEditing(fieldKey: string) {
    setEditTempValue(getFieldValue(fieldKey))
    setEditOriginalValue(getFieldValue(fieldKey))
    setEditingField(fieldKey)
    if (fieldKey === 'province' || fieldKey === 'city') {
      setActiveDropdownField(fieldKey)
    }
  }

  function cancelEditing() {
    if (editingField) {
      handleFieldChange(editingField, editOriginalValue)
    }
    setEditingField(null)
    setEditTempValue('')
    setActiveDropdownField(null)
  }

  async function confirmEditing() {
    if (!editingField) return
    const fieldKey = editingField
    const newValue = editTempValue
    const oldValue = editOriginalValue

    // Update local state + refs immediately
    handleFieldChange(fieldKey, newValue)
    setEditingField(null)
    setEditTempValue('')
    setActiveDropdownField(null)

    setIsSaving(true)
    setErrors({})
    try {
      if (fieldKey === 'nameField') {
        const res = await fetch('/api/profile?action=updateUsername', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentUsername: oldValue, newUsername: newValue }),
        })
        const data = await res.json()
        if (!res.ok) {
          setToastMessage(data?.error?.message ?? 'خطا در تغییر نام کاربری')
          setToastType('error')
          handleFieldChange(fieldKey, oldValue)
          return
        }
      } else {
        // Use refs to always have latest values, then override with the edited field
        const body: Record<string, string> = {
          username,
          action: 'update-profile',
          avatar: avatarRef.current,
          province: fieldKey === 'province' ? newValue : provinceRef.current,
          city: fieldKey === 'city' ? newValue : (fieldKey === 'province' ? '' : cityRef.current),
          phone: fieldKey === 'phone' ? newValue : phoneRef.current,
          email: fieldKey === 'email' ? newValue : emailRef.current,
        }

        const res = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) {
          setToastMessage(data?.error?.message ?? 'خطا در ذخیره اطلاعات')
          setToastType('error')
          handleFieldChange(fieldKey, oldValue)
          return
        }
      }
      setToastMessage('پروفایل با موفقیت به‌روزرسانی شد')
      setToastType('success')
    } catch {
      setToastMessage('خطا در ارتباط با سرور')
      setToastType('error')
      handleFieldChange(fieldKey, oldValue)
    } finally {
      setIsSaving(false)
    }
  }

  function onProvinceCitySelect(fieldKey: string, value: string) {
    handleFieldChange(fieldKey, value)
    setEditTempValue(value)
    setActiveDropdownField(null)
  }

  function getProvinceName(id: string): string {
    const p = allProvinces.find(pr => pr.id === id)
    return p ? p.name : ''
  }

  function getCityName(id: string): string {
    const c = citiesForProvince.find(ci => ci.id === id)
    return c ? c.name : ''
  }

  async function checkUsernameAvailability(value: string) {
    const trimmed = value.trim()
    if (trimmed.length < 3 || trimmed === nameField) {
      setUsernameAvailability('idle')
      return
    }

    setUsernameAvailability('checking')
    try {
      const res = await fetch('/api/profile?action=checkUsername&username=' + encodeURIComponent(trimmed))
      const data = await res.json()
      if (data.available) {
        setUsernameAvailability('available')
      } else {
        setUsernameAvailability('taken')
      }
    } catch {
      setUsernameAvailability('idle')
    }
  }

  function debouncedUsernameCheck(value: string) {
    if (usernameCheckTimeoutRef.current !== null) {
      window.clearTimeout(usernameCheckTimeoutRef.current)
    }
    if (value.trim().length < 3 || value.trim() === nameField) {
      setUsernameAvailability('idle')
      return
    }
    usernameCheckTimeoutRef.current = window.setTimeout(() => {
      usernameCheckTimeoutRef.current = null
      void checkUsernameAvailability(value)
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (usernameCheckTimeoutRef.current !== null) {
        window.clearTimeout(usernameCheckTimeoutRef.current)
      }
    }
  }, [])

  const textFieldKeys = ['nameField', 'phone', 'email']
  const isTextField = (key: string) => textFieldKeys.includes(key)
  const isProvinceField = (key: string) => key === 'province'
  const isCityField = (key: string) => key === 'city'

  function renderFieldRow(label: string, currentValue: string, fieldKey: string) {
    const isEditing = editingField === fieldKey
    const isLocDropdown = isProvinceField(fieldKey) || isCityField(fieldKey)

    return (
      <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
        <p className="mb-2 text-xs text-slate-400">{label}</p>
        <div className="relative flex items-center gap-2">
          {isEditing && isTextField(fieldKey) ? (
            <>
              <input
                ref={editInputRef}
                type={fieldKey === 'email' ? 'email' : fieldKey === 'phone' ? 'tel' : 'text'}
                value={editTempValue}
                onChange={(e) => {
                  setEditTempValue(e.target.value)
                  if (fieldKey === 'nameField') {
                    debouncedUsernameCheck(e.target.value)
                  }
                }}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring-2"
                autoFocus
                dir={fieldKey === 'phone' ? 'ltr' : 'rtl'}
              />
              <button
                type="button"
                onClick={confirmEditing}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-500 p-2 text-white transition hover:bg-emerald-400 disabled:opacity-60"
                aria-label="ذخیره"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                  <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center justify-center rounded-lg border border-slate-600 p-2 text-slate-200 transition hover:bg-slate-800"
                aria-label="انصراف"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                  <path d="m19 6.4-1.4-1.4L12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <p className="flex-1 text-sm font-semibold text-slate-100">
                {currentValue || <span className="text-slate-500">وارد نشده</span>}
              </p>
              {isEditing && isLocDropdown ? (
                <>
                  <button
                    type="button"
                    onClick={confirmEditing}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-500 p-2 text-white transition hover:bg-emerald-400 disabled:opacity-60"
                    aria-label="ذخیره"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-600 p-2 text-slate-200 transition hover:bg-slate-800"
                    aria-label="انصراف"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                      <path d="m19 6.4-1.4-1.4L12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => startEditing(fieldKey)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-600 p-2 text-slate-200 transition hover:bg-slate-800"
                  aria-label={'ویرایش ' + label}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-2.79Z" fill="currentColor" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
        {fieldKey === 'nameField' && isEditing && usernameAvailability !== 'idle' && (
          <div className="mt-2">
            {usernameAvailability === 'checking' && (
              <p className="text-xs text-slate-400">در حال بررسی...</p>
            )}
            {usernameAvailability === 'available' && (
              <p className="text-xs text-emerald-400">این نام کاربری در دسترس است</p>
            )}
            {usernameAvailability === 'taken' && (
              <p className="text-xs text-rose-400">این نام کاربری قبلاً ثبت شده است</p>
            )}
          </div>
        )}
        {activeDropdownField === fieldKey && isLocDropdown && (
          <div className="relative mt-2">
            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownField(null)} />
            <div className="absolute left-0 right-0 z-20 max-h-48 overflow-y-auto rounded-lg border border-slate-600 bg-slate-900 shadow-xl">
              {isProvinceField(fieldKey) ? (
                allProvinces.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">لیست استان‌ها خالی است</p>
                ) : (
                  allProvinces.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onProvinceCitySelect('province', p.id)}
                      className={'w-full px-4 py-2.5 text-right text-sm transition hover:bg-slate-800 ' + (editTempValue === p.id ? 'bg-cyan-500/15 text-cyan-200 font-semibold' : 'text-slate-200')}
                    >
                      {p.name}
                    </button>
                  ))
                )
              ) : (
                citiesForProvince.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">لطفاً ابتدا استان را انتخاب کنید</p>
                ) : (
                  citiesForProvince.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onProvinceCitySelect('city', c.id)}
                      className={'w-full px-4 py-2.5 text-right text-sm transition hover:bg-slate-800 ' + (editTempValue === c.id ? 'bg-cyan-500/15 text-cyan-200 font-semibold' : 'text-slate-200')}
                    >
                      {c.name}
                    </button>
                  ))
                )
              )}
            </div>
          </div>
        )}
      </div>
    )
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
          <h1 className="text-2xl font-bold text-slate-100">ویرایش پروفایل</h1>
        </div>

        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          type={toastType}
        />

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-slate-200">تصویر پروفایل</h2>
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div
                  onClick={handleAvatarClick}
                  className="flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-500 bg-slate-800 transition hover:border-cyan-400"
                >
                  {avatar ? (
                    <img src={avatar} alt="تصویر پروفایل" className="h-full w-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 text-slate-400" fill="currentColor">
                      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
                      <path d="M9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9Zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
                    </svg>
                  )}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="rounded-full bg-cyan-400 p-1.5 text-slate-950 shadow-lg transition hover:bg-cyan-300"
                    aria-label="تغییر تصویر"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-2.79Z" fill="currentColor" />
                    </svg>
                  </button>
                  {avatar ? (
                    <button
                      type="button"
                      onClick={handleAvatarDelete}
                      disabled={isSaving}
                      className="rounded-full bg-rose-400 p-1.5 text-slate-950 shadow-lg transition hover:bg-rose-300"
                      aria-label="حذف تصویر"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
              {avatarChanged && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAvatarSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-500 p-2 text-white transition hover:bg-emerald-400 disabled:opacity-60"
                    aria-label="ذخیره تصویر"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleAvatarCancel}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-600 p-2 text-slate-200 transition hover:bg-slate-800"
                    aria-label="انصراف"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                      <path d="m19 6.4-1.4-1.4L12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-slate-200">اطلاعات کاربری</h2>
            <div className="space-y-3">
              {renderFieldRow('نام کاربری', nameField, 'nameField')}
              {renderFieldRow('استان', getProvinceName(province), 'province')}
              {renderFieldRow('شهر', getCityName(city), 'city')}
              {renderFieldRow('شماره تلفن', phone, 'phone')}
              {renderFieldRow('ایمیل', email, 'email')}
            </div>
          </div>



        </div>
      </div>
    </div>
  )
}