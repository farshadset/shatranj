'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TemplateType, TemplateConfig } from '@/types/menu'
import { cn } from '@/lib/utils'
import { Layout, Square, Grid } from 'lucide-react'

interface TemplateSelectorProps {
  selectedTemplate: TemplateType
  onTemplateChange: (template: TemplateType) => void
}

const templates: TemplateConfig[] = [
  {
    id: 'default',
    name: 'قالب عریض',
    description: '',
    icon: '📄',
    className: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
  },
  {
    id: 'compact',
    name: 'قالب فشرده',
    description: '',
    icon: '📊',
    className: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
  },
  {
    id: 'square',
    name: 'قالب سریع',
    description: '',
    icon: '⬛',
    className: 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
  }
]

const getTemplateIcon = (templateId: TemplateType) => {
  switch (templateId) {
    case 'default':
      return <Layout className="w-5 h-5" />
    case 'compact':
      return <Grid className="w-5 h-5" />
    case 'square':
      return <Square className="w-5 h-5" />
    default:
      return <Layout className="w-5 h-5" />
  }
}

export function TemplateSelector({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) {
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2 font-headline">قالب‌ها</h2>
        <p className="text-muted-foreground font-body">انتخاب کنید که آیتم‌های منو چگونه نمایش داده شوند</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "p-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-2",
              template.className,
              selectedTemplate === template.id && "ring-2 ring-primary ring-offset-2 scale-105"
            )}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "p-2 rounded-lg",
                selectedTemplate === template.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {getTemplateIcon(template.id)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-right">{template.name}</h3>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground text-right leading-relaxed">
              {template.description}
            </p>
            
            {selectedTemplate === template.id && (
              <div className="mt-3 pt-3 border-t border-current/20">
                <span className="text-xs font-medium text-primary">قالب فعال</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
