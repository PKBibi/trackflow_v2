import { log } from '@/lib/logger';
// Monitoring and Alerting System
import { createClient } from '@/lib/supabase/server'
import { auditLogger } from '@/lib/audit/logger'

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical'
export type AlertChannel = 'email' | 'slack' | 'webhook' | 'console'

export interface Alert {
  type: string
  severity: AlertSeverity
  message: string
  details?: Record<string, any>
  timestamp: Date
  resolved?: boolean
}

export interface AlertRule {
  name: string
  condition: () => Promise<boolean>
  severity: AlertSeverity
  message: string
  channels: AlertChannel[]
  cooldownMinutes?: number
  enabled: boolean
}

class MonitoringSystem {
  private alerts: Map<string, Alert> = new Map()
  private lastAlertTime: Map<string, number> = new Map()
  private rules: AlertRule[] = []
  
  constructor() {
    this.initializeDefaultRules()
    this.startMonitoring()
  }

  /**
   * Initialize default monitoring rules
   */
  private initializeDefaultRules() {
    this.rules = [
      {
        name: 'high_failed_auth_attempts',
        condition: async () => {
          const supabase = await createClient()
          const { data } = await supabase
            .from('audit_logs')
            .select('count')
            .eq('event_type', 'auth:login')
            .eq('success', false)
            .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString())
          
          return (data?.[0]?.count || 0) > 10
        },
        severity: 'critical',
        message: 'High number of failed authentication attempts detected',
        channels: ['email', 'slack'],
        cooldownMinutes: 15,
        enabled: true
      },
      {
        name: 'rate_limit_exceeded',
        condition: async () => {
          const supabase = await createClient()
          const { data } = await supabase
            .from('audit_logs')
            .select('count')
            .eq('event_type', 'security:rate_limit_exceeded')
            .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
          
          return (data?.[0]?.count || 0) > 50
        },
        severity: 'warning',
        message: 'Multiple rate limit violations detected',
        channels: ['slack'],
        cooldownMinutes: 30,
        enabled: true
      },
      {
        name: 'critical_security_events',
        condition: async () => {
          const supabase = await createClient()
          const { data } = await supabase
            .from('audit_logs')
            .select('count')
            .eq('severity', 'critical')
            .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString())
          
          return (data?.[0]?.count || 0) > 0
        },
        severity: 'critical',
        message: 'Critical security event detected',
        channels: ['email', 'slack', 'webhook'],
        cooldownMinutes: 5,
        enabled: true
      },
      {
        name: 'unauthorized_access_attempts',
        condition: async () => {
          const supabase = await createClient()
          const { data } = await supabase
            .from('audit_logs')
            .select('count')
            .eq('event_type', 'security:permission_denied')
            .gte('timestamp', new Date(Date.now() - 30 * 60 * 1000).toISOString())
          
          return (data?.[0]?.count || 0) > 20
        },
        severity: 'error',
        message: 'Multiple unauthorized access attempts detected',
        channels: ['email', 'slack'],
        cooldownMinutes: 20,
        enabled: true
      },
      {
        name: 'data_export_spike',
        condition: async () => {
          const supabase = await createClient()
          const { data } = await supabase
            .from('audit_logs')
            .select('count')
            .eq('event_type', 'data:export')
            .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
          
          return (data?.[0]?.count || 0) > 100
        },
        severity: 'warning',
        message: 'Unusual data export activity detected',
        channels: ['email'],
        cooldownMinutes: 60,
        enabled: true
      },
      {
        name: 'failed_2fa_attempts',
        condition: async () => {
          const supabase = await createClient()
          const { data } = await supabase
            .from('audit_logs')
            .select('count')
            .eq('event_type', 'auth:2fa_verification')
            .eq('success', false)
            .gte('timestamp', new Date(Date.now() - 10 * 60 * 1000).toISOString())
          
          return (data?.[0]?.count || 0) > 5
        },
        severity: 'error',
        message: 'Multiple failed 2FA verification attempts',
        channels: ['email', 'slack'],
        cooldownMinutes: 15,
        enabled: true
      }
    ]
  }

  /**
   * Start monitoring with periodic checks
   */
  private startMonitoring() {
    // Check rules every minute
    setInterval(() => {
      this.checkAllRules()
    }, 60000)
    
    // Clean up old alerts every hour
    setInterval(() => {
      this.cleanupOldAlerts()
    }, 3600000)
  }

  /**
   * Check all monitoring rules
   */
  private async checkAllRules() {
    for (const rule of this.rules) {
      if (!rule.enabled) continue
      
      try {
        // Check cooldown
        const lastAlert = this.lastAlertTime.get(rule.name)
        if (lastAlert && rule.cooldownMinutes) {
          const cooldownMs = rule.cooldownMinutes * 60 * 1000
          if (Date.now() - lastAlert < cooldownMs) {
            continue
          }
        }
        
        // Check condition
        const triggered = await rule.condition()
        
        if (triggered) {
          await this.triggerAlert({
            type: rule.name,
            severity: rule.severity,
            message: rule.message,
            timestamp: new Date(),
            resolved: false
          }, rule.channels)
          
          this.lastAlertTime.set(rule.name, Date.now())
        }
      } catch (error) {
        log.error(`Error checking rule ${rule.name}:`, error)
      }
    }
  }

  /**
   * Trigger an alert
   */
  async triggerAlert(alert: Alert, channels: AlertChannel[]) {
    // Store alert
    this.alerts.set(`${alert.type}_${alert.timestamp.getTime()}`, alert)
    
    // Send to channels
    for (const channel of channels) {
      try {
        await this.sendToChannel(alert, channel)
      } catch (error) {
        log.error(`Failed to send alert to ${channel}:`, error)
      }
    }
    
    // Log the alert
    await auditLogger.log({
      event_type: 'security:alert_triggered' as any,
      severity: alert.severity === 'critical' ? 'critical' : 'high',
      success: true,
      metadata: {
        alert_type: alert.type,
        message: alert.message,
        channels: channels
      }
    })
  }

  /**
   * Send alert to specific channel
   */
  private async sendToChannel(alert: Alert, channel: AlertChannel) {
    switch (channel) {
      case 'console':
        log.debug(`[ALERT] [${alert.severity.toUpperCase()}] ${alert.message}`, alert.details)
        break
        
      case 'email':
        await this.sendEmailAlert(alert)
        break
        
      case 'slack':
        await this.sendSlackAlert(alert)
        break
        
      case 'webhook':
        await this.sendWebhookAlert(alert)
        break
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(alert: Alert) {
    // In production, integrate with email service
    const emailPayload = {
      to: process.env.ALERT_EMAIL || 'security@trackflow.com',
      subject: `[${alert.severity.toUpperCase()}] Security Alert: ${alert.type}`,
      html: `
        <h2>Security Alert</h2>
        <p><strong>Type:</strong> ${alert.type}</p>
        <p><strong>Severity:</strong> ${alert.severity}</p>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Time:</strong> ${alert.timestamp.toISOString()}</p>
        ${alert.details ? `<p><strong>Details:</strong> <pre>${JSON.stringify(alert.details, null, 2)}</pre></p>` : ''}
      `
    }
    
    // Send via email service (SendGrid, AWS SES, etc.)
    log.debug('Email alert:', emailPayload)
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(alert: Alert) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL
    if (!webhookUrl) return
    
    const color = {
      info: '#36a64f',
      warning: '#ff9900',
      error: '#ff0000',
      critical: '#990000'
    }[alert.severity]
    
    const payload = {
      attachments: [{
        color,
        title: `${alert.severity.toUpperCase()}: ${alert.type}`,
        text: alert.message,
        fields: alert.details ? Object.entries(alert.details).map(([key, value]) => ({
          title: key,
          value: String(value),
          short: true
        })) : [],
        footer: 'TrackFlow Security',
        ts: Math.floor(alert.timestamp.getTime() / 1000)
      }]
    }
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      log.error('Failed to send Slack alert:', error)
    }
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: Alert) {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL
    if (!webhookUrl) return
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Alert-Type': alert.type,
          'X-Alert-Severity': alert.severity
        },
        body: JSON.stringify(alert)
      })
    } catch (error) {
      log.error('Failed to send webhook alert:', error)
    }
  }

  /**
   * Clean up old alerts
   */
  private cleanupOldAlerts() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000 // 24 hours
    
    for (const [key, alert] of this.alerts.entries()) {
      if (alert.timestamp.getTime() < cutoff) {
        this.alerts.delete(key)
      }
    }
  }

  /**
   * Get current alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertKey: string) {
    const alert = this.alerts.get(alertKey)
    if (alert) {
      alert.resolved = true
    }
  }

  /**
   * Add custom monitoring rule
   */
  addRule(rule: AlertRule) {
    this.rules.push(rule)
  }

  /**
   * Get monitoring statistics
   */
  async getStats() {
    const supabase = await createClient()
    
    const [criticalEvents, highEvents, failedAuth, rateLimit] = await Promise.all([
      supabase
        .from('audit_logs')
        .select('count')
        .eq('severity', 'critical')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      
      supabase
        .from('audit_logs')
        .select('count')
        .eq('severity', 'high')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      
      supabase
        .from('audit_logs')
        .select('count')
        .eq('event_type', 'auth:login')
        .eq('success', false)
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()),
      
      supabase
        .from('audit_logs')
        .select('count')
        .eq('event_type', 'security:rate_limit_exceeded')
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    ])
    
    return {
      criticalEvents: criticalEvents.data?.[0]?.count || 0,
      highEvents: highEvents.data?.[0]?.count || 0,
      failedAuthAttempts: failedAuth.data?.[0]?.count || 0,
      rateLimitViolations: rateLimit.data?.[0]?.count || 0,
      activeAlerts: this.getActiveAlerts().length,
      enabledRules: this.rules.filter(r => r.enabled).length
    }
  }
}

// Export singleton instance
export const monitoring = new MonitoringSystem()

// Health check endpoint data
export async function getHealthStatus() {
  const stats = await monitoring.getStats()
  const alerts = monitoring.getActiveAlerts()
  
  const status = 
    stats.criticalEvents > 0 || alerts.some(a => a.severity === 'critical') ? 'critical' :
    stats.highEvents > 5 || alerts.some(a => a.severity === 'error') ? 'degraded' :
    alerts.length > 0 ? 'warning' :
    'healthy'
  
  return {
    status,
    timestamp: new Date().toISOString(),
    metrics: stats,
    alerts: alerts.map(a => ({
      type: a.type,
      severity: a.severity,
      message: a.message,
      timestamp: a.timestamp
    }))
  }
}