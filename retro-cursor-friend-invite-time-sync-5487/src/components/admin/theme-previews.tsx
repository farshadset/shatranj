'use client'

import React from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeConfig } from '@/types/theme'

interface PreviewProps {
  theme: ThemeConfig
  className?: string
}

// Color Preview Component
export function ColorPreview({ theme, className }: PreviewProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <div 
            className="w-full h-8 rounded border"
            style={{ backgroundColor: `hsl(${theme.colors.background})` }}
          />
          <p className="text-xs text-center">پس‌زمینه</p>
        </div>
        <div className="space-y-1">
          <div 
            className="w-full h-8 rounded border"
            style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
          />
          <p className="text-xs text-center">اصلی</p>
        </div>
        <div className="space-y-1">
          <div 
            className="w-full h-8 rounded border"
            style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
          />
          <p className="text-xs text-center">تاکیدی</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div 
            className="w-full h-6 rounded border"
            style={{ backgroundColor: `hsl(${theme.colors.card})` }}
          />
          <p className="text-xs text-center">کارت</p>
        </div>
        <div className="space-y-1">
          <div 
            className="w-full h-6 rounded border"
            style={{ backgroundColor: `hsl(${theme.colors.border})` }}
          />
          <p className="text-xs text-center">حاشیه</p>
        </div>
      </div>
    </div>
  )
}

// Typography Preview Component
export function TypographyPreview({ theme, className }: PreviewProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div 
        className="text-center"
        style={{ 
          fontFamily: theme.typography.headlineFontFamily,
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: theme.typography.fontWeight.bold,
          color: `hsl(${theme.colors.foreground})`
        }}
      >
        عنوان نمونه
      </div>
      <div 
        className="text-center"
        style={{ 
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.normal,
          color: `hsl(${theme.colors.muted})`
        }}
      >
        این یک متن نمونه است که نحوه نمایش فونت را نشان می‌دهد
      </div>
      <div 
        className="text-center"
        style={{ 
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: `hsl(${theme.colors.primary})`
        }}
      >
        ۱۲۵.۰۰۰ تومان
      </div>
    </div>
  )
}

// Layout Preview Component
export function LayoutPreview({ theme, className }: PreviewProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div 
        className="p-3 border relative"
        style={{ 
          borderColor: `hsl(${theme.colors.border})`,
          borderRadius: theme.layout.borderRadius.lg,
          boxShadow: theme.layout.shadow.md
        }}
      >
        {/* Background layer with opacity */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: `hsl(${theme.colors.card})`,
            opacity: theme.layout.opacity.card,
            borderRadius: theme.layout.borderRadius.lg
          }}
        />
        {/* Content layer - fully opaque */}
        <div className="relative z-10">
          <div 
            className="text-sm font-medium mb-1"
            style={{ color: `hsl(${theme.colors.cardForeground})` }}
          >
            کارت نمونه
          </div>
          <div 
            className="text-xs"
            style={{ color: `hsl(${theme.colors.muted})` }}
          >
            این یک کارت نمونه است
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div 
          className="h-4 border"
          style={{ 
            borderRadius: theme.layout.borderRadius.sm,
            backgroundColor: `hsl(${theme.colors.secondary})`
          }}
        />
        <div 
          className="h-4 border"
          style={{ 
            borderRadius: theme.layout.borderRadius.md,
            backgroundColor: `hsl(${theme.colors.secondary})`
          }}
        />
        <div 
          className="h-4 border"
          style={{ 
            borderRadius: theme.layout.borderRadius.xl,
            backgroundColor: `hsl(${theme.colors.secondary})`
          }}
        />
      </div>
    </div>
  )
}

// Menu Card Preview Component
export function MenuCardPreview({ theme, className }: PreviewProps) {
  return (
    <div className={`${className}`}>
      <div 
        className="relative overflow-hidden transition-all duration-300"
        style={{ 
          borderRadius: theme.layout.borderRadius.xl,
          boxShadow: theme.layout.shadow.lg,
          transform: `scale(0.8)`,
          transformOrigin: 'center'
        }}
      >
        {/* Card Background Layer - Only this should have opacity */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: `hsl(${theme.colors.card})`,
            opacity: theme.layout.opacity.card,
            borderRadius: theme.layout.borderRadius.xl
          }}
        />
        <div className="flex flex-row-reverse relative z-10">
          {/* Image Section */}
          <div className="w-[30%] flex-shrink-0 overflow-hidden">
            <div className="relative w-full h-20">
              <div 
                className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs text-gray-500"
                style={{ borderRadius: `${theme.layout.borderRadius.lg} 0 0 ${theme.layout.borderRadius.lg}` }}
              >
                تصویر
              </div>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="w-[70%] flex flex-col text-right p-3 relative">
            <h3 
              className="text-sm font-bold mb-1 leading-tight"
              style={{ 
                fontFamily: theme.typography.headlineFontFamily,
                fontWeight: theme.typography.fontWeight.bold,
                color: `hsl(${theme.colors.cardForeground})`
              }}
            >
              نام غذا
            </h3>
            
            <p 
              className="text-xs leading-relaxed mb-2"
              style={{ 
                fontFamily: theme.typography.fontFamily,
                color: `hsl(${theme.colors.muted})`
              }}
            >
              توضیحات کوتاه غذا
            </p>

            {/* Price Display */}
            <div className="absolute bottom-2 right-3">
              <span 
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ 
                  color: `hsl(${theme.colors.primary})`,
                  backgroundColor: `hsl(${theme.colors.primary} / 0.1)`
                }}
              >
                ۲۵.۰۰۰ تومان
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Effects Preview Component
export function EffectsPreview({ theme, className }: PreviewProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div 
        className="p-3 border cursor-pointer transition-all relative"
        style={{ 
          borderColor: `hsl(${theme.colors.border})`,
          borderRadius: theme.layout.borderRadius.lg,
          boxShadow: theme.layout.shadow.md,
          transitionDuration: theme.effects.transitionDuration,
          backdropFilter: `blur(${theme.effects.backdropBlur})`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = `translateY(${theme.effects.hoverTranslateY}) scale(${theme.effects.hoverScale})`
          const bgLayer = e.currentTarget.querySelector('.bg-layer') as HTMLElement
          if (bgLayer) bgLayer.style.opacity = theme.layout.opacity.hover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          const bgLayer = e.currentTarget.querySelector('.bg-layer') as HTMLElement
          if (bgLayer) bgLayer.style.opacity = theme.layout.opacity.card
        }}
      >
        {/* Background layer with opacity */}
        <div 
          className="absolute inset-0 bg-layer"
          style={{ 
            backgroundColor: `hsl(${theme.colors.card})`,
            opacity: theme.layout.opacity.card,
            borderRadius: theme.layout.borderRadius.lg
          }}
        />
        
        {/* Content layer - fully opaque */}
        <div className="relative z-10">
          <div 
            className="text-sm font-medium text-center"
            style={{ color: `hsl(${theme.colors.cardForeground})` }}
          >
            نمونه افکت هاور
          </div>
          <div 
            className="text-xs text-center mt-1"
            style={{ color: `hsl(${theme.colors.muted})` }}
          >
            ماوس را روی این کارت ببرید
          </div>
        </div>
      </div>
    </div>
  )
}

// Complete Theme Preview Component
export function CompleteThemePreview({ theme, className }: PreviewProps) {
  return (
    <div 
      className={`p-4 rounded-lg border ${className}`}
      style={{ 
        backgroundColor: `hsl(${theme.colors.background})`,
        borderColor: `hsl(${theme.colors.border})`
      }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h2 
            className="text-lg font-bold mb-1"
            style={{ 
              fontFamily: theme.typography.headlineFontFamily,
              color: `hsl(${theme.colors.foreground})`
            }}
          >
            RETRO
          </h2>
          <p 
            className="text-sm"
            style={{ 
              fontFamily: theme.typography.fontFamily,
              color: `hsl(${theme.colors.muted})`
            }}
          >
            نمونه منو
          </p>
        </div>

        {/* Sample Menu Cards */}
        <div className="space-y-3">
          <MenuCardPreview theme={theme} />
          <MenuCardPreview theme={theme} />
        </div>

        {/* Sample Button */}
        <div className="text-center">
          <button 
            className="px-4 py-2 rounded font-medium transition-all"
            style={{ 
              backgroundColor: `hsl(${theme.colors.primary})`,
              color: `hsl(${theme.colors.primaryForeground})`,
              borderRadius: theme.layout.borderRadius.md,
              transitionDuration: theme.effects.transitionDuration
            }}
          >
            دکمه نمونه
          </button>
        </div>
      </div>
    </div>
  )
}
