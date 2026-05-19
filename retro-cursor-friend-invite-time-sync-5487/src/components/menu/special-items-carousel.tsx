'use client'

import React, { useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MenuItem } from '@/types/menu'
import { Star, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpecialItemsCarouselProps {
  specialItems: MenuItem[]
  onEditItem?: (item: MenuItem) => void
  isAdmin?: boolean
  editPriceOnly?: boolean
}

export function SpecialItemsCarousel({ specialItems, onEditItem, isAdmin = false, editPriceOnly = false }: SpecialItemsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [showAllItemsModal, setShowAllItemsModal] = useState(false)
  const [showPriceEditModal, setShowPriceEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newPrice, setNewPrice] = useState('')

  // Show only first 7 items
  const displayedItems = specialItems.slice(0, 7)
  const hasMoreItems = specialItems.length > 7

  // Mouse drag-to-scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    scrollContainerRef.current.style.cursor = 'grabbing'
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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }

  const handleShowAllItems = () => {
    setShowAllItemsModal(true)
  }

  const handleCloseModal = () => {
    setShowAllItemsModal(false)
  }

  const handleClosePriceModal = () => {
    setShowPriceEditModal(false)
    setEditingItem(null)
    setNewPrice('')
  }

  const handleSavePrice = () => {
    if (editingItem && newPrice && !isNaN(Number(newPrice))) {
      const updatedItem = { ...editingItem, price: Number(newPrice) }
      onEditItem?.(updatedItem)
      handleClosePriceModal()
    }
  }

  const handleEditClick = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (editPriceOnly) {
      setEditingItem(item)
      setNewPrice(item.price.toString())
      setShowPriceEditModal(true)
    } else {
      onEditItem?.(item)
    }
  }

  // If no special items, don't render anything
  if (!specialItems.length) {
    return null
  }

  return (
    <div className="py-6 border-b border-gray-200">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-headline">
                تخفیف‌دارها
              </h2>
              {hasMoreItems && (
                <p className="text-sm text-muted-foreground mt-1">
                  {specialItems.length} آیتم موجود
                </p>
              )}
            </div>
          </div>
          

        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 cursor-grab select-none"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollBehavior: 'smooth'
            }}
          >
            {displayedItems.map((item, index) => (
              <Card
                key={item.id}
                className="flex-shrink-0 w-64 bg-white/90 backdrop-blur-sm border border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              >
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    
                    
                    
                    {/* Admin Edit Button */}
                    {isAdmin && onEditItem && (
                      <Button
                        size="sm"
                        className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={(e) => handleEditClick(e, item)}
                      >
                        ویرایش
                      </Button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-foreground mb-2 font-headline line-clamp-1">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3 font-body line-clamp-2">
                      {item.description}
                    </p>
                    
                                         {/* Price */}
                     <div className="flex items-center justify-between">
                       <div className="text-right">
                         <span className="text-lg font-bold text-green-600">
                           {item.price.toLocaleString('en-US').replace(/,/g, '.')}
                         </span>
                         <span className="text-sm text-green-500 mr-1">
                           تومان
                         </span>
                       </div>
                       
                       {/* Discount Badge (if applicable) */}
                       <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                         تخفیف ویژه
                       </div>
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Show All Button - positioned after the last item */}
            {hasMoreItems && (
              <div className="flex-shrink-0 w-64 flex items-center justify-center">
                <Button
                  onClick={handleShowAllItems}
                  variant="ghost"
                  size="lg"
                  className="h-64 w-full bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-800 transition-all duration-300 group rounded-xl"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      ✨
                    </div>
                    <div className="font-bold text-lg mb-2">
                      نمایش همه
                    </div>
                    <div className="text-sm text-gray-600">
                      {specialItems.length - 7} آیتم بیشتر
                    </div>
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Show All Items Modal */}
      {showAllItemsModal && (
        <div className="fixed inset-0 bg-black/50 z-[99999999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  تمام آیتم‌های تخفیف‌دار ({specialItems.length} آیتم)
                </h3>
              </div>
              <Button
                onClick={handleCloseModal}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {specialItems.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-white border border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                  >
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden rounded-t-lg">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        
                        {/* Admin Edit Button */}
                        {isAdmin && onEditItem && (
                          <Button
                            size="sm"
                            className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              onEditItem(item)
                              handleCloseModal()
                            }}
                          >
                            ویرایش
                          </Button>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <h3 className="font-bold text-sm text-foreground mb-1 font-headline line-clamp-1">
                          {item.title}
                        </h3>
                        
                        <p className="text-xs text-muted-foreground mb-2 font-body line-clamp-2">
                          {item.description}
                        </p>
                        
                                                 {/* Price */}
                         <div className="flex items-center justify-between">
                           <div className="text-right">
                             <span className="text-sm font-bold text-green-600">
                               {item.price.toLocaleString('en-US').replace(/,/g, '.')}
                             </span>
                             <span className="text-xs text-green-500 mr-1">
                               تومان
                             </span>
                           </div>
                           
                           {/* Discount Badge */}
                           <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                             تخفیف ویژه
                           </div>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Edit Modal */}
      {showPriceEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 z-[99999999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                ویرایش قیمت: {editingItem.title}
              </h3>
              <Button
                onClick={handleClosePriceModal}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  قیمت جدید (تومان)
                </label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="قیمت را وارد کنید"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={handleClosePriceModal}
                  variant="outline"
                  size="sm"
                >
                  لغو
                </Button>
                <Button
                  onClick={handleSavePrice}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  ذخیره
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
