'use client'

import React, { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MenuItem } from '@/types/menu'
import { cn } from '@/lib/utils'
import { Edit3, X, HelpCircle, Crop, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

interface CategoryDiscount {
  isActive: boolean
  percentage: number
}

interface CompactTemplateProps {
  item: MenuItem
  className?: string
  isAdmin?: boolean
  onEditItem?: ((item: MenuItem) => void) | null
  categoryDiscounts?: Record<string, CategoryDiscount>
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export function CompactTemplate({ item, className, isAdmin = false, onEditItem, categoryDiscounts = {} }: CompactTemplateProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)
  const [editDescription, setEditDescription] = useState(item.description)
  const [editImage, setEditImage] = useState(item.image)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const [showCropTool, setShowCropTool] = useState(false)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 })
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleEditClick = () => {
    setEditTitle(item.title)
    setEditDescription(item.description)
    setEditImage(item.image)
    setImagePreview(null)
    setImageError('')
    setShowCropTool(false)
    setScale(1)
    setRotation(0)
    setOriginalImage(null)
    setShowEditModal(true)
  }

  // Image compression function
  const compressImage = (file: File, maxSizeKB: number = 500): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new window.Image()
      
      img.onload = () => {
        // Calculate dimensions to maintain aspect ratio
        const maxDimension = 600
        let { width, height } = img
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        let quality = 0.9
        let dataUrl = canvas.toDataURL('image/jpeg', quality)
        
        // Reduce quality until size is under limit
        while (dataUrl.length > maxSizeKB * 1024 * 0.75 && quality > 0.1) {
          quality -= 0.1
          dataUrl = canvas.toDataURL('image/jpeg', quality)
        }
        
        resolve(dataUrl)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('فقط فایل‌های تصویری مجاز هستند')
      return
    }

    try {
      // Compress image to 500KB
      const compressedImage = await compressImage(file, 500)
      setOriginalImage(compressedImage)
      setImagePreview(compressedImage)
      setEditImage(compressedImage)
      setImageError('')
      setShowCropTool(true)
    } catch (error) {
      setImageError('خطا در پردازش تصویر')
    }
  }

  // Crop and apply image
  const handleCropApply = () => {
    if (!originalImage || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const img = new window.Image()
    
    img.onload = () => {
      // Calculate crop dimensions
      const imgWidth = img.width
      const imgHeight = img.height
      
      const cropX = (cropArea.x / 100) * imgWidth
      const cropY = (cropArea.y / 100) * imgHeight
      const cropWidth = (cropArea.width / 100) * imgWidth
      const cropHeight = (cropArea.height / 100) * imgHeight
      
      // Set canvas size to crop dimensions
      canvas.width = cropWidth
      canvas.height = cropHeight
      
      // Apply transformations and crop
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(scale, scale)
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        -cropWidth / 2, -cropHeight / 2, cropWidth, cropHeight
      )
      ctx.restore()
      
      // Get final image
      const finalImage = canvas.toDataURL('image/jpeg', 0.9)
      setEditImage(finalImage)
      setImagePreview(finalImage)
      setShowCropTool(false)
    }
    
    img.src = originalImage
  }

  const handleSave = () => {
    if (onEditItem) {
      // Create updated item
      const updatedItem = { 
        ...item, 
        title: editTitle, 
        description: editDescription, 
        image: editImage
      }
      onEditItem(updatedItem)
      setShowEditModal(false)
    }
  }

  const handleCancel = () => {
    setEditTitle(item.title)
    setEditDescription(item.description)
    setEditImage(item.image)
    setImagePreview(null)
    setImageError('')
    setShowCropTool(false)
    setScale(1)
    setRotation(0)
    setOriginalImage(null)
    setShowEditModal(false)
  }

  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowEditModal(false)
    }
  }

  return (
    <>
      <Card className={cn(
        "group relative backdrop-blur-md shadow-xl rounded-xl border-2 border-transparent hover:border-gold/80 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl overflow-hidden touch-manipulation mx-auto",
        "max-w-[645px]", // 575px + 70px = 645px
        className
      )}>
        {/* Card Background Layer - Only this should have opacity */}
        <div 
          className="absolute inset-0 rounded-xl"
          style={{ 
            backgroundColor: `hsl(var(--card))`,
            opacity: `var(--opacity-card)`
          }}
        />
        {/* Edit Button - Only visible when admin is logged in */}
        {isAdmin && onEditItem && (
          <div className="absolute top-3 right-3 z-[9999]">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleEditClick()
              }}
              className="p-3 bg-red-500 hover:bg-red-600 text-white border-2 border-white shadow-lg rounded-full cursor-pointer transition-all duration-200 hover:scale-110"
              title="ویرایش آیتم"
              style={{ 
                zIndex: 9999,
                position: 'relative'
              }}
            >
              <Edit3 size={18} className="text-white" />
            </Button>
          </div>
        )}

        <div className="flex flex-row-reverse relative z-10">
          {/* Image Section - 28% width with further reduced height and zoom effect */}
          <div className="w-[28%] flex-shrink-0 overflow-hidden rounded-l-xl">
            <div className="relative w-full h-[189px] sm:h-[197px]">
              <Image
                src={imagePreview || editImage || item.image}
                alt={item.title}
                fill
                className="object-cover rounded-l-xl group-hover:scale-110 transition-transform duration-300 ease-in-out"
                sizes="28vw"
                priority={false}
              />
            </div>
          </div>
          
          {/* Content Section - 72% width with further reduced padding */}
          <div className="w-[72%] flex flex-col text-right px-8 py-5 relative">
            <h3 className="text-2xl font-bold text-foreground mb-3 leading-tight font-headline group-hover:text-primary transition-colors duration-300">
              {item.title}
            </h3>
            
            <p className="text-base text-muted-foreground leading-relaxed font-body group-hover:text-foreground/80 transition-colors duration-300 mb-4 line-clamp-2 overflow-hidden">
              {item.description}
            </p>

            {/* Price Display - Bottom Right */}
            <div className="absolute bottom-5 right-8">
              {(() => {
                // Check for individual discount first
                if (item.hasIndividualDiscount && item.discountedPrice) {
                  return (
                    <div className="flex items-center gap-2">
                      {/* Individual Discounted Price - Green */}
                      <span className="text-lg font-bold text-green-600 bg-green-100 border border-green-300 px-3 py-1 rounded-full">
                        {item.discountedPrice.toLocaleString('en-US', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 2 
                        }).replace(/,/g, '.')} تومان
                      </span>
                      {/* Original Price - Red with Strike-through */}
                      <span className="text-sm font-medium text-red-600 bg-red-100 border border-red-300 px-2 py-1 rounded-full line-through">
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
                          <span className="text-lg font-bold text-green-600 bg-green-100 border border-green-300 px-3 py-1 rounded-full">
                            {discountedPrice.toLocaleString('en-US', { 
                              minimumFractionDigits: 0, 
                              maximumFractionDigits: 2 
                            }).replace(/,/g, '.')} تومان
                          </span>
                          {/* Original Price - Red with Strike-through */}
                          <span className="text-sm font-medium text-red-600 bg-red-100 border border-red-300 px-2 py-1 rounded-full line-through">
                            {item.price.toLocaleString('en-US').replace(/,/g, '.')} تومان
                          </span>
                        </div>
                      )
                    }
                  }
                }
                
                // Default price display
                return (
                  <span className={`text-lg font-bold px-3 py-1 rounded-full ${
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
      </Card>

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
          onClick={handleModalClick}
        >
          <Card className="modal-content w-[600px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-md border border-border shadow-2xl relative z-[999999]" style={{ zIndex: 999999 }}>
            {/* Close Button - Top Right */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditModal(false)}
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
                  
                  {/* Image Upload with Help */}
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id={`image-upload-${item.id}`}
                    />
                    <div className="flex items-center justify-center gap-2">
                      <label
                        htmlFor={`image-upload-${item.id}`}
                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        تغییر تصویر
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHelp(!showHelp)}
                        className="p-2 text-muted-foreground hover:text-foreground"
                        title="راهنمای آپلود"
                      >
                        <HelpCircle size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Help Information */}
                  {showHelp && (
                    <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground text-center space-y-1">
                      <p>حداکثر حجم: 500 کیلوبایت</p>
                      <p>ابعاد پیشنهادی: 600 × 600 پیکسل</p>
                      <p>نسبت تصویر: 1:1 (مربعی)</p>
                    </div>
                  )}
                  
                  {/* Image Error */}
                  {imageError && (
                    <p className="text-red-500 text-sm text-center">{imageError}</p>
                  )}
                </div>
              </div>

              {/* Crop Tool Panel */}
              {showCropTool && originalImage && (
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <h4 className="text-sm font-medium text-foreground mb-3 text-center">ابزار برش تصویر</h4>
                  
                  {/* Image Display for Cropping */}
                  <div className="relative w-full h-64 border border-border rounded-lg overflow-hidden mb-4">
                    <img
                      ref={imageRef}
                      src={originalImage}
                      alt="Crop Preview"
                      className="w-full h-full object-contain"
                      style={{
                        transform: `scale(${scale}) rotate(${rotation}deg)`
                      }}
                    />
                  </div>
                  
                  {/* Crop Controls */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">مقیاس</label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                          className="p-1"
                        >
                          <ZoomOut size={14} />
                        </Button>
                        <span className="text-xs">{Math.round(scale * 100)}%</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setScale(Math.min(2, scale + 0.1))}
                          className="p-1"
                        >
                          <ZoomIn size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">چرخش</label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRotation(rotation - 90)}
                          className="p-1"
                        >
                          <RotateCcw size={14} />
                        </Button>
                        <span className="text-xs">{rotation}°</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Crop Actions */}
                  <div className="flex gap-2">
                    <Button onClick={handleCropApply} className="flex-1">
                      تایید برش
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCropTool(false)} 
                      className="flex-1"
                    >
                      لغو
                    </Button>
                  </div>
                  
                  {/* Hidden canvas for processing */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

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
