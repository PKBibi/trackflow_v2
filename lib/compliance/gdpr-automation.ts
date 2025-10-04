import { log } from '@/lib/logger';
/**
 * GDPR Compliance Automation
 * Handles data retention, deletion, anonymization, and export
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { auditLogger } from '@/lib/audit/logger'
import crypto from 'crypto'

interface RetentionPolicy {
  tableName: string
  retentionDays: number
  identifierColumn: string
  dateColumn: string
  softDelete?: boolean
  anonymize?: boolean
  excludeConditions?: string
}

interface AnonymizationRule {
  tableName: string
  columns: {
    name: string
    type: 'email' | 'name' | 'phone' | 'address' | 'ip' | 'custom'
    customHandler?: (value: any) => any
  }[]
}

interface DataExportFormat {
  format: 'json' | 'csv' | 'xml'
  includeMetadata?: boolean
  encryptExport?: boolean
}

/**
 * GDPR Compliance Manager
 */
export class GDPRComplianceManager {
  private supabase: any

  constructor() {
    this.supabase = createAdminClient()
  }

  /**
   * Default retention policies for different data types
   */
  private readonly defaultPolicies: RetentionPolicy[] = [
    {
      tableName: 'audit_logs',
      retentionDays: 365, // 1 year for audit logs
      identifierColumn: 'id',
      dateColumn: 'timestamp',
      softDelete: false
    },
    {
      tableName: 'time_entries',
      retentionDays: 2555, // 7 years for financial records
      identifierColumn: 'id',
      dateColumn: 'created_at',
      softDelete: true
    },
    {
      tableName: 'activity_logs',
      retentionDays: 90, // 90 days for activity logs
      identifierColumn: 'id',
      dateColumn: 'created_at',
      softDelete: false
    },
    {
      tableName: 'webhook_delivery_logs',
      retentionDays: 30, // 30 days for webhook logs
      identifierColumn: 'id',
      dateColumn: 'created_at',
      softDelete: false
    },
    {
      tableName: 'sessions',
      retentionDays: 30, // 30 days for sessions
      identifierColumn: 'id',
      dateColumn: 'created_at',
      softDelete: false
    },
    {
      tableName: 'deleted_users',
      retentionDays: 30, // 30 days grace period for deleted users
      identifierColumn: 'id',
      dateColumn: 'deleted_at',
      softDelete: false
    }
  ]

  /**
   * Anonymization rules for PII
   */
  private readonly anonymizationRules: AnonymizationRule[] = [
    {
      tableName: 'profiles',
      columns: [
        { name: 'email', type: 'email' },
        { name: 'full_name', type: 'name' },
        { name: 'phone', type: 'phone' }
      ]
    },
    {
      tableName: 'clients',
      columns: [
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'address' }
      ]
    },
    {
      tableName: 'audit_logs',
      columns: [
        { name: 'user_email', type: 'email' },
        { name: 'ip_address', type: 'ip' }
      ]
    }
  ]

  /**
   * Apply retention policies - delete old data
   */
  async applyRetentionPolicies(
    policies: RetentionPolicy[] = this.defaultPolicies
  ): Promise<{ deleted: number; errors: string[] }> {
    let totalDeleted = 0
    const errors: string[] = []

    for (const policy of policies) {
      try {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays)

        let query = this.supabase
          .from(policy.tableName)
          .select(policy.identifierColumn)
          .lt(policy.dateColumn, cutoffDate.toISOString())

        if (policy.excludeConditions) {
          query = query.filter(policy.excludeConditions)
        }

        const { data: recordsToDelete, error: selectError } = await query

        if (selectError) {
          errors.push(`Error selecting from ${policy.tableName}: ${selectError.message}`)
          continue
        }

        if (!recordsToDelete || recordsToDelete.length === 0) {
          continue
        }

        // Perform deletion or soft delete
        if (policy.softDelete) {
          const { error } = await this.supabase
            .from(policy.tableName)
            .update({ deleted_at: new Date().toISOString(), deleted_by_gdpr: true })
            .in(policy.identifierColumn, recordsToDelete.map((r: any) => r[policy.identifierColumn]))

          if (error) {
            errors.push(`Error soft deleting from ${policy.tableName}: ${error.message}`)
          } else {
            totalDeleted += recordsToDelete.length
          }
        } else {
          // Anonymize before deletion if required
          if (policy.anonymize) {
            await this.anonymizeRecords(
              policy.tableName,
              recordsToDelete.map((r: any) => r[policy.identifierColumn])
            )
          }

          const { error } = await this.supabase
            .from(policy.tableName)
            .delete()
            .in(policy.identifierColumn, recordsToDelete.map((r: any) => r[policy.identifierColumn]))

          if (error) {
            errors.push(`Error deleting from ${policy.tableName}: ${error.message}`)
          } else {
            totalDeleted += recordsToDelete.length
          }
        }

        // Log the retention action
        await auditLogger.log({
          event_type: 'data:retention_applied' as any,
          severity: 'low',
          success: true,
          metadata: {
            table: policy.tableName,
            records_affected: recordsToDelete.length,
            retention_days: policy.retentionDays
          }
        })
      } catch (error) {
        errors.push(`Unexpected error for ${policy.tableName}: ${error}`)
      }
    }

    return { deleted: totalDeleted, errors }
  }

  /**
   * Anonymize user data
   */
  async anonymizeUserData(userId: string): Promise<void> {
    try {
      // Generate anonymous identifiers
      const anonymousId = this.generateAnonymousId(userId)
      const anonymousEmail = `${anonymousId}@anonymized.local`
      const anonymousName = `User ${anonymousId.substring(0, 8)}`

      // Anonymize profile
      await this.supabase
        .from('profiles')
        .update({
          email: anonymousEmail,
          full_name: anonymousName,
          phone: null,
          avatar_url: null,
          bio: null,
          anonymized_at: new Date().toISOString()
        })
        .eq('id', userId)

      // Anonymize related records
      for (const rule of this.anonymizationRules) {
        if (rule.tableName === 'profiles') continue

        const updates: Record<string, any> = {}
        for (const column of rule.columns) {
          updates[column.name] = this.anonymizeValue(column.type, '')
        }

        await this.supabase
          .from(rule.tableName)
          .update(updates)
          .eq('user_id', userId)
      }

      // Log the anonymization
      await auditLogger.log({
        event_type: 'data:user_anonymized' as any,
        severity: 'medium',
        user_id: userId,
        success: true,
        metadata: {
          anonymous_id: anonymousId,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      await auditLogger.log({
        event_type: 'data:user_anonymized' as any,
        severity: 'high',
        user_id: userId,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Export user data for portability
   */
  async exportUserData(
    userId: string,
    format: DataExportFormat = { format: 'json' }
  ): Promise<{ data: string; filename: string; mimeType: string }> {
    try {
      // Collect all user data
      const userData: Record<string, any> = {}

      // Define tables to export
      const tablesToExport = [
        'profiles',
        'time_entries',
        'clients',
        'projects',
        'invoices',
        'team_members',
        'notification_preferences',
        'api_keys',
        'activity_logs'
      ]

      for (const table of tablesToExport) {
        const { data, error } = await this.supabase
          .from(table)
          .select('*')
          .eq('user_id', userId)

        if (!error && data) {
          userData[table] = data
        }
      }

      // Add metadata
      if (format.includeMetadata) {
        userData._metadata = {
          exported_at: new Date().toISOString(),
          user_id: userId,
          format: format.format,
          tables_included: Object.keys(userData)
        }
      }

      // Format the data
      let exportData: string
      let mimeType: string
      let extension: string

      switch (format.format) {
        case 'csv':
          exportData = this.convertToCSV(userData)
          mimeType = 'text/csv'
          extension = 'csv'
          break

        case 'xml':
          exportData = this.convertToXML(userData)
          mimeType = 'application/xml'
          extension = 'xml'
          break

        case 'json':
        default:
          exportData = JSON.stringify(userData, null, 2)
          mimeType = 'application/json'
          extension = 'json'
          break
      }

      // Encrypt if requested
      if (format.encryptExport) {
        exportData = this.encryptData(exportData, userId)
        extension += '.encrypted'
      }

      // Log the export
      await auditLogger.log({
        event_type: 'data:export' as any,
        severity: 'medium',
        user_id: userId,
        success: true,
        metadata: {
          format: format.format,
          size: exportData.length,
          encrypted: format.encryptExport || false
        }
      })

      return {
        data: exportData,
        filename: `user-data-${userId}-${Date.now()}.${extension}`,
        mimeType
      }
    } catch (error) {
      await auditLogger.log({
        event_type: 'data:export' as any,
        severity: 'high',
        user_id: userId,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Delete all user data (right to be forgotten)
   */
  async deleteUserData(userId: string, reason?: string): Promise<void> {
    try {
      // First export data for backup
      const backup = await this.exportUserData(userId)

      // Store backup in deleted_users table
      await this.supabase
        .from('deleted_users')
        .insert({
          user_id: userId,
          backup_data: backup.data,
          deletion_reason: reason,
          deleted_at: new Date().toISOString()
        })

      // Delete from all tables in correct order (respecting foreign keys)
      const deletionOrder = [
        'activity_logs',
        'notification_preferences',
        'api_keys',
        'team_members',
        'invoices',
        'time_entries',
        'projects',
        'clients',
        'profiles'
      ]

      for (const table of deletionOrder) {
        await this.supabase
          .from(table)
          .delete()
          .eq('user_id', userId)
      }

      // Delete from auth.users
      await this.supabase.auth.admin.deleteUser(userId)

      // Log the deletion
      await auditLogger.log({
        event_type: 'data:user_deleted' as any,
        severity: 'critical',
        user_id: userId,
        success: true,
        metadata: {
          reason,
          backup_created: true,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      await auditLogger.log({
        event_type: 'data:user_deleted' as any,
        severity: 'critical',
        user_id: userId,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Detect and mask PII in logs
   */
  detectAndMaskPII(text: string): string {
    // Email pattern
    text = text.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '***@***.***'
    )

    // Phone pattern (various formats)
    text = text.replace(
      /(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}/g,
      '***-***-****'
    )

    // SSN pattern
    text = text.replace(
      /\b\d{3}-\d{2}-\d{4}\b/g,
      '***-**-****'
    )

    // Credit card pattern
    text = text.replace(
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      '****-****-****-****'
    )

    // IP address pattern
    text = text.replace(
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      '***.***.***.***'
    )

    return text
  }

  /**
   * Schedule automated compliance tasks
   */
  async scheduleComplianceTasks(): Promise<void> {
    // This would typically be handled by a cron job or scheduled function
    // For now, we'll just define the schedule

    const tasks = [
      {
        name: 'Apply Retention Policies',
        schedule: '0 2 * * *', // Daily at 2 AM
        handler: () => this.applyRetentionPolicies()
      },
      {
        name: 'Anonymize Inactive Users',
        schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
        handler: () => this.anonymizeInactiveUsers()
      },
      {
        name: 'Clean Temporary Data',
        schedule: '0 */6 * * *', // Every 6 hours
        handler: () => this.cleanTemporaryData()
      },
      {
        name: 'Generate Compliance Report',
        schedule: '0 0 1 * *', // Monthly on 1st at midnight
        handler: () => this.generateComplianceReport()
      }
    ]

    // Store schedule in database or register with job scheduler
    for (const task of tasks) {
      log.debug(`Scheduled: ${task.name} - ${task.schedule}`)
    }
  }

  /**
   * Helper methods
   */
  private generateAnonymousId(userId: string): string {
    return crypto
      .createHash('sha256')
      .update(userId + Date.now())
      .digest('hex')
      .substring(0, 16)
  }

  private anonymizeValue(type: string, value: any): any {
    switch (type) {
      case 'email':
        return `anon_${crypto.randomBytes(8).toString('hex')}@example.com`
      case 'name':
        return `Anonymous User`
      case 'phone':
        return null
      case 'address':
        return null
      case 'ip':
        return '0.0.0.0'
      default:
        return null
    }
  }

  private async anonymizeRecords(tableName: string, recordIds: string[]): Promise<void> {
    const rule = this.anonymizationRules.find(r => r.tableName === tableName)
    if (!rule) return

    const updates: Record<string, any> = {}
    for (const column of rule.columns) {
      updates[column.name] = this.anonymizeValue(column.type, '')
    }

    await this.supabase
      .from(tableName)
      .update(updates)
      .in('id', recordIds)
  }

  private async anonymizeInactiveUsers(): Promise<void> {
    // Anonymize users inactive for more than 2 years
    const cutoffDate = new Date()
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 2)

    const { data: inactiveUsers } = await this.supabase
      .from('profiles')
      .select('id')
      .lt('last_active_at', cutoffDate.toISOString())
      .is('anonymized_at', null)

    if (inactiveUsers) {
      for (const user of inactiveUsers) {
        await this.anonymizeUserData(user.id)
      }
    }
  }

  private async cleanTemporaryData(): Promise<void> {
    // Clean various temporary data
    const tables = [
      { name: 'two_factor_temp', column: 'expires_at' },
      { name: 'password_reset_tokens', column: 'expires_at' },
      { name: 'email_verification_tokens', column: 'expires_at' }
    ]

    for (const table of tables) {
      await this.supabase
        .from(table.name)
        .delete()
        .lt(table.column, new Date().toISOString())
    }
  }

  private async generateComplianceReport(): Promise<any> {
    // Generate monthly compliance report
    const report = {
      generated_at: new Date().toISOString(),
      retention_policies_applied: await this.getRetentionStats(),
      anonymizations_performed: await this.getAnonymizationStats(),
      data_exports: await this.getExportStats(),
      deletions: await this.getDeletionStats(),
      pii_detections: await this.getPIIDetectionStats()
    }

    // Store report
    await this.supabase
      .from('compliance_reports')
      .insert(report)

    return report
  }

  private convertToCSV(data: Record<string, any[]>): string {
    // Simple CSV conversion (would use a library in production)
    let csv = ''
    for (const [table, records] of Object.entries(data)) {
      if (!Array.isArray(records) || records.length === 0) continue

      csv += `\n# ${table}\n`
      const headers = Object.keys(records[0])
      csv += headers.join(',') + '\n'

      for (const record of records) {
        csv += headers.map(h => JSON.stringify(record[h] || '')).join(',') + '\n'
      }
    }
    return csv
  }

  private convertToXML(data: Record<string, any>): string {
    // Simple XML conversion
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<userData>\n'

    for (const [table, records] of Object.entries(data)) {
      xml += `  <${table}>\n`
      if (Array.isArray(records)) {
        for (const record of records) {
          xml += '    <record>\n'
          for (const [key, value] of Object.entries(record)) {
            xml += `      <${key}>${this.escapeXML(value)}</${key}>\n`
          }
          xml += '    </record>\n'
        }
      }
      xml += `  </${table}>\n`
    }

    xml += '</userData>'
    return xml
  }

  private escapeXML(value: any): string {
    if (value === null || value === undefined) return ''
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  private encryptData(data: string, key: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', key)
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
  }

  private async getRetentionStats() {
    // Implementation would query audit logs
    return { total_deleted: 0 }
  }

  private async getAnonymizationStats() {
    return { users_anonymized: 0 }
  }

  private async getExportStats() {
    return { exports_performed: 0 }
  }

  private async getDeletionStats() {
    return { users_deleted: 0 }
  }

  private async getPIIDetectionStats() {
    return { pii_instances_masked: 0 }
  }
}

// Export singleton instance
export const gdprManager = new GDPRComplianceManager()

// Export convenience functions
export const anonymizeUser = gdprManager.anonymizeUserData.bind(gdprManager)
export const exportUserData = gdprManager.exportUserData.bind(gdprManager)
export const deleteUser = gdprManager.deleteUserData.bind(gdprManager)
export const applyRetention = gdprManager.applyRetentionPolicies.bind(gdprManager)