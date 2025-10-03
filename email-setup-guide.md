# Email Delivery Service Setup Guide

## Overview

TrackFlow uses Resend for reliable email delivery. This guide covers complete setup for production.

## 1. Resend Account Setup

### Step 1: Create Resend Account
1. Visit [resend.com](https://resend.com)
2. Sign up with your business email
3. Verify your email address
4. Complete account setup

### Step 2: Domain Verification
1. Go to Resend Dashboard → Domains
2. Click "Add Domain"
3. Enter `track-flow.app`
4. Add the required DNS records:

```bash
# SPF Record (Required)
Type: TXT
Name: @
Value: "v=spf1 include:spf.resend.com ~all"

# DKIM Record (Required)
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com

# DMARC Record (Recommended)
Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@track-flow.app; pct=100"

# Return-Path (Optional but recommended)
Type: CNAME
Name: bounce
Value: bounce.resend.com
```

### Step 3: API Key Generation
1. Go to Resend Dashboard → API Keys
2. Click "Create API Key"
3. Name: "TrackFlow Production"
4. Permission: "Sending access"
5. Domain: "track-flow.app"
6. Copy the API key (starts with `re_live_`)

## 2. Environment Configuration

### Production Environment Variable
```bash
# Add to Vercel environment variables
RESEND_API_KEY=re_live_your-production-api-key
```

### Email From Address Configuration
```typescript
// lib/email/resend.ts
const defaultFrom = 'TrackFlow <noreply@track-flow.app>';

// Available email addresses:
// noreply@track-flow.app    - Automated emails
// alerts@track-flow.app     - System alerts
// support@track-flow.app    - Customer support
// billing@track-flow.app    - Billing notifications
```

## 3. Email Templates Verification

### Current Email Templates
TrackFlow includes these email templates:

1. **Welcome Email** - New user signup
2. **Subscription Confirmed** - Payment successful
3. **Retainer Alert** - Client retainer usage warnings
4. **Weekly Report** - Performance summaries

### Template Testing Script
```bash
# Test email templates locally
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"template": "welcome", "email": "test@example.com"}'
```

## 4. DNS Records Setup

### Complete DNS Configuration
Add these records to your DNS provider:

```bash
# Primary Domain (already configured)
Type: A
Name: @
Value: 76.76.19.61

# Email Authentication
Type: TXT
Name: @
Value: "v=spf1 include:spf.resend.com ~all"

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com

Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@track-flow.app; pct=100"

# MX Records (if hosting email)
Type: MX
Name: @
Value: 10 mx1.resend.com
Priority: 10

Type: MX
Name: @
Value: 20 mx2.resend.com
Priority: 20
```

## 5. Email Verification Tests

### Manual Verification
```bash
# Check SPF record
dig TXT track-flow.app | grep spf

# Check DKIM record
dig CNAME resend._domainkey.track-flow.app

# Check DMARC record
dig TXT _dmarc.track-flow.app

# Test email deliverability
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@track-flow.app",
    "to": ["test@gmail.com"],
    "subject": "Test Email",
    "html": "<p>This is a test email</p>"
  }'
```

### Automated Testing
```javascript
// test/email-delivery.test.js
const { sendEmail } = require('../lib/email/resend');

describe('Email Delivery', () => {
  test('sends welcome email', async () => {
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Welcome',
      html: '<h1>Welcome!</h1>'
    });

    expect(result.success).toBe(true);
    expect(result.data.id).toBeDefined();
  });
});
```

## 6. Production Monitoring

### Email Delivery Monitoring
1. **Resend Dashboard**
   - Monitor delivery rates
   - Track bounce rates
   - Review spam complaints

2. **Application Monitoring**
   - Log email send attempts
   - Track delivery failures
   - Monitor API rate limits

### Key Metrics to Monitor
- **Delivery Rate**: >99%
- **Bounce Rate**: <2%
- **Spam Rate**: <0.1%
- **API Response Time**: <2s

## 7. Email Security Best Practices

### Authentication Setup
```bash
# SPF (Sender Policy Framework)
"v=spf1 include:spf.resend.com ~all"

# DKIM (DomainKeys Identified Mail)
Automatically configured by Resend

# DMARC (Domain-based Message Authentication)
"v=DMARC1; p=quarantine; rua=mailto:dmarc@track-flow.app"
```

### Content Security
- Use HTTPS links only
- Implement unsubscribe links
- Include physical address
- Avoid spam trigger words

## 8. Rate Limiting and Quotas

### Resend Limits
- **Free Tier**: 100 emails/day
- **Pro Tier**: 50,000 emails/month
- **Business Tier**: 100,000 emails/month

### Implementation
```typescript
// lib/email/rate-limiter.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 emails per hour
});

export async function checkEmailRateLimit(userId: string) {
  const { success } = await ratelimit.limit(userId);
  return success;
}
```

## 9. Email Template Management

### Template Versioning
```typescript
// lib/email/templates/v1/welcome.ts
export const welcomeTemplate = {
  version: '1.0',
  subject: 'Welcome to TrackFlow! 🚀',
  html: `...`,
  text: `...`
};
```

### A/B Testing Setup
```typescript
// lib/email/ab-testing.ts
export function getEmailVariant(userId: string, templateName: string) {
  const hash = hashUserId(userId);
  const variant = hash % 2 === 0 ? 'A' : 'B';
  return `${templateName}_${variant}`;
}
```

## 10. Troubleshooting

### Common Issues

**Emails Not Sending**
- Verify RESEND_API_KEY is set correctly
- Check domain verification status
- Ensure DNS records are propagated

**Emails Going to Spam**
- Verify SPF/DKIM/DMARC setup
- Check sender reputation
- Review email content for spam triggers

**High Bounce Rate**
- Validate email addresses before sending
- Remove invalid addresses from lists
- Monitor delivery reports

### Debug Commands
```bash
# Check domain verification
curl "https://api.resend.com/domains/track-flow.app" \
  -H "Authorization: Bearer $RESEND_API_KEY"

# Check email status
curl "https://api.resend.com/emails/{email_id}" \
  -H "Authorization: Bearer $RESEND_API_KEY"

# Test deliverability
dig TXT track-flow.app
dig CNAME resend._domainkey.track-flow.app
```

## 11. Performance Optimization

### Email Queue System
```typescript
// lib/email/queue.ts
import { Queue } from 'bull';

export const emailQueue = new Queue('email processing', {
  redis: { host: 'localhost', port: 6379 }
});

emailQueue.process('send-email', async (job) => {
  const { to, subject, html } = job.data;
  return await sendEmail({ to, subject, html });
});
```

### Batch Processing
```typescript
// lib/email/batch.ts
export async function sendBulkEmails(emails: EmailData[]) {
  const chunks = chunkArray(emails, 100); // Process in batches of 100

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(email => emailQueue.add('send-email', email))
    );
    await sleep(1000); // Rate limiting
  }
}
```

## 12. Compliance and Legal

### GDPR Compliance
- Implement unsubscribe functionality
- Maintain consent records
- Provide data export/deletion

### CAN-SPAM Compliance
- Include physical address
- Clear unsubscribe mechanism
- Honest subject lines

### Email Footer Template
```html
<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
  <p>TrackFlow Inc.<br>
  123 Business St, Suite 100<br>
  San Francisco, CA 94105</p>

  <p>You received this email because you signed up for TrackFlow.
  <a href="{unsubscribe_url}">Unsubscribe</a> |
  <a href="https://track-flow.app/privacy">Privacy Policy</a></p>
</div>
```