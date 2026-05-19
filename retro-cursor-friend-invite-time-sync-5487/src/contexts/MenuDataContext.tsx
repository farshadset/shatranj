'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Category, MenuItem, NavbarStyle, DessertsSectionConfig, DessertsDiscountConfig, TemplateType } from '@/types/menu'

interface CategoryDiscount {
  isActive: boolean
  percentage: number
}
import { menuData } from '@/data/menu-data'

interface MenuDataContextType {
  // Current data
  menuItems: MenuItem[]
  categories: Category[]
  navbarStyle: NavbarStyle
  selectedTemplate: TemplateType
  dessertsConfig: DessertsSectionConfig
  dessertsDiscountConfig: DessertsDiscountConfig
  categoryDiscounts: Record<string, CategoryDiscount>
  
  // Change management
  hasUnsavedChanges: boolean
  pendingChanges: Partial<{
    menuItems: MenuItem[]
    categories: Category[]
    navbarStyle: NavbarStyle
    selectedTemplate: TemplateType
    dessertsConfig: DessertsSectionConfig
    dessertsDiscountConfig: DessertsDiscountConfig
    categoryDiscounts: Record<string, CategoryDiscount>
  }>
  
  // Actions
  updateMenuItems: (items: MenuItem[]) => void
  updateCategories: (categories: Category[]) => void
  updateNavbarStyle: (style: NavbarStyle) => void
  updateTemplate: (template: TemplateType) => void
  updateDessertsConfig: (config: DessertsSectionConfig) => void
  updateDessertsDiscountConfig: (config: DessertsDiscountConfig) => void
  updateCategoryDiscounts: (discounts: Record<string, CategoryDiscount>) => void
  
  // Change confirmation
  confirmChanges: () => void
  cancelChanges: () => void
  resetToOriginal: () => void
  
  // Save/load
  saveToStorage: () => void
  loadFromStorage: () => void
  
  // Admin state
  isAdmin: boolean
  setIsAdmin: (isAdmin: boolean) => void
}

const MenuDataContext = createContext<MenuDataContextType | undefined>(undefined)

interface MenuDataProviderProps {
  children: ReactNode
}

export function MenuDataProvider({ children }: MenuDataProviderProps) {
  // Original data (saved state)
  const [originalData, setOriginalData] = useState({
    menuItems: menuData.items,
    categories: menuData.categories,
    navbarStyle: 'text-only' as NavbarStyle,
    selectedTemplate: 'default' as TemplateType,
    dessertsConfig: {
      isVisible: true,
      title: 'کیک و دسر',
      description: 'آیتم خوشمزه برای انتخاب شما',
      order: 1,
      icon: 'cake'
    } as DessertsSectionConfig,
    dessertsDiscountConfig: {
      isActive: false,
      percentage: 10
    } as DessertsDiscountConfig,
    categoryDiscounts: {} as Record<string, CategoryDiscount>
  })

  // Current data (working state)
  const [currentData, setCurrentData] = useState(originalData)
  
  // Pending changes
  const [pendingChanges, setPendingChanges] = useState<Partial<typeof originalData>>({})
  
  // Unsaved changes flag
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('retro-menu-data')
      if (saved) {
        try {
          const parsedData = JSON.parse(saved)
          setOriginalData(parsedData)
          setCurrentData(parsedData)
        } catch (error) {
          console.error('Failed to parse saved menu data:', error)
        }
      }
    }
  }, [])

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(currentData) !== JSON.stringify(originalData)
    setHasUnsavedChanges(hasChanges)
    
    // Update pending changes
    if (hasChanges) {
      const changes: Partial<typeof originalData> = {}
      Object.keys(currentData).forEach(key => {
        const k = key as keyof typeof currentData
        if (JSON.stringify(currentData[k]) !== JSON.stringify(originalData[k])) {
          (changes as any)[k] = currentData[k]
        }
      })
      setPendingChanges(changes)
    } else {
      setPendingChanges({})
    }
  }, [currentData, originalData])

  // Note: Auto-save removed - changes are only saved when admin confirms them

  // Update functions
  const updateMenuItems = (items: MenuItem[]) => {
    setCurrentData(prev => ({ ...prev, menuItems: items }))
  }

  const updateCategories = (categories: Category[]) => {
    // Ensure desserts category is always first
    const sortedCategories = [...categories].sort((a, b) => {
      if (a.id === 'desserts') return -1
      if (b.id === 'desserts') return 1
      return 0
    })
    setCurrentData(prev => ({ ...prev, categories: sortedCategories }))
  }

  const updateNavbarStyle = (style: NavbarStyle) => {
    setCurrentData(prev => ({ ...prev, navbarStyle: style }))
  }

  const updateTemplate = (template: TemplateType) => {
    setCurrentData(prev => ({ ...prev, selectedTemplate: template }))
  }

  const updateDessertsConfig = (config: DessertsSectionConfig) => {
    setCurrentData(prev => ({ ...prev, dessertsConfig: config }))
  }

  const updateDessertsDiscountConfig = (config: DessertsDiscountConfig) => {
    setCurrentData(prev => ({ ...prev, dessertsDiscountConfig: config }))
  }

  const updateCategoryDiscounts = (discounts: Record<string, CategoryDiscount>) => {
    setCurrentData(prev => ({ ...prev, categoryDiscounts: discounts }))
  }

  // Change confirmation functions
  const confirmChanges = () => {
    setOriginalData(currentData)
    setHasUnsavedChanges(false)
    setPendingChanges({})
    saveToStorage()
  }

  const cancelChanges = () => {
    setCurrentData(originalData)
    setHasUnsavedChanges(false)
    setPendingChanges({})
  }

  const resetToOriginal = () => {
    setCurrentData(originalData)
    setHasUnsavedChanges(false)
    setPendingChanges({})
  }

  // Storage functions
  const saveToStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('retro-menu-data', JSON.stringify(currentData))
    }
  }

  const loadFromStorage = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('retro-menu-data')
      if (saved) {
        try {
          const parsedData = JSON.parse(saved)
          setOriginalData(parsedData)
          setCurrentData(parsedData)
        } catch (error) {
          console.error('Failed to parse saved menu data:', error)
        }
      }
    }
  }

  const value: MenuDataContextType = {
    // Current data
    menuItems: currentData.menuItems,
    categories: currentData.categories,
    navbarStyle: currentData.navbarStyle,
    selectedTemplate: currentData.selectedTemplate,
    dessertsConfig: currentData.dessertsConfig,
    dessertsDiscountConfig: currentData.dessertsDiscountConfig,
    categoryDiscounts: currentData.categoryDiscounts,
    
    // Change management
    hasUnsavedChanges,
    pendingChanges,
    
    // Actions
    updateMenuItems,
    updateCategories,
    updateNavbarStyle,
    updateTemplate,
    updateDessertsConfig,
    updateDessertsDiscountConfig,
    updateCategoryDiscounts,
    
    // Change confirmation
    confirmChanges,
    cancelChanges,
    resetToOriginal,
    
    // Save/load
    saveToStorage,
    loadFromStorage,
    
    // Admin state
    isAdmin,
    setIsAdmin
  }

  return (
    <MenuDataContext.Provider value={value}>
      {children}
    </MenuDataContext.Provider>
  )
}

export function useMenuData() {
  const context = useContext(MenuDataContext)
  if (context === undefined) {
    throw new Error('useMenuData must be used within a MenuDataProvider')
  }
  return context
}
