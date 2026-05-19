import React from 'react'
import { render, screen } from '@testing-library/react'
import { MenuCard } from '../menu/menu-card'
import { MenuItem } from '@/types/menu'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  },
}))

const mockMenuItem: MenuItem = {
  id: 'test-item',
  name: 'آزمایش منو',
  description: 'این یک توضیح آزمایشی برای آیتم منو است',
  price: 15.99,
  image: 'https://images.unsplash.com/test-image.jpg',
  category: 'test-category',
  allergens: ['گلوتن', 'لبنیات'],
  nutritionalInfo: {
    calories: 300,
    protein: 15,
    carbs: 25,
    fat: 12
  }
}

describe('MenuCard', () => {
  it('renders menu item information correctly', () => {
    render(<MenuCard item={mockMenuItem} />)
    
    expect(screen.getByText('آزمایش منو')).toBeInTheDocument()
    expect(screen.getByText('این یک توضیح آزمایشی برای آیتم منو است')).toBeInTheDocument()
    expect(screen.getByText('16 تومان')).toBeInTheDocument()
    expect(screen.getByText('گلوتن')).toBeInTheDocument()
    expect(screen.getByText('لبنیات')).toBeInTheDocument()
    expect(screen.getByText('300 کالری')).toBeInTheDocument()
  })

  it('renders image with correct alt text', () => {
    render(<MenuCard item={mockMenuItem} />)
    
    const image = screen.getByAltText('آزمایش منو')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://images.unsplash.com/test-image.jpg')
  })
})
