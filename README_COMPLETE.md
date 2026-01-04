# 🚀 SalesPro - Intelligent Sales Management

![CI/CD](https://github.com/adm01-debug/salespro/workflows/tests/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-85%25-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Complete sales CRM with AI-powered features, real-time collaboration, and advanced analytics.

## ✨ Features

### 🎯 Core CRM
- **Client Management** - Complete contact and company profiles
- **Deal Pipeline** - Visual Kanban board with drag-and-drop
- **Activity Tracking** - Calls, emails, meetings, notes
- **Product Catalog** - SKU management with pricing rules

### 📊 Analytics & Reporting
- **Real-time Dashboards** - KPIs and metrics
- **Sales Forecasting** - AI-powered predictions
- **Team Performance** - Individual and team analytics
- **Custom Reports** - PDF export with charts

### 🤖 AI Features
- **Lead Scoring** - Automatic qualification
- **Next Best Action** - AI recommendations
- **Churn Prediction** - Early warning system
- **Voice Assistant** - ElevenLabs integration

### 🎮 Gamification
- **Levels & XP** - Progression system
- **Leaderboards** - Team competition
- **Achievements** - Unlock badges
- **Daily Challenges** - Engagement boost

### 🔒 Security & Compliance
- **2FA** - Two-factor authentication
- **RBAC** - Role-based access control
- **Audit Trail** - Complete activity log
- **RLS** - Row-level security

### 🌐 Enterprise Features
- **Offline Mode** - Work without internet
- **i18n** - Multi-language support (pt-BR, en-US, es-ES)
- **Webhooks** - External integrations
- **Real-time Collaboration** - Presence & cursors
- **Feature Flags** - Gradual rollout
- **A/B Testing** - Data-driven decisions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State**: Tanstack Query + Zustand
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Testing**: Playwright + Vitest
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + Google Analytics

## 🚀 Quick Start

\`\`\`bash
# Clone repository
git clone https://github.com/adm01-debug/salespro
cd salespro

# Run installation script
chmod +x scripts/install.sh
./scripts/install.sh

# Start development server
npm run dev
\`\`\`

Visit http://localhost:5173

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE-updated.md)
- [API Documentation](docs/API-DOCUMENTATION-updated.md)
- [Contributing Guide](CONTRIBUTING-updated.md)
- [Monitoring Setup](docs/MONITORING.md)
- [Storybook Guide](docs/STORYBOOK.md)

## 🧪 Testing

\`\`\`bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
\`\`\`

## 📦 Deployment

### Staging
\`\`\`bash
./scripts/deploy-staging.sh
\`\`\`

### Production
\`\`\`bash
./scripts/deploy-production.sh
\`\`\`

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING-updated.md)

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Acknowledgments

Built with ❤️ by the SalesPro team
