#!/bin/bash
# Unified Deployment Script

set -e

ENV=${1:-staging}
echo "🚀 Deploying to $ENV environment"

# Pre-deployment checks
echo "📋 Running pre-deployment checks..."
npm run test
npm run lint
npm run type-check

# Build
echo "🏗️  Building application..."
npm run build

# Deploy based on environment
if [ "$ENV" = "production" ]; then
    echo "🔴 Deploying to PRODUCTION"
    
    # Confirm production deployment
    read -p "Are you sure you want to deploy to production? (yes/no) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
    
    # Backup current version
    ./scripts/backup.sh
    
    # Deploy
    rsync -avz --delete dist/ production:/var/www/salespro/
    
elif [ "$ENV" = "staging" ]; then
    echo "🟡 Deploying to STAGING"
    rsync -avz --delete dist/ staging:/var/www/salespro-staging/
else
    echo "❌ Unknown environment: $ENV"
    exit 1
fi

# Post-deployment
echo "✅ Deployment complete!"
echo "🔗 URL: https://salespro-$ENV.com"

# Notify team
./scripts/notify-deployment.sh "$ENV"
