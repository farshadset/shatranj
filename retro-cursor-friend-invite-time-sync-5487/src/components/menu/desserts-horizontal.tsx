'use client'

import React, { useState, useRef, forwardRef } from 'react'
import { ChevronLeft, ChevronRight, Star, Sparkles, Flame, Gift, Heart, Cake, Cookie, Candy, Crown, Zap, Target, Ban, Percent, Coffee, Pizza, Utensils, GlassWater, Sandwich, Salad, Sun, IceCream, Fish, Beef, Grape } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useMenuData } from '@/contexts/MenuDataContext'
import { DessertsSectionConfig, MenuItem } from '@/types/menu'

interface DessertsHorizontalProps {
  config?: DessertsSectionConfig
  items?: MenuItem[]
}

// Icon mapping for desserts section
const dessertsIconOptions = [
  { key: 'cake', icon: <Cake size={32} />, name: 'کیک' },
  { key: 'cookie', icon: <Cookie size={32} />, name: 'کلوچه' },
  { key: 'candy', icon: <Candy size={32} />, name: 'آبنبات' },
  { key: 'sparkles', icon: <Sparkles size={32} />, name: 'درخشش' },
  { key: 'crown', icon: <Crown size={32} />, name: 'تاج' },
  { key: 'zap', icon: <Zap size={32} />, name: 'برق' },
  { key: 'target', icon: <Target size={32} />, name: 'هدف' },
  { key: 'percent', icon: <Percent size={32} />, name: 'درصد' },
  { key: 'coffee', icon: <Coffee size={32} />, name: 'قهوه' },
  { key: 'pizza', icon: <Pizza size={32} />, name: 'پیتزا' },
  { key: 'burger', icon: <Utensils size={32} />, name: 'برگر' },
  { key: 'cold-drinks', icon: <GlassWater size={32} />, name: 'نوشیدنی سرد' },
  { key: 'sandwich', icon: <Sandwich size={32} />, name: 'ساندویچ' },
  { key: 'salad', icon: <Salad size={32} />, name: 'سالاد' },
  { key: 'breakfast', icon: <Sun size={32} />, name: 'صبحانه' },
  { key: 'special', icon: <Star size={32} />, name: 'ویژه' },
  { key: 'offers', icon: <Gift size={32} />, name: 'پیشنهادات' },
  { key: 'hot', icon: <Flame size={32} />, name: 'داغ' },
  { key: 'favorite', icon: <Heart size={32} />, name: 'محبوب' },
  { key: 'ice-cream', icon: <IceCream size={32} />, name: 'بستنی' },
  { key: 'seafood', icon: <Fish size={32} />, name: 'غذای دریایی' },
  { key: 'meat', icon: <Beef size={32} />, name: 'گوشت' },
  { key: 'juice', icon: <Grape size={32} />, name: 'آبمیوه' },
  { key: 'none', icon: <Ban size={32} />, name: 'بدون آیکن' }
]

// Function to get desserts icon
const getDessertsIcon = (iconKey: string) => {
  const option = dessertsIconOptions.find(opt => opt.key === iconKey)
  return option ? option.icon : <Cake size={32} />
}

export const DessertsHorizontal = forwardRef<HTMLElement, DessertsHorizontalProps>(({ 
  config = { isVisible: true, title: 'کیک و دسر', description: 'آیتم‌های خوشمزه برای انتخاب شما', order: 1 },
  items = []
}, ref) => {
  const { currentTheme } = useTheme()
  const { menuItems, dessertsDiscountConfig } = useMenuData()
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  

  
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Get all desserts items from props or fallback to context
  const dessertsItems = items.filter((item: MenuItem) => item.category === 'desserts').length > 0 
    ? items.filter((item: MenuItem) => item.category === 'desserts')
    : menuItems.filter((item: MenuItem) => item.category === 'desserts')







  // Drag and drop functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    
    setIsDragging(true)
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Scroll buttons
  const scrollLeftHandler = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRightHandler = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  return (
    <section ref={ref} className="py-6 border-b border-gray-200">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <div className="mb-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {config.icon && config.icon !== 'none' && (
                          <div className="text-primary">
                            {getDessertsIcon(config.icon)}
                          </div>
                        )}
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground" 
                            style={{ fontFamily: currentTheme.typography.headlineFontFamily }}>
                          {config.title}
                        </h2>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {dessertsItems.length} {config.description}
                      </p>
                    </div>

                  </div>
                </div>
              </div>
              

            </div>
          </div>

          {/* Horizontal Items Container */}
          <div className="relative group">
            {/* Scroll Left Button */}
            <button
              onClick={scrollLeftHandler}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-lg flex items-center justify-center text-foreground hover:bg-background transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Scroll Right Button */}
            <button
              onClick={scrollRightHandler}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-lg flex items-center justify-center text-foreground hover:bg-background transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Items Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 cursor-grab select-none"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* All Items with Square Template Design */}
              {dessertsItems.map((item) => (
                <div key={item.id} className="flex-shrink-0">
                  <div className="w-80 h-96 bg-card text-card-foreground shadow-sm border border-border rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 group overflow-hidden relative z-10">
                    

                    
                    {/* Image Section - Same as Square Template */}
                    <div className="relative h-56 overflow-hidden z-10">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground font-medium">تصویر</span>
                        </div>
                      )}
                    </div>

                    {/* Content Section - Same as Square Template */}
                    <div className="p-5 flex flex-col h-40 relative z-20">
                      {/* Title - Same styling as other menu items */}
                      <h3 className="text-2xl font-bold text-foreground mb-3 leading-tight font-headline group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>
                      
                      {/* Description - Same styling as other menu items */}
                      <p className="text-base text-muted-foreground leading-relaxed font-body group-hover:text-foreground/80 transition-colors duration-300 mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      
                                            {/* Price - Centered */}
                      <div className="mt-auto flex flex-col items-center justify-center space-y-2">
                        {(dessertsDiscountConfig?.isActive || item.hasIndividualDiscount) ? (
                          <div className="flex items-center gap-3">
                            {/* Discounted Price - Green Box on Left */}
                            <span className="text-lg font-bold text-green-600 bg-green-100 border border-green-300 px-3 py-1 rounded-full">
                              {(() => {
                                // Check if item has individual discount
                                if (item.hasIndividualDiscount && item.discountedPrice) {
                                  return item.discountedPrice.toLocaleString('en-US', { 
                                    minimumFractionDigits: 0, 
                                    maximumFractionDigits: 2 
                                  }).replace(/,/g, '.')
                                }
                                
                                // Use global discount if no individual discount
                                if (dessertsDiscountConfig?.isActive) {
                                  const originalPrice = Number(item.price) || 0
                                  const discountPercentage = Number(dessertsDiscountConfig?.percentage) || 0
                                  
                                  // Validate inputs
                                  if (originalPrice <= 0 || discountPercentage <= 0 || discountPercentage >= 100) {
                                    return originalPrice.toLocaleString('en-US').replace(/,/g, '.')
                                  }
                                  
                                  // Calculate discounted price: originalPrice - (discountPercentage * originalPrice / 100)
                                  const discountedPrice = originalPrice - (discountPercentage * originalPrice / 100)
                                  
                                  // Final validation
                                  if (isNaN(discountedPrice) || discountedPrice <= 0) {
                                    return originalPrice.toLocaleString('en-US').replace(/,/g, '.')
                                  }
                                  
                                  return discountedPrice.toLocaleString('en-US', { 
                                    minimumFractionDigits: 0, 
                                    maximumFractionDigits: 2 
                                  }).replace(/,/g, '.')
                                }
                                
                                // Fallback to original price
                                return item.price.toLocaleString('en-US').replace(/,/g, '.')
                              })()} تومان
                            </span>
                            {/* Original Price - Red Box on Right with Strike-through */}
                            <span className="text-sm font-medium text-red-600 bg-red-100 border border-red-300 px-2 py-1 rounded-full line-through">
                              {item.price.toLocaleString('en-US').replace(/,/g, '.')} تومان
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-green-600 bg-green-100 border border-green-300 px-3 py-1 rounded-full">
                            {item.price.toLocaleString('en-US').replace(/,/g, '.')} تومان
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

// Add display name for debugging
DessertsHorizontal.displayName = 'DessertsHorizontal'
