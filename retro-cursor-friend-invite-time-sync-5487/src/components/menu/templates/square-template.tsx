'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MenuItem } from '@/types/menu'
import { cn } from '@/lib/utils'
import { Edit3, X } from 'lucide-react'

interface CategoryDiscount {
  isActive: boolean
  percentage: number
}

interface SquareTemplateProps {
  item: MenuItem
  className?: string
  isAdmin?: boolean
  onEditItem?: ((item: MenuItem) => void) | null
  categoryDiscounts?: Record<string, CategoryDiscount>
}

export function SquareTemplate({ item, className, isAdmin = false, onEditItem, categoryDiscounts = {} }: SquareTemplateProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)
  const [editDescription, setEditDescription] = useState(item.description)
  const [editImage, setEditImage] = useState(item.image)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleEditClick = () => {
    console.log('Square template edit button clicked for:', item.title)
    setEditTitle(item.title)
    setEditDescription(item.description)
    setEditImage(item.image)
    setImagePreview(null)
    setImageError('')
    setShowEditModal(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('حجم فایل نباید بیشتر از ۵ مگابایت باشد')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setImageError('لطفاً فقط فایل تصویری انتخاب کنید')
        return
      }

      setImageError('')
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setEditImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (!editTitle.trim()) {
      alert('نام آیتم نمی‌تواند خالی باشد')
      return
    }

    const updatedItem: MenuItem = {
      ...item,
      title: editTitle.trim(),
      description: editDescription.trim(),
      image: imagePreview || editImage
    }

    console.log('Saving updated item:', updatedItem)
    
    if (onEditItem) {
      onEditItem(updatedItem)
    }
    
    setShowEditModal(false)
  }

  const handleCancel = () => {
    setShowEditModal(false)
    setEditTitle(item.title)
    setEditDescription(item.description)
    setEditImage(item.image)
    setImagePreview(null)
    setImageError('')
  }

  return (
    <>
      <div className={cn(
        "group relative text-center p-4 w-full max-w-[200px] mx-auto",
        className
      )}>
        {/* Edit Button - Only visible when admin is logged in */}
        {isAdmin && onEditItem && (
          <div className="absolute top-2 right-2 z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="p-2 bg-red-500 hover:bg-red-600 text-white border border-white shadow-lg rounded-full cursor-pointer transition-all duration-200 hover:scale-110"
              title="ویرایش آیتم"
            >
              <Edit3 size={14} className="text-white" />
            </Button>
          </div>
        )}

        <div className="relative z-10">
          {/* Square Image */}
          <div className="w-40 h-40 mx-auto mb-4 overflow-hidden rounded-lg">
            <Image
              src={imagePreview || item.image}
              alt={item.title}
              width={160}
              height={160}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300 ease-in-out"
              sizes="160px"
              priority={false}
            />
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-bold text-foreground mb-2 leading-tight font-headline group-hover:text-primary transition-colors duration-300 line-clamp-2 text-center">
            {item.title}
          </h3>
          
          {/* Price */}
          <div className="mt-auto text-center">
            {(() => {
              // Check for individual discount first
              if (item.hasIndividualDiscount && item.discountedPrice) {
                return (
                  <div className="flex flex-col items-center gap-1">
                    {/* Individual Discounted Price - Green */}
                    <span className="text-base font-bold text-green-600 bg-green-100 border border-green-300 px-3 py-1 rounded-full">
                      {item.discountedPrice.toLocaleString('en-US', { 
                        minimumFractionDigits: 0, 
                        maximumFractionDigits: 2 
                      }).replace(/,/g, '.')} تومان
                    </span>
                    {/* Original Price - Red with Strike-through */}
                    <span className="text-xs font-medium text-red-600 bg-red-100 border border-red-300 px-2 py-1 rounded-full line-through">
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
                      <div className="flex flex-col items-center gap-1">
                        {/* Category Discounted Price - Green */}
                        <span className="text-base font-bold text-green-600 bg-green-100 border border-green-300 px-3 py-1 rounded-full">
                          {discountedPrice.toLocaleString('en-US', { 
                            minimumFractionDigits: 0, 
                            maximumFractionDigits: 2 
                          }).replace(/,/g, '.')} تومان
                        </span>
                        {/* Original Price - Red with Strike-through */}
                        <span className="text-xs font-medium text-red-600 bg-red-100 border border-red-300 px-2 py-1 rounded-full line-through">
                          {item.price.toLocaleString('en-US').replace(/,/g, '.')} تومان
                        </span>
                      </div>
                    )
                  }
                }
              }
              
              // Default price display
              return (
                <span className={`text-base font-bold px-3 py-1 rounded-full ${
                  item.category === 'desserts' 
                    ? 'text-green-600 bg-green-100 border border-green-300' 
                    : 'text-blue-600 bg-blue-100'
                }`}>
                  {item.price.toLocaleString('en-US').replace(/,/g, '.')} تومان
                </span>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Edit Modal Popup - Rendered in Portal */}
      {typeof document !== 'undefined' && showEditModal && createPortal(
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
          onClick={handleCancel}
        >
          <Card className="modal-content w-[600px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-md border border-border shadow-2xl relative z-[999999]" style={{ zIndex: 999999 }}>
            {/* Close Button - Top Right */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="absolute top-3 right-3 p-1 h-8 w-8 text-foreground/70 hover:text-foreground hover:bg-background/50 rounded-full"
            >
              <X size={16} />
            </Button>

            {/* Modal Header */}
            <div className="pt-6 pb-4 px-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground text-center">ویرایش آیتم منو</h3>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Image Section */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  تصویر آیتم
                </label>
                <div className="space-y-3">
                  {/* Current Image Preview */}
                  <div className="relative w-32 h-32 mx-auto border border-border rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview || editImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                  
                  {/* Image Upload */}
                  <div className="text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id={`image-upload-${item.id}`}
                    />
                    <label
                      htmlFor={`image-upload-${item.id}`}
                      className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      تغییر تصویر
                    </label>
                  </div>

                  {imageError && (
                    <p className="text-sm text-red-500 text-center">{imageError}</p>
                  )}
                </div>
              </div>

              {/* Title Section */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  نام آیتم
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              {/* Description Section */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  توضیحات
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} className="flex-1">
                  ذخیره تغییرات
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  لغو
                </Button>
              </div>
            </div>
          </Card>
        </div>,
        document.body
      )}
    </>
  )
}
