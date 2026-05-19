'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/contexts/ThemeContext'
import { useMenuData } from '@/contexts/MenuDataContext'

import { ThemeConfig } from '@/types/theme'
import { Category, MenuItem, NavbarStyle, DessertsSectionConfig } from '@/types/menu'
import { 
  ColorPreview, 
  TypographyPreview, 
  CompleteThemePreview 
} from './theme-previews'
import { HelpTooltip } from './help-tooltip'
import { ItemManagement } from './item-management'

import { 
  X, 
  Palette, 
  Type, 
  Sparkles, 
  Save, 
  RotateCcw, 
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Settings,
  Coffee,
  Pizza,
  Utensils,
  Cake,
  GlassWater,
  Sandwich,
  Salad,
  Sun,
  Star,
  Gift,
  Flame,
  Heart,
  IceCream,
  Fish,
  Beef,
  Grape,
  Info,
  Edit,
  Plus,
  Trash2,
  Ban,
  Cookie,
  Candy,
  Crown,
  Zap,
  Target,
  Percent,
  Menu
} from 'lucide-react'

// Icon mapping for categories
const categoryIcons: Record<string, React.ReactNode> = {
  'coffee': <Coffee size={20} />,
  'tea': <Coffee size={20} />,
  'pizza': <Pizza size={20} />,
  'burger': <Utensils size={20} />,
  'dessert': <Cake size={20} />,
  'cold-drinks': <GlassWater size={20} />,
  'sandwich': <Sandwich size={20} />,
  'salad': <Salad size={20} />,
  'breakfast': <Sun size={20} />,
  'special': <Star size={20} />,
  'offers': <Gift size={20} />,
  'hot': <Flame size={20} />,
  'favorite': <Heart size={20} />,
  'ice-cream': <IceCream size={20} />,
  'seafood': <Fish size={20} />,
  'meat': <Beef size={20} />,
  'juice': <Grape size={20} />
}

// Function to get category icon
const getCategoryIcon = (iconKey: string) => {
  return categoryIcons[iconKey] || <Coffee size={20} />
}

// Desserts section icon options
const dessertsIconOptions = [
  { key: 'cake', icon: <Cake size={24} />, name: 'کیک' },
  { key: 'cookie', icon: <Cookie size={24} />, name: 'کلوچه' },
  { key: 'candy', icon: <Candy size={24} />, name: 'آبنبات' },
  { key: 'sparkles', icon: <Sparkles size={24} />, name: 'درخشش' },
  { key: 'crown', icon: <Crown size={24} />, name: 'تاج' },
  { key: 'zap', icon: <Zap size={24} />, name: 'برق' },
  { key: 'target', icon: <Target size={24} />, name: 'هدف' },
  { key: 'percent', icon: <Percent size={24} />, name: 'درصد' },
  { key: 'coffee', icon: <Coffee size={24} />, name: 'قهوه' },
  { key: 'pizza', icon: <Pizza size={24} />, name: 'پیتزا' },
  { key: 'burger', icon: <Utensils size={24} />, name: 'برگر' },
  { key: 'cold-drinks', icon: <GlassWater size={24} />, name: 'نوشیدنی سرد' },
  { key: 'sandwich', icon: <Sandwich size={24} />, name: 'ساندویچ' },
  { key: 'salad', icon: <Salad size={24} />, name: 'سالاد' },
  { key: 'breakfast', icon: <Sun size={24} />, name: 'صبحانه' },
  { key: 'special', icon: <Star size={24} />, name: 'ویژه' },
  { key: 'offers', icon: <Gift size={24} />, name: 'پیشنهادات' },
  { key: 'hot', icon: <Flame size={24} />, name: 'داغ' },
  { key: 'favorite', icon: <Heart size={24} />, name: 'محبوب' },
  { key: 'ice-cream', icon: <IceCream size={24} />, name: 'بستنی' },
  { key: 'seafood', icon: <Fish size={24} />, name: 'غذای دریایی' },
  { key: 'meat', icon: <Beef size={24} />, name: 'گوشت' },
  { key: 'juice', icon: <Grape size={24} />, name: 'آبمیوه' },
  { key: 'none', icon: <Ban size={24} />, name: 'بدون آیکن' }
]

// Function to get desserts icon
const getDessertsIcon = (iconKey: string) => {
  const option = dessertsIconOptions.find(opt => opt.key === iconKey)
  return option ? option.icon : <Cake size={24} />
}

// Function to calculate contrast and determine best text color
const getContrastTextColor = (hslColor: string): string => {
  try {
    const [h, s, l] = hslColor.split(' ').map(v => parseFloat(v.replace('%', '')))
    
    // Convert HSL to RGB for better contrast calculation
    const hue = h / 360
    const saturation = s / 100
    const lightness = l / 100
    
    let r, g, b
    
    if (saturation === 0) {
      r = g = b = lightness
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      
      const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation
      const p = 2 * lightness - q
      
      r = hue2rgb(p, q, hue + 1/3)
      g = hue2rgb(p, q, hue)
      b = hue2rgb(p, q, hue - 1/3)
    }
    
    // Convert to 0-255 range
    r = Math.round(r * 255)
    g = Math.round(g * 255)
    b = Math.round(b * 255)
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '0 0% 9%' : '0 0% 98%'
  } catch (error) {
    // Fallback to default colors if parsing fails
    return '0 0% 9%'
  }
}

interface ThemeEditorProps {
  isOpen: boolean
  onClose: () => void
  onUpdateCategories?: (categories: Category[]) => void
  onUpdateItems?: (items: MenuItem[]) => void
  onNavbarStyleChange?: (style: NavbarStyle) => void
  onDessertsConfigChange?: (config: DessertsSectionConfig) => void
}

// Color input component
function ColorInput({ 
  label, 
  value, 
  onChange
}: { 
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [hue, saturation, lightness] = value.split(' ').map(v => parseFloat(v.replace('%', '')))
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div 
          className="w-6 h-6 rounded border border-border"
          style={{ backgroundColor: `hsl(${value})` }}
        />
      </div>
      
      <div className="space-y-1">
        {/* Color Hue Slider */}
        <div className="flex items-center space-x-2">
          <span className="text-xs w-8">رنگ</span>
          <div className="flex-1 relative">
            {/* Color Spectrum Background */}
            <div 
              className="absolute inset-0 rounded-md pointer-events-none"
              style={{
                background: `linear-gradient(to right, 
                  hsl(360, 100%, 50%), 
                  hsl(300, 100%, 50%), 
                  hsl(240, 100%, 50%), 
                  hsl(180, 100%, 50%), 
                  hsl(120, 100%, 50%), 
                  hsl(60, 100%, 50%), 
                  hsl(0, 100%, 50%)
                )`,
                borderRadius: '0.375rem'
              }}
            />
            {/* Standard Range Input */}
          <input
            type="range"
            min="0"
            max="360"
            value={hue || 0}
            onChange={(e) => onChange(`${e.target.value} ${saturation || 50}% ${lightness || 50}%`)}
              className="w-full h-6 appearance-none bg-transparent cursor-pointer relative z-10"
          />
          </div>
          <span className="text-xs w-8">{Math.round(hue || 0)}</span>
        </div>
        
        {/* Saturation Slider */}
        <div className="flex items-center space-x-2">
          <span className="text-xs w-8">اشباع</span>
          <div className="flex-1 relative">
            {/* Saturation Background */}
            <div 
              className="absolute inset-0 rounded-md pointer-events-none"
              style={{
                background: `linear-gradient(to right, 
                  hsl(${hue || 0}, 100%, ${lightness || 50}%), 
                  hsl(${hue || 0}, 0%, ${lightness || 50}%)
                )`,
                borderRadius: '0.375rem'
              }}
            />
            {/* Standard Range Input */}
          <input
            type="range"
            min="0"
            max="100"
            value={saturation || 50}
            onChange={(e) => onChange(`${hue || 0} ${e.target.value}% ${lightness || 50}%`)}
              className="w-full h-6 appearance-none bg-transparent cursor-pointer relative z-10"
          />
          </div>
          <span className="text-xs w-8">{Math.round(saturation || 50)}%</span>
        </div>
        
        {/* Lightness Slider */}
        <div className="flex items-center space-x-2">
          <span className="text-xs w-8">روشنی</span>
          <div className="flex-1 relative">
            {/* Lightness Background */}
            <div 
              className="absolute inset-0 rounded-md pointer-events-none"
              style={{
                background: `linear-gradient(to right, 
                  hsl(${hue || 0}, ${saturation || 50}%, 100%), 
                  hsl(${hue || 0}, ${saturation || 50}%, 50%), 
                  hsl(${hue || 0}, ${saturation || 50}%, 0%)
                )`,
                borderRadius: '0.375rem'
              }}
            />
            {/* Standard Range Input */}
          <input
            type="range"
            min="0"
            max="100"
            value={lightness || 50}
            onChange={(e) => onChange(`${hue || 0} ${saturation || 50}% ${e.target.value}%`)}
              className="w-full h-6 appearance-none bg-transparent cursor-pointer relative z-10"
          />
          </div>
          <span className="text-xs w-8">{Math.round(lightness || 50)}%</span>
        </div>
      </div>
    </div>
  )
}

// Collapsible section component
function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false,
  helpText,
  onOpen,
  isOpen,
  onToggle
}: { 
  title: string
  icon: React.ComponentType<any>
  children: React.ReactNode
  defaultOpen?: boolean
  helpText?: string
  onOpen?: () => void
  isOpen?: boolean
  onToggle?: () => void
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen)
  const isCurrentlyOpen = isOpen !== undefined ? isOpen : internalIsOpen
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalIsOpen(!internalIsOpen)
    }
    if (!isCurrentlyOpen) onOpen?.()
  }
  
  return (
    <div className="border border-border rounded-lg">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-background/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon size={20} />
          <span className="font-medium">{title}</span>
          {helpText && <HelpTooltip content={helpText} />}
        </div>
        {isCurrentlyOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      
      {isCurrentlyOpen && (
        <div className="p-4 pt-0 border-t border-border">
          {children}
        </div>
      )}
    </div>
  )
}

export function ThemeEditor({ 
  isOpen, 
  onClose, 
  onUpdateCategories, 
  onUpdateItems,
  onNavbarStyleChange,
  onDessertsConfigChange
}: ThemeEditorProps) {
  const { currentTheme, setTheme, applyPreset, resetToDefault, revertChanges, saveTheme, hasUnsavedChanges, presets } = useTheme()
  const { 
    hasUnsavedChanges: hasMenuChanges, 
    confirmChanges: confirmMenuChanges, 
    cancelChanges: cancelMenuChanges,
    updateCategories,
    updateMenuItems,
    updateNavbarStyle,
    updateDessertsConfig,
    updateDessertsDiscountConfig,
    updateCategoryDiscounts,
    menuItems,
    categories,
    navbarStyle,
    dessertsConfig,
    dessertsDiscountConfig,
    categoryDiscounts
  } = useMenuData()

  const [activeSection, setActiveSection] = useState<'colors' | 'header' | 'typography' | 'presets' | 'templates' | 'items' | 'desserts' | 'storage' | null>(null)
  const [isEditingInProgress, setIsEditingInProgress] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)



  // Desserts item editing state
  const [editingDessertsItem, setEditingDessertsItem] = useState<MenuItem | null>(null)
  const [showAddDessertsItem, setShowAddDessertsItem] = useState(false)
  const [dessertsItemForm, setDessertsItemForm] = useState({
    title: '',
    description: '',
    price: 0,
    image: '',
    discountedPrice: 0,
    hasIndividualDiscount: false
  })

  if (!isOpen) return null

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme({ ...currentTheme, ...updates })
  }

  const updateColors = (colorUpdates: Partial<ThemeConfig['colors']>) => {
    // Auto-update text colors based on background changes
    const autoTextColors: Partial<ThemeConfig['colors']> = {}
    
    // If background color is changing, update foreground text color
    if (colorUpdates.background) {
      autoTextColors.foreground = getContrastTextColor(colorUpdates.background)
    }
    
    // If card background color is changing, update card foreground text color
    if (colorUpdates.card) {
      autoTextColors.cardForeground = getContrastTextColor(colorUpdates.card)
    }
    
    // If primary color is changing, update primary foreground text color
    if (colorUpdates.primary) {
      autoTextColors.primaryForeground = getContrastTextColor(colorUpdates.primary)
    }
    

    
    // Combine all updates
    const allColorUpdates = { ...colorUpdates, ...autoTextColors }
    
    updateTheme({
      colors: { ...currentTheme.colors, ...allColorUpdates }
    })
  }

  const updateTypography = (typographyUpdates: Partial<ThemeConfig['typography']>) => {
    updateTheme({
      typography: { ...currentTheme.typography, ...typographyUpdates }
    })
  }

  const updateHeader = (headerUpdates: Partial<ThemeConfig['header']>) => {
    updateTheme({
      header: { ...currentTheme.header, ...headerUpdates }
    })
  }





  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return typeof document !== 'undefined' ? createPortal(
    <div 
      className="modal-overlay bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 999999 
      }}
      onClick={handleModalClick}
    >
      <div className="w-full max-w-7xl h-[90vh] flex gap-4">
        {/* Main Editor Panel */}
        <Card className="flex-1 bg-card/95 backdrop-blur-md border border-border shadow-2xl overflow-hidden">
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Palette size={24} />
              <CardTitle className="text-xl">ویرایشگر تم</CardTitle>

            </div>
            
            <div className="flex items-center space-x-2">
              {/* Action Buttons - Show when there are unsaved changes in theme or menu */}
              {(hasUnsavedChanges || hasMenuChanges) && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (hasUnsavedChanges) saveTheme()
                      if (hasMenuChanges) confirmMenuChanges()
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4"
                  >
                    تایید تغییرات
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (hasUnsavedChanges) revertChanges()
                      if (hasMenuChanges) cancelMenuChanges()
                    }}
                    className="border-red-500 text-red-600 hover:bg-red-50 px-4"
                  >
                    لغو تغییرات
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X size={20} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-full overflow-hidden">
            <div className="flex h-full">
              {/* Controls Panel */}
              <div className="w-1/2 p-6 overflow-y-auto space-y-6">
                {/* Theme Presets */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Sparkles size={18} />
                    <span>تم‌های آماده</span>
                    {/* removed extra question icon */}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset) => (
                      <Button
                        key={preset.id}
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset(preset.id)}
                        className="text-xs"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Colors Section */}
                <CollapsibleSection 
                  title="رنگ‌ها" 
                  icon={Palette} 
                  helpText="تنظیم رنگ پس‌زمینه، رنگ اصلی و پس‌زمینه آیتم‌ها"
                  onOpen={() => setActiveSection('colors')}
                  isOpen={openSection === 'colors'}
                  onToggle={() => setOpenSection(openSection === 'colors' ? null : 'colors')}
                >
                  <div className="space-y-4">
                    <ColorInput
                      label="پس‌زمینه"
                      value={currentTheme.colors.background}
                      onChange={(value) => updateColors({ background: value })}
                    />
                    
                    <ColorInput
                      label="رنگ اصلی"
                      value={currentTheme.colors.primary}
                      onChange={(value) => updateColors({ primary: value })}
                    />
                    
                    <ColorInput
                      label="پس‌زمینه آیتم‌ها"
                      value={currentTheme.colors.card || '0 0% 100%'}
                      onChange={(value) => updateColors({ card: value })}
                    />
                    

                    
                  </div>
                </CollapsibleSection>

                {/* Header Section */}
                <CollapsibleSection 
                  title="سربرگ" 
                  icon={Type}
                  helpText="تغییر اسم و لوگو"
                  onOpen={() => setActiveSection('header')}
                  isOpen={openSection === 'header'}
                  onToggle={() => setOpenSection(openSection === 'header' ? null : 'header')}
                >
                  <div className="space-y-4">
                    {/* Header Type Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">نوع سربرگ</label>
                      <select
                        value={currentTheme.header.type}
                        onChange={(e) => updateHeader({ type: e.target.value as 'text' | 'logo' | 'textAndLogo' })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      >
                        <option value="text">فقط متن</option>
                        <option value="logo">فقط لوگو</option>
                        <option value="textAndLogo">متن و لوگو</option>
                      </select>
                    </div>

                    {/* Header Title */}
                    <div>
                      <label className="block text-sm font-medium mb-2">متن سربرگ</label>
                      <input
                        type="text"
                        value={currentTheme.header.title}
                        onChange={(e) => updateHeader({ title: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                        placeholder="متن سربرگ را وارد کنید"
                      />
                    </div>

                                         {/* Header Logo Upload */}
                     <div>
                       <label className="block text-sm font-medium mb-2">آپلود لوگو</label>
                    <div className="space-y-2">
                         <input
                           type="file"
                           accept=".png"
                           onChange={(e) => {
                             const file = e.target.files?.[0]
                             if (file) {
                               // Check file size (max 2MB)
                               if (file.size > 2 * 1024 * 1024) {
                                 alert('حجم فایل باید کمتر از 2 مگابایت باشد')
                                 return
                               }
                               // Create a temporary URL for preview
                               const url = URL.createObjectURL(file)
                               updateHeader({ logoUrl: url })
                             }
                           }}
                           className="w-full px-3 py-2 border border-border rounded-lg bg-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                         />
                         <div className="text-xs text-muted-foreground space-y-1">
                           <p>• فرمت فایل: PNG</p>
                           <p>• حداکثر حجم: 2 مگابایت</p>
                           <p>• اندازه پیشنهادی: 200×80 پیکسل</p>
                           <p>• پس‌زمینه شفاف برای بهترین نتیجه</p>
                         </div>
                       </div>
                     </div>

                    

                    {/* Header Background Toggle */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="showHeaderBackground"
                        checked={currentTheme.header.showBackground}
                        onChange={(e) => updateHeader({ showBackground: e.target.checked })}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                      />
                      <label htmlFor="showHeaderBackground" className="text-sm font-medium">
                        نمایش پس‌زمینه سربرگ
                      </label>
                    </div>









                    
                  </div>
                </CollapsibleSection>





                {/* Item & Navbar Management Section */}
                <CollapsibleSection 
                  title="مدیریت آیتم‌ها و نوبار" 
                  icon={Settings}
                  helpText="تغییر سبک نوبار و تغییر در ترتیب و اطلاعات آیتم‌ها"
                  onOpen={() => setActiveSection('items')}
                  isOpen={openSection === 'items'}
                  onToggle={() => setOpenSection(openSection === 'items' ? null : 'items')}
                >
                    <ItemManagement 
                      categories={categories}
                    items={menuItems}
                    onUpdateCategories={updateCategories}
                    onUpdateItems={updateMenuItems}
                    navbarStyle={navbarStyle}
                    onNavbarStyleChange={updateNavbarStyle}
                      onEditingStateChange={setIsEditingInProgress}
                      categoryDiscounts={categoryDiscounts}
                      onUpdateCategoryDiscounts={updateCategoryDiscounts}
                    />
                </CollapsibleSection>

                {/* Horizontal Menu Management */}
                <CollapsibleSection 
                  title="مدیریت منوی افقی" 
                  icon={Menu}
                  helpText="مدیریت منو افقی و آیتم‌های آن"
                  onOpen={() => setActiveSection('desserts')}
                  isOpen={openSection === 'desserts'}
                  onToggle={() => setOpenSection(openSection === 'desserts' ? null : 'desserts')}
                >

                  <div className="space-y-6">

                    {/* Section Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium">عنوان بخش</label>
                        <input
                          type="text"
                          placeholder="مثال: کیک و دسر"
                          value={dessertsConfig?.title || ''}
                          onChange={(e) => {
                            const newConfig = { 
                              ...dessertsConfig!, 
                              title: e.target.value 
                            }
                            updateDessertsConfig(newConfig)
                          }}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-medium">توضیحات بخش</label>
                          <input
                          type="text"
                          placeholder="مثال: آیتم خوشمزه برای انتخاب شما"
                          value={dessertsConfig?.description || ''}
                          onChange={(e) => {
                            const newConfig = { 
                              ...dessertsConfig!, 
                              description: e.target.value 
                            }
                            updateDessertsConfig(newConfig)
                          }}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>



                                        {/* Visibility Toggle and Discount Configuration - Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Visibility Toggle */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div>
                          <label className="block text-sm font-medium mb-1">نمایش منو افقی</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="dessertsVisibility"
                            checked={dessertsConfig?.isVisible || false}
                            onChange={(e) => {
                              const newConfig = { 
                                ...dessertsConfig!, 
                                isVisible: e.target.checked 
                              }
                              updateDessertsConfig(newConfig)
                            }}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                          />
                          <label htmlFor="dessertsVisibility" className="text-sm">
                            {dessertsConfig?.isVisible ? 'فعال' : 'غیرفعال'}
                          </label>
                        </div>
                      </div>

                      {/* Discount Configuration */}
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          {/* Percentage Input (left) */}
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={dessertsDiscountConfig?.percentage || 10}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0
                                updateDessertsDiscountConfig({ 
                                  ...dessertsDiscountConfig!, 
                                  percentage: Math.min(99, Math.max(1, value)) 
                                })
                              }}
                              className="w-20 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                    </div>

                          {/* Center Text */}
                          <div className="text-sm font-bold text-gray-700">
                            تخفیف
                      </div>

                          {/* Toggle (right, opposite the input) */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                              id="dessertsDiscount"
                              checked={dessertsDiscountConfig?.isActive || false}
                              onChange={(e) => {
                                updateDessertsDiscountConfig({ 
                                  ...dessertsDiscountConfig!, 
                                  isActive: e.target.checked 
                                })
                              }}
                          className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                        />
                            <label htmlFor="dessertsDiscount" className="text-sm">
                              {dessertsDiscountConfig?.isActive ? 'فعال' : 'غیرفعال'}
                        </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Icon Selection */}
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3">آیکن ها</h4>
                        <p className="text-sm text-gray-600 mb-4">انتخاب آیکن برای نمایش کنار عنوان بخش منو افقی</p>
                      </div>
                      
                      <div className="grid grid-cols-6 gap-3">
                        {dessertsIconOptions.map((option) => (
                          <button
                            key={option.key}
                            onClick={() => {
                              const newConfig = { 
                                ...dessertsConfig!, 
                                icon: option.key 
                              }
                              updateDessertsConfig(newConfig)
                            }}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                              dessertsConfig?.icon === option.key
                                ? 'border-primary bg-primary/10 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            title={option.name}
                          >
                            <div 
                              className={`flex justify-center ${
                                dessertsConfig?.icon === option.key 
                                  ? 'text-primary' 
                                  : 'text-gray-600'
                              }`}
                            >
                              {option.icon}
                            </div>
                            <div className="text-xs text-center mt-1 text-gray-600">
                              {option.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Desserts Items Display */}
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">
                          آیتم ها
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-sm">
                            {menuItems.filter(item => item.category === 'desserts').length} آیتم
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => setShowAddDessertsItem(true)}
                            className="flex items-center gap-2"
                          >
                            <Plus size={16} />
                            <span>افزودن آیتم</span>
                          </Button>
                      </div>
                      </div>
                      
                      {(() => {
                        const dessertsItems = menuItems.filter(item => item.category === 'desserts')
                        return dessertsItems.length > 0 ? (
                          <div className="space-y-3">
                            {dessertsItems.map((item, index) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <Badge variant="outline">{index + 1}</Badge>
                                  <div className="space-y-1">
                                    <div className="font-medium">{item.title}</div>
                                    <div className="text-sm text-muted-foreground">{item.description}</div>
                                    {(dessertsDiscountConfig?.isActive || item.hasIndividualDiscount) ? (
                      <div className="flex items-center gap-2">
                                        <div className="text-sm font-medium text-green-600">
                                          {(() => {
                                            // Check if item has individual discount
                                            if (item.hasIndividualDiscount && item.discountedPrice) {
                                              return item.discountedPrice.toLocaleString('en-US', { 
                                                minimumFractionDigits: 0, 
                                                maximumFractionDigits: 2 
                                              })
                                            }
                                            
                                            // Use global discount if no individual discount
                                            if (dessertsDiscountConfig?.isActive) {
                                              const originalPrice = Number(item.price) || 0
                                              const discountPercentage = Number(dessertsDiscountConfig?.percentage) || 0
                                              
                                              // Validate inputs
                                              if (originalPrice <= 0 || discountPercentage <= 0 || discountPercentage >= 100) {
                                                return originalPrice.toLocaleString()
                                              }
                                              
                                              // Calculate discounted price: originalPrice - (discountPercentage * originalPrice / 100)
                                              const discountedPrice = originalPrice - (discountPercentage * originalPrice / 100)
                                              
                                              // Final validation
                                              if (isNaN(discountedPrice) || discountedPrice <= 0) {
                                                return originalPrice.toLocaleString()
                                              }
                                              
                                              return discountedPrice.toLocaleString('en-US', { 
                                                minimumFractionDigits: 0, 
                                                maximumFractionDigits: 2 
                                              })
                                            }
                                            
                                            // Fallback to original price
                                            return item.price.toLocaleString()
                                          })()} تومان
                                        </div>
                                        <div className="text-xs text-red-600 line-through">
                                          {item.price.toLocaleString()} تومان
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-sm font-medium text-green-600">{item.price.toLocaleString()} تومان</div>
                                    )}
                                    {item.image && (
                                      <div className="text-xs text-blue-600">دارای تصویر</div>
                                    )}
                      </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const dessertsItems = menuItems.filter(i => i.category === 'desserts')
                                      const currentIndex = dessertsItems.findIndex(i => i.id === item.id)
                                      if (currentIndex > 0) {
                                        const allItems = [...menuItems]
                                        const currentItem = dessertsItems[currentIndex]
                                        const previousItem = dessertsItems[currentIndex - 1]
                                        const item1Index = allItems.findIndex(i => i.id === currentItem.id)
                                        const item2Index = allItems.findIndex(i => i.id === previousItem.id)
                                        if (item1Index !== -1 && item2Index !== -1) {
                                          [allItems[item1Index], allItems[item2Index]] = [allItems[item2Index], allItems[item1Index]]
                                          updateMenuItems(allItems)
                                        }
                                      }
                                    }}
                                    disabled={index === 0}
                                    title="انتقال به بالا"
                                  >
                                    <ChevronUp size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const dessertsItems = menuItems.filter(i => i.category === 'desserts')
                                      const currentIndex = dessertsItems.findIndex(i => i.id === item.id)
                                      if (currentIndex < dessertsItems.length - 1) {
                                        const allItems = [...menuItems]
                                        const currentItem = dessertsItems[currentIndex]
                                        const nextItem = dessertsItems[currentIndex + 1]
                                        const item1Index = allItems.findIndex(i => i.id === currentItem.id)
                                        const item2Index = allItems.findIndex(i => i.id === nextItem.id)
                                        if (item1Index !== -1 && item2Index !== -1) {
                                          [allItems[item1Index], allItems[item2Index]] = [allItems[item2Index], allItems[item1Index]]
                                          updateMenuItems(allItems)
                                        }
                                      }
                                    }}
                                    disabled={index === dessertsItems.length - 1}
                                    title="انتقال به پایین"
                                  >
                                    <ChevronDown size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingDessertsItem(item)}
                                    title="ویرایش"
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (confirm(`آیا از حذف آیتم "${item.title}" اطمینان دارید؟`)) {
                                        const updatedItems = menuItems.filter(i => i.id !== item.id)
                                        updateMenuItems(updatedItems)
                                      }
                                    }}
                                    className="text-destructive hover:text-destructive"
                                    title="حذف"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            هیچ آیتمی در بخش کیک و دسر وجود ندارد
                          </div>
                        )
                      })()}
                    </div>



                    
                                    </div>
                </CollapsibleSection>



                {/* Storage Management */}


                {/* Bottom Spacing for Better Scrolling */}
                <div className="h-20"></div>

              </div>

              {/* Preview Panel */}
              <div className="w-1/2 border-l border-border p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">پیش‌نمایش زنده</h3>
                  </div>
                  {activeSection === 'colors' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">پیش‌نمایش رنگ‌ها</h3>
                      <div className="border rounded-lg overflow-hidden bg-background scale-75 origin-top">
                        {/* Header */}
                        <div className="bg-primary text-primary-foreground py-4 sm:py-6">
                          <div className="container mx-auto px-3 sm:px-4">
                            <div className="text-center">
                              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3" style={{ fontFamily: currentTheme.typography.headerTitleFontFamily }}>RETRO</h1>
                            </div>
                          </div>
                        </div>
                        
                        {/* Category Navigation */}
                        <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
                          <div className="container mx-auto px-3 sm:px-4">
                            <div className="flex gap-2 sm:gap-3 py-3 sm:py-4 overflow-x-auto no-scrollbar cursor-grab select-none">
                              {categories?.slice(0, 8).map((category, index) => (
                                <button
                                  key={category.id}
                                  className={index === 0 
                                    ? "inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground flex-shrink-0 min-w-[80px] sm:min-w-[100px] px-3 sm:px-4 py-2.5 sm:py-3 h-auto rounded-xl border-2 transition-all duration-300 ease-in-out backdrop-blur-md font-medium font-body active:scale-95 bg-primary text-primary-foreground border-gold shadow-[0_0_12px_2px_hsl(var(--primary)/0.4)] hover:bg-primary hover:border-gold hover:scale-100"
                                    : "inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground flex-shrink-0 min-w-[80px] sm:min-w-[100px] px-3 sm:px-4 py-2.5 sm:py-3 h-auto rounded-xl border-2 transition-all duration-300 ease-in-out backdrop-blur-md font-medium font-body active:scale-95 bg-transparent backdrop-blur-md border-transparent text-foreground hover:bg-secondary/70 hover:border-gold/50 hover:scale-105"
                                  }
                                  data-category={category.id}
                                  style={{ fontFamily: currentTheme.typography.navbarFontFamily }}
                                >
                                  <span className="text-sm sm:text-base font-medium">{category.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </nav>

                        {/* Menu Content Sample */}
                        <div className="py-4 sm:py-6 relative bg-background">
                          <div className="container mx-auto px-3 sm:py-6 relative bg-background">
                            <div className="container mx-auto px-3 sm:px-4 relative z-10">
                              <div className="max-w-5xl mx-auto">
                                <div className="flex flex-col space-y-8 sm:space-y-12">
                                  {/* Category Header */}
                                                                  <div className="mb-6 sm:mb-8 text-center">
                                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ 
                                    fontFamily: currentTheme.typography.headlineFontFamily,
                                    color: `hsl(${currentTheme.colors.foreground})`
                                  }}>قهوه</h2>
                                </div>
                                
                                {/* Menu Items */}
                                <div className="flex flex-col space-y-9 sm:space-y-12">
                                  {menuItems?.slice(0, 1).map((item, index) => (
                                    <div
                                      key={item.id}
                                      className="animate-slide-up"
                                      style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                      <div className="bg-card text-card-foreground group relative backdrop-blur-md shadow-xl rounded-xl border-2 border-transparent hover:border-gold/80 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl overflow-hidden touch-manipulation max-w-4xl mx-auto">
                                        <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: `hsl(${currentTheme.colors.card})`, opacity: currentTheme.layout.opacity.card }}></div>
                                        <div className="flex flex-row-reverse relative z-10">
                                          <div className="w-[28%] flex-shrink-0 overflow-hidden rounded-l-xl">
                                            <div className="relative w-full h-full">
                                              <div className="w-full h-full bg-muted rounded-l-xl flex items-center justify-center">
                                                <span className="text-sm" style={{ 
                                                  fontFamily: currentTheme.typography.fontFamily,
                                                  color: `hsl(${currentTheme.colors.mutedForeground})`
                                                }}>تصویر</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="w-[72%] flex flex-col text-right px-8 py-9 relative">
                                            <h3 className="text-2xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors duration-300" style={{ 
                                              fontFamily: currentTheme.typography.itemTitleFontFamily,
                                              color: `hsl(${currentTheme.colors.cardForeground})`
                                            }}>{item.title}</h3>
                                            <p className="text-base leading-relaxed group-hover:text-foreground/80 transition-colors duration-300 mb-4" style={{ 
                                              fontFamily: currentTheme.typography.descriptionFontFamily,
                                              color: `hsl(${currentTheme.colors.mutedForeground})`
                                            }}>{item.description}</p>
                                            <div className="absolute bottom-6 right-8">
                                              <span className="text-lg font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full" style={{ fontFamily: currentTheme.typography.fontFamily }}>{item.price.toLocaleString()} تومان</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeSection === 'header' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">پیش‌نمایش سربرگ</h3>
                      <div className="border rounded-lg overflow-hidden bg-background scale-75 origin-top">
                        {/* Header Preview */}
                        <div className={`${currentTheme.header.showBackground ? 'bg-primary text-primary-foreground' : 'bg-transparent text-foreground'} py-4 sm:py-6`}>
                          <div className="container mx-auto px-3 sm:px-4">
                            <div className="text-center">
                              {currentTheme.header.type === 'text' && (
                                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3" style={{ fontFamily: currentTheme.typography.headerTitleFontFamily }}>{currentTheme.header.title}</h1>
                              )}
                              {currentTheme.header.type === 'logo' && (
                                <div className="flex justify-center">
                                  <img 
                                    src={currentTheme.header.logoUrl || '/api/placeholder/200/80/cccccc/666666?text=RETRO'} 
                                    alt="لوگو" 
                                    className="h-16 sm:h-20 md:h-24 w-auto"
                                  />
                                </div>
                              )}
                              {currentTheme.header.type === 'textAndLogo' && (
                                <div className="space-y-4">
                                  <div className="flex justify-center">
                                    <img 
                                      src={currentTheme.header.logoUrl || '/api/placeholder/200/80/cccccc/666666?text=RETRO'} 
                                      alt="لوگو" 
                                      className="h-16 sm:h-20 md:h-24 w-auto"
                                    />
                                  </div>
                                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3" style={{ fontFamily: currentTheme.typography.headerTitleFontFamily }}>{currentTheme.header.title}</h1>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeSection === 'typography' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">پیش‌نمایش فونت</h3>
                      <div className="border rounded-lg overflow-hidden bg-background scale-75 origin-top">
                        {/* Header */}
                        <div className="bg-primary text-primary-foreground py-4 sm:py-6">
                          <div className="container mx-auto px-3 sm:px-4">
                            <div className="text-center">
                              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3" style={{ fontFamily: currentTheme.typography.headerTitleFontFamily }}>RETRO</h1>
                            </div>
                          </div>
                        </div>
                        
                        {/* Category Navigation */}
                        <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
                          <div className="container mx-auto px-3 sm:px-4">
                            <div className="flex gap-2 sm:gap-3 py-3 sm:py-4 overflow-x-auto no-scrollbar cursor-grab select-none">
                              {categories?.slice(0, 8).map((category, index) => (
                                <button
                                  key={category.id}
                                  className={index === 0 
                                    ? "inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground flex-shrink-0 min-w-[80px] sm:min-w-[100px] px-3 sm:px-4 py-2.5 sm:py-3 h-auto rounded-xl border-2 transition-all duration-300 ease-in-out backdrop-blur-md font-medium font-body active:scale-95 bg-primary text-primary-foreground border-gold shadow-[0_0_12px_2px_hsl(var(--primary)/0.4)] hover:bg-primary hover:border-gold hover:scale-100"
                                    : "inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground flex-shrink-0 min-w-[80px] sm:min-w-[100px] px-3 sm:px-4 py-2.5 sm:py-3 h-auto rounded-xl border-2 transition-all duration-300 ease-in-out backdrop-blur-md font-medium font-body active:scale-95 bg-transparent backdrop-blur-md border-transparent text-foreground hover:bg-secondary/70 hover:border-gold/50 hover:scale-105"
                                  }
                                  data-category={category.id}
                                  style={{ fontFamily: currentTheme.typography.navbarFontFamily }}
                                >
                                  <span className="text-sm sm:text-base font-medium">{category.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </nav>

                        {/* Menu Content Sample */}
                        <div className="py-4 sm:py-6 relative bg-background">
                          <div className="container mx-auto px-3 sm:px-4 relative z-10">
                            <div className="max-w-5xl mx-auto">
                              <div className="flex flex-col space-y-8 sm:space-y-12">
                                {/* Category Header */}
                                <div className="mb-6 sm:mb-8 text-center">
                                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ 
                                    fontFamily: currentTheme.typography.headlineFontFamily,
                                    color: `hsl(${currentTheme.colors.foreground})`
                                  }}>قهوه</h2>
                                </div>
                                
                                {/* Menu Items */}
                                <div className="flex flex-col space-y-9 sm:space-y-12">
                                  {menuItems?.slice(0, 1).map((item, index) => (
                                    <div
                                      key={item.id}
                                      className="animate-slide-up"
                                      style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                      <div className="bg-card text-card-foreground group relative backdrop-blur-md shadow-xl rounded-xl border-2 border-transparent hover:border-gold/80 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl overflow-hidden touch-manipulation max-w-4xl mx-auto">
                                        <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: `hsl(${currentTheme.colors.card})`, opacity: currentTheme.layout.opacity.card }}></div>
                                        <div className="flex flex-row-reverse relative z-10">
                                          <div className="w-[28%] flex-shrink-0 overflow-hidden rounded-l-xl">
                                            <div className="relative w-full h-32 sm:h-36">
                                              <div className="w-full h-full bg-muted rounded-l-xl flex items-center justify-center">
                                                <span className="text-sm" style={{ 
                                                  fontFamily: currentTheme.typography.fontFamily,
                                                  color: `hsl(${currentTheme.colors.mutedForeground})`
                                                }}>تصویر</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="w-[72%] flex flex-col text-right px-8 py-9 relative">
                                            <h3 className="text-2xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors duration-300" style={{ 
                                              fontFamily: currentTheme.typography.itemTitleFontFamily,
                                              color: `hsl(${currentTheme.colors.cardForeground})`
                                            }}>{item.title}</h3>
                                            <p className="text-base leading-relaxed group-hover:text-foreground/80 transition-colors duration-300 mb-4" style={{ 
                                              fontFamily: currentTheme.typography.descriptionFontFamily,
                                              color: `hsl(${currentTheme.colors.mutedForeground})`
                                            }}>{item.description}</p>
                                            <div className="absolute bottom-6 right-8">
                                              <span className="text-lg font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full" style={{ fontFamily: currentTheme.typography.fontFamily }}>{item.price.toLocaleString()} تومان</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}




                  {activeSection === 'items' && !isEditingInProgress && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">پیش‌نمایش هدر و نوبار</h3>
                      
                      {/* Header and Navbar Preview */}
                      <div className="border rounded-lg overflow-hidden">
                        {/* Header Preview */}
                        <div className="bg-primary text-primary-foreground py-4 px-6">
                          <div className="flex justify-between items-center">
                            <div className="text-center flex-1">
                              <h1 className="text-2xl font-bold mb-2">RETRO</h1>
                              <p className="text-base opacity-90">منوی دیجیتال</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Navbar Preview */}
                        <div className="bg-background/90 backdrop-blur-md border-b border-border p-4">
                          <div className="flex gap-3 overflow-x-auto">
                            {categories?.map((category, index) => (
                              <div
                                key={category.id}
                                className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg whitespace-nowrap"
                                style={{ order: index }}
                              >
                                {getCategoryIcon(category.icon)}
                                <span className="text-sm font-medium">{category.name}</span>
                                <span className="text-xs text-muted-foreground bg-background px-1 rounded">
                                  {index + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground text-center">
                        ترتیب نمایش بخش‌ها در نوبار مطابق با ترتیب تنظیم شده در مدیریت بخش‌ها است
                      </div>
                    </div>
                  )}
                  


                  {!activeSection && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">پیش‌نمایش زنده صفحه اصلی</h3>
                      <div className="border rounded-lg overflow-hidden bg-background scale-75 origin-top">
                        {/* Header */}
                        <div className="bg-primary text-primary-foreground py-4 sm:py-6">
                          <div className="container mx-auto px-3 sm:px-4">
                            <div className="text-center">
                              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3 font-headline">RETRO</h1>
                            </div>
                          </div>
                        </div>
                        
                        {/* Category Navigation */}
                        <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
                          <div className="container mx-auto px-3 sm:px-4">
                            <div className="flex gap-2 sm:gap-3 py-3 sm:py-4 overflow-x-auto no-scrollbar cursor-grab select-none">
                              {categories?.slice(0, 1).map((category, index) => (
                                <button
                                  key={category.id}
                                  className={index === 0 
                                    ? "inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground flex-shrink-0 min-w-[80px] sm:min-w-[100px] px-3 sm:px-4 py-2.5 sm:py-3 h-auto rounded-xl border-2 transition-all duration-300 ease-in-out backdrop-blur-md font-medium font-body active:scale-95 bg-primary text-primary-foreground border-gold shadow-[0_0_12px_2px_hsl(var(--primary)/0.4)] hover:bg-primary hover:border-gold hover:scale-100"
                                    : "inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground flex-shrink-0 min-w-[80px] sm:min-w-[100px] px-3 sm:px-4 py-2.5 sm:py-3 h-auto rounded-xl border-2 transition-all duration-300 ease-in-out backdrop-blur-md font-medium font-body active:scale-95 bg-transparent backdrop-blur-md border-transparent text-foreground hover:bg-secondary/70 hover:border-gold/50 hover:scale-105"
                                  }
                                  data-category={category.id}
                                >
                                  <span className="text-sm sm:text-base font-medium">{category.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </nav>


                        
                        {/* Menu Content Sample */}
                        <div className="py-4 sm:py-6 relative bg-background">
                          <div className="container mx-auto px-3 sm:px-4 relative z-10">
                            <div className="max-w-5xl mx-auto">
                              <div className="flex flex-col space-y-8 sm:space-y-12">
                                {/* Category Header */}
                                <div className="mb-6 sm:mb-8 text-center">
                                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline" style={{ 
                                    color: `hsl(${currentTheme.colors.foreground})`
                                  }}>قهوه</h2>
                                </div>
                                
                                {/* Menu Items */}
                                <div className="flex flex-col space-y-9 sm:space-y-12">
                                  {menuItems?.slice(0, 1).map((item, index) => (
                                    <div
                                      key={item.id}
                                      className="animate-slide-up"
                                      style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                      <div className="bg-card text-card-foreground group relative backdrop-blur-md shadow-xl rounded-xl border-2 border-transparent hover:border-gold/80 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl overflow-hidden touch-manipulation max-w-4xl mx-auto">
                                        <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: `hsl(${currentTheme.colors.card})`, opacity: currentTheme.layout.opacity.card }}></div>
                                        <div className="flex flex-row-reverse relative z-10">
                                          <div className="w-[28%] flex-shrink-0 overflow-hidden rounded-l-xl">
                                            <div className="relative w-full h-60 sm:h-62">
                                              <div className="w-full h-full bg-muted rounded-l-xl flex items-center justify-center">
                                                <span className="text-sm" style={{ 
                                                  color: `hsl(${currentTheme.colors.mutedForeground})`
                                                }}>تصویر</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="w-[72%] flex flex-col text-right px-8 py-9 relative">
                                            <h3 className="text-2xl font-bold mb-3 leading-tight font-headline group-hover:text-primary transition-colors duration-300" style={{ 
                                              color: `hsl(${currentTheme.colors.cardForeground})`
                                            }}>{item.title}</h3>
                                            <p className="text-base leading-relaxed font-body group-hover:text-foreground/80 transition-colors duration-300 mb-4" style={{ 
                                              color: `hsl(${currentTheme.colors.mutedForeground})`
                                            }}>{item.description}</p>
                                            <div className="absolute bottom-6 right-8">
                                              <span className="text-lg font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{item.price.toLocaleString()} تومان</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeSection === 'presets' && (
                    <CompleteThemePreview theme={currentTheme} />
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          {/* Add/Edit Desserts Item Modal */}
          {(showAddDessertsItem || editingDessertsItem) && typeof document !== 'undefined' && createPortal(
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999999] p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowAddDessertsItem(false)
                  setEditingDessertsItem(null)
                  setDessertsItemForm({ title: '', description: '', price: 0, image: '', discountedPrice: 0, hasIndividualDiscount: false })
                }
              }}
            >
              <div className="w-[500px] max-w-[90vw] max-h-[90vh] bg-white border border-gray-300 rounded-lg shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingDessertsItem ? 'ویرایش آیتم' : 'افزودن آیتم جدید'}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAddDessertsItem(false)
                        setEditingDessertsItem(null)
                        setDessertsItemForm({ title: '', description: '', price: 0, image: '', discountedPrice: 0, hasIndividualDiscount: false })
                      }}
                      className="p-2 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {/* 1. Image Section - First */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">تصویر آیتم</label>
                      <div className="space-y-3">
                        {/* Image Preview */}
                        {(editingDessertsItem?.image || dessertsItemForm.image) && (
                          <div className="text-center">
                            <div className="w-32 h-32 mx-auto border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                              <img 
                                src={editingDessertsItem?.image || dessertsItemForm.image} 
                                alt="Image preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">پیش‌نمایش تصویر</p>
                          </div>
                        )}
                        
                        {/* Image Input */}
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  // Validate file size (max 2MB)
                                  const maxSize = 2 * 1024 * 1024
                                  if (file.size > maxSize) {
                                    alert('حجم فایل نباید بیشتر از 2 مگابایت باشد')
                                    return
                                  }
                                  
                                  // Validate file type
                                  if (!file.type.startsWith('image/')) {
                                    alert('فقط فایل‌های تصویری مجاز هستند')
                                    return
                                  }
                                  
                                  // Convert to base64 and update form
                                  const reader = new FileReader()
                                  reader.onload = (e) => {
                                    const imageData = e.target?.result as string
                                    if (editingDessertsItem) {
                                      setEditingDessertsItem({ ...editingDessertsItem, image: imageData })
                                    } else {
                                      setDessertsItemForm({ ...dessertsItemForm, image: imageData })
                                    }
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                              className="p-3 border border-gray-300 rounded-lg text-sm bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 transition-all duration-200"
                            />
                          </div>
                          <p className="text-xs text-gray-500 text-center">
                            حداکثر حجم: 2 مگابایت • فرمت‌های مجاز: JPG, PNG, GIF
                          </p>
                        </div>
                        
                        {/* Remove Image Button */}
                        {(editingDessertsItem?.image || dessertsItemForm.image) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (editingDessertsItem) {
                                setEditingDessertsItem({ ...editingDessertsItem, image: '' })
                              } else {
                                setDessertsItemForm({ ...dessertsItemForm, image: '' })
                              }
                            }}
                            className="mt-3 w-full"
                          >
                            حذف تصویر
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 2. Item Name - Second */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">نام آیتم</label>
                      <input
                        type="text"
                        value={editingDessertsItem ? editingDessertsItem.title : dessertsItemForm.title}
                        onChange={(e) => {
                          if (editingDessertsItem) {
                            setEditingDessertsItem({ ...editingDessertsItem, title: e.target.value })
                          } else {
                            setDessertsItemForm({ ...dessertsItemForm, title: e.target.value })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder="مثال: کیک شکلاتی"
                      />
                    </div>

                    {/* 3. Description - Third */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">توضیحات</label>
                      <textarea
                        value={editingDessertsItem ? editingDessertsItem.description : dessertsItemForm.description}
                        onChange={(e) => {
                          if (editingDessertsItem) {
                            setEditingDessertsItem({ ...editingDessertsItem, description: e.target.value })
                          } else {
                            setDessertsItemForm({ ...dessertsItemForm, description: e.target.value })
                          }
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="توضیحات آیتم"
                      />
                    </div>

                    {/* 4. Price - Fourth */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">قیمت اصلی (تومان)</label>
                      <input
                        type="number"
                        value={editingDessertsItem ? editingDessertsItem.price : dessertsItemForm.price}
                        onChange={(e) => {
                          if (editingDessertsItem) {
                            setEditingDessertsItem({ ...editingDessertsItem, price: parseInt(e.target.value) || 0 })
                          } else {
                            setDessertsItemForm({ ...dessertsItemForm, price: parseInt(e.target.value) || 0 })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    {/* 5. Individual Discount Toggle */}
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <input
                          type="checkbox"
                          id="hasIndividualDiscount"
                          checked={editingDessertsItem ? editingDessertsItem.hasIndividualDiscount || false : dessertsItemForm.hasIndividualDiscount}
                          onChange={(e) => {
                            if (editingDessertsItem) {
                              setEditingDessertsItem({ ...editingDessertsItem, hasIndividualDiscount: e.target.checked })
                            } else {
                              setDessertsItemForm({ ...dessertsItemForm, hasIndividualDiscount: e.target.checked })
                            }
                          }}
                          className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                        />
                        <label htmlFor="hasIndividualDiscount" className="text-sm font-medium text-gray-700">
                          تخفیف جداگانه برای این آیتم
                        </label>
                      </div>
                    </div>

                    {/* 6. Discounted Price - Sixth (only show if individual discount is enabled) */}
                    {(editingDessertsItem ? editingDessertsItem.hasIndividualDiscount : dessertsItemForm.hasIndividualDiscount) && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">قیمت بعد از تخفیف (تومان)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingDessertsItem ? editingDessertsItem.discountedPrice || 0 : dessertsItemForm.discountedPrice}
                          onChange={(e) => {
                            if (editingDessertsItem) {
                              setEditingDessertsItem({ ...editingDessertsItem, discountedPrice: parseFloat(e.target.value) || 0 })
                            } else {
                              setDessertsItemForm({ ...dessertsItemForm, discountedPrice: parseFloat(e.target.value) || 0 })
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder="0.00"
                          min="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          این قیمت در صفحه اصلی نمایش داده می‌شود
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fixed Footer with Buttons */}
                <div className="flex-shrink-0 border-t border-border p-6">
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => {
                        if (editingDessertsItem) {
                          // Update existing item
                          const updatedItems = menuItems.map(item => 
                            item.id === editingDessertsItem.id ? editingDessertsItem : item
                          )
                          updateMenuItems(updatedItems)
                          setEditingDessertsItem(null)
                        } else {
                          // Add new item
                          const newItem: MenuItem = {
                            id: Date.now(),
                            category: 'desserts',
                            title: dessertsItemForm.title,
                            description: dessertsItemForm.description,
                            price: dessertsItemForm.price,
                            image: dessertsItemForm.image,
                            discountedPrice: dessertsItemForm.hasIndividualDiscount ? dessertsItemForm.discountedPrice : undefined,
                            hasIndividualDiscount: dessertsItemForm.hasIndividualDiscount
                          }
                          const updatedItems = [...menuItems, newItem]
                          updateMenuItems(updatedItems)
                          setShowAddDessertsItem(false)
                          setDessertsItemForm({ title: '', description: '', price: 0, image: '', discountedPrice: 0, hasIndividualDiscount: false })
                        }
                      }}
                      disabled={editingDessertsItem ? (!editingDessertsItem.title.trim() || editingDessertsItem.price <= 0) : (!dessertsItemForm.title.trim() || dessertsItemForm.price <= 0)}
                      className="flex-1 h-12 text-base font-medium"
                    >
                      <Save size={18} className="ml-2" />
                      <span>{editingDessertsItem ? 'ذخیره' : 'افزودن'}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddDessertsItem(false)
                        setEditingDessertsItem(null)
                        setDessertsItemForm({ title: '', description: '', price: 0, image: '', discountedPrice: 0, hasIndividualDiscount: false })
                      }}
                      className="flex-1 h-12 text-base font-medium"
                    >
                      <X size={18} className="ml-2" />
                      <span>لغو</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Footer Actions */}
          <div className="border-t border-border p-4 flex items-center justify-between bg-background/50">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefault}
                className="flex items-center space-x-2"
              >
                <RotateCcw size={16} />
                <span>بازگشت به پیش‌فرض</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
              >
                لغو
              </Button>
              <Button
                onClick={() => {
                  saveTheme()
                  onClose()
                }}
                className="flex items-center space-x-2"
                disabled={!hasUnsavedChanges}
              >
                <Save size={16} />
                <span>ذخیره و اعمال</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>,
    document.body
  ) : null
}