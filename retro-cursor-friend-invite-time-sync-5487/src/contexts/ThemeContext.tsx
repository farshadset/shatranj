'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeConfig, defaultTheme, ThemePreset, themePresets } from '@/types/theme'

interface ThemeContextType {
  currentTheme: ThemeConfig
  setTheme: (theme: ThemeConfig) => void
  applyPreset: (presetId: string) => void
  resetToDefault: () => void
  revertChanges: () => void
  saveTheme: () => void
  hasUnsavedChanges: boolean
  presets: ThemePreset[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(defaultTheme)
  const [savedTheme, setSavedTheme] = useState<ThemeConfig>(defaultTheme)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load saved theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('retro-theme')
      if (saved) {
        try {
          const parsedTheme = JSON.parse(saved)
          setCurrentTheme(parsedTheme)
          setSavedTheme(parsedTheme)
        } catch (error) {
          console.error('Failed to parse saved theme:', error)
        }
      }
    }
  }, [])

  // Apply theme to CSS variables whenever theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      
      // Apply color variables
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        root.style.setProperty(`--${cssVar}`, value)
      })

      // Apply typography variables
      root.style.setProperty('--font-family', currentTheme.typography.fontFamily)
      root.style.setProperty('--font-headline', currentTheme.typography.headlineFontFamily)
      
      Object.entries(currentTheme.typography.fontSize).forEach(([key, value]) => {
        root.style.setProperty(`--font-size-${key}`, value)
      })

      Object.entries(currentTheme.typography.fontWeight).forEach(([key, value]) => {
        root.style.setProperty(`--font-weight-${key}`, value)
      })

      Object.entries(currentTheme.typography.lineHeight).forEach(([key, value]) => {
        root.style.setProperty(`--line-height-${key}`, value)
      })

      // Apply layout variables
      Object.entries(currentTheme.layout.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--border-radius-${key}`, value)
      })

      Object.entries(currentTheme.layout.shadow).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value)
      })

      Object.entries(currentTheme.layout.opacity).forEach(([key, value]) => {
        root.style.setProperty(`--opacity-${key}`, value)
      })

      Object.entries(currentTheme.layout.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value)
      })

      // Apply effects variables
      Object.entries(currentTheme.effects).forEach(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        root.style.setProperty(`--${cssVar}`, value)
      })
    }
  }, [currentTheme])

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(currentTheme) !== JSON.stringify(savedTheme)
    setHasUnsavedChanges(hasChanges)
  }, [currentTheme, savedTheme])

  const setTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme)
  }

  const applyPreset = (presetId: string) => {
    const preset = themePresets.find(p => p.id === presetId)
    if (preset) {
      setCurrentTheme(preset.config)
    }
  }

  const resetToDefault = () => {
    setCurrentTheme(defaultTheme)
  }

  const revertChanges = () => {
    setCurrentTheme(savedTheme)
  }

  const saveTheme = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('retro-theme', JSON.stringify(currentTheme))
      setSavedTheme(currentTheme)
      setHasUnsavedChanges(false)
    }
  }

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    applyPreset,
    resetToDefault,
    revertChanges,
    saveTheme,
    hasUnsavedChanges,
    presets: themePresets,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
