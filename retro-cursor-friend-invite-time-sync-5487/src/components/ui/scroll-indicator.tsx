'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ScrollIndicatorProps {
  activeCategory: string
  className?: string
}

export function ScrollIndicator({ activeCategory, className }: ScrollIndicatorProps) {
  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg text-sm font-medium",
      className
    )}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></div>
        <span>دسته‌بندی فعال: {activeCategory}</span>
      </div>
    </div>
  )
}
