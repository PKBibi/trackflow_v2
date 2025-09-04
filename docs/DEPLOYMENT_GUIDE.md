# TrackFlow v2 - Complete Deployment Guide for Vercel

## 📋 Pre-Deployment Checklist

### 1. GitHub Repository Status
- **Repository:** https://github.com/PKBibi/trackflow_v2.git
- **Current Status:** You have uncommitted changes (mainly .next build files)
- **Action Required:** 
  ```bash
  # Add .next to .gitignore if not already there
  echo ".next/" >> .gitignore
  
  # Commit your application code
  git add -A
  git commit -m "Prepare for Vercel deployment"
  git push origin master
  ```

## 🔧 Third-Party Service Setup

### 1. Supabase Setup (Database & Authentication)
1. **Create Account:** https://app.supabase.com
2. **Create New Project:**
   - Project Name: trackflow-v2
   - Database Password: (Generate a strong password)
   - Region: Choose closest to your users
   - Pricing Plan: Start with Free tier

3. **Get Credentials:**
   - Go to Settings → API
   - Copy: `Project URL`, `anon public key`, `service_role key`

4. **Database Setup:**
   - Run migrations in SQL Editor (check `supabase/migrations/` folder)
   - Enable Row Level Security (RLS) on all tables
   - Set up Auth providers (Email, Google OAuth)

### 2. Stripe Setup (Payment Processing)
1. **Create Account:** https://dashboard.stripe.com
2. **Get API Keys:**
   - Dashboard → Developers → API Keys
   - Copy both Publishable and Secret keys

3. **Create Products & Pricing:**
   - Products → Add Product
   - Create pricing tiers: Starter, Professional, Enterprise
   - Copy Price IDs for each tier

4. **Setup Webhook:**
   - Developers → Webhooks → Add Endpoint
   - Endpoint URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Events to listen:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy Webhook Secret

### 3. Google OAuth & Calendar Setup
1. **Google Cloud Console:** https://console.cloud.google.com
2. **Create New Project:** "TrackFlow"
3. **Enable APIs:**
   - Google Calendar API
   - Google+ API (for authentication)

4. **Create OAuth Credentials:**
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application Type: Web application
   - Name: TrackFlow
   - Authorized JavaScript origins:
     - `https://your-app.vercel.app`
     - `http://localhost:3000` (for development)
   - Authorized redirect URIs:
     - `https://your-app.vercel.app/api/auth/google/callback`
     - `http://localhost:3000/api/auth/google/callback`
   - Copy Client ID and Client Secret

5. **Configure OAuth Consent Screen:**
   - User Type: External
   - App Information: Fill in app details
   - Scopes: Add calendar scopes
   - Test Users: Add your email for testing

### 4. Slack Integration Setup
1. **Create Slack App:** https://api.slack.com/apps
2. **Basic Information:**
   - App Name: TrackFlow
   - Workspace: Select your workspace

3. **OAuth & Permissions:**
   - Scopes to add:
     - `chat:write`
     - `chat:write.public`
     - `incoming-webhook`
     - `commands`
   - Install to Workspace
   - Copy Bot User OAuth Token

4. **Slash Commands:**
   - Create commands: `/track`, `/timer`, `/report`
   - Request URL: `https://your-app.vercel.app/api/slack/commands`

5. **Incoming Webhooks:**
   - Activate Incoming Webhooks
   - Add New Webhook to Workspace
   - Copy Webhook URL

6. **Event Subscriptions:**
   - Enable Events
   - Request URL: `https://your-app.vercel.app/api/slack/events`
   - Subscribe to bot events as needed

## 🚀 Vercel Deployment Steps

### Step 1: Connect to Vercel
1. **Sign up/Login:** https://vercel.com
2. **Import Project:**
   - Click "New Project"
   - Import Git Repository
   - Select: PKBibi/trackflow_v2

### Step 2: Configure Build Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Step 3: Environment Variables
Add the following environment variables in Vercel Dashboard:

#### Core Configuration
```
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_NAME=TrackFlow
NEXT_PUBLIC_APP_DESCRIPTION=Professional Time Tracking & Project Management
NODE_ENV=production
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Stripe
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_STARTER=price_xxx
STRIPE_PRICE_ID_PROFESSIONAL=price_xxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxx
```

#### Google Integration
```
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/auth/google/callback
```

#### Slack Integration
```
SLACK_BOT_TOKEN=xoxb-xxx
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
SLACK_CLIENT_ID=xxx
SLACK_CLIENT_SECRET=xxx
SLACK_SIGNING_SECRET=xxx
```

#### Optional Services
```
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-xxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Caching (if using Redis/Upstash)
REDIS_URL=redis://xxx
UPSTASH_REDIS_REST_URL=https://xxx
UPSTASH_REDIS_REST_TOKEN=xxx
```

### Step 4: Deploy
1. Click "Deploy" button
2. Wait for build to complete (usually 2-5 minutes)
3. Visit deployment URL to verify

## 🔍 Post-Deployment Configuration

### 1. Update OAuth Redirect URLs
After deployment, update redirect URLs in:
- Google Cloud Console
- Slack App Settings
- Supabase Auth Settings

### 2. Configure Webhooks
Update webhook endpoints with your Vercel URL:
- Stripe: `https://your-app.vercel.app/api/webhooks/stripe`
- Slack: `https://your-app.vercel.app/api/slack/events`

### 3. Domain Configuration (Optional)
1. **Add Custom Domain:**
   - Vercel Dashboard → Settings → Domains
   - Add your domain
   - Update DNS records as instructed

2. **Update Environment Variables:**
   - Change `NEXT_PUBLIC_APP_URL` to your custom domain
   - Redeploy for changes to take effect

### 4. Database Migrations
```bash
# If using Supabase CLI
supabase db push
# Or run migrations manually in Supabase SQL Editor
```

## 🧪 Testing Checklist

### Essential Features to Test:
- [ ] User registration and login
- [ ] Google OAuth authentication
- [ ] Timer functionality
- [ ] Time entry creation/editing
- [ ] Project and client management
- [ ] Invoice generation
- [ ] Stripe payment flow
- [ ] Slack notifications
- [ ] Google Calendar sync
- [ ] PWA installation
- [ ] Report generation
- [ ] Data export

### Performance Checks:
- [ ] Page load times < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile responsiveness
- [ ] Offline functionality

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check Node.js version (requires 18.x or higher)
   - Verify all environment variables are set
   - Check for TypeScript errors

2. **Authentication Issues:**
   - Verify Supabase URL and keys
   - Check OAuth redirect URLs
   - Ensure cookies are enabled

3. **Payment Issues:**
   - Verify Stripe webhook secret
   - Check webhook endpoint is accessible
   - Ensure products/prices are created in Stripe

4. **Integration Issues:**
   - Verify API credentials
   - Check CORS settings
   - Ensure webhook URLs are correct

## 📊 Monitoring & Maintenance

### Recommended Monitoring Tools:
1. **Vercel Analytics** (Built-in)
2. **Sentry** for error tracking
3. **PostHog** for user analytics
4. **Stripe Dashboard** for payment monitoring
5. **Supabase Dashboard** for database monitoring

### Regular Maintenance:
- Weekly: Check error logs and performance metrics
- Monthly: Review and optimize database queries
- Quarterly: Update dependencies and security patches

## 🚨 Security Checklist

- [ ] All sensitive keys are in environment variables
- [ ] Row Level Security enabled in Supabase
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Content Security Policy headers set
- [ ] SSL/TLS enabled (automatic with Vercel)
- [ ] Regular security audits with `npm audit`

## 📞 Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Supabase Documentation:** https://supabase.com/docs
- **Stripe Documentation:** https://stripe.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Project Repository:** https://github.com/PKBibi/trackflow_v2

## 🎉 Launch Checklist

Before going live:
- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Payment system tested
- [ ] Integrations verified
- [ ] Custom domain configured (if applicable)
- [ ] Analytics and monitoring set up
- [ ] Backup strategy in place
- [ ] User documentation ready
- [ ] Support channels established

---

**Deployment ETA:** 15-30 minutes for basic setup, 1-2 hours for complete configuration with all integrations.

**Note:** Start with core features (Supabase + basic deployment) and add integrations incrementally to ensure each component works correctly.
