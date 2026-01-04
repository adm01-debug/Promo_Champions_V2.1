#!/bin/bash
# Deploy to Staging

set -e

echo "🚀 Deploying to Staging..."

# Build
npm run build

# Run migrations
npx supabase db push --db-url $STAGING_DB_URL

# Deploy to Vercel
vercel --prod --token=$VERCEL_TOKEN

# Health check
sleep 10
curl -f https://staging.salespro.com/api/health || exit 1

echo "✅ Deployment successful!"
