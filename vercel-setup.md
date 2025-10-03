# Vercel Production Setup Guide

## 1. Environment Variables Configuration

### Required Production Environment Variables

Add these to your Vercel project settings under Environment Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-production-key
STRIPE_SECRET_KEY=sk_live_your-production-key
STRIPE_WEBHOOK_SECRET=whsec_your-production-webhook-secret

# Stripe Price IDs
STRIPE_PRICE_ID_FREELANCER=price_your_freelancer_id
STRIPE_PRICE_ID_PROFESSIONAL=price_your_professional_id
STRIPE_PRICE_ID_ENTERPRISE=price_your_enterprise_id

# Application Configuration
NEXT_PUBLIC_APP_URL=https://track-flow.app
NODE_ENV=production

# Email Service
RESEND_API_KEY=re_live_your-production-key

# Security
JWT_SECRET=your-ultra-secure-production-secret
CRON_SECRET=your-secure-cron-secret

# Optional Services
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR-GA-ID
NEXT_PUBLIC_POSTHOG_KEY=phc_your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Feature Flags
ENABLE_REDIS_RATE_LIMITING=true
ENABLE_AUDIT_LOGGING=true
ENABLE_SECURITY_HEADERS=true
```

## 2. Vercel Project Configuration

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/((?!app|_next|api|favicon.ico|.*\\..*).*)",
      "destination": "/app/$1",
      "permanent": false
    }
  ]
}
```

## 3. Domain Setup Steps

### Step 1: Add Domain to Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add `track-flow.app`
3. Add `www.track-flow.app` (redirect to main domain)

### Step 2: Configure DNS Records
Add these DNS records at your domain registrar:

```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: SSL Configuration
- Vercel automatically provisions SSL certificates
- Verify HTTPS is working after DNS propagation

## 4. Webhook Configuration

### Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://track-flow.app/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Supabase Webhooks (if needed)
1. Go to Supabase Dashboard → Database → Webhooks
2. Add webhook: `https://track-flow.app/api/webhooks/supabase`

## 5. Deployment Process

### Initial Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

### Continuous Deployment
1. Connect GitHub repository to Vercel
2. Enable automatic deployments on main branch
3. Configure preview deployments for pull requests

## 6. Post-Deployment Verification

### Critical Tests
```bash
# Test API endpoints
curl https://track-flow.app/api/health
curl https://track-flow.app/api/auth/check

# Test webhooks
curl -X POST https://track-flow.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Manual Testing Checklist
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Login functionality works
- [ ] Timer starts/stops/resets
- [ ] Payment flow completes
- [ ] Email notifications send
- [ ] Dashboard displays data

## 7. Monitoring Setup

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor Core Web Vitals
- Track conversion funnels

### Custom Monitoring
```javascript
// Add to your pages for performance monitoring
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

## 8. Performance Optimization

### Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true, // Partial Prerendering
  },
  images: {
    domains: ['track-flow.app'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
```

### Build Optimization
```json
// package.json scripts
{
  "build": "next build",
  "build:analyze": "ANALYZE=true next build",
  "build:prod": "NODE_ENV=production next build"
}
```

## 9. Security Configuration

### Content Security Policy
```javascript
// Add to next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-insights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' *.supabase.co *.stripe.com"
    ].join('; ')
  }
]
```

## 10. Troubleshooting

### Common Issues

**Build Failures**
- Check environment variables are set
- Verify TypeScript compilation
- Check for missing dependencies

**Runtime Errors**
- Monitor Vercel Function logs
- Check Sentry error reports
- Verify database connections

**Performance Issues**
- Use Vercel Analytics insights
- Check bundle size analysis
- Monitor Core Web Vitals

### Debug Commands
```bash
# Check deployment logs
vercel logs

# Test environment variables
vercel env ls

# Check function logs
vercel logs --follow
```