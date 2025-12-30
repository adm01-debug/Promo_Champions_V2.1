#!/bin/bash
# Melhoria 107 - Deploy Production
set -e

echo "🚀 Deploying to PRODUCTION..."

# Run tests
npm test
npm run test:e2e

# Build
npm run build

# Health checks
npm run health-check

# Deploy to production
vercel deploy --prod

echo "✅ Production deployment complete!"
