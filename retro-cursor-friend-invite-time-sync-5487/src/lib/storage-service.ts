// Storage Service - Unified data persistence layer
// Supports both browser storage and can be easily adapted for server storage

export interface StorageConfig {
  type: 'browser' | 'server' | 'hybrid'
  prefix?: string
  serverEndpoint?: string
  fallbackToBrowser?: boolean
}

export interface StorageData {
  menuItems: any[]
  categories: any[]
  navbarStyle: string
  dessertsConfig: any
  selectedTemplate: string
  theme: any
  lastSaved: string
  version: string
}

export interface StorageResult {
  success: boolean
  data?: StorageData
  error?: string
  timestamp: string
}

class StorageService {
  private config: StorageConfig
  private readonly STORAGE_VERSION = '1.0.0'
  private readonly DEFAULT_PREFIX = 'retro-cafe'

  constructor(config: StorageConfig = { type: 'browser' }) {
    this.config = {
      prefix: this.DEFAULT_PREFIX,
      fallbackToBrowser: true,
      ...config
    }
  }

  // Generate storage key with prefix
  private getKey(key: string): string {
    return `${this.config.prefix}:${key}`
  }

  // Check if browser storage is available
  private isBrowserStorageAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  // Browser storage methods
  private async saveToBrowser(data: StorageData): Promise<StorageResult> {
    try {
      if (!this.isBrowserStorageAvailable()) {
        throw new Error('Browser storage not available')
      }

      const storageData = {
        ...data,
        lastSaved: new Date().toISOString(),
        version: this.STORAGE_VERSION
      }

      localStorage.setItem(this.getKey('menu-data'), JSON.stringify(storageData))
      
      return {
        success: true,
        data: storageData,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Browser storage failed: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  private async loadFromBrowser(): Promise<StorageResult> {
    try {
      if (!this.isBrowserStorageAvailable()) {
        throw new Error('Browser storage not available')
      }

      const stored = localStorage.getItem(this.getKey('menu-data'))
      if (!stored) {
        return {
          success: false,
          error: 'No data found in browser storage',
          timestamp: new Date().toISOString()
        }
      }

      const data = JSON.parse(stored)
      
      // Validate data structure
      if (!this.validateDataStructure(data)) {
        throw new Error('Invalid data structure in storage')
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to load from browser: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Server storage methods (placeholder for future implementation)
  private async saveToServer(data: StorageData): Promise<StorageResult> {
    try {
      if (!this.config.serverEndpoint) {
        throw new Error('Server endpoint not configured')
      }

      const response = await fetch(`${this.config.serverEndpoint}/api/save-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          lastSaved: new Date().toISOString(),
          version: this.STORAGE_VERSION
        })
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Server storage failed: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  private async loadFromServer(): Promise<StorageResult> {
    try {
      if (!this.config.serverEndpoint) {
        throw new Error('Server endpoint not configured')
      }

      const response = await fetch(`${this.config.serverEndpoint}/api/load-data`)
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const result = await response.json()
      
      if (!this.validateDataStructure(result.data)) {
        throw new Error('Invalid data structure from server')
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to load from server: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Validate data structure
  private validateDataStructure(data: any): boolean {
    const requiredFields = ['menuItems', 'categories', 'navbarStyle', 'dessertsConfig', 'selectedTemplate']
    
    for (const field of requiredFields) {
      if (!(field in data)) {
        console.warn(`Missing required field: ${field}`)
        return false
      }
    }
    
    return true
  }

  // Public methods
  async saveData(data: Omit<StorageData, 'lastSaved' | 'version'>): Promise<StorageResult> {
    const storageData: StorageData = {
      ...data,
      lastSaved: new Date().toISOString(),
      version: this.STORAGE_VERSION
    }

    switch (this.config.type) {
      case 'server':
        try {
          const result = await this.saveToServer(storageData)
          if (result.success) {
            return result
          }
          // Fallback to browser if server fails and fallback is enabled
          if (this.config.fallbackToBrowser) {
            console.warn('Server storage failed, falling back to browser storage')
            return await this.saveToBrowser(storageData)
          }
          return result
        } catch (error) {
          if (this.config.fallbackToBrowser) {
            console.warn('Server storage failed, falling back to browser storage')
            return await this.saveToBrowser(storageData)
          }
          throw error
        }

      case 'hybrid':
        // Try server first, then browser
        try {
          const serverResult = await this.saveToServer(storageData)
          if (serverResult.success) {
            // Also save to browser as backup
            await this.saveToBrowser(storageData)
            return serverResult
          }
        } catch (error) {
          console.warn('Server storage failed, using browser storage')
        }
        return await this.saveToBrowser(storageData)

      case 'browser':
      default:
        return await this.saveToBrowser(storageData)
    }
  }

  async loadData(): Promise<StorageResult> {
    switch (this.config.type) {
      case 'server':
        try {
          const result = await this.loadFromServer()
          if (result.success) {
            return result
          }
          // Fallback to browser if server fails and fallback is enabled
          if (this.config.fallbackToBrowser) {
            console.warn('Server load failed, falling back to browser storage')
            return await this.loadFromBrowser()
          }
          return result
        } catch (error) {
          if (this.config.fallbackToBrowser) {
            console.warn('Server load failed, falling back to browser storage')
            return await this.loadFromBrowser()
          }
          throw error
        }

      case 'hybrid':
        // Try server first, then browser
        try {
          const serverResult = await this.loadFromServer()
          if (serverResult.success) {
            return serverResult
          }
        } catch (error) {
          console.warn('Server load failed, trying browser storage')
        }
        return await this.loadFromBrowser()

      case 'browser':
      default:
        return await this.loadFromBrowser()
    }
  }

  // Clear all stored data
  async clearData(): Promise<StorageResult> {
    try {
      if (this.isBrowserStorageAvailable()) {
        localStorage.removeItem(this.getKey('menu-data'))
      }

      if (this.config.serverEndpoint) {
        try {
          await fetch(`${this.config.serverEndpoint}/api/clear-data`, { method: 'DELETE' })
        } catch (error) {
          console.warn('Failed to clear server data:', error)
        }
      }

      return {
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to clear data: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Get storage status
  async getStatus(): Promise<{
    type: string
    available: boolean
    lastSaved?: string
    dataSize?: number
  }> {
    try {
      const data = await this.loadData()
      
      return {
        type: this.config.type,
        available: data.success,
        lastSaved: data.data?.lastSaved,
        dataSize: data.data ? JSON.stringify(data.data).length : 0
      }
    } catch (error) {
      return {
        type: this.config.type,
        available: false
      }
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Export data for backup
  async exportData(): Promise<string> {
    const data = await this.loadData()
    if (!data.success || !data.data) {
      throw new Error('No data to export')
    }
    
    return JSON.stringify(data.data, null, 2)
  }

  // Import data from backup
  async importData(jsonData: string): Promise<StorageResult> {
    try {
      const data = JSON.parse(jsonData)
      
      if (!this.validateDataStructure(data)) {
        throw new Error('Invalid backup data structure')
      }

      return await this.saveData(data)
    } catch (error) {
      return {
        success: false,
        error: `Import failed: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }
}

// Create default instance
export const storageService = new StorageService()

// Export the class for custom instances
export { StorageService }
