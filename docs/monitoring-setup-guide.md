# 🔍 Monitoring & Error Tracking Setup Guide

## 📋 Overview

TrackFlow includes comprehensive monitoring and error tracking to ensure reliability and rapid issue resolution in production.

## 🚨 Error Monitoring with Sentry

### 1. Create Sentry Account & Project

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project, select "Next.js"
3. Copy your DSN from the project settings

### 2. Configure Environment Variables

```env
# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org-name
SENTRY_PROJECT=trackflow
SENTRY_DEBUG=false
```

### 3. Deploy Configuration

Sentry is automatically configured through:
- `sentry.client.config.ts` - Browser error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime tracking
- Enhanced error boundaries in React components

### 4. Features Enabled

✅ **Automatic Error Capture**
- JavaScript errors
- API route errors
- React component errors
- Network request failures

✅ **Performance Monitoring**
- Page load times
- API response times
- Database query performance
- Custom transaction tracking

✅ **Session Replay**
- 1% of sessions recorded in production
- 100% of error sessions captured
- Privacy-first (form inputs masked)

✅ **Release Tracking**
- Git commit tracking
- Deploy notifications
- Error regression detection

## 📊 Health Check System

### Endpoint: `/api/health`

**GET Request Returns:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "authentication": "healthy",
    "monitoring": "healthy"
  },
  "metrics": {
    "criticalEvents": 0,
    "highEvents": 2,
    "failedAuthAttempts": 1,
    "rateLimitViolations": 0,
    "activeAlerts": 0,
    "enabledRules": 6
  },
  "alerts": [],
  "version": "abc123",
  "environment": "production"
}
```

**Status Codes:**
- `200` - Healthy or degraded
- `503` - Unhealthy (service unavailable)

## 🚨 Alert System

### Built-in Alert Rules

1. **High Failed Auth Attempts** (Critical)
   - Triggers: >10 failed logins in 5 minutes
   - Channels: Email, Slack
   - Cooldown: 15 minutes

2. **Rate Limit Exceeded** (Warning)
   - Triggers: >50 rate limit hits in 1 hour
   - Channels: Slack
   - Cooldown: 30 minutes

3. **Critical Security Events** (Critical)
   - Triggers: Any critical security event
   - Channels: Email, Slack, Webhook
   - Cooldown: 5 minutes

4. **Unauthorized Access Attempts** (Error)
   - Triggers: >20 permission denied in 30 minutes
   - Channels: Email, Slack
   - Cooldown: 20 minutes

5. **Data Export Spike** (Warning)
   - Triggers: >100 exports in 1 hour
   - Channels: Email
   - Cooldown: 60 minutes

6. **Failed 2FA Attempts** (Error)
   - Triggers: >5 failed 2FA in 10 minutes
   - Channels: Email, Slack
   - Cooldown: 15 minutes

### Alert Configuration

```env
# Alert Channels
ALERT_EMAIL=alerts@your-domain.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/slack/webhook
ALERT_WEBHOOK_URL=https://your-pagerduty-webhook.com/alerts
```

## 📈 Performance Monitoring

### Custom Transaction Tracking

```typescript
import { measurePerformance } from '@/lib/monitoring';

// Measure function performance
const result = await measurePerformance(
  'user-signup',
  async () => {
    // Your code here
    return await signupUser(userData);
  },
  { userId: 'user123' }
);
```

### API Request Monitoring

```typescript
import { monitoredFetch } from '@/lib/monitoring';

// Monitored HTTP requests
const response = await monitoredFetch(
  '/api/users',
  { method: 'POST', body: JSON.stringify(data) },
  { component: 'UserForm' }
);
```

### Business Event Tracking

```typescript
import { trackBusinessEvent } from '@/lib/monitoring';

// Track important business metrics
trackBusinessEvent('subscription_created', 29, {
  plan: 'pro',
  userId: 'user123'
});
```

## 🔧 Uptime Monitoring Setup

### Recommended Services

1. **UptimeRobot** (Free)
   - Monitor: `https://your-domain.com/api/health`
   - Interval: 5 minutes
   - Alert: Email/SMS when down

2. **Pingdom**
   - More advanced monitoring
   - Global monitoring locations
   - Detailed performance reports

3. **Better Stack** (formerly StatusCake)
   - Status page generation
   - Advanced alerting rules
   - Team collaboration

### Configuration

```bash
# Health Check URL
https://your-domain.com/api/health

# Expected Response
HTTP Status: 200
Response Time: < 2000ms
Content Contains: "healthy"
```

## 🧪 Testing Your Setup

### Automated Testing

```bash
# Run monitoring test suite
node scripts/test-monitoring.js
```

### Manual Testing

1. **Sentry Error Capture**
   ```javascript
   // In browser console
   throw new Error('Test error for Sentry');
   ```

2. **Health Check**
   ```bash
   curl https://your-domain.com/api/health
   ```

3. **Performance Monitoring**
   - Check Sentry Performance tab
   - Monitor slow transactions
   - Review Web Vitals scores

## 📱 Production Checklist

### Pre-Launch Setup

- [ ] Sentry project created and configured
- [ ] Error alerting tested (email/Slack)
- [ ] Health check endpoint verified
- [ ] Uptime monitoring configured
- [ ] Performance baselines established
- [ ] Alert thresholds tuned for production traffic

### Post-Launch Monitoring

- [ ] Monitor error rates daily
- [ ] Review performance metrics weekly
- [ ] Update alert thresholds based on traffic
- [ ] Regular health check testing
- [ ] Incident response procedures documented

## 🔥 Incident Response

### Error Rate Spike

1. Check Sentry for new errors
2. Review recent deployments
3. Check health endpoints
4. Verify third-party services
5. Roll back if necessary

### Performance Degradation

1. Check Sentry Performance tab
2. Monitor database performance
3. Review API response times
4. Check CDN/caching status
5. Scale resources if needed

### Security Alerts

1. Review audit logs immediately
2. Check for brute force attacks
3. Verify user account integrity
4. Update security rules if needed
5. Document incident details

## 📊 Key Metrics to Monitor

### Application Health
- Error rate (< 1%)
- Response time (95th percentile < 2s)
- Uptime (> 99.9%)
- Database connection pool

### Business Metrics
- User signups/day
- Subscription conversions
- Revenue per user
- Churn rate

### Security Metrics
- Failed authentication attempts
- Unusual data access patterns
- Rate limiting violations
- Account takeover attempts

## 🔧 Advanced Configuration

### Custom Alert Rules

```typescript
import { monitoring } from '@/lib/monitoring/alerts';

// Add custom monitoring rule
monitoring.addRule({
  name: 'high_subscription_failures',
  condition: async () => {
    // Check Stripe webhook failures
    const failures = await getSubscriptionFailures();
    return failures > 5;
  },
  severity: 'error',
  message: 'High number of subscription failures detected',
  channels: ['email', 'slack'],
  cooldownMinutes: 30,
  enabled: true
});
```

### Integration Examples

```typescript
// Slack webhook payload
const alertPayload = {
  text: "🚨 Critical Error Alert",
  attachments: [{
    color: "danger",
    fields: [{
      title: "Error Rate",
      value: "5.2%",
      short: true
    }]
  }]
};
```

## 🆘 Troubleshooting

### Common Issues

**Sentry Not Capturing Errors**
- Verify DSN configuration
- Check Content Security Policy
- Ensure error boundaries are in place

**Health Check Failing**
- Check database connectivity
- Verify environment variables
- Review API rate limits

**Alerts Not Firing**
- Test webhook URLs manually
- Check alert cooldown periods
- Verify rule conditions

**Performance Issues**
- Review slow transactions in Sentry
- Check database query performance
- Monitor memory usage