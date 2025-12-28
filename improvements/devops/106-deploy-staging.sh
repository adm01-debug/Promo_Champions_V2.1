#!/bin/bash
# Melhoria 106 - Deploy Staging
set -e

echo "🚀 Deploying to STAGING..."

# Build
npm run build

# Link to staging Supabase
supabase link --project-ref staging-project-ref

# Push migrations
supabase db push

# Deploy functions
supabase functions deploy

# Deploy to Vercel/Netlify staging
vercel deploy --env staging

echo "✅ Staging deployment complete!"
