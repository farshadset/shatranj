'use client'

import React, { useRef, useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface HelpTooltipProps {
  content: string
  className?: string
}

export function HelpTooltip({ content, className = '' }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const touchTimerRef = useRef<number | null>(null)

  const handleMouseEnter = () => setIsVisible(true)
  const handleMouseLeave = () => setIsVisible(false)

  const handleTouchStart: React.TouchEventHandler<HTMLButtonElement> = () => {
    if (touchTimerRef.current) window.clearTimeout(touchTimerRef.current)
    touchTimerRef.current = window.setTimeout(() => {
      setIsVisible(true)
    }, 350) // long-press threshold
  }

  const handleTouchEnd: React.TouchEventHandler<HTMLButtonElement> = () => {
    if (touchTimerRef.current) window.clearTimeout(touchTimerRef.current)
    setIsVisible(false)
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <HelpCircle size={14} />
      </button>
      
      {isVisible && (
        <div className="absolute bottom-full right-0 mb-2 z-50">
          <div 
            className="relative bg-card text-foreground text-xs rounded-md px-2.5 py-1 shadow-lg border border-border max-w-sm whitespace-nowrap font-body"
            dir="rtl"
          >
            <div className="text-right">{content}</div>
            {/* Arrow */}
            <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent" style={{ borderTopColor: 'hsl(var(--card))' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}
