# 🏆 Promo Champions v2 — Sales Performance Platform

Plataforma gamificada de CRM, BI e inteligência de vendas para equipes comerciais.

## 🚀 Quick Start

### Pré-requisitos
- **Node.js** 18+ ou **Bun** 1.0+
- **Supabase** (local ou cloud)

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/adm01-debug/promo-champions-v2.git
cd promo-champions-v2

# 2. Instale as dependências (escolha um)
npm install
# ou
bun install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# 4. Inicie o Supabase local (opcional)
supabase start

# 5. Rode as migrações
supabase db push

# 6. Inicie o dev server
npm run dev
# ou
bun run dev
```

Acesse: **http://localhost:5173**

## 🧪 Testes

```bash
# Unit tests (Vitest)
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📦 Stack

| Categoria | Tecnologia |
|-----------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| State | TanStack Query + React Context |
| Backend | Supabase (PostgreSQL + Auth) |
| Testing | Vitest + Playwright |
| CI/Lint | ESLint + Prettier + Husky + Lighthouse CI |

## 📁 Estrutura

```
src/
├── components/    # UI + gamification components
├── contexts/      # React contexts (Auth, Audio)
├── hooks/         # Custom hooks
├── lib/           # Utilities, BI helpers, gamification
├── pages/         # Route pages (lazy loaded)
├── routes/        # AppRoutes + lazyPages
├── services/      # Supabase service layer
├── types/         # TypeScript types
└── utils/         # Helper functions

supabase/
└── migrations/    # Database migrations

tests/
├── e2e/           # Playwright tests
└── load/          # Load tests
```

## 🔒 Segurança

- Todas as tabelas possuem **Row Level Security (RLS)**
- **Nunca** commite o arquivo `.env`
- Rotacione as chaves do Supabase periodicamente

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) e [docs/style-guide.md](./docs/style-guide.md).

Commits seguem [Conventional Commits](https://www.conventionalcommits.org/) com scopes: `auth`, `bi`, `crm`, `gamification`, `ui`, `hooks`, `services`, `db`, `config`, `deps`.

## 📄 Licença

MIT © Promo Brindes
