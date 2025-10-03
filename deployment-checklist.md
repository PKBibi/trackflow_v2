# Production Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables Setup
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill in all required production values
- [ ] Verify all environment variables are set correctly
- [ ] Test environment variable loading locally

### 2. Supabase Production Setup
- [ ] Create production Supabase project
- [ ] Configure production database schema
- [ ] Set up Row Level Security (RLS) policies
- [ ] Configure CORS settings for production domain
- [ ] Set up database backups
- [ ] Test database connectivity

### 3. Stripe Production Setup
- [ ] Activate Stripe account for live payments
- [ ] Create production price objects for plans
- [ ] Configure production webhooks
- [ ] Set up webhook endpoint verification
- [ ] Test payment flows in live mode
- [ ] Configure tax settings if applicable

### 4. Domain and SSL Setup
- [ ] Purchase and configure domain (track-flow.app)
- [ ] Set up DNS records
- [ ] Configure SSL certificates
- [ ] Set up domain redirects (www to non-www)
- [ ] Test domain resolution

### 5. Email Service Setup
- [ ] Set up Resend account for production
- [ ] Configure domain verification for email sending
- [ ] Set up email templates
- [ ] Test email delivery
- [ ] Configure SPF/DKIM records

### 6. Monitoring and Analytics
- [ ] Set up Sentry for error monitoring
- [ ] Configure Google Analytics
- [ ] Set up PostHog analytics
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring

### 7. Security Configuration
- [ ] Enable security headers
- [ ] Configure rate limiting
- [ ] Set up CORS policies
- [ ] Enable audit logging
- [ ] Configure session security

## Deployment Process

### 1. Build Testing
- [ ] Run production build locally
- [ ] Test all critical paths
- [ ] Verify environment variables load correctly
- [ ] Check for build warnings/errors

### 2. Vercel Deployment
- [ ] Connect GitHub repository to Vercel
- [ ] Configure production environment variables in Vercel
- [ ] Set up custom domain in Vercel
- [ ] Configure deployment settings
- [ ] Deploy to production

### 3. Post-Deployment Verification
- [ ] Verify site loads correctly
- [ ] Test user registration/login
- [ ] Test timer functionality
- [ ] Test payment flows
- [ ] Verify email notifications work
- [ ] Check all analytics tracking

## Critical Production Settings

### Environment Variables Checklist
```bash
# Required Core Settings
NEXT_PUBLIC_SUPABASE_URL=✓
NEXT_PUBLIC_SUPABASE_ANON_KEY=✓
SUPABASE_SERVICE_ROLE_KEY=✓
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=✓
STRIPE_SECRET_KEY=✓
STRIPE_WEBHOOK_SECRET=✓
NEXT_PUBLIC_APP_URL=✓
RESEND_API_KEY=✓
JWT_SECRET=✓
CRON_SECRET=✓

# Optional but Recommended
UPSTASH_REDIS_REST_URL=○
SENTRY_DSN=○
NEXT_PUBLIC_GA_MEASUREMENT_ID=○
NEXT_PUBLIC_POSTHOG_KEY=○
```

### Security Checklist
- [ ] JWT secrets are strong and unique
- [ ] Database RLS policies are properly configured
- [ ] API routes have proper authentication
- [ ] Sensitive data is not logged
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled

### Performance Checklist
- [ ] Images are optimized
- [ ] Bundle size is reasonable
- [ ] Critical CSS is inlined
- [ ] Database queries are optimized
- [ ] Caching is configured
- [ ] CDN is set up

## Post-Launch Monitoring

### Daily Checks
- [ ] Monitor error rates in Sentry
- [ ] Check payment processing
- [ ] Verify email delivery
- [ ] Monitor site performance

### Weekly Checks
- [ ] Review analytics data
- [ ] Check database performance
- [ ] Review user feedback
- [ ] Update dependencies if needed

### Monthly Checks
- [ ] Security audit
- [ ] Performance optimization
- [ ] Cost optimization
- [ ] Backup verification

## Emergency Procedures

### Rollback Process
1. Revert to previous Vercel deployment
2. Check database integrity
3. Verify all services are operational
4. Communicate status to users

### Incident Response
1. Identify the issue scope
2. Implement immediate fix if possible
3. Communicate with users via status page
4. Document the incident
5. Conduct post-mortem review

## Contact Information

- **Domain Registrar**: [Your registrar]
- **DNS Provider**: [Your DNS provider]
- **Hosting**: Vercel
- **Database**: Supabase
- **Email**: Resend
- **Payments**: Stripe
- **Monitoring**: Sentry, PostHog