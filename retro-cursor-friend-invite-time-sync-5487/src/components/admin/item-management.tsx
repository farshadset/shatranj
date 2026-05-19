'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
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
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  IceCream,
  Fish,
  Beef,
  Grape
} from 'lucide-react'
import { 
  Category, 
  MenuItem, 
  CategoryFormData,
  MenuItemFormData,
  NavbarStyle
} from '@/types/menu'

interface CategoryDiscount {
  isActive: boolean
  percentage: number
}

interface ItemManagementProps {
  categories: Category[]
  items: MenuItem[]
  onUpdateCategories: (categories: Category[]) => void
  onUpdateItems: (items: MenuItem[]) => void
  navbarStyle?: NavbarStyle
  onNavbarStyleChange?: (style: NavbarStyle) => void
  onEditingStateChange?: (isEditing: boolean) => void
  categoryDiscounts?: Record<string, CategoryDiscount>
  onUpdateCategoryDiscounts?: (discounts: Record<string, CategoryDiscount>) => void
}

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

// Available icons for selection - مناسب کافه، رستوران و شیرینی‌فروشی
const availableIcons = [
  { id: 'coffee', icon: <Coffee size={20} />, name: 'قهوه' },
  { id: 'tea', icon: <Coffee size={20} />, name: 'چای' },
  { id: 'pizza', icon: <Pizza size={20} />, name: 'پیتزا' },
  { id: 'burger', icon: <Utensils size={20} />, name: 'برگر' },
  { id: 'dessert', icon: <Cake size={20} />, name: 'دسر' },
  { id: 'ice-cream', icon: <IceCream size={20} />, name: 'بستنی' },
  { id: 'cold-drinks', icon: <GlassWater size={20} />, name: 'نوشیدنی سرد' },
  { id: 'juice', icon: <Grape size={20} />, name: 'آبمیوه' },
  { id: 'sandwich', icon: <Sandwich size={20} />, name: 'ساندویچ' },
  { id: 'salad', icon: <Salad size={20} />, name: 'سالاد' },
  { id: 'seafood', icon: <Fish size={20} />, name: 'غذای دریایی' },
  { id: 'meat', icon: <Beef size={20} />, name: 'گوشت' },
  { id: 'breakfast', icon: <Sun size={20} />, name: 'صبحانه' },
  { id: 'special', icon: <Star size={20} />, name: 'ویژه' },
  { id: 'offers', icon: <Gift size={20} />, name: 'تخفیف' },
  { id: 'hot', icon: <Flame size={20} />, name: 'داغ' },
  { id: 'favorite', icon: <Heart size={20} />, name: 'محبوب' }
]

export function ItemManagement({ 
  categories, 
  items, 
  onUpdateCategories, 
  onUpdateItems,
  navbarStyle = 'icon-with-text',
  onNavbarStyleChange,
  onEditingStateChange,
  categoryDiscounts = {},
  onUpdateCategoryDiscounts
}: ItemManagementProps) {
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const [localItems, setLocalItems] = useState<MenuItem[]>(items)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Form states
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<number | null>(null)
  
  // Form data
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: 'coffee'
  })
  
  const [itemForm, setItemForm] = useState<MenuItemFormData>({
    title: '',
    description: '',
    price: 0,
    image: '',
    category: 'coffee'
  })

  // Store original values for cancel functionality
  const [originalCategoryValues, setOriginalCategoryValues] = useState<{[key: string]: Category}>({})
  const [originalItemValues, setOriginalItemValues] = useState<{[key: number]: MenuItem}>({})

  // Sync with parent when data changes
  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  // Notify parent when editing state changes
  useEffect(() => {
    const isEditing = editingCategory !== null || editingItem !== null
    onEditingStateChange?.(isEditing)
  }, [editingCategory, editingItem, onEditingStateChange])

  // Get category icon
  const getCategoryIcon = (iconKey: string) => {
    return categoryIcons[iconKey] || <Coffee size={20} />
  }

  // Handle editing category start
  const handleStartEditCategory = (categoryId: string) => {
    const category = localCategories.find(c => c.id === categoryId)
    if (category) {
      setOriginalCategoryValues({ [categoryId]: { ...category } })
      setEditingCategory(categoryId)
    }
  }

  // Handle cancel category edit
  const handleCancelCategoryEdit = () => {
    if (editingCategory && originalCategoryValues[editingCategory]) {
      const originalCategory = originalCategoryValues[editingCategory]
      handleUpdateCategory(editingCategory, originalCategory)
    }
    setEditingCategory(null)
    setOriginalCategoryValues({})
  }

  // Handle save category edit
  const handleSaveCategoryEdit = () => {
    // تغییرات قبلاً در handleUpdateCategory اعمال شده‌اند
    // فقط باید editing state را پاک کنیم
    setEditingCategory(null)
    setOriginalCategoryValues({})
  }

  // Handle editing item start
  const handleStartEditItem = (itemId: number) => {
    const item = localItems.find(i => i.id === itemId)
    if (item) {
      setOriginalItemValues({ [itemId]: { ...item } })
      setEditingItem(itemId)
    }
  }

  // Handle cancel item edit
  const handleCancelItemEdit = () => {
    if (editingItem && originalItemValues[editingItem]) {
      const originalItem = originalItemValues[editingItem]
      handleUpdateItem(editingItem, originalItem)
    }
    setEditingItem(null)
    setOriginalItemValues({})
  }

  // Handle save item edit
  const handleSaveItemEdit = () => {
    setEditingItem(null)
    setOriginalItemValues({})
  }

  // Category Management Functions
  const handleAddCategory = () => {
    if (!categoryForm.name.trim()) return

    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name: categoryForm.name.trim(),
      description: categoryForm.description?.trim() || '',
      icon: categoryForm.icon
    }

    const updatedCategories = [...localCategories, newCategory]
    setLocalCategories(updatedCategories)
    onUpdateCategories(updatedCategories)
    
    setCategoryForm({ name: '', description: '', icon: 'coffee' })
    setShowAddCategory(false)
  }

  const handleUpdateCategory = (categoryId: string, updates: Partial<Category>) => {
    const updatedCategories = localCategories.map(cat =>
      cat.id === categoryId ? { ...cat, ...updates } : cat
    )
    setLocalCategories(updatedCategories)
    onUpdateCategories(updatedCategories)
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این بخش را حذف کنید؟')) {
      const updatedCategories = localCategories.filter(cat => cat.id !== categoryId)
      setLocalCategories(updatedCategories)
      onUpdateCategories(updatedCategories)
      
      // Also remove items from this category
      const updatedItems = localItems.filter(item => item.category !== categoryId)
      setLocalItems(updatedItems)
      onUpdateItems(updatedItems)
      
      if (selectedCategory === categoryId) {
        setSelectedCategory(null)
      }
    }
  }

  const handleMoveCategoryUp = (categoryId: string) => {
    const currentIndex = localCategories.findIndex(cat => cat.id === categoryId)
    if (currentIndex > 0) {
      const updatedCategories = [...localCategories]
      const [moved] = updatedCategories.splice(currentIndex, 1)
      updatedCategories.splice(currentIndex - 1, 0, moved)
      setLocalCategories(updatedCategories)
      onUpdateCategories(updatedCategories)
    }
  }

  const handleMoveCategoryDown = (categoryId: string) => {
    const currentIndex = localCategories.findIndex(cat => cat.id === categoryId)
    if (currentIndex < localCategories.length - 1) {
      const updatedCategories = [...localCategories]
      const [moved] = updatedCategories.splice(currentIndex, 1)
      updatedCategories.splice(currentIndex + 1, 0, moved)
      setLocalCategories(updatedCategories)
      onUpdateCategories(updatedCategories)
    }
  }

  // Item Management Functions
  const handleAddItem = () => {
    if (!itemForm.title.trim() || !selectedCategory) return

    const newItem: MenuItem = {
      id: Date.now(),
      category: selectedCategory,
      title: itemForm.title.trim(),
      description: itemForm.description.trim(),
      price: itemForm.price,
      image: itemForm.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCAxNTAgNzIuMzg2IDE1MCAxMDBDMTUwIDEyNy42MTQgMTI3LjYxNCAxNTAgMTAwIDE1MEM3Mi4zODYgMTUwIDUwIDEyNy42MTQgNTAgMTAwQzUwIDcyLjM4NiA3Mi4zODYgNTAgMTAwIDUwWiIgZmlsbD0iI0Q5RDBENiIvPgo8L3N2Zz4K'
    }

    const updatedItems = [...localItems, newItem]
    setLocalItems(updatedItems)
    onUpdateItems(updatedItems)
    
    setItemForm({ title: '', description: '', price: 0, image: '', category: selectedCategory })
    setShowAddItem(false)
  }

  const handleUpdateItem = (itemId: number, updates: Partial<MenuItem>) => {
    const updatedItems = localItems.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    )
    setLocalItems(updatedItems)
    onUpdateItems(updatedItems)
  }

  const handleDeleteItem = (itemId: number) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟')) {
      const updatedItems = localItems.filter(item => item.id !== itemId)
      setLocalItems(updatedItems)
      onUpdateItems(updatedItems)
    }
  }

  const handleMoveItemUp = (itemId: number) => {
    const categoryItems = localItems.filter(item => item.category === selectedCategory)
    const currentIndex = categoryItems.findIndex(item => item.id === itemId)
    
    if (currentIndex > 0) {
      const allItems = [...localItems]
      const currentItem = categoryItems[currentIndex]
      const previousItem = categoryItems[currentIndex - 1]
      const item1Index = allItems.findIndex(item => item.id === currentItem.id)
      const item2Index = allItems.findIndex(item => item.id === previousItem.id)
      
      if (item1Index !== -1 && item2Index !== -1) {
        [allItems[item1Index], allItems[item2Index]] = [allItems[item2Index], allItems[item1Index]]
        
        setLocalItems(allItems)
        onUpdateItems(allItems)
      }
    }
  }

  const handleMoveItemDown = (itemId: number) => {
    const categoryItems = localItems.filter(item => item.category === selectedCategory)
    const currentIndex = categoryItems.findIndex(item => item.id === itemId)
    
    if (currentIndex < categoryItems.length - 1) {
      const allItems = [...localItems]
      const currentItem = categoryItems[currentIndex]
      const nextItem = categoryItems[currentIndex + 1]
      const item1Index = allItems.findIndex(item => item.id === currentItem.id)
      const item2Index = allItems.findIndex(item => item.id === nextItem.id)
      
      if (item1Index !== -1 && item2Index !== -1) {
        [allItems[item1Index], allItems[item2Index]] = [allItems[item2Index], allItems[item1Index]]
        
        setLocalItems(allItems)
        onUpdateItems(allItems)
      }
    }
  }

  // Get items for selected category
  const selectedCategoryItems = selectedCategory 
    ? localItems.filter(item => item.category === selectedCategory)
    : []

  return (
    <div className="space-y-6">

      
      {/* Navbar Style Selection */}
      <Card>
        <CardHeader>
          <CardTitle>انتخاب سبک نمایش نوبار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Text Only */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  navbarStyle === 'text-only' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onNavbarStyleChange?.('text-only')}
              >
                <div className="space-y-3">
                  <h3 className="font-medium">فقط متن</h3>
                  
                  {/* Preview */}
                  <div className="border rounded p-2 bg-background">
                    <div className="flex gap-2 text-xs justify-center">
                      <span className="px-2 py-1 bg-muted rounded">قهوه</span>
                    </div>
                  </div>
                  
                  {navbarStyle === 'text-only' && (
                    <div className="text-center">
                      <Badge variant="default">انتخاب شده</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Icon Only */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  navbarStyle === 'icon-only' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onNavbarStyleChange?.('icon-only')}
              >
                <div className="space-y-3">
                  <h3 className="font-medium">فقط آیکون</h3>
                  
                  {/* Preview */}
                  <div className="border rounded p-2 bg-background">
                    <div className="flex gap-2 text-xs justify-center">
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <Coffee size={16} />
                      </div>
                    </div>
                  </div>
                  
                  {navbarStyle === 'icon-only' && (
                    <div className="text-center">
                      <Badge variant="default">انتخاب شده</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Icon with Text */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  navbarStyle === 'icon-with-text' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onNavbarStyleChange?.('icon-with-text')}
              >
                <div className="space-y-3">
                  <h3 className="font-medium">آیکون + متن</h3>
                  
                  {/* Preview */}
                  <div className="border rounded p-2 bg-background">
                    <div className="flex gap-2 text-xs justify-center">
                      <div className="flex flex-col items-center space-y-1 p-1">
                        <Coffee size={16} />
                        <span>قهوه</span>
                      </div>
                    </div>
                  </div>
                  
                  {navbarStyle === 'icon-with-text' && (
                    <div className="text-center">
                      <Badge variant="default">انتخاب شده</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle>مدیریت نوبار</CardTitle>
            <Badge variant="secondary">{localCategories.length}</Badge>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddCategory(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            <span>افزودن بخش</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {localCategories.map((category, index) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">
                    {index + 1}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(category.icon)}
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {localItems.filter(item => item.category === category.id).length} آیتم
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMoveCategoryUp(category.id)}
                    disabled={index === 0}
                    title="انتقال به بالا"
                  >
                    <ChevronUp size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMoveCategoryDown(category.id)}
                    disabled={index === localCategories.length - 1}
                    title="انتقال به پایین"
                  >
                    <ChevronDown size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartEditCategory(category.id)}
                    title="ویرایش"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-destructive hover:text-destructive"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Items Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle>مدیریت آیتم‌ها</CardTitle>
            {selectedCategory && (
              <Badge variant="secondary">{selectedCategoryItems.length}</Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddItem(true)}
            disabled={!selectedCategory}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            <span>افزودن آیتم</span>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Category Selector */}
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {localCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    selectedCategory === category.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {getCategoryIcon(category.icon)}
                    <span className="text-sm font-medium">{category.name}</span>
                    <Badge variant={selectedCategory === category.id ? "secondary" : "outline"}>
                      {localItems.filter(item => item.category === category.id).length}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          {selectedCategory ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">
                  آیتم‌های بخش: {localCategories.find(c => c.id === selectedCategory)?.name}
                </h4>
              </div>

              {/* Category Discount Section */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  {/* Percentage Input with Text (left) */}
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={categoryDiscounts[selectedCategory]?.percentage || 10}
                      onChange={(e) => {
                        if (onUpdateCategoryDiscounts) {
                          const value = parseInt(e.target.value) || 0
                          onUpdateCategoryDiscounts({
                            ...categoryDiscounts,
                            [selectedCategory]: {
                              ...categoryDiscounts[selectedCategory],
                              percentage: Math.min(99, Math.max(1, value))
                            }
                          })
                        }
                      }}
                      className="w-20 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                    <span className="text-sm font-bold text-gray-700">تخفیف</span>
                  </div>

                  {/* Toggle (right) */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`categoryDiscount-${selectedCategory}`}
                      checked={categoryDiscounts[selectedCategory]?.isActive || false}
                      onChange={(e) => {
                        if (onUpdateCategoryDiscounts) {
                          onUpdateCategoryDiscounts({
                            ...categoryDiscounts,
                            [selectedCategory]: {
                              ...categoryDiscounts[selectedCategory],
                              isActive: e.target.checked,
                              percentage: categoryDiscounts[selectedCategory]?.percentage || 10
                            }
                          })
                        }
                      }}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor={`categoryDiscount-${selectedCategory}`} className="text-sm">
                      {categoryDiscounts[selectedCategory]?.isActive ? 'فعال' : 'غیرفعال'}
                    </label>
                  </div>
                </div>
              </div>
              
              {selectedCategoryItems.length > 0 ? (
                <div className="space-y-3">
                  {selectedCategoryItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div className="space-y-1">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                          <div className="text-sm">
                            {(() => {
                              // Check for individual discount first
                              if (item.hasIndividualDiscount && item.discountedPrice) {
                                return (
                                  <div className="flex items-center gap-2">
                                    {/* Individual Discounted Price - Green */}
                                    <span className="font-medium text-green-600">
                                      {item.discountedPrice.toLocaleString('en-US', { 
                                        minimumFractionDigits: 0, 
                                        maximumFractionDigits: 2 
                                      }).replace(/,/g, '.')} تومان
                                    </span>
                                    {/* Original Price - Red with Strike-through */}
                                    <span className="text-xs text-red-600 line-through">
                                      {item.price.toLocaleString('en-US').replace(/,/g, '.')} تومان
                                    </span>
                                  </div>
                                )
                              }
                              
                              // Check for category discount
                              const categoryDiscount = categoryDiscounts[item.category]
                              if (categoryDiscount?.isActive) {
                                const originalPrice = Number(item.price) || 0
                                const discountPercentage = Number(categoryDiscount.percentage) || 0
                                
                                // Validate inputs
                                if (originalPrice > 0 && discountPercentage > 0 && discountPercentage < 100) {
                                  // Calculate discounted price: originalPrice - (discountPercentage * originalPrice / 100)
                                  const discountedPrice = originalPrice - (discountPercentage * originalPrice / 100)
                                  
                                  // Final validation
                                  if (!isNaN(discountedPrice) && discountedPrice > 0) {
                                    return (
                                      <div className="flex items-center gap-2">
                                        {/* Category Discounted Price - Green */}
                                        <span className="font-medium text-green-600">
                                          {discountedPrice.toLocaleString('en-US', { 
                                            minimumFractionDigits: 0, 
                                            maximumFractionDigits: 2 
                                          }).replace(/,/g, '.')} تومان
                                        </span>
                                        {/* Original Price - Red with Strike-through */}
                                        <span className="text-xs text-red-600 line-through">
                                          {item.price.toLocaleString('en-US').replace(/,/g, '.')} تومان
                                        </span>
                                      </div>
                                    )
                                  }
                                }
                              }
                              
                              // Default price display
                              return (
                                <span className="font-medium text-green-600">
                                  {item.price.toLocaleString('en-US').replace(/,/g, '.')} تومان
                                </span>
                              )
                            })()}
                          </div>
                          {item.image && (
                            <div className="text-xs text-blue-600">دارای تصویر</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveItemUp(item.id)}
                          disabled={index === 0}
                          title="انتقال به بالا"
                        >
                          <ChevronUp size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveItemDown(item.id)}
                          disabled={index === selectedCategoryItems.length - 1}
                          title="انتقال به پایین"
                        >
                          <ChevronDown size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEditItem(item.id)}
                          title="ویرایش"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteItem(item.id)}
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
                  هیچ آیتمی در این بخش وجود ندارد
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              لطفاً یک بخش را انتخاب کنید تا آیتم‌های آن را مدیریت کنید
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      {showAddCategory && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999999]">
          <Card className="w-96 max-w-[90vw]">
            <CardHeader>
              <CardTitle>افزودن بخش جدید</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">نام بخش *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg"
                  placeholder="مثال: قهوه‌های ویژه"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">توضیحات (اختیاری)</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg"
                  placeholder="توضیحات بخش"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">انتخاب آیکون</label>
                <div className="w-full border border-border rounded-lg p-2">
                  <div className="flex flex-wrap gap-1">
                  {availableIcons.map((iconOption) => (
                    <button
                      key={iconOption.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setCategoryForm({ ...categoryForm, icon: iconOption.id })
                        }}
                        className={`min-w-[48px] w-12 h-12 rounded-md flex items-center justify-center transition-colors duration-200 border-2 cursor-pointer ${
                        categoryForm.icon === iconOption.id
                            ? 'bg-blue-500 text-white border-blue-600'
                            : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-blue-400'
                      }`}
                        title={iconOption.name}
                    >
                      {iconOption.icon}
                    </button>
                  ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={handleAddCategory} 
                  className="flex-1"
                  disabled={!categoryForm.name.trim()}
                >
                  <Save size={16} />
                  <span>افزودن</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddCategory(false)
                    setCategoryForm({ name: '', description: '', icon: 'coffee' })
                  }}
                  className="flex-1"
                >
                  <X size={16} />
                  <span>لغو</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>,
        document.body
      )}

      {/* Add Item Modal */}
      {showAddItem && selectedCategory && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddItem(false)
              setItemForm({ title: '', description: '', price: 0, image: '', category: selectedCategory })
            }
          }}
        >
          <Card className="w-[500px] max-w-[90vw] max-h-[90vh] bg-card/95 backdrop-blur-md border border-border shadow-2xl flex flex-col">
            <CardHeader className="flex-shrink-0 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">افزودن آیتم جدید</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddItem(false)
                    setItemForm({ title: '', description: '', price: 0, image: '', category: selectedCategory })
                  }}
                  className="p-2 h-8 w-8 text-foreground/70 hover:text-foreground hover:bg-background/50 rounded-full"
                >
                  <X size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getCategoryIcon(localCategories.find(c => c.id === selectedCategory)?.icon || 'coffee')}
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">بخش:</span>
                    <span className="font-semibold text-foreground mr-2">
                      {localCategories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Image Management Section - Moved to top and centered */}
              <div className="text-center">
                <label className="block text-sm font-medium mb-3">تصویر آیتم (اختیاری)</label>
                
                {/* Image Preview */}
                {itemForm.image && (
                  <div className="mb-4 flex flex-col items-center">
                    <div className="w-32 h-32 border border-border rounded-lg overflow-hidden">
                      <img
                        src={itemForm.image}
                        alt="Image preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">پیش‌نمایش تصویر</p>
                  </div>
                )}
                
                {/* Image Input */}
                <div className="space-y-3">
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
                          setItemForm({ ...itemForm, image: imageData })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="w-full max-w-xs mx-auto p-3 border border-border rounded-lg text-sm bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 transition-all duration-200"
                  />
                  <p className="text-xs text-muted-foreground">
                    حداکثر حجم: 2 مگابایت • فرمت‌های مجاز: JPG, PNG, GIF
                  </p>
                </div>
                
                {/* Remove Image Button */}
                {itemForm.image && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setItemForm({ ...itemForm, image: '' })}
                    className="mt-3"
                  >
                    حذف تصویر
                  </Button>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">نام آیتم *</label>
                <input
                  type="text"
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="مثال: اسپرسو"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">توضیحات</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg resize-none bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  rows={3}
                  placeholder="توضیحات آیتم (اختیاری)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">قیمت (تومان)</label>
                <input
                  type="number"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Individual Discount Toggle */}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="checkbox"
                    id="hasIndividualDiscount"
                    checked={itemForm.hasIndividualDiscount || false}
                    onChange={(e) => setItemForm({ ...itemForm, hasIndividualDiscount: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="hasIndividualDiscount" className="text-sm font-medium text-foreground">
                    تخفیف جداگانه برای این آیتم
                  </label>
                </div>
              </div>

              {/* Discounted Price - only show if individual discount is enabled */}
              {itemForm.hasIndividualDiscount && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">قیمت بعد از تخفیف (تومان)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.discountedPrice || 0}
                    onChange={(e) => setItemForm({ ...itemForm, discountedPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    این قیمت در صفحه اصلی نمایش داده می‌شود
                  </p>
                </div>
              )}

              </div>
            </CardContent>
            
            {/* Fixed Footer with Buttons */}
            <div className="flex-shrink-0 border-t border-border p-6">
              <div className="flex space-x-2">
                <Button 
                  onClick={handleAddItem} 
                  className="flex-1 h-12 text-base font-medium"
                  disabled={!itemForm.title.trim()}
                >
                  <Save size={18} className="ml-2" />
                  <span>افزودن</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddItem(false)
                    setItemForm({ title: '', description: '', price: 0, image: '', category: selectedCategory })
                  }}
                  className="flex-1 h-12 text-base font-medium"
                >
                  <X size={18} className="ml-2" />
                  <span>لغو</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>,
        document.body
      )}

      {/* Edit Category Modal */}
                  {editingCategory && typeof document !== 'undefined' && createPortal(
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999999]"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    handleCancelCategoryEdit()
                  }
                }}
              >
          <Card className="w-96 max-w-[90vw]">
            <CardHeader>
              <CardTitle>ویرایش نوبار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const category = localCategories.find(c => c.id === editingCategory)
                if (!category) return null
                
                return (
                  <>
                    {/* انتخاب نام */}
                    <div>
                      <label className="block text-sm font-medium mb-2">انتخاب نام</label>
                      <input
                        type="text"
                        defaultValue={category.name}
                        onChange={(e) => handleUpdateCategory(category.id, { name: e.target.value })}
                        className="w-full p-3 border border-border rounded-lg"
                        placeholder="نام بخش را وارد کنید..."
                        autoFocus
                      />
                    </div>
                    
                                              {/* انتخاب آیکون */}
                    <div>
                      <label className="block text-sm font-medium mb-2">انتخاب آیکون</label>
                            <div className="w-full border border-border rounded-lg p-2">
                              <div className="flex flex-wrap gap-1">
                        {availableIcons.map((iconOption) => (
                          <button
                            key={iconOption.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleUpdateCategory(category.id, { icon: iconOption.id })
                                    }}
                                    className={`min-w-[48px] w-12 h-12 rounded-md flex items-center justify-center transition-colors duration-200 border-2 cursor-pointer ${
                              category.icon === iconOption.id
                                        ? 'bg-blue-500 text-white border-blue-600'
                                        : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-blue-400'
                            }`}
                                    title={iconOption.name}
                          >
                            {iconOption.icon}
                          </button>
                        ))}
                              </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button 
                        onClick={handleSaveCategoryEdit} 
                        className="flex-1"
                      >
                        <Save size={16} />
                        <span>ذخیره</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancelCategoryEdit}
                        className="flex-1"
                      >
                        <X size={16} />
                        <span>لغو</span>
                      </Button>
                    </div>
                  </>
                )
              })()}
            </CardContent>
          </Card>
        </div>,
        document.body
      )}

      {/* Edit Item Modal */}
              {editingItem && typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999999] p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCancelItemEdit()
              }
            }}
          >
            <Card className="w-[500px] max-w-[90vw] max-h-[90vh] bg-card/95 backdrop-blur-md border border-border shadow-2xl flex flex-col">
              <CardHeader className="flex-shrink-0 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">ویرایش آیتم</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelItemEdit}
                    className="p-2 h-8 w-8 text-foreground/70 hover:text-foreground hover:bg-background/50 rounded-full"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6">
                {(() => {
                  const item = localItems.find(i => i.id === editingItem)
                  if (!item) return null
                  
                  return (
                    <div className="space-y-4">
                      {/* Image Management Section - Moved to top and centered */}
                      <div className="text-center">
                        <label className="block text-sm font-medium mb-3">تصویر آیتم</label>
                        
                        {/* Current Image Preview */}
                        {item.image && (
                          <div className="mb-4 flex flex-col items-center">
                            <div className="w-32 h-32 border border-border rounded-lg overflow-hidden">
                              <img
                                src={item.image}
                                alt="Current image"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">تصویر فعلی</p>
                          </div>
                        )}
                        
                        {/* Image Input */}
                        <div className="space-y-3">
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
                                
                                // Convert to base64 and update
                                const reader = new FileReader()
                                reader.onload = (e) => {
                                  const imageData = e.target?.result as string
                                  handleUpdateItem(item.id, { image: imageData })
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                            className="w-full max-w-xs mx-auto p-3 border border-border rounded-lg text-sm bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 transition-all duration-200"
                          />
                          <p className="text-xs text-muted-foreground">
                            حداکثر حجم: 2 مگابایت • فرمت‌های مجاز: JPG, PNG, GIF
                          </p>
                        </div>
                        
                        {/* Remove Image Button */}
                        {item.image && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUpdateItem(item.id, { image: '' })}
                            className="mt-3"
                          >
                            حذف تصویر
                          </Button>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">نام آیتم *</label>
                        <input
                          type="text"
                          defaultValue={item.title}
                          onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                          className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          autoFocus
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">توضیحات *</label>
                        <textarea
                          defaultValue={item.description}
                          onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                          className="w-full p-3 border border-border rounded-lg resize-none bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">قیمت (تومان) *</label>
                        <input
                          type="number"
                          defaultValue={item.price}
                          onChange={(e) => handleUpdateItem(item.id, { price: parseInt(e.target.value) || 0 })}
                          className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          min="0"
                        />
                        
                        {/* Current Price Display */}
                        <div className="mt-2 p-2 bg-muted/30 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">قیمت فعلی:</div>
                          <div className="text-sm">
                            {(() => {
                              // Check for individual discount first
                              if (item.hasIndividualDiscount && item.discountedPrice) {
                                return (
                                  <div className="flex items-center gap-2">
                                    {/* Individual Discounted Price - Green */}
                                    <span className="font-medium text-green-600">
                                      {item.discountedPrice.toLocaleString('en-US', { 
                                        minimumFractionDigits: 0, 
                                        maximumFractionDigits: 2 
                                      }).replace(/,/g, '.')} تومان
                                    </span>
                                    {/* Original Price - Red with Strike-through */}
                                    <span className="text-xs text-red-600 line-through">
                                      {item.price.toLocaleString('en-US').replace(/,/g, '.')} تومان
                                    </span>
                                  </div>
                                )
                              }
                              
                              // Check for category discount
                              const categoryDiscount = categoryDiscounts[item.category]
                              if (categoryDiscount?.isActive) {
                                const originalPrice = Number(item.price) || 0
                                const discountPercentage = Number(categoryDiscount.percentage) || 0
                                
                                // Validate inputs
                                if (originalPrice > 0 && discountPercentage > 0 && discountPercentage < 100) {
                                  // Calculate discounted price: originalPrice - (discountPercentage * originalPrice / 100)
                                  const discountedPrice = originalPrice - (discountPercentage * originalPrice / 100)
                                  
                                  // Final validation
                                  if (!isNaN(discountedPrice) && discountedPrice > 0) {
                                    return (
                                      <div className="flex items-center gap-2">
                                        {/* Category Discounted Price - Green */}
                                        <span className="font-medium text-green-600">
                                          {discountedPrice.toLocaleString('en-US', { 
                                            minimumFractionDigits: 0, 
                                            maximumFractionDigits: 2 
                                          }).replace(/,/g, '.')} تومان
                                        </span>
                                        {/* Original Price - Red with Strike-through */}
                                        <span className="text-xs text-red-600 line-through">
                                          {item.price.toLocaleString('en-US').replace(/,/g, '.')} تومان
                                        </span>
                                      </div>
                                    )
                                  }
                                }
                              }
                              
                              // Default price display
                              return (
                                <span className="font-medium text-green-600">
                                  {item.price.toLocaleString('en-US').replace(/,/g, '.')} تومان
                                </span>
                              )
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Individual Discount Toggle */}
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <input
                            type="checkbox"
                            id={`hasIndividualDiscount-${item.id}`}
                            checked={item.hasIndividualDiscount || false}
                            onChange={(e) => handleUpdateItem(item.id, { hasIndividualDiscount: e.target.checked })}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                          />
                          <label htmlFor={`hasIndividualDiscount-${item.id}`} className="text-sm font-medium text-foreground">
                            تخفیف جداگانه برای این آیتم
                          </label>
                        </div>
                      </div>

                      {/* Discounted Price - only show if individual discount is enabled */}
                      {item.hasIndividualDiscount && (
                        <div>
                          <label className="block text-sm font-medium mb-2 text-foreground">قیمت بعد از تخفیف (تومان)</label>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={item.discountedPrice || 0}
                            onChange={(e) => handleUpdateItem(item.id, { discountedPrice: parseFloat(e.target.value) || 0 })}
                            className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            placeholder="0.00"
                            min="0"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            این قیمت در صفحه اصلی نمایش داده می‌شود
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
              
              {/* Fixed Footer with Buttons */}
              <div className="flex-shrink-0 border-t border-border p-6">
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSaveItemEdit} 
                    className="flex-1 h-12 text-base font-medium"
                  >
                    <Save size={18} className="ml-2" />
                    <span>ذخیره</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelItemEdit}
                    className="flex-1 h-12 text-base font-medium"
                  >
                    <X size={18} className="ml-2" />
                    <span>لغو</span>
                  </Button>
                </div>
              </div>
            </Card>
        </div>,
        document.body
      )}
    </div>
  )
}