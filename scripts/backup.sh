#!/bin/bash
# Backup Script

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

echo "📦 Creating backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
echo "💾 Backing up database..."
pg_dump $DATABASE_URL > "$BACKUP_DIR/db_$TIMESTAMP.sql"

# Backup files
echo "📁 Backing up files..."
tar -czf "$BACKUP_FILE"     --exclude=node_modules     --exclude=dist     --exclude=.git     .

echo "✅ Backup created: $BACKUP_FILE"

# Cleanup old backups (keep last 10)
ls -t "$BACKUP_DIR"/backup_*.tar.gz | tail -n +11 | xargs rm -f 2>/dev/null || true

echo "🗑️  Old backups cleaned up"
