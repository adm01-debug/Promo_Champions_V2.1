# Deployment Guide

## Production Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Manual Build
\`\`\`bash
npm run build
npm run preview
\`\`\`

### Environment Variables
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_BITRIX24_WEBHOOK

## Database Migrations
\`\`\`bash
npx supabase db push
\`\`\`