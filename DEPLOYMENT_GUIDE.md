# TrackFlow V2 Deployment Guide 🚀

A complete step-by-step guide to deploy TrackFlow V2 to production with custom domain `track-flow.app`.

## 📋 Prerequisites

Before starting, you'll need:
- A GitHub account
- A Vercel account (sign up at vercel.com)
- A Supabase account (sign up at supabase.com)
- A Stripe account (sign up at stripe.com)
- Access to your domain registrar (for track-flow.app)
- 30-60 minutes of time

---

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New project"**
3. Choose your organization (or create one)
4. Fill in project details:
   - **Name**: `TrackFlow V2`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to initialize

### 1.2 Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the entire contents of `supabase/migrations/20250101000000_initial_schema.sql` from your project
4. Paste it into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" - this means it worked!

### 1.3 Get Your Supabase Environment Variables

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values (you'll need them later):
   - **URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...` (long string starting with eyJ)

### 1.4 Configure Authentication

1. Go to **Authentication** → **Settings** (left sidebar)
2. Scroll to **Site URL**
3. Set it to: `https://track-flow.app`
4. Under **Redirect URLs**, add:
   - `https://track-flow.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)
5. Click **Save**

---

## 💳 Step 2: Set Up Stripe

### 2.1 Create Stripe Account & Get API Keys

1. Go to [stripe.com](https://stripe.com) and sign in/sign up
2. Complete your account setup (business details, bank account)
3. Go to **Developers** → **API keys**
4. Copy these keys (you'll need them later):
   - **Publishable key**: `pk_live_...` (for production) or `pk_test_...` (for testing)
   - **Secret key**: `sk_live_...` (for production) or `sk_test_...` (for testing)

⚠️ **Important**: Start with test keys, switch to live keys only when ready for real payments!

### 2.2 Create Products and Prices

1. Go to **Products** → **Product catalog**
2. Create these products:

#### Freelancer Plan
- **Name**: `Freelancer Plan`
- **Description**: `Perfect for independent marketers`
- **Pricing**: 
  - Monthly: $15/month
  - Annual: $12/month (save this as $144/year)

#### Agency Starter Plan (Pro)
- **Name**: `Agency Starter Plan`
- **Description**: `Growing marketing teams`
- **Pricing**:
  - Monthly: $29/month
  - Annual: $23/month (save as $276/year)

#### Agency Growth Plan (Enterprise)
- **Name**: `Agency Growth Plan`
- **Description**: `Scale your agency operations`
- **Pricing**:
  - Monthly: $49/month  
  - Annual: $39/month (save as $468/year)

3. For each price, copy the **Price ID** (starts with `price_...`)

### 2.3 Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://track-flow.app/api/webhooks/stripe`
4. **Events to send**: Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_...`)

---

## 🚀 Step 3: Deploy to Vercel

### 3.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Connect your GitHub account if not already connected
4. Find your `trackflow_v2` repository and click **"Import"**

### 3.2 Configure Environment Variables

In the Vercel import screen, click **"Environment Variables"** and add all of these:

```bash
# Supabase (from Step 1.3)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (from Step 2.1)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_1...

# App Configuration
NEXT_PUBLIC_APP_URL=https://track-flow.app

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=your-super-secret-jwt-key-here-32-chars-minimum
```

### 3.3 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment to complete
3. You'll get a temporary URL like `your-app-name.vercel.app`
4. Test the deployment by visiting the URL

---

## 🌐 Step 4: Set Up Custom Domain

### 4.1 Add Domain in Vercel

1. In your Vercel project dashboard, go to **Settings** → **Domains**
2. Add these domains:
   - `track-flow.app`
   - `www.track-flow.app`
3. Vercel will show you DNS records to configure

### 4.2 Configure DNS Records

Go to your domain registrar (where you bought track-flow.app) and add these DNS records:

```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

⏱️ **Wait Time**: DNS changes can take 5 minutes to 24 hours to propagate.

### 4.3 Force HTTPS

1. In Vercel project settings → **Domains**
2. Make sure both domains show "✅ Valid Configuration"
3. Enable **"Redirect to HTTPS"** if not already enabled

---

## 🔧 Step 5: Update Application URLs

### 5.1 Update Supabase Site URL

1. Go back to your Supabase project
2. Go to **Authentication** → **Settings**
3. Update **Site URL** to: `https://track-flow.app`
4. Update **Redirect URLs** to include: `https://track-flow.app/auth/callback`

### 5.2 Update Stripe Webhook URL

1. Go back to your Stripe dashboard
2. Go to **Developers** → **Webhooks**
3. Click on your webhook endpoint
4. Update the endpoint URL to: `https://track-flow.app/api/webhooks/stripe`

---

## ✅ Step 6: Testing Your Deployment

### 6.1 Basic Functionality Test

1. Visit `https://track-flow.app`
2. Try to sign up for a new account
3. Check that you receive a confirmation email
4. Log in to your account
5. Try creating a client, project, and time entry

### 6.2 Payment Flow Test (with Stripe test mode)

1. Go to the pricing page
2. Try to upgrade to a paid plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Any future expiry date and any 3-digit CVC
5. Verify the subscription appears in your Stripe dashboard

### 6.3 Database Test

1. Log into Supabase dashboard
2. Go to **Table Editor**
3. Check that data appears in tables:
   - `profiles` (your user profile)
   - `clients`, `projects`, `time_entries` (if you created any)

---

## 🔒 Step 7: Security & Production Checklist

### 7.1 Switch to Stripe Live Mode (when ready)

⚠️ **Only do this when you're ready to accept real payments!**

1. In Stripe dashboard, toggle from "Test mode" to "Live mode"
2. Get your live API keys from **Developers** → **API keys**
3. Update environment variables in Vercel:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `STRIPE_SECRET_KEY=sk_live_...`
4. Update webhook endpoint with live mode signing secret

### 7.2 Environment Variables Security Check

In Vercel, go to **Settings** → **Environment Variables** and verify:
- ✅ No secrets are marked as `NEXT_PUBLIC_` unless they should be public
- ✅ All sensitive keys (Stripe secret, JWT secret) are kept private
- ✅ All URLs point to production domains

### 7.3 Database Security

1. In Supabase, go to **Settings** → **Database**
2. Verify **Row Level Security (RLS)** is enabled on all tables
3. Check **API** → **API Settings** and ensure rate limiting is appropriate

---

## 🚨 Troubleshooting Common Issues

### Issue: "Invalid JWT" or Auth Errors
**Solution**: Check that your JWT_SECRET is set and is at least 32 characters long.

### Issue: Stripe Payments Not Working  
**Solution**: Verify webhook endpoint is correct and webhook secret matches.

### Issue: Database Connection Failed
**Solution**: Double-check your Supabase URL and anon key in environment variables.

### Issue: Domain Not Working
**Solution**: DNS can take up to 24 hours. Check DNS propagation at dnschecker.org

### Issue: Build Failures
**Solution**: Check the Vercel build logs. Often it's missing environment variables.

### Issue: Email Not Sending
**Solution**: In Supabase → Authentication → Settings, configure SMTP or use the default.

---

## 📊 Step 8: Monitoring & Analytics

### 8.1 Set Up Error Monitoring

1. Consider adding error monitoring:
   - Sentry (recommended)
   - LogRocket
   - Vercel Analytics (built-in)

### 8.2 Set Up Uptime Monitoring  

1. Use a service like:
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

### 8.3 Performance Monitoring

1. Enable Vercel Analytics in project settings
2. Monitor Core Web Vitals
3. Set up Google Analytics if needed

---

## 🎉 You're Live!

Congratulations! Your TrackFlow V2 application is now live at `https://track-flow.app`

### Next Steps:
- [ ] Test all functionality thoroughly
- [ ] Set up backup procedures for your database
- [ ] Create user documentation
- [ ] Plan your marketing launch
- [ ] Monitor error logs and user feedback

### Support Resources:
- **Vercel Docs**: https://vercel.com/docs  
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## 🔄 Making Updates

To update your live application:

1. Make changes to your code locally
2. Test thoroughly with `npm run dev`
3. Commit and push to GitHub: `git push origin master`
4. Vercel will automatically deploy the changes
5. Monitor the deployment in Vercel dashboard

---

**🚀 Your TrackFlow V2 app is now live and ready to help marketing teams track their time and grow their business!**