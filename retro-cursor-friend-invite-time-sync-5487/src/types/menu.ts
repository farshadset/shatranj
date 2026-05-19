export interface Category {
  id: string
  name: string
  description?: string // Made optional since we're no longer displaying it
  icon: string
}

// Special desserts section configuration
export interface DessertsSectionConfig {
  isVisible: boolean
  title: string
  description: string
  order: number // Always 1 (first priority)
  icon?: string // Icon key for the desserts section
}

// Discount configuration for desserts section
export interface DessertsDiscountConfig {
  isActive: boolean
  percentage: number
}

// Navigation bar display styles
export type NavbarStyle = 'text-only' | 'icon-only' | 'icon-with-text'

export interface NavbarConfig {
  style: NavbarStyle
  dessertsSection: DessertsSectionConfig
}

export interface MenuItem {
  id: number
  category: string
  title: string
  description: string
  price: number
  image: string
  discountedPrice?: number // Individual discounted price for this item
  hasIndividualDiscount?: boolean // Whether this item has individual discount
}

export interface MenuData {
  categories: Category[]
  items: MenuItem[]
}

export type TemplateType = 'default' | 'compact' | 'square'

export interface TemplateConfig {
  id: TemplateType
  name: string
  description: string
  icon: string
  className?: string
}

// New interfaces for Item Management
export interface DraggableCategory extends Category {
  order: number
}

export interface DraggableMenuItem extends MenuItem {
  order: number
}

export interface CategoryFormData {
  name: string
  description?: string
  icon: string
}

export interface MenuItemFormData {
  title: string
  description: string
  price: number
  image: string
  category: string
  discountedPrice?: number
  hasIndividualDiscount?: boolean
}
