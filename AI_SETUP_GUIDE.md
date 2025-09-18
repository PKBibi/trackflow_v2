# AI Setup Guide - Transform TrackFlow to AI-Powered Platform

This guide will help you activate the advanced AI features that transform TrackFlow from basic time tracking to an intelligent business optimization platform.

## Prerequisites

- TrackFlow v2 deployed and running
- Supabase project set up
- Access to environment variables
- OpenAI API account

## Step 1: OpenAI API Key Setup

### 1.1 Get Your OpenAI API Key

1. **Visit OpenAI Platform**: Go to [platform.openai.com](https://platform.openai.com)
2. **Sign Up/Login**: Create account or sign in
3. **Navigate to API Keys**: Click your profile → "View API keys"
4. **Create New Key**: Click "Create new secret key"
5. **Copy the Key**: Save it securely (you won't see it again)
6. **Add Billing**: Ensure you have billing set up for API usage

**Cost Estimate**: ~$0.50-2.00 per 100 AI insights generated (very affordable)

### 1.2 Add Environment Variables

Add these to your environment (`.env.local` for development, production environment for live):

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# Optional: Use GPT-4 for higher quality (more expensive)
# OPENAI_MODEL=gpt-4
```

**For Different Environments:**

**Local Development (.env.local):**
```bash
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

**Vercel Production:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `OPENAI_API_KEY` = `sk-your-key-here`
3. Add: `OPENAI_MODEL` = `gpt-4o-mini`
4. Redeploy your application

**Other Platforms:**
- **Netlify**: Site settings → Environment variables
- **Railway**: Project → Variables
- **Heroku**: Settings → Config Vars

## Step 2: Database Migration

### 2.1 Using Supabase CLI (Recommended)

**Install Supabase CLI (if not installed):**
```bash
npm install -g supabase
```

**Login to Supabase:**
```bash
supabase login
```

**Link to your project:**
```bash
supabase link --project-ref your-project-ref
```
*Find your project ref in Supabase dashboard URL: `supabase.com/dashboard/project/YOUR-PROJECT-REF`*

**Run the migration:**
```bash
supabase db push
```

### 2.2 Using Supabase Dashboard (Alternative)

If you prefer using the web interface:

1. **Open Supabase Dashboard**: Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Select Your Project**: Click on your TrackFlow project
3. **Go to SQL Editor**: Click "SQL Editor" in the left sidebar
4. **Copy Migration SQL**: Copy the content from `supabase/migrations/20250201000300_ai_summaries.sql`
5. **Paste and Run**: Paste the SQL and click "Run"

**Migration SQL Content:**
```sql
-- AI Summaries table for storing weekly summaries and other AI-generated content
CREATE TABLE ai_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly', 'quarterly', 'annual', 'custom')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ai_summaries_user_id ON ai_summaries(user_id);
CREATE INDEX idx_ai_summaries_type ON ai_summaries(type);
CREATE INDEX idx_ai_summaries_generated_at ON ai_summaries(generated_at);

-- Enable RLS
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI summaries" ON ai_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI summaries" ON ai_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI summaries" ON ai_summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI summaries" ON ai_summaries
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_summaries_updated_at
    BEFORE UPDATE ON ai_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 Verify Migration Success

**Check in Supabase Dashboard:**
1. Go to **Table Editor** in your Supabase dashboard
2. You should see the new `ai_summaries` table
3. Click on the table to verify it has the correct columns

**Or check via SQL:**
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ai_summaries'
ORDER BY ordinal_position;
```

## Step 3: Test AI Features

### 3.1 Restart Your Application

**Development:**
```bash
npm run dev
```

**Production:**
- If on Vercel: Deployment will restart automatically after env var changes
- If on other platforms: Restart your application service

### 3.2 Test the AI Insights

1. **Login to TrackFlow**: Use your existing account
2. **Navigate to Insights**: Go to `/insights` page
3. **Enable AI**: Click the "Enable AI" button
4. **View AI Insights**: You should see advanced AI-powered insights with:
   - Predictions with confidence scores
   - Anomaly detection
   - Detailed recommendations
   - Growth opportunities
   - Action items

### 3.3 Test Weekly Summary (Pro Feature)

1. **Upgrade to Pro**: Ensure user has Pro subscription in database
2. **Generate Summary**: Click "Weekly Summary" button
3. **Download Report**: AI-generated markdown report should download

## Step 4: Subscription Configuration (Optional)

To control AI feature access by subscription tier:

### 4.1 Update User Profiles

```sql
-- Set user to Pro tier for full AI access
UPDATE profiles
SET subscription_tier = 'pro'
WHERE id = 'your-user-id';

-- Or set to free for limited AI access
UPDATE profiles
SET subscription_tier = 'free'
WHERE id = 'your-user-id';
```

### 4.2 Subscription Tiers

**Free Tier:**
- 5 AI insights maximum
- Basic recommendations
- Limited action items

**Pro Tier ($29/month):**
- Unlimited AI insights
- Advanced predictions
- Anomaly detection
- Weekly AI summaries
- Growth opportunities
- Full visualization data

**Enterprise Tier ($99/month):**
- All Pro features
- Priority AI processing
- Custom AI models (future)
- Advanced integrations

## Step 5: Monitoring and Troubleshooting

### 5.1 Check AI Status

Visit `/insights` and look for:
- ✅ Green "AI-Powered Insights Active" banner
- ✅ "AI Enabled" button in top-right
- ✅ Rich insight cards with predictions
- ✅ "Powered by gpt-4o-mini AI" in footer

### 5.2 Common Issues

**"AI temporarily unavailable" message:**
- Check OpenAI API key is correct
- Verify API key has billing enabled
- Check Vercel/platform environment variables
- Look at application logs for errors

**Empty insights or errors:**
- Ensure user has time tracking data (need some entries)
- Check database migration completed successfully
- Verify Supabase connection is working

**Subscription errors:**
- Update user's `subscription_tier` in profiles table
- Check RLS policies on ai_summaries table

### 5.3 View Logs

**Vercel:**
```bash
vercel logs
```

**Local Development:**
- Check browser console
- Check terminal for server errors

## Step 6: Advanced Configuration (Optional)

### 6.1 OpenAI Model Selection

**For Higher Quality (More Expensive):**
```bash
OPENAI_MODEL=gpt-4
```

**For Speed and Cost (Recommended):**
```bash
OPENAI_MODEL=gpt-4o-mini
```

### 6.2 AI Feature Flags

```bash
# Disable AI features entirely
AI_ENABLED=false

# Enable OpenTelemetry tracing
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-tracing-endpoint
```

## Success Verification Checklist

- [ ] OpenAI API key added to environment variables
- [ ] Database migration completed successfully
- [ ] Application restarted with new environment variables
- [ ] AI insights page shows "AI-Powered Insights Active"
- [ ] Can toggle between rule-based and AI insights
- [ ] AI insights show predictions, anomalies, and recommendations
- [ ] Weekly summary generates (for Pro users)
- [ ] No errors in application logs

## What's Next?

With AI activated, your TrackFlow platform now provides:

🎯 **Predictive Analytics**: Revenue forecasting and trend predictions
🔍 **Anomaly Detection**: Automatic identification of unusual patterns
💡 **Smart Recommendations**: Actionable business optimization suggestions
📈 **Growth Opportunities**: AI-identified revenue expansion possibilities
📊 **Weekly Intelligence**: Executive-level AI summaries
🤖 **Natural Language Insights**: Human-readable business intelligence

Your time tracking app is now an **intelligent business optimization platform**!

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs for specific errors
3. Verify all environment variables are set correctly
4. Ensure database migration completed successfully

The AI transformation is now complete! 🚀