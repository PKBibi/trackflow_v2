import { log } from '@/lib/logger';
// Client-side encryption utility for localStorage data
// Uses Web Crypto API for secure encryption/decryption

class EncryptedStorage {
  private key: CryptoKey | null = null
  private algorithm = 'AES-GCM'
  private cachedUserId: string | null = null

  private getSecretKeyMaterial(): string | null {
    if (typeof document === 'undefined') return null

    const meta = document.querySelector('meta[name="trackflow-user-id"]')
    const userId = meta?.getAttribute('content')
    if (!userId) return null

    if (this.cachedUserId && this.cachedUserId !== userId) {
      this.key = null
    }

    this.cachedUserId = userId
    const entropy = process.env.NEXT_PUBLIC_STORAGE_SECRET || 'trackflow-fallback-secret'
    return `${userId}:${entropy}`
  }

  // Initialize encryption key (call this once per session)
  private async initKey(): Promise<CryptoKey> {
    if (this.key) return this.key

    const keyMaterialSeed = this.getSecretKeyMaterial()
    if (!keyMaterialSeed) {
      throw new Error('Unable to derive storage key: user not authenticated')
    }

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(keyMaterialSeed),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )

    this.key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('trackflow-secure-storage'),
        iterations: 150000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: 256 },
      false,
      ['encrypt', 'decrypt']
    )

    return this.key
  }
  
  // Encrypt data before storing
  async encrypt(data: string): Promise<string> {
    try {
      const key = await this.initKey()
      const iv = crypto.getRandomValues(new Uint8Array(12)) // 12 bytes for AES-GCM
      const encodedData = new TextEncoder().encode(data)
      
      const encryptedData = await crypto.subtle.encrypt(
        { name: this.algorithm, iv },
        key,
        encodedData
      )
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedData.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encryptedData), iv.length)
      
      // Convert to base64 for storage
      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      log.error('Encryption failed:', error)
      return data // Fallback to unencrypted if encryption fails
    }
  }
  
  // Decrypt data after retrieval
  async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.initKey()
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      )
      
      const iv = combined.slice(0, 12)
      const data = combined.slice(12)
      
      const decryptedData = await crypto.subtle.decrypt(
        { name: this.algorithm, iv },
        key,
        data
      )
      
      return new TextDecoder().decode(decryptedData)
    } catch (error) {
      log.error('Decryption failed:', error)
      return encryptedData // Fallback to returning as-is if decryption fails
    }
  }
  
  // Secure localStorage wrapper
  async setItem(key: string, value: any): Promise<void> {
    const storageKey = `encrypted_${key}`
    const serialized = JSON.stringify(value)
    const encrypted = await this.encrypt(serialized)
    localStorage.setItem(storageKey, encrypted)
  }
  
  async getItem<T>(key: string): Promise<T | null> {
    const encrypted = localStorage.getItem(`encrypted_${key}`)
    if (!encrypted) {
      const legacy = localStorage.getItem(key)
      if (!legacy) {
        return null
      }

      try {
        const parsed = JSON.parse(legacy)
        await this.setItem(key, parsed)
        localStorage.removeItem(key)
        return parsed
      } catch {
        localStorage.removeItem(key)
        return null
      }
    }

    const decrypted = await this.decrypt(encrypted)
    return JSON.parse(decrypted)
  }
  
  removeItem(key: string): void {
    localStorage.removeItem(`encrypted_${key}`)
    localStorage.removeItem(key) // Also remove any unencrypted version
  }
  
  // Check if key exists
  hasItem(key: string): boolean {
    return localStorage.getItem(`encrypted_${key}`) !== null || 
           localStorage.getItem(key) !== null
  }
}

// Export singleton instance
export const secureStorage = new EncryptedStorage()

// Backwards-compatible wrapper for existing localStorage usage
export const safeLocalStorage = {
  async setItem(key: string, value: any): Promise<void> {
    if (typeof window === 'undefined') return
    
    // Only encrypt sensitive data
    const sensitiveKeys = [
      'recentActivities',
      'onboardingData',
      'timer_target_minutes',
      'notification-settings',
      'user-preferences'
    ]
    
    if (sensitiveKeys.includes(key)) {
      try {
        await secureStorage.setItem(key, value)
        return
      } catch (error) {
        log.warn('Falling back to plain storage for key:', key, error)
      }
    } else {
      // Non-sensitive data can remain unencrypted
      localStorage.setItem(key, JSON.stringify(value))
      return
    }

    localStorage.setItem(key, JSON.stringify(value))
  },
  
  async getItem<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null
    
    const sensitiveKeys = [
      'recentActivities',
      'onboardingData', 
      'timer_target_minutes',
      'notification-settings',
      'user-preferences'
    ]
    
    if (sensitiveKeys.includes(key)) {
      try {
        return await secureStorage.getItem<T>(key)
      } catch (error) {
        log.warn('Falling back to plain storage for key:', key, error)
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      }
    } else {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch {
        return null
      }
    }
  },
  
  removeItem(key: string): void {
    if (typeof window === 'undefined') return
    secureStorage.removeItem(key)
  },
  
  hasItem(key: string): boolean {
    if (typeof window === 'undefined') return false
    return secureStorage.hasItem(key) || localStorage.getItem(key) !== null
  }
}
