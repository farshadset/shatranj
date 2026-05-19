'use client'

import React, { useEffect, useRef } from 'react'
import { MenuCard } from './menu-card'
import { MenuItem, Category } from '@/types/menu'
import { cn } from '@/lib/utils'

interface MenuSectionProps {
  category: Category
  items: MenuItem[]
  className?: string
}

export function MenuSection({ category, items, className }: MenuSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  if (items.length === 0) return null

  return (
    <section 
      ref={sectionRef}
      id={`category-${category.id}`}
      className={cn("py-6 sm:py-8 animate-fade-in scroll-mt-20 sm:scroll-mt-24", className)}
      data-category={category.id}
    >
      <div className="container mx-auto px-3 sm:px-4">
        {/* Category Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            {category.name}
          </h2>
        </div>
        
        {/* Menu Items - Vertical stack layout */}
        <div className="flex flex-col space-y-4 sm:space-y-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MenuCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
