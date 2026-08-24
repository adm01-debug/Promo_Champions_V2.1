# E2E Test Suite — Promo Champions

## Estrutura

```
tests/
├── e2e/
│   ├── helpers/
│   │   ├── auth.ts              # Session management & HAS_AUTH guard
│   │   ├── page-helpers.ts      # Shared restoreSession(), loadPage(), skipReason()
│   │   ├── quote-to-sale-*.ts  # Quote-to-sale specific helpers/fixtures
│   ├── pages-*.spec.ts         # Page-level smoke tests (um arquivo por domínio)
│   ├── pipeline-flows.spec.ts  # Pipeline kanban flows
│   ├── quote-to-sale*.spec.ts  # Quote-to-sale E2E (comprehensive)
│   ├── smoke.spec.ts           # Basic smoke tests
│   └── global-setup.ts         # Supabase auth → session.json
├── a11y/
│   ├── axe-sweep.spec.ts       # Accessibility sweep
│   └── routes.ts               # Routes list for a11y
└── load/
    └── load-test.ts            # Load testing
```

## Como executar

### Pré-requisitos

1. Variáveis de ambiente (copie `.env.example` para `.env.local`):
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   VITE_SUPABASE_PROJECT_ID=your-project-ref
   E2E_TEST_EMAIL=ti@promobrindes.com.br
   E2E_TEST_PASSWORD=sua-senha
   ```

2. Sessão de autenticação gerada pelo `global-setup`:
   ```bash
   npm run test:e2e -- --reporter=list
   ```
   O global-setup vai logar com `E2E_TEST_EMAIL` e persistir a sessão em `tests/e2e/.auth/session.json`.

### Executar todos os testes de página

```bash
npm run test:e2e -- --project=page-smoke
```

### Executar por domínio

```bash
npm run test:e2e -- tests/e2e/pages-crm-core.spec.ts
npm run test:e2e -- tests/e2e/pages-bi-analytics.spec.ts
npm run test:e2e -- tests/e2e/pages-sales-commerce.spec.ts
npm run test:e2e -- tests/e2e/pages-gamification.spec.ts
npm run test:e2e -- tests/e2e/pages-automation-ai.spec.ts
npm run test:e2e -- tests/e2e/pages-customer-success.spec.ts
npm run test:e2e -- tests/e2e/pages-navigation.spec.ts
npm run test:e2e -- tests/e2e/pages-reports-hubs.spec.ts
npm run test:e2e -- tests/e2e/pages-admin-config.spec.ts
```

### UI mode (visual, interativo)

```bash
npm run test:e2e:ui -- --project=page-smoke
```

### Quote-to-Sale (projeto separado)

```bash
npm run test:e2e -- --project=quote-to-sale
```

## Cobertura

| Spec | Páginas testadas |
|------|-----------------|
| `pages-crm-core.spec.ts` | Vendas, Clientes, Pipeline, KanbanClientes, MapaClientes, Agenda |
| `pages-bi-analytics.spec.ts` | BIVendedor, BISDR, BICloser, BIGestor, Funnel, Inteligência, HealthScore, ABC, ClosingTime, DealVelocity, EvolutionCurves, TopProdutos, EvoluçãoPreços, GamifiedProfile, Badges, Coaching, DealIntelligence, WinLoss, InteligênciaCompras |
| `pages-sales-commerce.spec.ts` | Orçamentos (CPQ), Comissões, LogisticsCommand (Estoque), Fornecedores |
| `pages-gamification.spec.ts` | Ranking, Arena, DesafiosSemanais, DesafiosDiários, VictoryFeed, TeamActivity, RaceArena, CompetitiveSeasons |
| `pages-automation-ai.spec.ts` | AutomationBuilder, AutomaçãoInteligente, Cadências, QuoteCadências, AssistenteIA, MeuAssistente, AIAgents, BulkComposer, EmailTracking, Sequences |
| `pages-customer-success.spec.ts` | CustomerSuccessHub, NPS, ArenaAtividades, Atividades, FollowUp, Competências, Calendário, Vendedores, Metas, Territórios, CS360 |
| `pages-navigation.spec.ts` | Redirects anônimos, Auth, 404, AccessDenied, Dashboard auth |
| `pages-reports-hubs.spec.ts` | Dashboard, Relatórios, Hubs, Revenue, Forecast, ROI, ICP, LeadScoring, ABM, SmartSearch, Tarefas, Pedidos, MinhasPremiações |
| `pages-admin-config.spec.ts` | Configurações, AdminDashboard, AdminPages, Webhooks, Comissões, Premiações, Churn, etc. |

## Padrão dos testes de página

Cada spec segue o mesmo padrão:

1. `test.skip(!HAS_AUTH, skipReason())` — pula se não houver sessão
2. `restoreSession(page)` — injeta sessão Supabase no localStorage
3. `loadPage(page, '/rota')` — navega com `waitUntil: 'networkidle'`
4. Asserções: heading visível, title correto, elementos-chave presentes

## Debugging

```bash
# Ver vídeo do teste que falhou
# Vídeos ficam em test-results/ e são retidos só em failure

# Executar um teste só
npx playwright test --project=page-smoke tests/e2e/pages-crm-core.spec.ts
```
