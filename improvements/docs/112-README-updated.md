# Sales CRM - Sistema de Gestão de Vendas

![Tests](https://github.com/adm01-debug/salespro/actions/workflows/tests.yml/badge.svg)
![Lint](https://github.com/adm01-debug/salespro/actions/workflows/lint.yml/badge.svg)
![Coverage](https://img.shields.io/codecov/c/github/adm01-debug/salespro)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Sistema completo de CRM para equipes de vendas com SDRs e Closers, incluindo pipeline visual, gamificação, analytics avançados e IA para coaching.

## ✨ Features

- 📊 **Dashboard** - KPIs em tempo real, métricas de vendas, forecasts
- 🎯 **Pipeline Kanban** - Drag-and-drop para gestão de deals
- 🏆 **Gamificação** - Rankings competitivos, streaks, achievements
- 📈 **Analytics** - Win/Loss analysis, velocidade de deals, conversão
- 🤖 **IA Coaching** - Análise de performance e recomendações
- 📋 **Playbooks** - Checklists por estágio do funil
- 🔔 **Alertas** - Notificações de deals em risco e metas
- 👥 **Roles** - Admin, Manager, Salesperson com RLS
- 🔐 **2FA** - Autenticação de dois fatores
- 📝 **Audit Trail** - Log completo de todas as ações
- 🌐 **Offline Support** - Funciona sem internet
- 🎨 **Dark Mode** - Interface adaptável

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/adm01-debug/salespro.git
cd salespro

# Install
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run migrations
supabase migration up

# Start dev server
npm run dev
```

## 🛠️ Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Query
- Framer Motion

**Backend:**
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Edge Functions
- Real-time subscriptions

**Testing:**
- Vitest (unit tests - 80% coverage)
- Playwright (E2E tests)
- React Testing Library

**DevOps:**
- GitHub Actions (CI/CD)
- Vercel (hosting)
- Sentry (error tracking)

## 📦 Project Structure

```
salespro/
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom hooks (88 hooks)
│   ├── pages/           # Page components
│   ├── lib/             # Utilities
│   └── integrations/    # External APIs
├── supabase/
│   ├── migrations/      # Database migrations
│   └── functions/       # Edge functions
├── e2e/                 # E2E tests
└── docs/                # Documentation
```

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🚢 Deployment

```bash
# Staging
./scripts/deploy-staging.sh

# Production
./scripts/deploy-production.sh

# Rollback
./scripts/rollback.sh
```

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Contributing](./docs/CONTRIBUTING.md)
- [API Documentation](./docs/API.md)
- [Component Storybook](https://storybook.yourdomain.com)

## 🤝 Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## 📄 License

MIT License - see [LICENSE](./LICENSE)

## 👨‍💻 Author

**Pink e Cerébro**  
GitHub: [@adm01-debug](https://github.com/adm01-debug)

---

Made with ❤️ for sales teams
