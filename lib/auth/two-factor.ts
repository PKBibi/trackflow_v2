// Two-Factor Authentication (2FA) implementation
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import { auditLogger } from '@/lib/audit/logger'

export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export class TwoFactorAuth {
  private readonly issuer = 'TrackFlow'
  private readonly backupCodeCount = 10
  private readonly backupCodeLength = 8

  /**
   * Generate a new 2FA secret and QR code for user setup
   */
  async setupTwoFactor(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    try {
      // Generate secret
      const secret = authenticator.generateSecret()
      
      // Generate QR code
      const otpauth = authenticator.keyuri(userEmail, this.issuer, secret)
      const qrCode = await QRCode.toDataURL(otpauth)
      
      // Generate backup codes
      const backupCodes = this.generateBackupCodes()
      
      // Store encrypted secret in database (temporary until user confirms)
      const supabase = await createClient()
      const { error } = await supabase
        .from('two_factor_temp')
        .upsert({
          user_id: userId,
          secret: this.encryptSecret(secret),
          backup_codes: this.encryptBackupCodes(backupCodes),
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min expiry
        })
      
      if (error) {
        throw new Error('Failed to store 2FA setup')
      }
      
      // Log the setup attempt
      await auditLogger.log({
        event_type: 'auth:2fa_setup_initiated' as any,
        severity: 'medium',
        user_id: userId,
        user_email: userEmail,
        success: true,
        metadata: { method: 'authenticator' }
      })
      
      return {
        secret,
        qrCode,
        backupCodes
      }
    } catch (error) {
      await auditLogger.log({
        event_type: 'auth:2fa_setup_initiated' as any,
        severity: 'high',
        user_id: userId,
        user_email: userEmail,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Verify and enable 2FA for the user
   */
  async enableTwoFactor(userId: string, userEmail: string, token: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      // Get temporary secret
      const { data: tempData, error: tempError } = await supabase
        .from('two_factor_temp')
        .select('secret, backup_codes')
        .eq('user_id', userId)
        .single()
      
      if (tempError || !tempData) {
        throw new Error('2FA setup not found or expired')
      }
      
      const secret = this.decryptSecret(tempData.secret)
      
      // Verify the token
      const isValid = authenticator.verify({ token, secret })
      
      if (!isValid) {
        await auditLogger.log({
          event_type: 'auth:2fa_enable_failed' as any,
          severity: 'high',
          user_id: userId,
          user_email: userEmail,
          success: false,
          error_message: 'Invalid verification token'
        })
        return false
      }
      
      // Enable 2FA for the user
      const { error: enableError } = await supabase
        .from('user_two_factor')
        .upsert({
          user_id: userId,
          secret: tempData.secret,
          backup_codes: tempData.backup_codes,
          enabled: true,
          enabled_at: new Date().toISOString(),
          last_used: null
        })
      
      if (enableError) {
        throw new Error('Failed to enable 2FA')
      }
      
      // Clean up temporary data
      await supabase
        .from('two_factor_temp')
        .delete()
        .eq('user_id', userId)
      
      // Log successful enablement
      await auditLogger.log({
        event_type: 'auth:2fa_enabled' as any,
        severity: 'low',
        user_id: userId,
        user_email: userEmail,
        success: true,
        metadata: { method: 'authenticator' }
      })
      
      return true
    } catch (error) {
      await auditLogger.log({
        event_type: 'auth:2fa_enable_failed' as any,
        severity: 'high',
        user_id: userId,
        user_email: userEmail,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  /**
   * Verify a 2FA token during login
   */
  async verifyToken(userId: string, userEmail: string, token: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      // Get user's 2FA secret
      const { data, error } = await supabase
        .from('user_two_factor')
        .select('secret, backup_codes, enabled')
        .eq('user_id', userId)
        .single()
      
      if (error || !data || !data.enabled) {
        return false
      }
      
      const secret = this.decryptSecret(data.secret)
      
      // Check if it's a regular token
      let isValid = authenticator.verify({ token, secret })
      let usedBackupCode = false
      let backupCodes: string[] = []

      // If not valid, check backup codes
      if (!isValid) {
        backupCodes = this.decryptBackupCodes(data.backup_codes)
        const codeIndex = backupCodes.indexOf(token)
        
        if (codeIndex !== -1) {
          isValid = true
          usedBackupCode = true
          
          // Remove used backup code
          backupCodes.splice(codeIndex, 1)
          await supabase
            .from('user_two_factor')
            .update({
              backup_codes: this.encryptBackupCodes(backupCodes),
              last_used: new Date().toISOString()
            })
            .eq('user_id', userId)
        }
      } else {
        // Update last used timestamp
        await supabase
          .from('user_two_factor')
          .update({ last_used: new Date().toISOString() })
          .eq('user_id', userId)
      }
      
      // Log the verification attempt
      await auditLogger.log({
        event_type: 'auth:2fa_verification' as any,
        severity: isValid ? 'low' : 'high',
        user_id: userId,
        user_email: userEmail,
        success: isValid,
        metadata: { 
          method: usedBackupCode ? 'backup_code' : 'authenticator',
          remaining_backup_codes: usedBackupCode ? backupCodes.length : undefined
        }
      })
      
      return isValid
    } catch (error) {
      await auditLogger.log({
        event_type: 'auth:2fa_verification' as any,
        severity: 'critical',
        user_id: userId,
        user_email: userEmail,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  /**
   * Disable 2FA for a user
   */
  async disableTwoFactor(userId: string, userEmail: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from('user_two_factor')
        .update({ 
          enabled: false,
          disabled_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      if (error) {
        throw new Error('Failed to disable 2FA')
      }
      
      // Log the disable action
      await auditLogger.log({
        event_type: 'auth:2fa_disabled' as any,
        severity: 'medium',
        user_id: userId,
        user_email: userEmail,
        success: true
      })
      
      return true
    } catch (error) {
      await auditLogger.log({
        event_type: 'auth:2fa_disable_failed' as any,
        severity: 'high',
        user_id: userId,
        user_email: userEmail,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  async isEnabled(userId: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('user_two_factor')
        .select('enabled')
        .eq('user_id', userId)
        .single()
      
      return !error && data?.enabled === true
    } catch {
      return false
    }
  }

  /**
   * Generate new backup codes
   */
  async regenerateBackupCodes(userId: string, userEmail: string): Promise<string[]> {
    try {
      const backupCodes = this.generateBackupCodes()
      const supabase = await createClient()
      
      const { error } = await supabase
        .from('user_two_factor')
        .update({
          backup_codes: this.encryptBackupCodes(backupCodes),
          backup_codes_generated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      if (error) {
        throw new Error('Failed to regenerate backup codes')
      }
      
      await auditLogger.log({
        event_type: 'auth:2fa_backup_codes_regenerated' as any,
        severity: 'medium',
        user_id: userId,
        user_email: userEmail,
        success: true
      })
      
      return backupCodes
    } catch (error) {
      await auditLogger.log({
        event_type: 'auth:2fa_backup_codes_regeneration_failed' as any,
        severity: 'high',
        user_id: userId,
        user_email: userEmail,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Retrieve current 2FA status for a user without exposing secrets
   */
  async getStatus(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_two_factor')
      .select('enabled, enabled_at, last_used, backup_codes')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data || !data.enabled) {
      return {
        enabled: false,
        enabledAt: null,
        lastUsed: null,
        backupCodesRemaining: 0,
      }
    }

    const codes = data.backup_codes ? this.decryptBackupCodes(data.backup_codes) : []

    return {
      enabled: true,
      enabledAt: data.enabled_at ?? null,
      lastUsed: data.last_used ?? null,
      backupCodesRemaining: codes.length,
    }
  }

  /**
   * Generate random backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = []
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    
    for (let i = 0; i < this.backupCodeCount; i++) {
      let code = ''
      for (let j = 0; j < this.backupCodeLength; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      codes.push(code)
    }
    
    return codes
  }

  /**
   * Simple encryption for secrets (in production, use proper KMS)
   */
  private encryptSecret(secret: string): string {
    // In production, use AWS KMS or similar
    return Buffer.from(secret).toString('base64')
  }

  private decryptSecret(encrypted: string): string {
    // In production, use AWS KMS or similar
    return Buffer.from(encrypted, 'base64').toString('utf-8')
  }

  private encryptBackupCodes(codes: string[]): string {
    return Buffer.from(JSON.stringify(codes)).toString('base64')
  }

  private decryptBackupCodes(encrypted: string): string[] {
    return JSON.parse(Buffer.from(encrypted, 'base64').toString('utf-8'))
  }
}

// Export singleton instance
export const twoFactorAuth = new TwoFactorAuth()
