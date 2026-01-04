# Troubleshooting Guide

## Common Issues

### Build Failures

**Issue**: `npm run build` fails with TypeScript errors

**Solution**:
```bash
npm run type-check
# Fix type errors
npm run build
```

### Database Connection Issues

**Issue**: Cannot connect to Supabase

**Solution**:
1. Check `.env.local` credentials
2. Verify Supabase project is running
3. Check network connectivity
4. Verify RLS policies

### Authentication Problems

**Issue**: Users cannot login

**Solution**:
1. Check Supabase Auth settings
2. Verify email templates
3. Check redirect URLs
4. Review error logs

### Performance Issues

**Issue**: Slow page loads

**Solution**:
1. Check network tab in DevTools
2. Enable React DevTools Profiler
3. Review database query performance
4. Check for unnecessary re-renders
5. Optimize images and assets

### Webhook Failures

**Issue**: Webhooks not firing

**Solution**:
1. Check webhook URL is accessible
2. Verify SSL certificate
3. Review webhook logs
4. Test with webhook testing tool
5. Check retry queue

## Debug Mode

Enable debug mode:
```bash
VITE_DEBUG=true npm run dev
```

## Logs Location

- Application: `./logs/app.log`
- Error: `./logs/error.log`
- Access: `./logs/access.log`

## Getting Help

1. Check documentation
2. Search GitHub issues
3. Ask in Discord
4. Contact support: support@salespro.com
