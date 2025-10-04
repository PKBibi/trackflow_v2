#!/bin/bash

###############################################################################
# TrackFlow v2 - Production Setup Script
#
# This script helps configure the production environment
# Usage: bash scripts/setup-production.sh
###############################################################################

set -e  # Exit on error

echo "🚀 TrackFlow v2 - Production Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 1
    fi
fi

echo ""
echo "📝 Please provide the following environment variables:"
echo "   (Press Enter to skip optional fields)"
echo ""

# Supabase Configuration
echo -e "${GREEN}Supabase Configuration${NC}"
read -p "NEXT_PUBLIC_SUPABASE_URL: " SUPABASE_URL
read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
read -p "SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_KEY

# Stripe Configuration
echo ""
echo -e "${GREEN}Stripe Configuration${NC}"
read -p "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: " STRIPE_PUB_KEY
read -p "STRIPE_SECRET_KEY: " STRIPE_SECRET
read -p "STRIPE_WEBHOOK_SECRET: " STRIPE_WEBHOOK
read -p "STRIPE_PRICE_ID_FREELANCER: " STRIPE_PRICE_FREELANCER
read -p "STRIPE_PRICE_ID_PROFESSIONAL: " STRIPE_PRICE_PRO
read -p "STRIPE_PRICE_ID_ENTERPRISE: " STRIPE_PRICE_ENT

# App Configuration
echo ""
echo -e "${GREEN}App Configuration${NC}"
read -p "NEXT_PUBLIC_APP_URL (e.g., https://trackflow.com): " APP_URL
read -s -p "JWT_SECRET (generate with: openssl rand -base64 64): " JWT_SECRET
echo ""
read -s -p "WEBHOOK_SECRET_KEY (generate with: openssl rand -hex 32): " WEBHOOK_SECRET
echo ""

# Optional - OpenAI
echo ""
echo -e "${GREEN}Optional: OpenAI Configuration (for AI features)${NC}"
read -p "OPENAI_API_KEY (optional): " OPENAI_KEY
if [ -z "$OPENAI_KEY" ]; then
    OPENAI_MODEL="gpt-4o-mini"
else
    read -p "OPENAI_MODEL (default: gpt-4o-mini): " OPENAI_MODEL
    OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o-mini}
fi

# Optional - Analytics
echo ""
echo -e "${GREEN}Optional: Analytics Configuration${NC}"
read -p "NEXT_PUBLIC_GA_MEASUREMENT_ID (optional): " GA_ID
read -p "NEXT_PUBLIC_POSTHOG_KEY (optional): " POSTHOG_KEY
if [ ! -z "$POSTHOG_KEY" ]; then
    read -p "NEXT_PUBLIC_POSTHOG_HOST (default: https://us.i.posthog.com): " POSTHOG_HOST
    POSTHOG_HOST=${POSTHOG_HOST:-https://us.i.posthog.com}
fi

# Generate .env.production file
echo ""
echo "📄 Generating .env.production..."

cat > .env.production << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUB_KEY
STRIPE_SECRET_KEY=$STRIPE_SECRET
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK
STRIPE_PRICE_ID_FREELANCER=$STRIPE_PRICE_FREELANCER
STRIPE_PRICE_ID_PROFESSIONAL=$STRIPE_PRICE_PRO
STRIPE_PRICE_ID_ENTERPRISE=$STRIPE_PRICE_ENT

# App URL
NEXT_PUBLIC_APP_URL=$APP_URL

# Secrets
JWT_SECRET=$JWT_SECRET
WEBHOOK_SECRET_KEY=$WEBHOOK_SECRET

# OpenAI (AI Features)
OPENAI_API_KEY=$OPENAI_KEY
OPENAI_MODEL=$OPENAI_MODEL

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=$GA_ID
NEXT_PUBLIC_POSTHOG_KEY=$POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST=$POSTHOG_HOST

# Sentry (optional - configure in Vercel dashboard)
# SENTRY_DSN=
# NEXT_PUBLIC_SENTRY_DSN=

# Production optimizations
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
EOF

echo -e "${GREEN}✅ .env.production created successfully!${NC}"
echo ""
echo "📋 Next Steps:"
echo "   1. Review .env.production and verify all values"
echo "   2. Set up environment variables in your hosting platform:"
echo "      - Vercel: Settings > Environment Variables"
echo "      - Netlify: Site settings > Build & deploy > Environment"
echo "      - AWS/GCP: Use secrets manager"
echo "   3. Run migrations: npm run db:migrate"
echo "   4. Build and test: npm run build && npm start"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Never commit .env.production to git!${NC}"
echo ""

# Add to .gitignore if not already there
if ! grep -q ".env.production" .gitignore 2>/dev/null; then
    echo ".env.production" >> .gitignore
    echo "✅ Added .env.production to .gitignore"
fi

echo ""
echo -e "${GREEN}🎉 Production setup complete!${NC}"
