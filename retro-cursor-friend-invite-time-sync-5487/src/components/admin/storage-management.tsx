'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive
} from 'lucide-react'
import { StorageResult } from '@/lib/storage-service'

interface StorageManagementProps {
  storageStatus: {
    type: string
    available: boolean
    lastSaved?: string
    dataSize?: number
  }
  hasUnsavedChanges: boolean
  onSave: () => Promise<StorageResult>
  onExport: () => Promise<string>
  onImport: (jsonData: string) => Promise<StorageResult>
  onClear: () => Promise<StorageResult>
  onReset: () => void
}

export function StorageManagement({
  storageStatus,
  hasUnsavedChanges,
  onSave,
  onExport,
  onImport,
  onClear,
  onReset
}: StorageManagementProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [importData, setImportData] = useState('')
  const [showImportForm, setShowImportForm] = useState(false)
  const [lastAction, setLastAction] = useState<{
    type: 'save' | 'export' | 'import' | 'clear' | 'reset'
    success: boolean
    message: string
    timestamp: string
  } | null>(null)

  const handleSave = async () => {
    try {
      const result = await onSave()
      setLastAction({
        type: 'save',
        success: result.success,
        message: result.success ? 'تغییرات با موفقیت ذخیره شد' : `خطا در ذخیره: ${result.error}`,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setLastAction({
        type: 'save',
        success: false,
        message: `خطا در ذخیره: ${error}`,
        timestamp: new Date().toISOString()
      })
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await onExport()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `retro-cafe-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setLastAction({
        type: 'export',
        success: true,
        message: 'پشتیبان با موفقیت دانلود شد',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setLastAction({
        type: 'export',
        success: false,
        message: `خطا در دانلود: ${error}`,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    if (!importData.trim()) return
    
    setIsImporting(true)
    try {
      const result = await onImport(importData)
      setLastAction({
        type: 'import',
        success: result.success,
        message: result.success ? 'داده‌ها با موفقیت بازیابی شد' : `خطا در بازیابی: ${result.error}`,
        timestamp: new Date().toISOString()
      })
      
      if (result.success) {
        setImportData('')
        setShowImportForm(false)
      }
    } catch (error) {
      setLastAction({
        type: 'import',
        success: false,
        message: `خطا در بازیابی: ${error}`,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClear = async () => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید تمام داده‌ها را پاک کنید؟ این عمل قابل بازگشت نیست.')) {
      return
    }
    
    setIsClearing(true)
    try {
      const result = await onClear()
      setLastAction({
        type: 'clear',
        success: result.success,
        message: result.success ? 'تمام داده‌ها پاک شد' : `خطا در پاک کردن: ${result.error}`,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setLastAction({
        type: 'clear',
        success: false,
        message: `خطا در پاک کردن: ${error}`,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsClearing(false)
    }
  }

  const handleReset = () => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید تمام تغییرات را لغو کنید؟')) {
      return
    }
    
    onReset()
    setLastAction({
      type: 'reset',
      success: true,
      message: 'تمام تغییرات لغو شد',
      timestamp: new Date().toISOString()
    })
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'نامشخص'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'نامشخص'
    return new Date(dateString).toLocaleString('fa-IR')
  }

  const getStorageTypeIcon = (type: string) => {
    switch (type) {
      case 'browser':
        return <HardDrive size={16} />
      case 'server':
        return <Database size={16} />
      case 'hybrid':
        return <Database size={16} />
      default:
        return <HardDrive size={16} />
    }
  }

  const getStorageTypeLabel = (type: string) => {
    switch (type) {
      case 'browser':
        return 'مرورگر'
      case 'server':
        return 'سرور'
      case 'hybrid':
        return 'ترکیبی'
      default:
        return 'نامشخص'
    }
  }

  return (
    <div className="space-y-4">
      {/* Storage Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            وضعیت ذخیره‌سازی
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Storage Type */}
            <div className="flex items-center gap-2">
              {getStorageTypeIcon(storageStatus.type)}
              <span className="text-sm font-medium">نوع ذخیره:</span>
              <Badge variant={storageStatus.available ? 'default' : 'destructive'}>
                {getStorageTypeLabel(storageStatus.type)}
              </Badge>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              {storageStatus.available ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <AlertCircle size={16} className="text-red-500" />
              )}
              <span className="text-sm font-medium">وضعیت:</span>
              <Badge variant={storageStatus.available ? 'default' : 'destructive'}>
                {storageStatus.available ? 'در دسترس' : 'غیرقابل دسترس'}
              </Badge>
            </div>

            {/* Last Saved */}
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span className="text-sm font-medium">آخرین ذخیره:</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(storageStatus.lastSaved)}
              </span>
            </div>

            {/* Data Size */}
            <div className="flex items-center gap-2">
              <Database size={16} />
              <span className="text-sm font-medium">حجم داده:</span>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(storageStatus.dataSize)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>عملیات ذخیره‌سازی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Save Changes */}
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || !storageStatus.available}
              className="w-full"
              variant="default"
            >
              <Save size={16} className="mr-2" />
              ذخیره تغییرات
            </Button>

            {/* Export Data */}
            <Button
              onClick={handleExport}
              disabled={isExporting || !storageStatus.available}
              className="w-full"
              variant="outline"
            >
              <Download size={16} className="mr-2" />
              {isExporting ? 'در حال دانلود...' : 'دانلود پشتیبان'}
            </Button>

            {/* Import Data */}
            <Button
              onClick={() => setShowImportForm(!showImportForm)}
              disabled={isImporting}
              className="w-full"
              variant="outline"
            >
              <Upload size={16} className="mr-2" />
              بازیابی پشتیبان
            </Button>

            {/* Reset Changes */}
            <Button
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
              className="w-full"
              variant="outline"
            >
              <RotateCcw size={16} className="mr-2" />
              لغو تغییرات
            </Button>

            {/* Clear Storage */}
            <Button
              onClick={handleClear}
              disabled={isClearing || !storageStatus.available}
              className="w-full"
              variant="destructive"
            >
              <Trash2 size={16} className="mr-2" />
              {isClearing ? 'در حال پاک کردن...' : 'پاک کردن همه'}
            </Button>
          </div>

          {/* Import Form */}
          {showImportForm && (
            <div className="mt-4 p-4 border border-border rounded-lg bg-muted/30">
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  داده‌های پشتیبان (JSON):
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="محتوای فایل JSON پشتیبان را اینجا کپی کنید..."
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleImport}
                    disabled={!importData.trim() || isImporting}
                    size="sm"
                  >
                    {isImporting ? 'در حال بازیابی...' : 'بازیابی'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowImportForm(false)
                      setImportData('')
                    }}
                    variant="outline"
                    size="sm"
                  >
                    لغو
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Action Result */}
      {lastAction && (
        <Card className={`border-l-4 ${
          lastAction.success ? 'border-l-green-500' : 'border-l-red-500'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {lastAction.success ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <AlertCircle size={16} className="text-red-500" />
              )}
              <span className={`text-sm ${lastAction.success ? 'text-green-700' : 'text-red-700'}`}>
                {lastAction.message}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(lastAction.timestamp)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
