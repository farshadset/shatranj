'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string | null
  onClose: () => void
  duration?: number
  type?: 'info' | 'success' | 'error'
}

export function Toast({ message, onClose, duration = 2000, type = 'info' }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const [renderedMessage, setRenderedMessage] = useState<string | null>(null)

  useEffect(() => {
    if (message) {
      setRenderedMessage(message)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true)
        })
      })

      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => {
          onClose()
          setRenderedMessage(null)
        }, 300)
      }, duration)

      return () => clearTimeout(timer)
    } else {
      setVisible(false)
      setRenderedMessage(null)
    }
  }, [message, duration, onClose])

  if (!renderedMessage) return null

  const bgColor = type === 'error' ? 'bg-rose-600' : type === 'success' ? 'bg-emerald-600' : 'bg-cyan-600'

  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2">
      <div
        className={`rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-300 ${bgColor} ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
        data-testid="toast-message"
      >
        {renderedMessage}
      </div>
    </div>
  )
}