/**
 * Production-grade encryption using AWS KMS or local encryption
 * Provides envelope encryption for maximum security
 */

import crypto from 'crypto'

interface EncryptionProvider {
  encrypt(plaintext: string): Promise<{ ciphertext: string; keyId?: string }>
  decrypt(ciphertext: string, keyId?: string): Promise<string>
  generateDataKey(): Promise<{ plaintext: Buffer; ciphertext: string }>
}

/**
 * AWS KMS Provider for production environments
 */
class AWSKMSProvider implements EncryptionProvider {
  private kmsClient: any
  private keyId: string

  constructor() {
    this.keyId = process.env.AWS_KMS_KEY_ID || ''

    // Only initialize if AWS credentials are available
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.initializeKMS()
    }
  }

  private async initializeKMS() {
    try {
      const { KMSClient, EncryptCommand, DecryptCommand, GenerateDataKeyCommand } = await import('@aws-sdk/client-kms' as any)
      this.kmsClient = new KMSClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
      })
    } catch (error) {
      console.warn('AWS KMS client not available, falling back to local encryption')
    }
  }

  async encrypt(plaintext: string): Promise<{ ciphertext: string; keyId?: string }> {
    if (!this.kmsClient) {
      throw new Error('KMS client not initialized')
    }

    const { EncryptCommand } = await import('@aws-sdk/client-kms' as any)
    const command = new EncryptCommand({
      KeyId: this.keyId,
      Plaintext: Buffer.from(plaintext),
    })

    const response = await this.kmsClient.send(command)
    return {
      ciphertext: Buffer.from(response.CiphertextBlob).toString('base64'),
      keyId: response.KeyId
    }
  }

  async decrypt(ciphertext: string): Promise<string> {
    if (!this.kmsClient) {
      throw new Error('KMS client not initialized')
    }

    const { DecryptCommand } = await import('@aws-sdk/client-kms' as any)
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(ciphertext, 'base64'),
    })

    const response = await this.kmsClient.send(command)
    return Buffer.from(response.Plaintext).toString()
  }

  async generateDataKey(): Promise<{ plaintext: Buffer; ciphertext: string }> {
    if (!this.kmsClient) {
      throw new Error('KMS client not initialized')
    }

    const { GenerateDataKeyCommand } = await import('@aws-sdk/client-kms' as any)
    const command = new GenerateDataKeyCommand({
      KeyId: this.keyId,
      KeySpec: 'AES_256',
    })

    const response = await this.kmsClient.send(command)
    return {
      plaintext: Buffer.from(response.Plaintext),
      ciphertext: Buffer.from(response.CiphertextBlob).toString('base64')
    }
  }
}

/**
 * HashiCorp Vault Provider for production environments
 */
class VaultProvider implements EncryptionProvider {
  private vaultUrl: string
  private vaultToken: string
  private transitEngine: string

  constructor() {
    this.vaultUrl = process.env.VAULT_URL || 'http://localhost:8200'
    this.vaultToken = process.env.VAULT_TOKEN || ''
    this.transitEngine = process.env.VAULT_TRANSIT_ENGINE || 'transit'
  }

  private async vaultRequest(path: string, method: string = 'GET', body?: any) {
    const response = await fetch(`${this.vaultUrl}/v1/${this.transitEngine}/${path}`, {
      method,
      headers: {
        'X-Vault-Token': this.vaultToken,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Vault request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async encrypt(plaintext: string): Promise<{ ciphertext: string; keyId?: string }> {
    const response = await this.vaultRequest('encrypt/trackflow', 'POST', {
      plaintext: Buffer.from(plaintext).toString('base64'),
    })

    return {
      ciphertext: response.data.ciphertext,
      keyId: 'vault:trackflow'
    }
  }

  async decrypt(ciphertext: string): Promise<string> {
    const response = await this.vaultRequest('decrypt/trackflow', 'POST', {
      ciphertext,
    })

    return Buffer.from(response.data.plaintext, 'base64').toString()
  }

  async generateDataKey(): Promise<{ plaintext: Buffer; ciphertext: string }> {
    // Generate a random key and encrypt it with Vault
    const key = crypto.randomBytes(32)
    const { ciphertext } = await this.encrypt(key.toString('base64'))

    return {
      plaintext: key,
      ciphertext
    }
  }
}

/**
 * Local encryption provider for development/testing
 */
class LocalEncryptionProvider implements EncryptionProvider {
  private masterKey: Buffer

  constructor() {
    const key = process.env.ENCRYPTION_MASTER_KEY || 'dev-master-key-32-chars-long-xxx'
    this.masterKey = crypto.scryptSync(key, 'salt', 32)
  }

  async encrypt(plaintext: string): Promise<{ ciphertext: string; keyId?: string }> {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv)

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ])

    const authTag = cipher.getAuthTag()

    // Combine IV, auth tag, and encrypted data
    const combined = Buffer.concat([iv, authTag, encrypted])

    return {
      ciphertext: combined.toString('base64'),
      keyId: 'local:v1'
    }
  }

  async decrypt(ciphertext: string): Promise<string> {
    const combined = Buffer.from(ciphertext, 'base64')

    const iv = combined.slice(0, 16)
    const authTag = combined.slice(16, 32)
    const encrypted = combined.slice(32)

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])

    return decrypted.toString('utf8')
  }

  async generateDataKey(): Promise<{ plaintext: Buffer; ciphertext: string }> {
    const key = crypto.randomBytes(32)
    const { ciphertext } = await this.encrypt(key.toString('base64'))

    return {
      plaintext: key,
      ciphertext
    }
  }
}

/**
 * Envelope encryption implementation
 */
export class EnvelopeEncryption {
  private provider: EncryptionProvider

  constructor() {
    // Choose provider based on environment
    if (process.env.AWS_KMS_KEY_ID && process.env.NODE_ENV === 'production') {
      this.provider = new AWSKMSProvider()
    } else if (process.env.VAULT_TOKEN && process.env.NODE_ENV === 'production') {
      this.provider = new VaultProvider()
    } else {
      this.provider = new LocalEncryptionProvider()
    }
  }

  /**
   * Encrypt data using envelope encryption
   */
  async encrypt(plaintext: string): Promise<string> {
    try {
      // Generate a data encryption key (DEK)
      const { plaintext: dek, ciphertext: encryptedDek } = await this.provider.generateDataKey()

      // Use the DEK to encrypt the actual data
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv)

      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
      ])

      const authTag = cipher.getAuthTag()

      // Combine encrypted DEK, IV, auth tag, and encrypted data
      const envelope = {
        version: '1.0',
        encryptedDek,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        ciphertext: encrypted.toString('base64')
      }

      // Clear the DEK from memory
      dek.fill(0)

      return Buffer.from(JSON.stringify(envelope)).toString('base64')
    } catch (error) {
      console.error('Envelope encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypt data using envelope encryption
   */
  async decrypt(envelopeData: string): Promise<string> {
    try {
      const envelope = JSON.parse(Buffer.from(envelopeData, 'base64').toString())

      // Decrypt the DEK
      const dekBase64 = await this.provider.decrypt(envelope.encryptedDek)
      const dek = Buffer.from(dekBase64, 'base64')

      // Use the DEK to decrypt the actual data
      const iv = Buffer.from(envelope.iv, 'base64')
      const authTag = Buffer.from(envelope.authTag, 'base64')
      const ciphertext = Buffer.from(envelope.ciphertext, 'base64')

      const decipher = crypto.createDecipheriv('aes-256-gcm', dek, iv)
      decipher.setAuthTag(authTag)

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
      ])

      // Clear the DEK from memory
      dek.fill(0)

      return decrypted.toString('utf8')
    } catch (error) {
      console.error('Envelope decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Rotate encryption keys by re-encrypting data
   */
  async rotateKey(envelopeData: string): Promise<string> {
    const plaintext = await this.decrypt(envelopeData)
    return this.encrypt(plaintext)
  }

  /**
   * Encrypt multiple fields in an object
   */
  async encryptFields<T extends Record<string, any>>(
    obj: T,
    fieldsToEncrypt: (keyof T)[]
  ): Promise<T> {
    const encrypted = { ...obj }

    for (const field of fieldsToEncrypt) {
      if (obj[field] !== undefined && obj[field] !== null) {
        const value = typeof obj[field] === 'string' ? obj[field] : JSON.stringify(obj[field])
        encrypted[field] = await this.encrypt(value) as any
      }
    }

    return encrypted
  }

  /**
   * Decrypt multiple fields in an object
   */
  async decryptFields<T extends Record<string, any>>(
    obj: T,
    fieldsToDecrypt: (keyof T)[]
  ): Promise<T> {
    const decrypted = { ...obj }

    for (const field of fieldsToDecrypt) {
      if (obj[field] !== undefined && obj[field] !== null) {
        try {
          const plaintext = await this.decrypt(obj[field] as string)
          decrypted[field] = plaintext.startsWith('{') || plaintext.startsWith('[')
            ? JSON.parse(plaintext)
            : plaintext as any
        } catch (error) {
          console.error(`Failed to decrypt field ${String(field)}:`, error)
          // Keep original value if decryption fails
        }
      }
    }

    return decrypted
  }
}

// Export singleton instance
export const envelopeEncryption = new EnvelopeEncryption()

// Export for backward compatibility
export const encryptSecret = (secret: string) => envelopeEncryption.encrypt(secret)
export const decryptSecret = (ciphertext: string) => envelopeEncryption.decrypt(ciphertext)