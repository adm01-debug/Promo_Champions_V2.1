#!/bin/bash
# Automated Rollback Script

set -e

VERSION=$1
BACKUP_DIR="./backups"

if [ -z "$VERSION" ]; then
  echo "Usage: ./rollback.sh <version>"
  echo "Example: ./rollback.sh v1.2.3"
  exit 1
fi

echo "🔄 Rolling back to version $VERSION..."

# 1. Restore database backup
echo "📦 Restoring database backup..."
if [ -f "$BACKUP_DIR/db_$VERSION.sql" ]; then
  psql $DATABASE_URL < "$BACKUP_DIR/db_$VERSION.sql"
  echo "✅ Database restored"
else
  echo "⚠️  Database backup not found, skipping..."
fi

# 2. Checkout code version
echo "📝 Reverting code to $VERSION..."
git fetch --tags
git checkout "$VERSION"

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm ci

# 4. Rebuild
echo "🔨 Building application..."
npm run build

# 5. Restart services
echo "🔄 Restarting services..."
if command -v pm2 &> /dev/null; then
  pm2 restart salespro
elif command -v systemctl &> /dev/null; then
  sudo systemctl restart salespro
fi

echo "✅ Rollback complete to version $VERSION"
echo "🔍 Run health checks to verify"
