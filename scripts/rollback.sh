#!/bin/bash
# Rollback Deployment

set -e

echo "⏪ Rolling back deployment..."

# Get previous deployment
PREV_DEPLOYMENT=$(vercel ls --token=$VERCEL_TOKEN | head -2 | tail -1 | awk '{print $1}')

# Promote previous deployment
vercel promote $PREV_DEPLOYMENT --token=$VERCEL_TOKEN

# Restore database backup
if [ -f "backup-latest.sql" ]; then
  psql $DATABASE_URL < backup-latest.sql
fi

echo "✅ Rollback complete!"
