#!/bin/bash
# Melhorias 104-105 - Staging Environment Setup

echo "🚀 Setting up Staging Environment"
echo "=================================="

# 1. Create .env.staging
cat > .env.staging << 'ENVFILE'
VITE_SUPABASE_URL=https://YOUR_STAGING_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_STAGING_ANON_KEY
VITE_ENVIRONMENT=staging
VITE_API_URL=https://staging-api.yourdomain.com
ENVFILE

echo "✅ .env.staging created"

# 2. Create supabase config for staging
cat > supabase/config.staging.toml << 'TOML'
project_id = "YOUR_STAGING_PROJECT_ID"

[api]
enabled = true
port = 54321

[db]
port = 54322

[studio]
enabled = true
port = 54323
TOML

echo "✅ supabase/config.staging.toml created"

# 3. Link to staging project
echo "📝 Next steps:"
echo "1. Create staging project on Supabase"
echo "2. Run: supabase link --project-ref YOUR_STAGING_REF"
echo "3. Run: supabase db push"
echo "4. Deploy frontend to staging (Vercel/Netlify)"
