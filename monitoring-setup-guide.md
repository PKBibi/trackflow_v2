# Production Monitoring & Alerts Setup Guide

## Overview

TrackFlow includes comprehensive monitoring for security, performance, and business metrics. This guide covers complete monitoring setup for production.

## 1. Monitoring Stack Architecture

### Core Components
- **Application Monitoring**: Custom alert system with rule-based triggers
- **Error Tracking**: Sentry for JavaScript and API errors
- **Performance Monitoring**: Vercel Analytics + Custom metrics
- **Uptime Monitoring**: External service (UptimeRobot/StatusCake)
- **Log Aggregation**: Vercel Function logs + Custom audit logs
- **Business Metrics**: Custom dashboard with key metrics

### Data Flow
```
Application Events → Audit Logs → Alert Rules → Notification Channels
                  ↓
             Analytics → Dashboards → Business Intelligence
```

## 2. Environment Configuration

### Required Environment Variables
```bash
# Monitoring and Alerts
ALERT_EMAIL=alerts@track-flow.app
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
ALERT_WEBHOOK_URL=https://your-monitoring-service.com/webhooks

# Error Monitoring (Sentry)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-organization
SENTRY_PROJECT=trackflow-production
SENTRY_DEBUG=false

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR-GA-ID
NEXT_PUBLIC_POSTHOG_KEY=phc_your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Performance Monitoring
ENABLE_MONITORING=true
MONITORING_SAMPLE_RATE=1.0
```

### Sentry Configuration
```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.SENTRY_DEBUG === 'true',
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization;
    }
    return event;
  },
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ["localhost", "track-flow.app"],
    }),
  ],
});
```

```javascript
// sentry.server.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.SENTRY_DEBUG === 'true',
  environment: process.env.NODE_ENV,
});
```

## 3. Alert Rules Configuration

### Security Alerts
The system includes pre-configured security alerts:

1. **High Failed Auth Attempts** (Critical)
   - Threshold: >10 failed logins in 5 minutes
   - Channels: Email, Slack
   - Cooldown: 15 minutes

2. **Rate Limit Violations** (Warning)
   - Threshold: >50 violations in 1 hour
   - Channels: Slack
   - Cooldown: 30 minutes

3. **Critical Security Events** (Critical)
   - Threshold: Any critical severity event
   - Channels: Email, Slack, Webhook
   - Cooldown: 5 minutes

4. **Unauthorized Access Attempts** (Error)
   - Threshold: >20 permission denied events in 30 minutes
   - Channels: Email, Slack
   - Cooldown: 20 minutes

### Business Alerts
```typescript
// lib/monitoring/business-alerts.ts
export const businessAlerts: AlertRule[] = [
  {
    name: 'payment_failures_spike',
    condition: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('audit_logs')
        .select('count')
        .eq('event_type', 'payment:failed')
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      return (data?.[0]?.count || 0) > 5;
    },
    severity: 'critical',
    message: 'High number of payment failures detected',
    channels: ['email', 'slack'],
    cooldownMinutes: 30,
    enabled: true
  },
  {
    name: 'new_user_signups_drop',
    condition: async () => {
      const supabase = createClient();
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [currentHour, previousDay] = await Promise.all([
        supabase.from('profiles').select('count').gte('created_at', hourAgo.toISOString()),
        supabase.from('profiles').select('count').gte('created_at', dayAgo.toISOString()).lt('created_at', hourAgo.toISOString())
      ]);

      const currentRate = currentHour.data?.[0]?.count || 0;
      const expectedRate = (previousDay.data?.[0]?.count || 0) / 24;

      return currentRate < expectedRate * 0.3; // 70% drop
    },
    severity: 'warning',
    message: 'Significant drop in new user signups',
    channels: ['email'],
    cooldownMinutes: 120,
    enabled: true
  }
];
```

## 4. Custom Monitoring Endpoints

### Health Check Dashboard
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { getHealthStatus } from '@/lib/monitoring/alerts';

export async function GET() {
  try {
    const health = await getHealthStatus();

    // Add additional system checks
    const systemChecks = await Promise.all([
      checkDatabaseHealth(),
      checkEmailService(),
      checkPaymentProvider(),
      checkExternalAPIs()
    ]);

    const overallStatus = [health.status, ...systemChecks.map(c => c.status)]
      .reduce((worst, current) => {
        const statusPriority = { healthy: 0, warning: 1, degraded: 2, critical: 3 };
        return statusPriority[current] > statusPriority[worst] ? current : worst;
      });

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      components: {
        application: health,
        database: systemChecks[0],
        email: systemChecks[1],
        payments: systemChecks[2],
        external_apis: systemChecks[3]
      },
      metrics: await getSystemMetrics()
    });

  } catch (error) {
    return NextResponse.json({
      status: 'critical',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
```

### Performance Metrics Endpoint
```typescript
// app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  const metrics = await Promise.all([
    // Response time metrics
    supabase.rpc('get_avg_response_time', { minutes: 60 }),

    // User activity metrics
    supabase.from('time_entries')
      .select('count')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),

    // Error rate
    supabase.from('audit_logs')
      .select('count')
      .eq('success', false)
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()),

    // Active users
    supabase.rpc('get_active_users', { hours: 24 })
  ]);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    performance: {
      avg_response_time_ms: metrics[0].data || 0,
      error_rate_percent: calculateErrorRate(metrics[2].data || 0),
      requests_per_hour: metrics[1].data?.[0]?.count || 0
    },
    business: {
      active_users_24h: metrics[3].data || 0,
      time_entries_24h: metrics[1].data?.[0]?.count || 0,
      conversion_rate: await getConversionRate()
    }
  });
}
```

## 5. Third-Party Service Integration

### Slack Integration
```javascript
// lib/integrations/slack.ts
export class SlackIntegration {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendAlert(alert: Alert) {
    const payload = {
      username: 'TrackFlow Monitor',
      icon_emoji: ':warning:',
      attachments: [{
        color: this.getSeverityColor(alert.severity),
        title: `${alert.severity.toUpperCase()}: ${alert.type}`,
        text: alert.message,
        fields: [
          {
            title: 'Time',
            value: alert.timestamp.toISOString(),
            short: true
          },
          {
            title: 'Environment',
            value: process.env.NODE_ENV,
            short: true
          }
        ],
        footer: 'TrackFlow Monitoring',
        ts: Math.floor(alert.timestamp.getTime() / 1000)
      }]
    };

    return fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  private getSeverityColor(severity: AlertSeverity): string {
    const colors = {
      info: 'good',
      warning: 'warning',
      error: 'danger',
      critical: '#FF0000'
    };
    return colors[severity] || 'warning';
  }
}
```

### UptimeRobot Configuration
```javascript
// Monitor Configuration for UptimeRobot
const monitors = [
  {
    type: 'HTTP',
    url: 'https://track-flow.app',
    interval: 300, // 5 minutes
    alert_contacts: ['email', 'slack']
  },
  {
    type: 'HTTP',
    url: 'https://track-flow.app/api/health',
    interval: 300,
    alert_contacts: ['email']
  },
  {
    type: 'HTTP',
    url: 'https://track-flow.app/api/health/database',
    interval: 600, // 10 minutes
    alert_contacts: ['email', 'slack']
  }
];
```

## 6. Logging and Audit Trail

### Structured Logging
```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'trackflow',
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Custom log methods
export const log = {
  apiRequest: (method: string, path: string, userId?: string, duration?: number) => {
    logger.info('API Request', {
      type: 'api_request',
      method,
      path,
      userId,
      duration
    });
  },

  apiError: (path: string, error: any, context?: any) => {
    logger.error('API Error', {
      type: 'api_error',
      path,
      error: error.message,
      stack: error.stack,
      context
    });
  },

  securityEvent: (event: string, userId?: string, details?: any) => {
    logger.warn('Security Event', {
      type: 'security_event',
      event,
      userId,
      details
    });
  }
};
```

### Performance Monitoring
```typescript
// lib/monitoring/performance.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  trackApiResponse(endpoint: string, duration: number) {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }

    const times = this.metrics.get(endpoint)!;
    times.push(duration);

    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }

    // Alert on slow responses
    if (duration > 5000) { // 5 seconds
      this.triggerSlowResponseAlert(endpoint, duration);
    }
  }

  getAverageResponseTime(endpoint: string): number {
    const times = this.metrics.get(endpoint) || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  private async triggerSlowResponseAlert(endpoint: string, duration: number) {
    // Send alert for slow response
    console.warn(`Slow response detected: ${endpoint} took ${duration}ms`);
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

## 7. Dashboard and Visualization

### Custom Monitoring Dashboard
```typescript
// app/(dashboard)/admin/monitoring/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function MonitoringDashboard() {
  const health = await getHealthStatus();
  const metrics = await getSystemMetrics();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
            {health.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{health.metrics.activeAlerts}</div>
          <p className="text-xs text-muted-foreground">Active alerts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
          <p className="text-xs text-muted-foreground">Average last hour</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.errorRate}%</div>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeUsers}</div>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 8. Alerting Best Practices

### Alert Fatigue Prevention
- Set appropriate thresholds to avoid false positives
- Use cooldown periods to prevent spam
- Escalation rules based on severity
- Regular review and tuning of alert rules

### Notification Channels
```typescript
// Channel priority by severity
const channelMap = {
  critical: ['email', 'slack', 'webhook', 'sms'],
  error: ['email', 'slack'],
  warning: ['slack'],
  info: ['console']
};
```

### Response Procedures
1. **Critical Alerts**: Immediate response required (< 15 minutes)
2. **Error Alerts**: Response within 1 hour during business hours
3. **Warning Alerts**: Response within 4 hours
4. **Info Alerts**: Review during regular maintenance

## 9. Monitoring Checklist

### Daily Monitoring Tasks
- [ ] Review overnight alerts
- [ ] Check system health dashboard
- [ ] Verify backup completion
- [ ] Monitor error rates and performance

### Weekly Monitoring Tasks
- [ ] Review alert rule effectiveness
- [ ] Analyze performance trends
- [ ] Update monitoring thresholds
- [ ] Test alerting channels

### Monthly Monitoring Tasks
- [ ] Audit monitoring coverage
- [ ] Review and optimize alert rules
- [ ] Analyze long-term trends
- [ ] Update monitoring documentation

## 10. Troubleshooting

### Common Issues

**Alerts Not Firing**
- Check alert rule conditions
- Verify database connectivity
- Review audit log entries
- Test notification channels

**False Positive Alerts**
- Adjust thresholds
- Add context filters
- Implement cooldown periods
- Review alert conditions

**Missing Metrics**
- Check data collection points
- Verify database triggers
- Review API instrumentation
- Test metric endpoints

### Debug Commands
```bash
# Check monitoring service status
curl https://track-flow.app/api/health

# Test alert webhook
curl -X POST https://track-flow.app/api/admin/test-alerts

# View recent audit logs
curl https://track-flow.app/api/admin/audit-logs?limit=100

# Check system metrics
curl https://track-flow.app/api/metrics
```