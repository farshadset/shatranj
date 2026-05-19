'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseScrollSyncProps {
  categories: string[]
  offset?: number
  threshold?: number
  dessertsSectionHeight?: number
}

export function useScrollSync({ 
  categories, 
  offset = 100, 
  threshold = 0.3,
  dessertsSectionHeight = 0
}: UseScrollSyncProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || '')
  const observerRef = useRef<IntersectionObserver | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActiveCategoryRef = useRef<string>(categories[0] || '')
  const isUpdatingRef = useRef<boolean>(false)

  const updateActiveCategory = useCallback((categoryId: string) => {
    // Prevent rapid state updates that cause flickering
    if (isUpdatingRef.current || lastActiveCategoryRef.current === categoryId) {
      return
    }

    isUpdatingRef.current = true
    lastActiveCategoryRef.current = categoryId
    setActiveCategory(categoryId)

    // Reset the flag after a short delay
    setTimeout(() => {
      isUpdatingRef.current = false
    }, 100)
  }, [])

  // Two separate scroll handlers for different scenarios
  const handleScrollWithoutDesserts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      // Normal scroll detection when desserts section is NOT visible
      const scrollPosition = window.scrollY + offset
      let foundCategory = ''

      // Find which category section is currently in view
      for (let i = categories.length - 1; i >= 0; i--) {
        const categoryId = categories[i]
        const element = document.getElementById(`category-${categoryId}`)
        
        if (element) {
          const elementTop = element.offsetTop
          const elementBottom = elementTop + element.offsetHeight
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            foundCategory = categoryId
            break
          }
        }
      }
      
      // Only update if we found a different category
      if (foundCategory && foundCategory !== lastActiveCategoryRef.current) {
        updateActiveCategory(foundCategory)
      }
    }, 50)
  }, [categories, offset, updateActiveCategory])

  const handleScrollWithDesserts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      // Special scroll detection when desserts section IS visible
      // Much lower detection point to avoid conflicts
      const adjustedOffset = offset + dessertsSectionHeight - 450
      const scrollPosition = window.scrollY + adjustedOffset
      
      console.log('Scroll with Desserts Debug:', {
        dessertsHeight: dessertsSectionHeight,
        originalOffset: offset,
        adjustedOffset,
        scrollY: window.scrollY,
        scrollPosition
      })
      
      let foundCategory = ''

      // Find which category section is currently in view
      for (let i = categories.length - 1; i >= 0; i--) {
        const categoryId = categories[i]
        const element = document.getElementById(`category-${categoryId}`)
        
        if (element) {
          const elementTop = element.offsetTop
          const elementBottom = elementTop + element.offsetHeight
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            foundCategory = categoryId
            break
          }
        }
      }

      // Special handling for first category when desserts section is visible
      if (!foundCategory && categories.length > 0) {
        const firstCategory = categories[0]
        const firstElement = document.getElementById(`category-${firstCategory}`)
        
        if (firstElement && window.scrollY < firstElement.offsetTop + 200) {
          // If we're within 200px of the first category, activate it
          foundCategory = firstCategory
        }
      }
      
      // Only update if we found a different category
      if (foundCategory && foundCategory !== lastActiveCategoryRef.current) {
        updateActiveCategory(foundCategory)
      }
    }, 50)
  }, [categories, offset, dessertsSectionHeight, updateActiveCategory])

  // Main scroll handler that chooses the appropriate logic
  const handleScroll = useCallback(() => {
    if (dessertsSectionHeight > 0) {
      handleScrollWithDesserts()
    } else {
      handleScrollWithoutDesserts()
    }
  }, [dessertsSectionHeight, handleScrollWithDesserts, handleScrollWithoutDesserts])

  // Two separate intersection observers for different scenarios
  const createObserverWithoutDesserts = useCallback(() => {
    return new IntersectionObserver(
      (entries) => {
        // Sort entries by intersection ratio to find the most visible section
        const sortedEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))

        if (sortedEntries.length > 0) {
          const mostVisibleEntry = sortedEntries[0]
          const categoryId = mostVisibleEntry.target.getAttribute('data-category')
          
          if (categoryId && categoryId !== lastActiveCategoryRef.current) {
            // Only update if the intersection ratio is significant
            if ((mostVisibleEntry.intersectionRatio || 0) > threshold) {
              updateActiveCategory(categoryId)
            }
          }
        }
      },
      {
        rootMargin: `-${offset}px 0px -${offset}px 0px`,
        threshold: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.0]
      }
    )
  }, [offset, threshold, updateActiveCategory])

  const createObserverWithDesserts = useCallback(() => {
    return new IntersectionObserver(
      (entries) => {
        // Sort entries by intersection ratio to find the most visible section
        const sortedEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))

        if (sortedEntries.length > 0) {
          const mostVisibleEntry = sortedEntries[0]
          const categoryId = mostVisibleEntry.target.getAttribute('data-category')
          
          if (categoryId && categoryId !== lastActiveCategoryRef.current) {
            // Only update if the intersection ratio is significant
            if ((mostVisibleEntry.intersectionRatio || 0) > threshold) {
              updateActiveCategory(categoryId)
            }
          }
        }
      },
      {
        rootMargin: `-${offset + dessertsSectionHeight - 450}px 0px -${offset}px 0px`,
        threshold: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.0]
      }
    )
  }, [offset, threshold, dessertsSectionHeight, updateActiveCategory])

  // Main intersection observer that chooses the appropriate logic
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Choose the appropriate observer based on desserts section visibility
    if (dessertsSectionHeight > 0) {
      observerRef.current = createObserverWithDesserts()
    } else {
      observerRef.current = createObserverWithoutDesserts()
    }

    // Observe all category sections
    categories.forEach(categoryId => {
      const element = document.getElementById(`category-${categoryId}`)
      if (element && observerRef.current) {
        observerRef.current.observe(element)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [categories, offset, threshold, dessertsSectionHeight, updateActiveCategory])

  // Fallback scroll listener with improved performance
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleScroll])

  return { activeCategory, setActiveCategory }
}
