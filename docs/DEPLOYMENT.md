# Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Supabase CLI
- PM2 (for production)

## Environment Setup

### Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

### Staging

```bash
# Set environment variables
export NODE_ENV=staging
export VITE_SUPABASE_URL=https://staging.supabase.co
export VITE_SUPABASE_ANON_KEY=your-staging-key

# Build
npm run build

# Deploy
./scripts/deploy.sh staging
```

### Production

```bash
# Pre-deployment checklist
- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Team notified

# Deploy
./scripts/deploy.sh production
```

## Database Migrations

```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push

# Rollback
npx supabase migration revert
```

## Monitoring

### Health Checks

```bash
./scripts/health-check.sh https://salespro.com
```

### Logs

```bash
# Application logs
pm2 logs salespro

# Database logs
sudo journalctl -u postgresql
```

## Rollback Procedure

1. Stop application
2. Restore backup
3. Revert migrations
4. Restart application

```bash
./scripts/rollback.sh TIMESTAMP
```

## Performance Optimization

- Enable gzip compression
- Configure CDN
- Set up caching headers
- Optimize images
- Minify assets

## Security

- Keep dependencies updated
- Use HTTPS only
- Set secure headers
- Regular security audits
- Monitor for vulnerabilities
