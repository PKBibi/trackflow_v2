# TrackFlow V2 - Complete Setup Guide

This guide will walk you through setting up all required environment variables, configuring Stripe webhooks, and ensuring your Supabase database is ready.

---

## 1. Environment Variables Setup

### Step 1: Create Your Environment Files

You need **two** environment files:
- `.env.local` - For local development
- `.env.production` - For production deployment

### Step 2: Copy the Template

```bash
cp .env.production.example .env.local
```

### Step 3: Configure Each Variable

#### **Supabase Configuration**

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in and select your project
3. Go to **Settings** → **API**
4. Copy the following:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Important**: The service role key has admin access. Never expose it in client-side code!

#### **Stripe Configuration**

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. For **testing**, toggle to "Test mode" in the top right
3. Go to **Developers** → **API Keys**

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # We'll get this in step 2
```

4. For **production**, use live keys:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
```

#### **Application URL**

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For development
# NEXT_PUBLIC_APP_URL=https://your-domain.com  # For production
```

#### **Optional: OpenAI (for AI features)**

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key

```env
OPENAI_API_KEY=sk-xxxxx
```

#### **Optional: Resend (for email)**

1. Go to [https://resend.com/api-keys](https://resend.com/api-keys)
2. Create a new API key

```env
RESEND_API_KEY=re_xxxxx
```

#### **Optional: Sentry (for error tracking)**

```env
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

---

## 2. Stripe Webhook Configuration

### For Local Development (Using Stripe CLI)

#### Step 1: Install Stripe CLI

**Windows:**
```bash
scoop install stripe
```

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download from https://github.com/stripe/stripe-cli/releases
```

#### Step 2: Login to Stripe

```bash
stripe login
```

This will open your browser to authenticate.

#### Step 3: Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

Copy that `whsec_xxxxx` value and add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

#### Step 4: Test the Webhook

In a new terminal:
```bash
stripe trigger payment_intent.succeeded
```

Check your app logs - you should see the webhook event received!

---

### For Production (Stripe Dashboard)

#### Step 1: Create Webhook Endpoint

1. Go to [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your endpoint URL:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```

#### Step 2: Select Events to Listen For

Select these events:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

#### Step 3: Get Webhook Secret

1. After creating the endpoint, click on it
2. Click **"Reveal"** next to "Signing secret"
3. Copy the `whsec_xxxxx` value
4. Add it to your production environment variables

---

## 3. Supabase Database Setup

### Step 1: Check Current Migration Status

1. Go to [https://supabase.com](https://supabase.com)
2. Select your project
3. Go to **Database** → **Migrations**

You should see all migrations listed. If not, continue to Step 2.

### Step 2: Install Supabase CLI

**Windows:**
```bash
scoop install supabase
```

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
# Download from https://github.com/supabase/cli/releases
```

### Step 3: Link Your Project

```bash
supabase login
supabase link --project-ref your-project-ref
```

Find your project ref in Supabase dashboard under **Settings** → **General** → **Reference ID**

### Step 4: Check Existing Migrations

```bash
supabase db diff
```

This shows any differences between your local migrations and the database.

### Step 5: Run All Migrations

```bash
cd supabase
supabase db push
```

This will apply all migration files in `supabase/migrations/` to your database.

### Step 6: Verify Tables Exist

In Supabase dashboard, go to **Table Editor**. You should see:

**Core Tables:**
- ✅ `profiles`
- ✅ `clients`
- ✅ `projects`
- ✅ `time_entries`
- ✅ `invoices`
- ✅ `teams`
- ✅ `teams_users`

**Feature Tables:**
- ✅ `api_keys`
- ✅ `notification_preferences`
- ✅ `activity_logs`
- ✅ `webhook_subscriptions`
- ✅ `webhook_delivery_logs`
- ✅ `user_preferences`

### Step 7: Verify Row Level Security (RLS)

1. Go to **Authentication** → **Policies**
2. Each table should have RLS policies configured
3. Key policies to verify:
   - Users can only access their own data
   - Team members can only access team data
   - Service role can bypass RLS

### Step 8: Create Initial Data (Optional)

If you want sample data for testing:

```sql
-- Go to SQL Editor in Supabase and run:

-- Create a test team
INSERT INTO teams (id, name, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Test Team', NOW());

-- Link your user to the team (replace YOUR_USER_ID)
INSERT INTO teams_users (team_id, user_id, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'YOUR_USER_ID',
  'owner',
  NOW()
);
```

---

## 4. Verification Checklist

### ✅ Environment Variables
```bash
# Run this to check all required vars are set:
node -e "
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL'
];
require('dotenv').config({ path: '.env.local' });
required.forEach(key => {
  console.log(key, process.env[key] ? '✅' : '❌');
});
"
```

### ✅ Stripe Webhook
```bash
# Test webhook with Stripe CLI
stripe trigger checkout.session.completed
```

Check logs for: `✓ Webhook signature verified`

### ✅ Supabase Database
```bash
# Check migration status
supabase db diff

# Should show: "No schema differences detected"
```

### ✅ Application Start
```bash
npm run dev
```

Visit `http://localhost:3000` - no errors should appear in console.

---

## 5. Common Issues & Solutions

### Issue: "Webhook signature verification failed"
**Solution:** Make sure `STRIPE_WEBHOOK_SECRET` matches your Stripe CLI or dashboard webhook secret.

### Issue: "No Supabase client initialized"
**Solution:** Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly.

### Issue: "Table does not exist"
**Solution:** Run `supabase db push` to apply migrations.

### Issue: "RLS policy violation"
**Solution:**
1. Check that RLS policies are created
2. Verify your user is linked to a team in `teams_users` table
3. Check the `x-team-id` header is being sent with requests

### Issue: "CORS error when calling Supabase"
**Solution:** Add your local URL to Supabase:
1. Go to **Authentication** → **URL Configuration**
2. Add `http://localhost:3000` to **Redirect URLs**

---

## 6. Next Steps

After completing this setup:

1. **Test Authentication:**
   - Sign up: `http://localhost:3000/signup`
   - Sign in: `http://localhost:3000/login`

2. **Test Stripe:**
   - Go to settings → billing
   - Use test card: `4242 4242 4242 4242`
   - Any future date and CVC

3. **Create Sample Data:**
   - Add a client
   - Add a project
   - Track some time
   - Generate an invoice

4. **Test AI Features** (if OpenAI key is configured):
   - Go to `/insights`
   - Try generating AI reports

---

## 7. Production Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in production environment
- [ ] Supabase database migrations applied
- [ ] Stripe webhook configured with production URL
- [ ] SSL certificate installed (HTTPS)
- [ ] Domain configured in Supabase allowed URLs
- [ ] Production Stripe keys (not test keys)
- [ ] Sentry configured for error tracking
- [ ] Database backups enabled in Supabase

---

## Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Stripe Webhooks:** https://stripe.com/docs/webhooks
- **Next.js Env Vars:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

---

**Setup Complete! 🎉**

Your TrackFlow instance should now be fully configured and ready to use.
