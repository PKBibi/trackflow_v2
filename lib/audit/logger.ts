import { log } from '@/lib/logger';
// Comprehensive audit logging system for security and compliance
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export type AuditEventType = 
  | 'auth:login'
  | 'auth:logout'
  | 'auth:password_change'
  | 'auth:account_delete'
  | 'data:client_create'
  | 'data:client_update'
  | 'data:client_delete'
  | 'data:project_create'
  | 'data:project_update'
  | 'data:project_delete'
  | 'data:time_entry_create'
  | 'data:time_entry_update'
  | 'data:time_entry_delete'
  | 'data:invoice_create'
  | 'data:invoice_update'
  | 'data:invoice_delete'
  | 'data:invoice_send'
  | 'data:export'
  | 'security:rate_limit_exceeded'
  | 'security:invalid_token'
  | 'security:permission_denied'
  | 'security:suspicious_activity'
  | 'admin:user_impersonation'
  | 'admin:bulk_operation'
  | 'integration:api_key_create'
  | 'integration:api_key_revoke'
  | 'integration:webhook_create'

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface AuditLogEntry {
  event_type: AuditEventType
  severity: AuditSeverity
  user_id?: string
  user_email?: string
  session_id?: string
  ip_address?: string
  user_agent?: string
  resource_type?: string
  resource_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  metadata?: Record<string, any>
  success: boolean
  error_message?: string
  timestamp: string
  request_id?: string
}

class AuditLogger {
  private supabase: any = null
  private logBuffer: AuditLogEntry[] = []
  private isFlushingLogs = false
  private initPromise: Promise<void> | null = null

  constructor() {
    // Don't initialize Supabase at construction time
    // It will be lazily initialized on first log call

    // Flush logs periodically (only in Node.js environment)
    if (typeof process !== 'undefined' && process.on) {
      setInterval(() => {
        this.flushLogs()
      }, 10000) // Flush every 10 seconds

      // Flush on process exit
      process.on('beforeExit', () => {
        this.flushLogs()
      })
    }
  }

  private async initSupabase() {
    if (this.initPromise) return this.initPromise

    this.initPromise = (async () => {
      try {
        this.supabase = await createClient()
      } catch (error) {
        log.error('Failed to initialize Supabase for audit logging:', error)
      }
    })()

    return this.initPromise
  }

  async log(entry: Omit<AuditLogEntry, 'timestamp' | 'ip_address' | 'user_agent'>) {
    try {
      // Enhance entry with request context
      const headersList = await headers()
      const enhancedEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
        ip_address: this.extractIP(headersList),
        user_agent: headersList.get('user-agent') || undefined,
        request_id: headersList.get('x-request-id') || undefined,
      }

      // Add to buffer for batch processing
      this.logBuffer.push(enhancedEntry)

      // For critical events, flush immediately
      if (entry.severity === 'critical') {
        await this.flushLogs()
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        log.debug('🔍 Audit Log:', {
          event: entry.event_type,
          severity: entry.severity,
          user: entry.user_id,
          success: entry.success,
          resource: entry.resource_type && entry.resource_id ? `${entry.resource_type}:${entry.resource_id}` : undefined
        })
      }
    } catch (error) {
      log.error('Failed to log audit entry:', error)
      // Don't throw - audit logging failure shouldn't break the application
    }
  }

  private async flushLogs() {
    if (this.isFlushingLogs || this.logBuffer.length === 0) return

    this.isFlushingLogs = true
    const logsToFlush = [...this.logBuffer]
    this.logBuffer = []

    try {
      if (!this.supabase) {
        await this.initSupabase()
      }

      if (this.supabase) {
        // Insert logs into database
        const { error } = await this.supabase
          .from('audit_logs')
          .insert(logsToFlush.map(log => ({
            event_type: log.event_type,
            severity: log.severity,
            user_id: log.user_id,
            user_email: log.user_email,
            session_id: log.session_id,
            ip_address: log.ip_address,
            user_agent: log.user_agent,
            resource_type: log.resource_type,
            resource_id: log.resource_id,
            old_values: log.old_values,
            new_values: log.new_values,
            metadata: log.metadata,
            success: log.success,
            error_message: log.error_message,
            timestamp: log.timestamp,
            request_id: log.request_id
          })))

        if (error) {
          log.error('Failed to flush audit logs to database:', error)
          // Put logs back in buffer to retry later
          this.logBuffer.unshift(...logsToFlush)
        }
      } else {
        // Fallback to file logging if database is unavailable
        log.warn('Audit logs written to fallback (console) - database unavailable')
        logsToFlush.forEach(log => log.debug('AUDIT:', JSON.stringify(log)))
      }
    } catch (error) {
      log.error('Error flushing audit logs:', error)
      this.logBuffer.unshift(...logsToFlush)
    } finally {
      this.isFlushingLogs = false
    }
  }

  private extractIP(headersList: Headers): string | undefined {
    return headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           headersList.get('x-real-ip') ||
           headersList.get('cf-connecting-ip') || // Cloudflare
           headersList.get('x-client-ip') ||
           undefined
  }

  // Convenience methods for common audit events
  async logAuthentication(
    userId: string,
    userEmail: string,
    success: boolean,
    method: 'password' | 'oauth' | 'magic_link' | '2fa' = 'password',
    errorMessage?: string
  ) {
    await this.log({
      event_type: 'auth:login',
      severity: success ? 'low' : 'medium',
      user_id: userId,
      user_email: userEmail,
      success,
      error_message: errorMessage,
      metadata: { method }
    })
  }

  async logDataAccess(
    eventType: Extract<AuditEventType, `data:${string}`>,
    userId: string,
    resourceType: string,
    resourceId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    success: boolean = true,
    errorMessage?: string
  ) {
    const severity: AuditSeverity = 
      eventType.includes('delete') ? 'high' :
      eventType.includes('create') || eventType.includes('update') ? 'medium' : 'low'

    await this.log({
      event_type: eventType,
      severity,
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      success,
      error_message: errorMessage
    })
  }

  async logSecurityEvent(
    eventType: Extract<AuditEventType, `security:${string}`>,
    userId?: string,
    details?: Record<string, any>,
    errorMessage?: string
  ) {
    await this.log({
      event_type: eventType,
      severity: 'critical',
      user_id: userId,
      success: false,
      error_message: errorMessage,
      metadata: details
    })
  }

  async logExport(
    userId: string,
    exportType: string,
    resourceCount: number,
    format: string,
    success: boolean,
    errorMessage?: string
  ) {
    await this.log({
      event_type: 'data:export',
      severity: 'medium',
      user_id: userId,
      resource_type: 'export',
      success,
      error_message: errorMessage,
      metadata: {
        export_type: exportType,
        resource_count: resourceCount,
        format
      }
    })
  }

  // Query audit logs (for admin dashboard)
  async queryLogs(
    filters: {
      user_id?: string
      event_type?: AuditEventType
      severity?: AuditSeverity
      start_date?: string
      end_date?: string
      resource_type?: string
      success?: boolean
    },
    pagination: {
      page?: number
      limit?: number
    } = {}
  ) {
    if (!this.supabase) return { data: [], count: 0 }

    const { page = 1, limit = 50 } = pagination
    const offset = (page - 1) * limit

    let query = this.supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })

    // Apply filters
    if (filters.user_id) query = query.eq('user_id', filters.user_id)
    if (filters.event_type) query = query.eq('event_type', filters.event_type)
    if (filters.severity) query = query.eq('severity', filters.severity)
    if (filters.resource_type) query = query.eq('resource_type', filters.resource_type)
    if (filters.success !== undefined) query = query.eq('success', filters.success)
    if (filters.start_date) query = query.gte('timestamp', filters.start_date)
    if (filters.end_date) query = query.lte('timestamp', filters.end_date)

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      log.error('Failed to query audit logs:', error)
      return { data: [], count: 0 }
    }

    return { data: data || [], count: count || 0 }
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger()

// Middleware wrapper for automatic audit logging
export function auditMiddleware<T extends any[]>(
  eventType: AuditEventType,
  resourceType?: string,
  options?: {
    captureArgs?: boolean
    captureResult?: boolean
    severity?: AuditSeverity
  }
) {
  return function(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<any>>
  ) {
    const method = descriptor.value!

    descriptor.value = async function(...args: T) {
      const startTime = Date.now()
      let success = true
      let error: Error | null = null
      let result: any = null

      try {
        result = await method.apply(this, args)
        return result
      } catch (e) {
        success = false
        error = e as Error
        throw e
      } finally {
        // Log the operation
        const metadata: Record<string, any> = {
          duration_ms: Date.now() - startTime,
          method: propertyName
        }

        if (options?.captureArgs) {
          metadata.arguments = args
        }
        if (options?.captureResult && result) {
          metadata.result = result
        }

        await auditLogger.log({
          event_type: eventType,
          severity: options?.severity || (success ? 'low' : 'medium'),
          resource_type: resourceType,
          success,
          error_message: error?.message,
          metadata
        })
      }
    }

    return descriptor
  }
}