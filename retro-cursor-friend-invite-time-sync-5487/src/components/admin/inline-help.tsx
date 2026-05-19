'use client'

import React from 'react'

interface InlineHelpProps {
  text: string
  className?: string
}

export function InlineHelp({ text, className = '' }: InlineHelpProps) {
  return (
    <span
      dir="rtl"
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] leading-5 bg-background text-muted-foreground border-border ml-2 ${className}`}
    >
      {text}
    </span>
  )
}


