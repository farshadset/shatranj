'use client'

import React from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeConfig } from '@/types/theme'

interface ComprehensivePreviewProps {
  theme: ThemeConfig
  className?: string
}

export function ComprehensivePreview({ theme, className }: ComprehensivePreviewProps) {
  return (
    <div 
      className={`p-6 rounded-lg border overflow-hidden ${className}`}
      style={{ 
        backgroundColor: `hsl(${theme.colors.background})`,
        borderColor: `hsl(${theme.colors.border})`,
        fontFamily: theme.typography.fontFamily
      }}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 
            className="font-bold"
            style={{ 
              fontFamily: theme.typography.headlineFontFamily,
              fontSize: theme.typography.fontSize['4xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: `hsl(${theme.colors.foreground})`,
              lineHeight: theme.typography.lineHeight.tight
            }}
          >
            RETRO
          </h1>
          <p 
            style={{ 
              fontFamily: theme.typography.fontFamily,
              fontSize: theme.typography.fontSize.lg,
              color: `hsl(${theme.colors.muted})`,
              lineHeight: theme.typography.lineHeight.normal
            }}
          >
            پیش‌نمایش زنده تم
          </p>
        </div>

        {/* Typography Showcase */}
        <div className="space-y-3 p-4 border rounded-lg" style={{ borderColor: `hsl(${theme.colors.border})` }}>
          <h3 
            className="font-semibold"
            style={{ 
              fontFamily: theme.typography.headlineFontFamily,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: `hsl(${theme.colors.foreground})`
            }}
          >
            نمونه تایپوگرافی
          </h3>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span style={{ color: `hsl(${theme.colors.muted})` }}>متن عادی: </span>
              <span 
                style={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.normal,
                  color: `hsl(${theme.colors.foreground})`
                }}
              >
                نمونه متن
              </span>
            </div>
            
            <div>
              <span style={{ color: `hsl(${theme.colors.muted})` }}>متن متوسط: </span>
              <span 
                style={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: `hsl(${theme.colors.foreground})`
                }}
              >
                نمونه متن
              </span>
            </div>
            
            <div>
              <span style={{ color: `hsl(${theme.colors.muted})` }}>متن نیمه‌بولد: </span>
              <span 
                style={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: `hsl(${theme.colors.foreground})`
                }}
              >
                نمونه متن
              </span>
            </div>
            
            <div>
              <span style={{ color: `hsl(${theme.colors.muted})` }}>متن بولد: </span>
              <span 
                style={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: `hsl(${theme.colors.foreground})`
                }}
              >
                نمونه متن
              </span>
            </div>
          </div>
        </div>

        {/* Color Palette Display */}
        <div className="space-y-3 p-4 border rounded-lg" style={{ borderColor: `hsl(${theme.colors.border})` }}>
          <h3 
            className="font-semibold"
            style={{ 
              fontFamily: theme.typography.headlineFontFamily,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: `hsl(${theme.colors.foreground})`
            }}
          >
            پالت رنگی
          </h3>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div 
                className="w-full h-8 rounded mb-1"
                style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
              />
              <span style={{ color: `hsl(${theme.colors.muted})` }}>رنگ اصلی</span>
            </div>
            
            <div className="text-center">
              <div 
                className="w-full h-8 rounded mb-1"
                style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
              />
              <span style={{ color: `hsl(${theme.colors.muted})` }}>رنگ تاکیدی</span>
            </div>
            
            <div className="text-center">
              <div 
                className="w-full h-8 rounded mb-1"
                style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
              />
              <span style={{ color: `hsl(${theme.colors.muted})` }}>رنگ ثانویه</span>
            </div>
          </div>
        </div>

        {/* Interactive Elements */}
        <div className="space-y-3 p-4 border rounded-lg" style={{ borderColor: `hsl(${theme.colors.border})` }}>
          <h3 
            className="font-semibold"
            style={{ 
              fontFamily: theme.typography.headlineFontFamily,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: `hsl(${theme.colors.foreground})`
            }}
          >
            عناصر تعاملی
          </h3>
          
          <div className="flex flex-wrap gap-3">
            <button 
              className="px-4 py-2 rounded font-medium transition-all"
              style={{ 
                backgroundColor: `hsl(${theme.colors.primary})`,
                color: `hsl(${theme.colors.primaryForeground})`,
                borderRadius: theme.layout.borderRadius.md,
                transitionDuration: theme.effects.transitionDuration,
                fontFamily: theme.typography.fontFamily,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = `scale(${theme.effects.hoverScale})`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              دکمه اصلی
            </button>
            
            <button 
              className="px-4 py-2 rounded font-medium transition-all border"
              style={{ 
                backgroundColor: 'transparent',
                color: `hsl(${theme.colors.primary})`,
                borderColor: `hsl(${theme.colors.primary})`,
                borderRadius: theme.layout.borderRadius.md,
                transitionDuration: theme.effects.transitionDuration,
                fontFamily: theme.typography.fontFamily,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `hsl(${theme.colors.primary})`
                e.currentTarget.style.color = `hsl(${theme.colors.primaryForeground})`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = `hsl(${theme.colors.primary})`
              }}
            >
              دکمه ثانویه
            </button>
            
            <button 
              className="px-4 py-2 rounded font-medium transition-all"
              style={{ 
                backgroundColor: `hsl(${theme.colors.accent})`,
                color: `hsl(${theme.colors.accentForeground})`,
                borderRadius: theme.layout.borderRadius.md,
                transitionDuration: theme.effects.transitionDuration,
                fontFamily: theme.typography.fontFamily,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium
              }}
            >
              دکمه تاکیدی
            </button>
          </div>
        </div>

        {/* Sample Menu Cards */}
        <div className="space-y-4">
          <h3 
            className="font-semibold"
            style={{ 
              fontFamily: theme.typography.headlineFontFamily,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: `hsl(${theme.colors.foreground})`
            }}
          >
            نمونه کارت‌های منو
          </h3>
          
          {/* Sample Menu Card 1 */}
          <div 
            className="relative overflow-hidden transition-all cursor-pointer"
            style={{ 
              borderRadius: theme.layout.borderRadius.xl,
              boxShadow: theme.layout.shadow.lg,
              transitionDuration: theme.effects.transitionDuration,
              backdropFilter: `blur(${theme.effects.backdropBlur})`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `translateY(${theme.effects.hoverTranslateY}) scale(${theme.effects.hoverScale})`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}
          >
            {/* Card Background Layer */}
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
                <div 
                  className="relative w-full h-24 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs text-gray-500"
                  style={{ 
                    borderRadius: `${theme.layout.borderRadius.lg} 0 0 ${theme.layout.borderRadius.lg}` 
                  }}
                >
                  تصویر غذا
                </div>
              </div>
              
              {/* Content Section */}
              <div className="w-[70%] flex flex-col text-right p-4 relative">
                <h4 
                  className="font-bold mb-2 leading-tight"
                  style={{ 
                    fontFamily: theme.typography.headlineFontFamily,
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: `hsl(${theme.colors.cardForeground})`,
                    lineHeight: theme.typography.lineHeight.tight
                  }}
                >
                  کباب کوبیده
                </h4>
                
                <p 
                  className="leading-relaxed mb-3"
                  style={{ 
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.fontSize.sm,
                    color: `hsl(${theme.colors.muted})`,
                    lineHeight: theme.typography.lineHeight.relaxed
                  }}
                >
                  کباب کوبیده تازه با گوشت مرغوب و ادویه‌های خوشمزه
                </p>

                {/* Price Display */}
                <div className="absolute bottom-3 right-4">
                  <span 
                    className="px-3 py-1 rounded-full font-bold"
                    style={{ 
                      color: `hsl(${theme.colors.primary})`,
                      backgroundColor: `hsl(${theme.colors.primary} / 0.1)`,
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.bold,
                      borderRadius: theme.layout.borderRadius.lg
                    }}
                  >
                    ۱۸۵.۰۰۰ تومان
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Menu Card 2 */}
          <div 
            className="relative overflow-hidden transition-all cursor-pointer"
            style={{ 
              borderRadius: theme.layout.borderRadius.xl,
              boxShadow: theme.layout.shadow.lg,
              transitionDuration: theme.effects.transitionDuration,
              backdropFilter: `blur(${theme.effects.backdropBlur})`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `translateY(${theme.effects.hoverTranslateY}) scale(${theme.effects.hoverScale})`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}
          >
            {/* Card Background Layer */}
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
                <div 
                  className="relative w-full h-24 bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-xs text-amber-700"
                  style={{ 
                    borderRadius: `${theme.layout.borderRadius.lg} 0 0 ${theme.layout.borderRadius.lg}` 
                  }}
                >
                  تصویر نوشیدنی
                </div>
              </div>
              
              {/* Content Section */}
              <div className="w-[70%] flex flex-col text-right p-4 relative">
                <h4 
                  className="font-bold mb-2 leading-tight"
                  style={{ 
                    fontFamily: theme.typography.headlineFontFamily,
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: `hsl(${theme.colors.cardForeground})`,
                    lineHeight: theme.typography.lineHeight.tight
                  }}
                >
                  قهوه اسپرسو
                </h4>
                
                <p 
                  className="leading-relaxed mb-3"
                  style={{ 
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.fontSize.sm,
                    color: `hsl(${theme.colors.muted})`,
                    lineHeight: theme.typography.lineHeight.relaxed
                  }}
                >
                  اسپرسو ایتالیایی با دانه‌های قهوه تازه برشت
                </p>

                {/* Price Display */}
                <div className="absolute bottom-3 right-4">
                  <span 
                    className="px-3 py-1 rounded-full font-bold"
                    style={{ 
                      color: `hsl(${theme.colors.primary})`,
                      backgroundColor: `hsl(${theme.colors.primary} / 0.1)`,
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.bold,
                      borderRadius: theme.layout.borderRadius.lg
                    }}
                  >
                    ۴۵.۰۰۰ تومان
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Elements Showcase */}
        <div className="space-y-3 p-4 border rounded-lg" style={{ borderColor: `hsl(${theme.colors.border})` }}>
          <h3 
            className="font-semibold"
            style={{ 
              fontFamily: theme.typography.headlineFontFamily,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: `hsl(${theme.colors.foreground})`
            }}
          >
            عناصر طرح‌بندی
          </h3>
          
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div 
                className="w-full h-6 mb-1"
                style={{ 
                  backgroundColor: `hsl(${theme.colors.secondary})`,
                  borderRadius: theme.layout.borderRadius.sm
                }}
              />
              <span 
                className="text-xs"
                style={{ color: `hsl(${theme.colors.muted})` }}
              >
                گردی کم
              </span>
            </div>
            
            <div className="text-center">
              <div 
                className="w-full h-6 mb-1"
                style={{ 
                  backgroundColor: `hsl(${theme.colors.secondary})`,
                  borderRadius: theme.layout.borderRadius.md
                }}
              />
              <span 
                className="text-xs"
                style={{ color: `hsl(${theme.colors.muted})` }}
              >
                گردی متوسط
              </span>
            </div>
            
            <div className="text-center">
              <div 
                className="w-full h-6 mb-1"
                style={{ 
                  backgroundColor: `hsl(${theme.colors.secondary})`,
                  borderRadius: theme.layout.borderRadius.lg
                }}
              />
              <span 
                className="text-xs"
                style={{ color: `hsl(${theme.colors.muted})` }}
              >
                گردی زیاد
              </span>
            </div>
            
            <div className="text-center">
              <div 
                className="w-full h-6 mb-1"
                style={{ 
                  backgroundColor: `hsl(${theme.colors.secondary})`,
                  borderRadius: theme.layout.borderRadius.xl
                }}
              />
              <span 
                className="text-xs"
                style={{ color: `hsl(${theme.colors.muted})` }}
              >
                گردی خیلی زیاد
              </span>
            </div>
          </div>
        </div>

        {/* Shadow Examples */}
        <div className="space-y-3 p-4 border rounded-lg" style={{ borderColor: `hsl(${theme.colors.border})` }}>
          <h3 
            className="font-semibold"
            style={{ 
              fontFamily: theme.typography.headlineFontFamily,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: `hsl(${theme.colors.foreground})`
            }}
          >
            نمونه سایه‌ها
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div 
              className="h-12 rounded flex items-center justify-center text-xs"
              style={{ 
                backgroundColor: `hsl(${theme.colors.card})`,
                boxShadow: theme.layout.shadow.sm,
                borderRadius: theme.layout.borderRadius.md,
                color: `hsl(${theme.colors.cardForeground})`
              }}
            >
              سایه کم
            </div>
            
            <div 
              className="h-12 rounded flex items-center justify-center text-xs"
              style={{ 
                backgroundColor: `hsl(${theme.colors.card})`,
                boxShadow: theme.layout.shadow.md,
                borderRadius: theme.layout.borderRadius.md,
                color: `hsl(${theme.colors.cardForeground})`
              }}
            >
              سایه متوسط
            </div>
            
            <div 
              className="h-12 rounded flex items-center justify-center text-xs"
              style={{ 
                backgroundColor: `hsl(${theme.colors.card})`,
                boxShadow: theme.layout.shadow.lg,
                borderRadius: theme.layout.borderRadius.md,
                color: `hsl(${theme.colors.cardForeground})`
              }}
            >
              سایه زیاد
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
