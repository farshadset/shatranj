// Storage Configuration - Easy switching between storage types
// Modify this file to change storage behavior without touching other code

import { StorageConfig } from './storage-service'

// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Default configuration for development
const developmentConfig: StorageConfig = {
  type: 'browser',
  prefix: 'retro-cafe-dev',
  fallbackToBrowser: true
}

// Configuration for production (can be easily changed)
const productionConfig: StorageConfig = {
  type: 'browser', // Change to 'server' or 'hybrid' when deploying
  prefix: 'retro-cafe-prod',
  serverEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://your-api-domain.com',
  fallbackToBrowser: true
}

// Configuration for testing
const testConfig: StorageConfig = {
  type: 'browser',
  prefix: 'retro-cafe-test',
  fallbackToBrowser: false
}

// Export the appropriate configuration based on environment
export const storageConfig: StorageConfig = 
  isDevelopment ? developmentConfig :
  isProduction ? productionConfig :
  testConfig

// Alternative configurations for easy switching
export const storageConfigs = {
  // Browser-only storage (current default)
  browser: {
    type: 'browser' as const,
    prefix: 'retro-cafe',
    fallbackToBrowser: true
  },

  // Server-only storage (for production deployment)
  server: {
    type: 'server' as const,
    prefix: 'retro-cafe',
    serverEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://your-api-domain.com',
    fallbackToBrowser: false
  },

  // Hybrid storage (server first, browser fallback)
  hybrid: {
    type: 'hybrid' as const,
    prefix: 'retro-cafe',
    serverEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://your-api-domain.com',
    fallbackToBrowser: true
  },

  // Local development with custom prefix
  localDev: {
    type: 'browser' as const,
    prefix: 'retro-cafe-local',
    fallbackToBrowser: true
  }
}

// Quick configuration switcher
export function getStorageConfig(type: keyof typeof storageConfigs): StorageConfig {
  return storageConfigs[type]
}

// Environment variables for easy configuration
export const envConfig = {
  // Set this in your .env.local or deployment environment
  API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  
  // Set this to change storage type via environment variable
  STORAGE_TYPE: process.env.NEXT_PUBLIC_STORAGE_TYPE as 'browser' | 'server' | 'hybrid' | undefined,
  
  // Set this to change storage prefix via environment variable
  STORAGE_PREFIX: process.env.NEXT_PUBLIC_STORAGE_PREFIX,
  
  // Set this to enable/disable browser fallback
  FALLBACK_TO_BROWSER: process.env.NEXT_PUBLIC_FALLBACK_TO_BROWSER !== 'false'
}

// Dynamic configuration based on environment variables
export function getDynamicStorageConfig(): StorageConfig {
  const baseConfig = storageConfig
  
  if (envConfig.STORAGE_TYPE) {
    baseConfig.type = envConfig.STORAGE_TYPE
  }
  
  if (envConfig.STORAGE_PREFIX) {
    baseConfig.prefix = envConfig.STORAGE_PREFIX
  }
  
  if (envConfig.API_ENDPOINT) {
    baseConfig.serverEndpoint = envConfig.API_ENDPOINT
  }
  
  baseConfig.fallbackToBrowser = envConfig.FALLBACK_TO_BROWSER
  
  return baseConfig
}

// Configuration for different deployment scenarios
export const deploymentConfigs = {
  // Vercel deployment
  vercel: {
    type: 'hybrid' as const,
    prefix: 'retro-cafe-vercel',
    serverEndpoint: process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : undefined,
    fallbackToBrowser: true
  },

  // Netlify deployment
  netlify: {
    type: 'hybrid' as const,
    prefix: 'retro-cafe-netlify',
    serverEndpoint: process.env.NEXT_PUBLIC_NETLIFY_URL,
    fallbackToBrowser: true
  },

  // Custom server deployment
  customServer: {
    type: 'server' as const,
    prefix: 'retro-cafe-custom',
    serverEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT,
    fallbackToBrowser: false
  },

  // Static hosting (browser only)
  static: {
    type: 'browser' as const,
    prefix: 'retro-cafe-static',
    fallbackToBrowser: true
  }
}

// Export the deployment configuration based on environment
export function getDeploymentConfig(): StorageConfig {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return deploymentConfigs.vercel
  }
  
  if (process.env.NEXT_PUBLIC_NETLIFY_URL) {
    return deploymentConfigs.netlify
  }
  
  if (process.env.NEXT_PUBLIC_API_ENDPOINT) {
    return deploymentConfigs.customServer
  }
  
  return deploymentConfigs.static
}
