# Inventário Completo do Projeto - CRM de Vendas

**Data de Análise:** 2024-12-30  
**Parceria:** Claude (Anthropic) + Lovable

---

## 📁 Estrutura Raiz

```
├── .github/              # Configurações GitHub
├── .lovable/             # Configurações Lovable
├── docs/                 # Documentação
├── e2e/                  # Testes end-to-end (Playwright)
├── improvements/         # Melhorias planejadas (Claude)
├── improvements-180/     # Batch de melhorias 180+ (Claude)
├── public/               # Assets estáticos
├── scripts/              # Scripts utilitários
├── src/                  # Código fonte principal
├── supabase/             # Backend Supabase
└── Arquivos config       # tsconfig, vite, tailwind, etc.
```

---

## 📂 SRC - Código Fonte Principal

### /src/components (49+ subpastas)

| Pasta | Arquivos | Descrição |
|-------|----------|-----------|
| achievements/ | 5 | Conquistas e histórico |
| activities/ | 6 | Log de atividades |
| analytics/ | 24 | Análises e gráficos |
| assistant/ | 5 | Assistente IA |
| auth/ | 1 | Autenticação |
| cadences/ | 4 | Cadências de vendas |
| clients/ | 2 | CRUD clientes |
| closer/ | 6 | Dashboard closers |
| dashboard/ | 14 | KPIs e métricas |
| debug/ | 3 | Circuit breaker |
| errors/ | 2 | Error boundaries |
| gamification/ | 29 | Sistema XP/níveis |
| goals/ | 4 | Metas de vendas |
| layout/ | 5 | Sidebar, navegação |
| notifications/ | 2 | Central notificações |
| pipeline/ | 6 | Kanban pipeline |
| playbooks/ | 2 | Playbooks vendas |
| portfolio/ | 6 | Carteira clientes |
| products/ | 2 | CRUD produtos |
| sales/ | 1 | Diálogo vendas |
| sdr/ | 11 | Dashboard SDR |
| settings/ | 9 | Configurações |
| shared/ | 9 | Componentes reutilizáveis |
| skeletons/ | 5 | Loading states |
| tasks/ | 7 | Gestão tarefas |
| teams/ | 3 | Gestão times |
| transitions/ | 2 | Animações |
| ui/ | 49 | Shadcn/UI components |
| vendedores/ | 4 | Formulários vendedores |

### /src/hooks (90+ hooks)

**Hooks principais funcionando:**
- useABCAnalysis, useAchievements, useActivities
- useCadences, useClients, useDailyChallenges
- useDeals, useFunnelData, useGamificationData
- useGoals, useLeadScoring, useMetrics
- useNotifications, usePipeline, useProducts
- useSalespeople, useTasks, useTeams, etc.

### /src/pages (41 páginas)

Páginas principais: Index, Pipeline, Analytics, Vendas, Clientes, Metas, Times, Gamification, Configurações, Auth, etc.

### /src/contexts
- AuthContext.tsx

### /src/types
- index.ts (tipos compartilhados)

### /src/utils
- csvExport.ts, gamificationExport.ts, performanceExport.ts, reportDownload.ts, supabase-helpers.ts

---

## 📂 SUPABASE - Backend

### /supabase/functions (22 Edge Functions)

| Função | Descrição |
|--------|-----------|
| access-denied-alerts | Alertas de acesso negado |
| activity-goal-alerts | Alertas de metas |
| auto-reassign-inactive | Reatribuição automática |
| bitrix24-oauth | OAuth Bitrix24 |
| bitrix24-sync | Sincronização Bitrix24 |
| challenge-expiration-alerts | Alertas de expiração |
| check-lead-sla | Verificação SLA |
| create-stagnant-tasks | Tarefas estagnadas |
| deal-probability | Probabilidade de negócio |
| demand-forecast | Previsão de demanda |
| detect-at-risk-deals | Negócios em risco |
| elevenlabs-stt | Speech-to-text |
| elevenlabs-tts | Text-to-speech |
| lead-scoring | Scoring de leads |
| next-best-action | Próxima melhor ação |
| push-subscribe | Push notifications |
| rotate-daily-challenges | Rotação desafios |
| sales-assistant-chat | Chat assistente |
| salesperson-coaching | Coaching vendedor |
| sdr-consecutive-alerts | Alertas SDR |
| send-alert-notifications | Envio alertas |
| send-push-notification | Push notification |

---

## 📂 IMPROVEMENTS (Claude)

### /improvements/ (planejadas)
- components/analytics/, performance/, shared/
- database/ - SQL migrations
- devops/ - DevOps configs
- docs/ - Documentação
- e2e/ - Testes E2E
- features/ - Novas features
- hooks/ - Hooks refatorados
- performance/ - Otimizações
- security/ - Segurança
- supabase/migrations/
- tests/ - Testes unitários
- typescript/ - Tipagem
- ui-ux/ - Melhorias UI

### /improvements-180/ (batch 180+)
- components/ - 60+ componentes
- hooks/ - 18 hooks refatorados
- tests/ - 39 arquivos de teste
- types/, utils/

### /src/improvements/ (integrados)
- components/ - 5 arquivos
- hooks/ - 11 arquivos
- lib/ - 4 arquivos
- tests/ - 3 arquivos

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### Erros de Build Corrigidos
1. **18 hooks com sintaxe errada** - Faltava vírgula entre `staleTime` e `gcTime` ✅ CORRIGIDO

2. **Arquivos .ts com JSX** - Renomeados para .tsx:
   - ui-ux-optimizations.ts → .tsx ✅
   - useSoftDelete.ts → .tsx ✅
   - advanced-features-bundle.ts → .tsx ✅
   - batch-tests-2.test.ts → .tsx ✅
   - batch-tests-3.test.ts → .tsx ✅
   - useLeadRouting.test.ts → .tsx ✅

### Erros de Tipagem Pendentes
Incompatibilidade entre interfaces nos tipos e implementações dos hooks:
- Achievement type vs uso
- Activity types/exports
- Cadence exports
- Client exports
- Products exports
- Notifications exports

---

## 📊 ESTATÍSTICAS

| Categoria | Quantidade |
|-----------|------------|
| Páginas | 41 |
| Componentes | 200+ |
| Hooks | 90+ |
| Edge Functions | 22 |
| Testes | 50+ |
| UI Components (Shadcn) | 49 |

---

## 🔧 TECNOLOGIAS

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Shadcn/UI
- **State:** TanStack Query, Zustand
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Animações:** Framer Motion
- **Testes:** Vitest, Playwright
- **Drag & Drop:** dnd-kit

---

*Documento gerado automaticamente pela análise do repositório.*
