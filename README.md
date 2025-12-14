# Sales CRM - Sistema de Gestão de Vendas

![E2E Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/e2e-tests.yml/badge.svg)
![PR Checks](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-checks.yml/badge.svg)

Sistema completo de CRM para equipes de vendas com SDRs e Closers, incluindo pipeline visual, gamificação, analytics avançados e IA para coaching.

## Features

- 📊 **Dashboard** - KPIs em tempo real, métricas de vendas, forecasts
- 🎯 **Pipeline Kanban** - Drag-and-drop para gestão de deals
- 🏆 **Gamificação** - Rankings competitivos, streaks, achievements
- 📈 **Analytics** - Win/Loss analysis, velocidade de deals, conversão
- 🤖 **IA Coaching** - Análise de performance e recomendações
- 📋 **Playbooks** - Checklists por estágio do funil
- 🔔 **Alertas** - Notificações de deals em risco e metas
- 👥 **Roles** - Admin, Manager, Salesperson com RLS

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Testing**: Vitest (unit), Playwright (E2E)
- **CI/CD**: GitHub Actions

## Quick Start

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Instale dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## Testing

```bash
# Testes unitários
npm test

# Testes E2E
npx playwright install chromium
npx playwright test

# Com interface visual
npx playwright test --ui
```

## Segurança

O sistema implementa Row Level Security (RLS) com três níveis de acesso:

| Permissão | Salesperson | Manager | Admin |
|-----------|-------------|---------|-------|
| Ver dashboard | ✅ | ✅ | ✅ |
| Ver rankings | ✅ | ✅ | ✅ |
| Criar clientes | ❌ | ✅ | ✅ |
| Criar produtos | ❌ | ✅ | ✅ |
| Gerenciar roles | ❌ | ❌ | ✅ |
| Ver logs de segurança | ❌ | ✅ | ✅ |

## Estrutura do Projeto

```
src/
├── components/     # Componentes React
│   ├── ui/         # shadcn/ui components
│   ├── dashboard/  # Dashboard widgets
│   ├── pipeline/   # Kanban pipeline
│   └── ...
├── hooks/          # React Query hooks
├── pages/          # Páginas da aplicação
├── contexts/       # React contexts (Auth)
└── integrations/   # Supabase client

e2e/                # Testes E2E Playwright
supabase/
├── functions/      # Edge Functions
└── migrations/     # Database migrations
```

## Documentação

- [Design System](docs/DESIGN_SYSTEM.md)
- [Hover Utilities](docs/HOVER_UTILITIES.md)
- [E2E Tests](e2e/README.md)
- [GitHub Actions](.github/workflows/README.md)

## Deployment

1. Clique em **Share → Publish** no Lovable
2. Ou conecte ao GitHub e use o CI/CD configurado

## License

MIT
