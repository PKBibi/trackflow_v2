// Client-side encryption utility for localStorage data
// Uses Web Crypto API for secure encryption/decryption

class EncryptedStorage {
  private key: CryptoKey | null = null
  private algorithm = 'AES-GCM'
  
  // Initialize encryption key (call this once per session)
  private async initKey(): Promise<CryptoKey> {
    if (this.key) return this.key
    
    // Generate a key from user session or create a new one
    // In production, you might derive this from user's session token
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('trackflow-session-key-v1'), // In production, use actual session key
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )
    
    this.key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('trackflow-salt'),
        iterations: 100000,
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
      console.error('Encryption failed:', error)
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
      console.error('Decryption failed:', error)
      return encryptedData // Fallback to returning as-is if decryption fails
    }
  }
  
  // Secure localStorage wrapper
  async setItem(key: string, value: any): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      const encrypted = await this.encrypt(serialized)
      localStorage.setItem(`encrypted_${key}`, encrypted)
    } catch (error) {
      console.error('Failed to set encrypted item:', error)
      // Fallback to regular localStorage
      localStorage.setItem(key, JSON.stringify(value))
    }
  }
  
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const encrypted = localStorage.getItem(`encrypted_${key}`)
      if (!encrypted) {
        // Try fallback to unencrypted version for migration
        const unencrypted = localStorage.getItem(key)
        if (unencrypted) {
          try {
            const parsed = JSON.parse(unencrypted)
            // Migrate to encrypted version
            await this.setItem(key, parsed)
            localStorage.removeItem(key) // Remove unencrypted version
            return parsed
          } catch {
            return null
          }
        }
        return null
      }
      
      const decrypted = await this.decrypt(encrypted)
      return JSON.parse(decrypted)
    } catch (error) {
      console.error('Failed to get encrypted item:', error)
      return null
    }
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
      await secureStorage.setItem(key, value)
    } else {
      // Non-sensitive data can remain unencrypted
      localStorage.setItem(key, JSON.stringify(value))
    }
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
      return await secureStorage.getItem<T>(key)
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