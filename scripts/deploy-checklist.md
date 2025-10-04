# Production Deployment Checklist

Use this checklist to ensure a smooth production deployment.

## Pre-Deployment Checklist

### 1. Environment Variables ✅

- [ ] Run `bash scripts/setup-production.sh` to generate `.env.production`
- [ ] Verify all required environment variables are set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `STRIPE_PRICE_ID_*` (all three tiers)
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `JWT_SECRET` (generated with `openssl rand -base64 64`)
  - [ ] `WEBHOOK_SECRET_KEY` (generated with `openssl rand -hex 32`)
- [ ] Optional but recommended:
  - [ ] `OPENAI_API_KEY` (for AI features)
  - [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` (analytics)
  - [ ] `NEXT_PUBLIC_POSTHOG_KEY` (product analytics)
  - [ ] `SENTRY_DSN` (error tracking)

### 2. Database Setup ✅

- [ ] Create production Supabase project
- [ ] Run all migrations:
  ```bash
  # From Supabase dashboard:
  # Database > SQL Editor > paste each migration
  # Or use CLI:
  supabase db push --linked
  ```
- [ ] Verify tables exist:
  - [ ] `profiles`
  - [ ] `time_entries`
  - [ ] `clients`
  - [ ] `projects`
  - [ ] `team_members`
  - [ ] `team_invitations` (not team_invites)
  - [ ] `api_keys`
  - [ ] `notification_preferences`
- [ ] Verify RLS policies are enabled
- [ ] Create database snapshot/backup

### 3. Stripe Setup ✅

- [ ] Switch to live mode API keys (remove `_test` from keys)
- [ ] Create production webhook endpoint: `https://YOUR_DOMAIN/api/webhooks/stripe`
- [ ] Configure webhook events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Create price IDs for all three tiers:
  - [ ] Freelancer
  - [ ] Professional
  - [ ] Enterprise
- [ ] Test payment flow in test mode before going live

### 4. Build & Test ✅

- [ ] Run full build locally: `npm run build`
- [ ] Verify build completes without errors
- [ ] Run tests: `npm test` (acceptable to have some UI test failures)
- [ ] Run linting: `npm run lint` (should be mostly clean)
- [ ] Run security scan: `npm run security:scan`
- [ ] Test production build locally: `npm run build && npm start`
- [ ] Verify all critical pages load:
  - [ ] Landing page (`/`)
  - [ ] Login (`/login`)
  - [ ] Dashboard (`/dashboard`)
  - [ ] Timer (`/timer`)
  - [ ] Invoices (`/invoices`)

### 5. Security ✅

- [ ] **CRITICAL**: Rotate ALL secrets if `.env.local` was committed to git
  - [ ] New Supabase keys
  - [ ] New Stripe keys
  - [ ] New OpenAI key
  - [ ] New JWT secret
  - [ ] New webhook secret
- [ ] Verify `.env.local` and `.env.production` are in `.gitignore`
- [ ] Review and remove any hardcoded API keys in code
- [ ] Enable Supabase Auth email verification
- [ ] Configure CORS settings in Supabase
- [ ] Set up rate limiting (API routes have rate limit middleware)

### 6. DNS & Hosting Setup ✅

#### For Vercel (Recommended):
- [ ] Connect GitHub repository
- [ ] Configure environment variables in Vercel dashboard
- [ ] Set up custom domain
- [ ] Configure DNS records:
  - [ ] A record or CNAME pointing to Vercel
  - [ ] Verify domain ownership
- [ ] Enable automatic deployments from `master` branch
- [ ] Set up preview deployments for PRs

#### For Other Platforms:
- [ ] Configure build command: `npm run build`
- [ ] Configure start command: `npm start`
- [ ] Set Node.js version to 18 or higher
- [ ] Configure environment variables
- [ ] Set up SSL certificate (auto with Vercel/Netlify)

### 7. Monitoring & Analytics ✅

- [ ] Configure Sentry for error tracking:
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
- [ ] Set up Google Analytics (if using)
- [ ] Set up PostHog analytics (if using)
- [ ] Configure uptime monitoring:
  - [ ] UptimeRobot (free)
  - [ ] Pingdom
  - [ ] Better Uptime
- [ ] Set up Supabase dashboard alerts for:
  - [ ] High database CPU
  - [ ] Storage limits
  - [ ] API rate limits

### 8. Content & Legal ✅

- [ ] Add Terms of Service page (`/terms`)
- [ ] Add Privacy Policy page (`/privacy`)
- [ ] Add Cookie Policy (if using analytics)
- [ ] Verify GDPR compliance if serving EU users
- [ ] Add contact information
- [ ] Set up support email

### 9. Performance Optimization ✅

- [ ] Verify images are optimized
- [ ] Enable Vercel Analytics (or alternative)
- [ ] Set up CDN for static assets (auto with Vercel)
- [ ] Configure caching headers
- [ ] Run Lighthouse audit on key pages:
  - [ ] Performance > 90
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 90

### 10. Email Configuration ✅

- [ ] Set up email service (Resend, SendGrid, or AWS SES)
- [ ] Configure Supabase Auth email templates:
  - [ ] Welcome email
  - [ ] Password reset
  - [ ] Email confirmation
- [ ] Test email delivery
- [ ] Set up SPF, DKIM, DMARC records for email domain

## Deployment Steps

### Step 1: Deploy to Staging (if available)

```bash
# Deploy to staging branch
git checkout staging
git merge master
git push origin staging

# Verify staging deployment
# Test all critical flows
```

### Step 2: Deploy to Production

```bash
# Ensure you're on master branch
git checkout master
git pull origin master

# Tag the release
git tag -a v1.0.0 -m "Production launch - v1.0.0"
git push origin v1.0.0

# Deploy (Vercel auto-deploys on push to master)
# Or manually:
vercel --prod
```

### Step 3: Post-Deployment Verification

- [ ] Visit production URL and verify it loads
- [ ] Test user registration flow
- [ ] Test login flow
- [ ] Test password reset
- [ ] Test creating a time entry
- [ ] Test creating an invoice
- [ ] Test Stripe payment flow (with test card in test mode first!)
- [ ] Test team invitation flow
- [ ] Verify email notifications are sent
- [ ] Check error tracking (Sentry) for any issues
- [ ] Monitor Supabase logs for errors

### Step 4: Post-Launch Monitoring (First 24 Hours)

- [ ] Monitor error rates in Sentry
- [ ] Check Supabase database performance
- [ ] Verify Stripe webhook events are being received
- [ ] Monitor page load times
- [ ] Check for any 404 errors
- [ ] Monitor user registration rate
- [ ] Check social media/support channels for user issues

## Rollback Plan

If critical issues are discovered:

1. **Immediate**: Revert to previous deployment in Vercel dashboard
2. **Database**: Restore from snapshot taken pre-deployment
3. **DNS**: Keep same (no changes needed)
4. **Notify**: Send status update to users if needed

## Common Issues & Solutions

### Issue: Build fails on Vercel
**Solution**: Check environment variables are set correctly in Vercel dashboard

### Issue: Database connection fails
**Solution**: Verify Supabase URL and keys, check IP allowlist

### Issue: Stripe webhooks not working
**Solution**: Verify webhook endpoint URL, check webhook secret matches

### Issue: Emails not sending
**Solution**: Check Supabase Auth email provider settings, verify email service configuration

### Issue: 500 errors on API routes
**Solution**: Check Sentry for error details, verify environment variables

## Support Contacts

- Supabase: https://supabase.com/dashboard/support
- Stripe: https://support.stripe.com
- Vercel: https://vercel.com/support

## Documentation Links

- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Stripe Production Checklist](https://stripe.com/docs/development/checklist)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)

---

**Last Updated**: 2025-10-04
**Version**: 1.0.0
