#!/bin/bash
# Deploy to Production

set -e

echo "🚀 Deploying to Production..."

# Pre-flight checks
echo "Running pre-flight checks..."
npm run lint
npm test
npx tsc --noEmit

# Backup database
echo "Backing up database..."
npx supabase db dump > backup-$(date +%Y%m%d-%H%M%S).sql

# Build
npm run build

# Run migrations
npx supabase db push --db-url $PRODUCTION_DB_URL

# Deploy
vercel --prod --token=$VERCEL_TOKEN

# Health check
sleep 10
curl -f https://salespro.com/api/health || {
  echo "❌ Health check failed! Rolling back..."
  ./scripts/rollback.sh
  exit 1
}

echo "✅ Production deployment successful!"
