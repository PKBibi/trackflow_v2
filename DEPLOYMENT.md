# TrackFlow v2 - Production Deployment Guide

Complete guide for deploying TrackFlow v2 to production.

## Quick Start (TL;DR)

```bash
# 1. Set up production environment
npm run prod:setup

# 2. Verify configuration
npm run prod:verify

# 3. Deploy (if using Vercel)
npm run prod:deploy
```

## Prerequisites

- [x] Node.js 18+ installed
- [x] Git repository set up
- [x] Supabase account (free tier works)
- [x] Stripe account (test mode for staging)
- [x] Vercel account (recommended) or other hosting platform

## Step-by-Step Deployment

### 1. Create Production Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose a strong database password
4. Select a region closest to your users
5. Wait for project to initialize (~2 minutes)

### 2. Apply Database Migrations

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project > Database > SQL Editor
2. Copy contents of each migration file from `supabase/migrations/` in order:
   - `20250101000000_initial_schema.sql`
   - `20250102000000_performance_indexes.sql`
   - `20250103000000_audit_logs_table.sql`
   - `20250104000000_two_factor_auth.sql`
   - `20250105000000_team_invitations.sql`
   - `20250106000000_retainer_alerts.sql`
   - `20250107000000_scheduled_exports.sql`
   - `20250108000000_user_preferences.sql`
   - `20250108010000_user_preferences_extras.sql`
   - `20250108021000_user_preferences_report_period.sql`
3. Run each migration by clicking "Run"
4. Verify no errors

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### 3. Configure Supabase Settings

#### Enable Email Auth

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates (optional):
   - Confirm signup
   - Reset password
   - Invite user

#### Set up RLS Policies

✅ Already configured in migrations! Verify:

```sql
-- Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

### 4. Configure Stripe

#### Create Products & Prices

1. Go to Stripe Dashboard > Products
2. Create three products:
   - **Freelancer**: $15/month
   - **Professional**: $29/month
   - **Enterprise**: $99/month
3. Copy the Price IDs (format: `price_xxxxx`)

#### Set up Webhook

1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. URL: `https://YOUR_DOMAIN/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret (format: `whsec_xxxxx`)

### 5. Generate Secrets

```bash
# JWT Secret (64 bytes base64)
openssl rand -base64 64

# Webhook Secret (32 bytes hex)
openssl rand -hex 32
```

Save these securely!

### 6. Configure Environment Variables

#### Run Setup Script

```bash
npm run prod:setup
```

This will prompt you for all required variables and create `.env.production`.

#### Manual Configuration

Alternatively, copy `.env.local.example` to `.env.production` and fill in:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_FREELANCER=price_...
STRIPE_PRICE_ID_PROFESSIONAL=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...

NEXT_PUBLIC_APP_URL=https://trackflow.com
JWT_SECRET=<from openssl command>
WEBHOOK_SECRET_KEY=<from openssl command>

# Optional but recommended
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

### 7. Verify Configuration

```bash
npm run prod:verify
```

This checks:
- ✅ All required variables are set
- ✅ Variables have correct format
- ⚠️ Warns if using test keys
- ⚠️ Security issues

### 8. Deploy to Vercel (Recommended)

#### First Time Setup

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Link project:
   ```bash
   vercel link
   ```

4. Add environment variables in Vercel dashboard:
   - Go to Settings > Environment Variables
   - Add all variables from `.env.production`
   - Make sure to select "Production" environment

#### Deploy

```bash
# Deploy to production
npm run prod:deploy

# Or manually
vercel --prod
```

#### Alternative: Connect GitHub

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables
6. Deploy

Vercel will auto-deploy on every push to `master` branch.

### 9. Configure Custom Domain

#### In Vercel:

1. Go to Settings > Domains
2. Add your domain (e.g., `trackflow.com`)
3. Configure DNS records as shown by Vercel
4. Wait for SSL certificate (automatic, ~1 minute)

#### DNS Configuration:

Add these records to your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel's IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Or use Vercel's nameservers for automatic configuration.

### 10. Post-Deployment Verification

Run through this checklist:

```bash
# Use the deployment checklist
cat scripts/deploy-checklist.md
```

Key things to test:
- [ ] Homepage loads
- [ ] User registration works
- [ ] Email verification works
- [ ] Login works
- [ ] Password reset works
- [ ] Timer functionality works
- [ ] Invoice creation works
- [ ] Stripe payment works (use test card: 4242 4242 4242 4242)
- [ ] Team invitations work
- [ ] API endpoints respond correctly

### 11. Set up Monitoring

#### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to environment variables:
```
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

#### Uptime Monitoring

Use [UptimeRobot](https://uptimerobot.com) (free):
1. Add monitor for `https://YOUR_DOMAIN`
2. Set check interval to 5 minutes
3. Add email alerts

#### Supabase Alerts

1. Go to Supabase Dashboard > Settings > Alerts
2. Enable alerts for:
   - High database CPU
   - Storage limits
   - API rate limits

### 12. Backup Strategy

#### Supabase Backups

1. Go to Database > Backups
2. Enable automatic daily backups
3. Create manual backup before major changes

#### GitHub

Ensure code is pushed to GitHub:
```bash
git push origin master
git tag -a v1.0.0 -m "Production launch"
git push origin v1.0.0
```

## Alternative Hosting Platforms

### Netlify

1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variables
4. Deploy

### AWS Amplify

1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Base directory: `/`
   - Output directory: `.next`
3. Add environment variables
4. Deploy

### Self-Hosted (Docker)

```bash
# Build
docker build -t trackflow:latest .

# Run
docker run -p 3000:3000 --env-file .env.production trackflow:latest
```

## Troubleshooting

### Build Fails

**Error**: "Cannot find module 'critters'"
**Solution**: `npm install`

**Error**: "Environment variable not defined"
**Solution**: Check all variables are set in hosting platform

### Database Connection Issues

**Error**: "Could not connect to Supabase"
**Solution**:
1. Verify Supabase URL is correct
2. Check RLS policies allow access
3. Verify service role key is correct

### Stripe Webhook Errors

**Error**: "Webhook signature verification failed"
**Solution**:
1. Verify webhook secret matches
2. Check endpoint URL is correct
3. Ensure raw body is passed to Stripe verification

### Email Not Sending

**Error**: "Failed to send email"
**Solution**:
1. Check Supabase Auth email settings
2. Verify email templates are configured
3. Check SMTP settings if using custom provider

## Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Test
npm test
npm run build
```

### Database Migrations

When adding new migrations:

1. Create migration file: `supabase/migrations/YYYYMMDD_description.sql`
2. Test locally
3. Apply to production:
   ```bash
   supabase db push --linked
   ```

### Rotate Secrets

Periodically rotate:
- JWT_SECRET
- WEBHOOK_SECRET_KEY
- Stripe webhook secret (create new endpoint)
- Database password (in Supabase dashboard)

## Rollback Procedure

If deployment fails:

### Vercel

1. Go to Deployments
2. Find previous working deployment
3. Click "..." > "Promote to Production"

### Database

1. Go to Supabase > Database > Backups
2. Select pre-deployment backup
3. Click "Restore"

## Support

- **Supabase**: https://supabase.com/dashboard/support
- **Stripe**: https://support.stripe.com
- **Vercel**: https://vercel.com/support
- **GitHub Issues**: https://github.com/YOUR_USERNAME/trackflow_v2/issues

## Security Checklist

Before going live:

- [ ] All secrets rotated if previously exposed
- [ ] `.env.local` and `.env.production` in `.gitignore`
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] RLS policies enabled on all tables
- [ ] CORS configured in Supabase
- [ ] Rate limiting enabled
- [ ] Email verification required
- [ ] Strong JWT secret (64+ characters)
- [ ] Stripe webhook secret verified
- [ ] Security headers configured (in `next.config.js`)
- [ ] Content Security Policy set
- [ ] SQL injection prevention (using Supabase client)
- [ ] XSS prevention (React escaping)

## Performance Checklist

- [ ] Images optimized
- [ ] Static assets cached
- [ ] Database indexes created (in migrations)
- [ ] API routes optimized
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass
- [ ] Virtual scrolling for large lists
- [ ] Lazy loading implemented

## Legal Checklist

- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Cookie Policy (if using analytics)
- [ ] GDPR compliance (if EU users)
- [ ] Contact information
- [ ] Support email

---

**Version**: 1.0.0
**Last Updated**: 2025-10-04
**Next Review**: 2025-11-04
