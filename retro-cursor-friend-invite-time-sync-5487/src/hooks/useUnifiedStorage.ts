// Unified Storage Hook - Provides a clean interface for managing data persistence
// Combines change tracking with storage operations

import { useState, useEffect, useCallback, useRef } from 'react'
import { storageService, StorageResult, StorageData } from '@/lib/storage-service'
import { getDynamicStorageConfig } from '@/lib/storage-config'

export interface UseUnifiedStorageOptions {
  autoSave?: boolean
  autoSaveDelay?: number
  saveOnChange?: boolean
  storageType?: 'browser' | 'server' | 'hybrid'
}

export interface UseUnifiedStorageReturn<T> {
  // Data state
  data: T
  originalData: T
  
  // Change tracking
  hasUnsavedChanges: boolean
  pendingChanges: Partial<T>
  
  // Storage operations
  saveChanges: () => Promise<StorageResult>
  cancelChanges: () => void
  confirmChanges: () => void
  
  // Data operations
  updateData: (updates: Partial<T>) => void
  resetToOriginal: () => void
  
  // Storage status
  storageStatus: {
    type: string
    available: boolean
    lastSaved?: string
    dataSize?: number
  }
  
  // Utility functions
  exportData: () => Promise<string>
  importData: (jsonData: string) => Promise<StorageResult>
  clearStorage: () => Promise<StorageResult>
}

export function useUnifiedStorage<T extends Record<string, any>>(
  initialData: T,
  options: UseUnifiedStorageOptions = {}
): UseUnifiedStorageReturn<T> {
  const {
    autoSave = true,
    autoSaveDelay = 5000, // 5 seconds
    saveOnChange = false,
    storageType
  } = options

  // Initialize storage service with configuration
  useEffect(() => {
    if (storageType) {
      const config = getDynamicStorageConfig()
      config.type = storageType
      storageService.updateConfig(config)
    }
  }, [storageType])

  // State management
  const [data, setData] = useState<T>(initialData)
  const [originalData, setOriginalData] = useState<T>(initialData)
  const [pendingChanges, setPendingChanges] = useState<Partial<T>>({})
  const [storageStatus, setStorageStatus] = useState<{
    type: string
    available: boolean
    lastSaved?: string
    dataSize?: number
  }>({
    type: 'browser',
    available: false,
    lastSaved: undefined,
    dataSize: 0
  })

  // Refs for auto-save
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSaveRef = useRef<Date>(new Date())

  // Load data from storage on mount
  useEffect(() => {
    loadFromStorage()
    updateStorageStatus()
  }, [])

  // Auto-save effect
  useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveChanges()
      }, autoSaveDelay)
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [data, autoSave, autoSaveDelay])

  // Save on change effect
  useEffect(() => {
    if (saveOnChange && hasUnsavedChanges) {
      saveChanges()
    }
  }, [data, saveOnChange])

  // Load data from storage
  const loadFromStorage = async () => {
    try {
      const result = await storageService.loadData()
      if (result.success && result.data) {
        const loadedData = {
          menuItems: result.data.menuItems || initialData.menuItems,
          categories: result.data.categories || initialData.categories,
          navbarStyle: result.data.navbarStyle || initialData.navbarStyle,
          dessertsConfig: result.data.dessertsConfig || initialData.dessertsConfig,
          selectedTemplate: result.data.selectedTemplate || initialData.selectedTemplate,
          theme: result.data.theme || initialData.theme,
          ...initialData // Fill in any missing fields with defaults
        } as T

        setData(loadedData)
        setOriginalData(loadedData)
        setPendingChanges({})
      }
    } catch (error) {
      console.warn('Failed to load from storage:', error)
      // Keep using initial data if storage fails
    }
  }

  // Update storage status
  const updateStorageStatus = async () => {
    try {
      const status = await storageService.getStatus()
      setStorageStatus(status)
    } catch (error) {
      console.warn('Failed to get storage status:', error)
    }
  }

  // Check for unsaved changes
  const hasUnsavedChanges = JSON.stringify(data) !== JSON.stringify(originalData)

  // Update data
  const updateData = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }))
    
    // Update pending changes
    setPendingChanges(prev => ({ ...prev, ...updates }))
  }, [])

  // Save changes to storage
  const saveChanges = async (): Promise<StorageResult> => {
    try {
      // Prepare data for storage
      const storageData = {
        menuItems: data.menuItems || [],
        categories: data.categories || [],
        navbarStyle: data.navbarStyle || 'text-only',
        dessertsConfig: data.dessertsConfig || {},
        selectedTemplate: data.selectedTemplate || 'default',
        theme: data.theme || {}
      }

      const result = await storageService.saveData(storageData)
      
      if (result.success) {
        // Update original data to current data
        setOriginalData(data)
        setPendingChanges({})
        lastSaveRef.current = new Date()
        await updateStorageStatus()
      }
      
      return result
    } catch (error) {
      console.error('Failed to save changes:', error)
      return {
        success: false,
        error: `Save failed: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Cancel changes and revert to original
  const cancelChanges = useCallback(() => {
    setData(originalData)
    setPendingChanges({})
  }, [originalData])

  // Confirm changes (same as save but without storage)
  const confirmChanges = useCallback(() => {
    setOriginalData(data)
    setPendingChanges({})
  }, [data])

  // Reset to original data
  const resetToOriginal = useCallback(() => {
    setData(originalData)
    setPendingChanges({})
  }, [originalData])

  // Export data
  const exportData = async (): Promise<string> => {
    try {
      return await storageService.exportData()
    } catch (error) {
      throw new Error(`Export failed: ${error}`)
    }
  }

  // Import data
  const importData = async (jsonData: string): Promise<StorageResult> => {
    try {
      const result = await storageService.importData(jsonData)
      if (result.success && result.data) {
        // Reload data after import
        await loadFromStorage()
      }
      return result
    } catch (error) {
      return {
        success: false,
        error: `Import failed: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Clear storage
  const clearStorage = async (): Promise<StorageResult> => {
    try {
      const result = await storageService.clearData()
      if (result.success) {
        // Reset to initial data
        setData(initialData)
        setOriginalData(initialData)
        setPendingChanges({})
        await updateStorageStatus()
      }
      return result
    } catch (error) {
      return {
        success: false,
        error: `Clear failed: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  return {
    data,
    originalData,
    hasUnsavedChanges,
    pendingChanges,
    saveChanges,
    cancelChanges,
    confirmChanges,
    updateData,
    resetToOriginal,
    storageStatus,
    exportData,
    importData,
    clearStorage
  }
}
