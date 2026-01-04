#!/bin/bash
# Setup Staging Environment

echo "🚀 Setting up staging environment..."

# Copy staging env
cp .env.staging .env

# Install dependencies
npm install

# Run migrations
npx supabase db push --db-url $STAGING_DB_URL

# Build
npm run build

echo "✅ Staging environment ready!"
