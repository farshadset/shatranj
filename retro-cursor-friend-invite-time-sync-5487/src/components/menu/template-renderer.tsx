'use client'

import React from 'react'
import { MenuItem } from '@/types/menu'
import { TemplateType } from '@/types/menu'
import { MenuCard } from './menu-card'
import { 
  CompactTemplate,
  SquareTemplate
} from './templates'

interface CategoryDiscount {
  isActive: boolean
  percentage: number
}

interface TemplateRendererProps {
  item: MenuItem
  template: TemplateType
  isAdmin?: boolean
  onEditItem?: ((item: MenuItem) => void) | null
  className?: string
  categoryDiscounts?: Record<string, CategoryDiscount>
}

export function TemplateRenderer({ 
  item, 
  template, 
  isAdmin = false, 
  onEditItem, 
  className,
  categoryDiscounts = {}
}: TemplateRendererProps) {
  switch (template) {
    case 'default':
      return (
        <MenuCard 
          item={item} 
          isAdmin={isAdmin}
          onEditItem={onEditItem}
          className={className}
          categoryDiscounts={categoryDiscounts}
        />
      )
    
    case 'compact':
      return (
        <CompactTemplate 
          item={item} 
          isAdmin={isAdmin}
          onEditItem={onEditItem}
          className={className}
          categoryDiscounts={categoryDiscounts}
        />
      )
    
    case 'square':
      return (
        <SquareTemplate 
          item={item} 
          isAdmin={isAdmin}
          onEditItem={onEditItem}
          className={className}
          categoryDiscounts={categoryDiscounts}
        />
      )
    
    default:
      return (
        <MenuCard 
          item={item} 
          isAdmin={isAdmin}
          onEditItem={onEditItem}
          className={className}
        />
      )
  }
}
