#!/bin/bash
# Melhoria 108 - Rollback Script
set -e

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "Usage: ./rollback.sh <version>"
  exit 1
fi

echo "⏪ Rolling back to version $PREVIOUS_VERSION..."

# Rollback Vercel deployment
vercel rollback $PREVIOUS_VERSION

# Rollback database migrations if needed
# supabase db reset

echo "✅ Rollback complete!"
