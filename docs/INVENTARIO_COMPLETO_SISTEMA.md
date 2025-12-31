# 📋 Inventário Completo do Sistema SalesPro CRM

> Documentação exaustiva de todas as funcionalidades e ferramentas utilizadas

---

## 🛠️ STACK TECNOLÓGICA PRINCIPAL

### Frontend Core
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | ^18.3.1 | Framework UI principal |
| **TypeScript** | ^5.8.3 | Tipagem estática |
| **Vite** | ^5.4.19 | Build tool e dev server |
| **TailwindCSS** | ^3.4.17 | Estilização utility-first |
| **React Router DOM** | ^6.30.1 | Roteamento SPA |

### UI Components
| Biblioteca | Uso |
|------------|-----|
| **shadcn/ui** | Componentes base (50+ componentes) |
| **Radix UI** | Primitivos acessíveis (15+ pacotes) |
| **Lucide React** | ^0.462.0 - Ícones |
| **Framer Motion** | ^12.23.26 - Animações |
| **Vaul** | ^0.9.9 - Drawer mobile |

### State & Data
| Biblioteca | Uso |
|------------|-----|
| **TanStack Query** | ^5.83.0 - Cache e fetch |
| **Supabase JS** | ^2.87.1 - Backend client |
| **Zod** | ^3.25.76 - Validação |
| **React Hook Form** | ^7.61.1 - Formulários |

### Utilitários
| Biblioteca | Uso |
|------------|-----|
| **date-fns** | ^3.6.0 - Manipulação de datas |
| **clsx** | ^2.1.1 - Classnames condicionais |
| **tailwind-merge** | ^2.6.0 - Merge de classes |
| **class-variance-authority** | ^0.7.1 - Variants |
| **canvas-confetti** | ^1.9.4 - Celebrações |

### Drag & Drop
| Biblioteca | Uso |
|------------|-----|
| **@dnd-kit/core** | ^6.3.1 - Core DnD |
| **@dnd-kit/sortable** | ^10.0.0 - Ordenação |
| **@dnd-kit/utilities** | ^3.2.2 - Helpers |

### Gráficos
| Biblioteca | Uso |
|------------|-----|
| **Recharts** | ^2.15.4 - Charts |
| **Embla Carousel** | ^8.6.0 - Carrossel |

### Testing
| Biblioteca | Uso |
|------------|-----|
| **Vitest** | ^4.0.15 - Unit tests |
| **Playwright** | ^1.57.0 - E2E tests |
| **Testing Library** | ^16.3.0 - React testing |

---

## 📱 PÁGINAS E FUNCIONALIDADES

### 1. **Dashboard Principal** (`Index.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| KPIs em tempo real | `useDashboardKPIs` |
| Gráficos de vendas | `Recharts` |
| Filtros por período | `date-fns` |
| Atualização realtime | `useRealtime` |

### 2. **Pipeline Kanban** (`Pipeline.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Drag & Drop de deals | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Colunas por estágio | `usePipeline` |
| Deals em risco | `useAtRiskDeals` |
| Lead scoring | `useLeadScoring` |
| Atalhos de teclado | `useKanbanShortcuts` |
| Playbooks por estágio | `usePlaybooks` |

### 3. **Analytics** (`Analytics.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Win/Loss analysis | `useWinLossAnalysis` |
| Análise de conversão | `useConversionAnalysis` |
| Velocidade de deals | `useDealVelocity` |
| Tempo de fechamento | `useClosingTime` |
| Análise ABC | `useABCAnalysis` |
| Tendências | `Recharts` |

### 4. **Gamificação** (`RankingCompetitivo.tsx`, `DesafiosSemanais.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Rankings competitivos | `useCompetitiveRanking` |
| Sistema de XP | `useSalespersonXP` |
| Desafios diários | `useDailyChallenges` |
| Desafios semanais | `useWeeklyChallenges` |
| Achievements | `useAchievements` |
| Streaks | `useDailyStreakAchievements` |
| Celebrações | `useCelebration`, `canvas-confetti` |
| Level up | `useLevelUpCelebration` |

### 5. **Clientes** (`Clientes.tsx`, `Portfolio.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| CRUD de clientes | `useClients` |
| Portfólio de clientes | `useClientPortfolio` |
| Análise ICP | `useICPData` |
| Previsão de churn | `useChurnPrediction` |
| Configurações portfólio | `usePortfolioSettings` |

### 6. **Cadências** (`Cadencias.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Fluxos de prospecção | `useCadences` |
| Steps de cadência | `useCadenceQueries` |
| Tarefas automáticas | `cadence_tasks` table |
| Templates de ação | `cadence_steps` table |

### 7. **Metas** (`Metas.tsx`, `MetasAtividades.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Metas de vendas | `useGoals` |
| Dashboard de metas | `useGoalsDashboard` |
| Metas de atividades | `useActivityGoals` |
| Progresso visual | `Progress` component |

### 8. **BI Vendedor** (`BIVendedor.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Métricas pessoais | `useBIVendedor` |
| Performance individual | `usePerformanceComparison` |
| Coaching IA | `useSalespersonCoaching` |
| Próximas ações | `useNextBestAction` |

### 9. **BI Gestor** (`BIGestor.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Visão geral do time | `useBIGestor` |
| Comparativo de vendedores | `usePerformanceComparison` |
| Análise de equipe | `useTeamAchievementStats` |
| Forecast de vendas | `useSalesForecast` |

### 10. **SDR Dashboard** (`SDRDashboard.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Métricas SDR | `useSDRMetrics` |
| Alertas consecutivos | `useSDRAlertNotifications` |
| Sons de alerta | `useSDRAlertSoundSettings` |
| Lead SLA | `useLeadSLA` |

### 11. **Closer Dashboard** (`CloserDashboard.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Métricas closer | `useCloserMetrics` |
| Probabilidade de deals | `useDealProbability` |
| Timeline de deals | `useDealTimeline` |
| Chat history | `useDealChatHistory` |

### 12. **Assistente IA** (`Assistente.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Chat com IA | `useSalesAssistant` |
| Histórico de conversas | `chat_conversations` table |
| Voice to text | `useElevenLabsVoice` |
| Coaching personalizado | `useSalespersonCoaching` |

### 13. **Produtos & Fornecedores** (`Produtos.tsx`, `Fornecedores.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| CRUD produtos | `useProducts` |
| CRUD fornecedores | `useSuppliers` |
| Histórico de preços | `usePriceHistory` |
| Comparador de preços | `ComparadorPrecos.tsx` |
| Previsão de demanda | `useDemandForecast` |

### 14. **Times & Vendedores** (`Times.tsx`, `Vendedores.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Gestão de times | `useTeams` |
| Gestão de vendedores | `useSalespeople` |
| Roles e permissões | `useUserRoles` |
| Atribuição de leads | `useLeadRouting` |

### 15. **Relatórios** (`Relatorios.tsx`, `RelatorioAtividades.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Builder de relatórios | `useReportData` |
| Relatório de atividades | `useSalespersonActivityReport` |
| Exportação CSV | `csvExport.ts` |
| Download PDF/Excel | `reportDownload.ts` |

### 16. **Assinatura Digital** (`AssinaturaDigital.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Gestão de documentos | `useDigitalSignatures` |
| Status de assinatura | `digital_signatures` table |
| Signatários | `document_signers` table |

### 17. **Notificações** (`Notificacoes.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Centro de notificações | `useNotifications` |
| Preferências | `useNotificationPreferences` |
| Push notifications | `usePushNotifications` |
| Sons do sistema | `useSystemSoundSettings` |

### 18. **Configurações** (`Configuracoes.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Tema claro/escuro | `useTheme`, `next-themes` |
| Preferências de som | `useSoundSettings` |
| Configurações de alertas | `useSecurityAlertSettings` |

### 19. **Autenticação** (`Auth.tsx`, `ResetPassword.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Login/Signup | `Supabase Auth` |
| Reset de senha | `Supabase Auth` |
| Proteção de rotas | `ProtectedRoute` component |
| Contexto de auth | `AuthContext` |

### 20. **Admin Dashboard** (`AdminDashboard.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Gestão de usuários | `useUsers` |
| Logs de acesso | `access_denied_logs` table |
| Alertas de segurança | `useSecurityAlertNotifications` |
| Circuit breaker | `useCircuitBreaker` |

### 21. **Playbooks** (`Playbooks.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Gestão de playbooks | `usePlaybooks` |
| Items de checklist | `playbook_items` table |
| Progresso por deal | `playbook_progress` table |

### 22. **Tarefas** (`Tarefas.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| CRUD de tarefas | `useTasks` |
| Tarefas estagnadas | `useStagnantTasks` |
| Priorização | Ordenação por data/status |

### 23. **Atividades** (`Atividades.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Registro de atividades | `useActivities` |
| Métricas de email | `useEmailMetrics` |
| Goals de atividade | `useActivityGoals` |

### 24. **Bitrix24 Integração** (`Bitrix24.tsx`)
| Funcionalidade | Ferramenta/Hook |
|----------------|-----------------|
| Sync com Bitrix | `useBitrix24` |
| OAuth flow | `bitrix24-oauth` edge function |
| Logs de sync | `bitrix24_sync_logs` table |

---

## ⚡ EDGE FUNCTIONS (Backend Serverless)

| Função | Propósito | Trigger |
|--------|-----------|---------|
| `access-denied-alerts` | Alertas de acesso negado | Automático |
| `activity-goal-alerts` | Alertas de metas de atividade | Automático |
| `auto-reassign-inactive` | Reassignar leads inativos | Cron |
| `bitrix24-oauth` | OAuth com Bitrix24 | HTTP |
| `bitrix24-sync` | Sincronização Bitrix24 | HTTP/Cron |
| `challenge-expiration-alerts` | Alertas de desafios expirando | Cron |
| `check-lead-sla` | Verificar SLA de leads | Cron |
| `create-stagnant-tasks` | Criar tarefas para deals parados | Cron |
| `deal-probability` | Calcular probabilidade de deals | HTTP |
| `demand-forecast` | Previsão de demanda IA | HTTP |
| `detect-at-risk-deals` | Detectar deals em risco | Cron |
| `elevenlabs-stt` | Speech-to-Text | HTTP |
| `elevenlabs-tts` | Text-to-Speech | HTTP |
| `lead-scoring` | Pontuação de leads | HTTP |
| `next-best-action` | Próxima melhor ação IA | HTTP |
| `push-subscribe` | Inscrição push notifications | HTTP |
| `rotate-daily-challenges` | Rotacionar desafios diários | Cron |
| `sales-assistant-chat` | Chat IA assistente | HTTP |
| `salesperson-coaching` | Coaching IA personalizado | HTTP |
| `sdr-consecutive-alerts` | Alertas SDR consecutivos | Cron |
| `send-alert-notifications` | Envio de notificações | HTTP |
| `send-push-notification` | Envio push notification | HTTP |

---

## 🎨 COMPONENTES UI (shadcn/ui + Custom)

### Componentes Base (50+)
```
accordion, alert-dialog, alert, aspect-ratio, avatar, badge, 
breadcrumb, button, calendar, card, carousel, chart, checkbox, 
collapsible, command, context-menu, dialog, drawer, dropdown-menu,
enhanced-accordion, form, horizontal-scroll, hover-card, input-otp,
input, label, menubar, navigation-menu, pagination, popover, 
progress, radio-group, resizable, scroll-area, select, separator,
sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, 
textarea, toast, toaster, toggle-group, toggle, tooltip
```

### Componentes Custom por Categoria

| Categoria | Componentes |
|-----------|-------------|
| **Dashboard** | `SalesDashboard`, `DashboardHeader`, `KPICards`, `SalesChart` |
| **Pipeline** | `PipelineBoard`, `PipelineColumn`, `DealCard`, `AtRiskDealsPanel` |
| **Gamification** | `AchievementCard`, `XPEvolutionChart`, `LevelProgress`, `StreakCounter` |
| **Analytics** | `ConversionChart`, `LeadSourceTrendChart`, `DemandForecastDashboard` |
| **Auth** | `ProtectedRoute`, `LoginForm`, `SignupForm` |
| **Layout** | `MainLayout`, `Sidebar`, `GlobalSearch`, `NotificationCenter` |
| **Errors** | `ErrorBoundary`, `PageErrorBoundary` |
| **Skeletons** | `PageLoadingSkeleton`, `SkeletonTransition` |
| **Transitions** | `PageTransition` (Framer Motion) |

---

## 🪝 HOOKS CUSTOMIZADOS (100+)

### Dados & Queries
| Hook | Função |
|------|--------|
| `useClients` | CRUD clientes |
| `useDeals` | CRUD deals |
| `useProducts` | CRUD produtos |
| `useSalespeople` | CRUD vendedores |
| `useSuppliers` | CRUD fornecedores |
| `useTasks` | CRUD tarefas |
| `useActivities` | CRUD atividades |
| `useTeams` | CRUD times |
| `useGoals` | CRUD metas |
| `useCadences` | CRUD cadências |
| `usePlaybooks` | CRUD playbooks |

### Analytics & Métricas
| Hook | Função |
|------|--------|
| `useDashboardKPIs` | KPIs dashboard |
| `useMetrics` | Métricas gerais |
| `useCloserMetrics` | Métricas closer |
| `useSDRMetrics` | Métricas SDR |
| `useBIVendedor` | BI individual |
| `useBIGestor` | BI gestão |
| `useWinLossAnalysis` | Análise win/loss |
| `useConversionAnalysis` | Análise conversão |
| `useDealVelocity` | Velocidade deals |
| `useABCAnalysis` | Análise ABC |
| `useFunnelData` | Dados do funil |
| `useLeadSourceAnalysis` | Análise fonte leads |

### Gamificação
| Hook | Função |
|------|--------|
| `useGamificationData` | Dados gamificação |
| `useAchievements` | Conquistas |
| `useDailyChallenges` | Desafios diários |
| `useWeeklyChallenges` | Desafios semanais |
| `useCompetitiveRanking` | Rankings |
| `useSalespersonXP` | Sistema XP |
| `useDailyStreakAchievements` | Streaks |
| `useCelebration` | Celebrações |
| `useLevelUpCelebration` | Level up |

### IA & Automação
| Hook | Função |
|------|--------|
| `useSalesAssistant` | Chat IA |
| `useSalespersonCoaching` | Coaching IA |
| `useNextBestAction` | Próxima ação |
| `useLeadScoring` | Score de leads |
| `useDealProbability` | Probabilidade |
| `useChurnPrediction` | Previsão churn |
| `useDemandForecast` | Previsão demanda |

### Realtime & Performance
| Hook | Função |
|------|--------|
| `useRealtime` | Supabase Realtime |
| `useSalesRealtime` | Vendas realtime |
| `useOptimisticUpdate` | Updates otimistas |
| `useRetryMutation` | Retry automático |
| `useInvalidateCache` | Invalidação cache |
| `usePrefetch` | Prefetch dados |
| `useQueryPerformance` | Métricas perf |
| `useCircuitBreaker` | Circuit breaker |

### UI & UX
| Hook | Função |
|------|--------|
| `useDebounce` | Debounce valores |
| `useTheme` | Tema claro/escuro |
| `useMediaQuery` | Media queries |
| `useIsMobile` | Detecção mobile |
| `useLocalStorage` | Persistência local |
| `useIntersectionObserver` | Lazy loading |
| `usePagination` | Paginação |
| `useSort` | Ordenação |
| `useFilter` | Filtros |
| `useSelection` | Seleção múltipla |
| `useUndoRedo` | Undo/Redo |
| `useHapticFeedback` | Feedback tátil |
| `useKanbanShortcuts` | Atalhos teclado |

### Notificações & Alertas
| Hook | Função |
|------|--------|
| `useNotifications` | Notificações |
| `useNotificationPreferences` | Preferências |
| `usePushNotifications` | Push notifications |
| `useAlerts` | Alertas |
| `useSDRAlertNotifications` | Alertas SDR |
| `useSecurityAlertNotifications` | Alertas segurança |
| `useSoundSettings` | Configuração sons |

### Auth & Segurança
| Hook | Função |
|------|--------|
| `useUserRoles` | Roles usuário |
| `useUsers` | Gestão usuários |

---

## 🗄️ TABELAS DO BANCO DE DADOS

### Core Business
| Tabela | Propósito |
|--------|-----------|
| `clients` | Clientes |
| `sales` | Vendas/Deals |
| `products` | Produtos |
| `salespeople` | Vendedores |
| `activities` | Atividades |
| `tasks` | Tarefas |

### Gamificação
| Tabela | Propósito |
|--------|-----------|
| `achievements` | Conquistas |
| `daily_challenges` | Desafios diários |
| `daily_challenge_progress` | Progresso diário |
| `weekly_challenges` | Desafios semanais |
| `challenge_progress` | Progresso semanal |
| `salesperson_xp` | Sistema XP |
| `daily_streak_achievements` | Streaks |

### Cadências & Playbooks
| Tabela | Propósito |
|--------|-----------|
| `cadences` | Cadências |
| `cadence_steps` | Steps cadência |
| `cadence_tasks` | Tarefas cadência |
| `prospect_cadences` | Prospects em cadência |
| `playbooks` | Playbooks |
| `playbook_items` | Items playbook |
| `playbook_progress` | Progresso playbook |

### Analytics & Métricas
| Tabela | Propósito |
|--------|-----------|
| `daily_metrics` | Métricas diárias |
| `category_metrics` | Métricas categoria |
| `deal_stage_history` | Histórico estágios |
| `deal_outcomes` | Resultados deals |
| `lead_scores` | Scores de leads |

### Integrações
| Tabela | Propósito |
|--------|-----------|
| `bitrix24_sync_logs` | Logs Bitrix24 |
| `icp_data` | Dados ICP |

### Fornecedores & Estoque
| Tabela | Propósito |
|--------|-----------|
| `suppliers` | Fornecedores |
| `supplier_products` | Produtos fornecedor |
| `supplier_orders` | Pedidos |
| `inventory_levels` | Níveis estoque |
| `stock_movements` | Movimentações |
| `price_history` | Histórico preços |
| `price_alerts` | Alertas preço |
| `demand_forecasts` | Previsões demanda |

### Notificações & Alertas
| Tabela | Propósito |
|--------|-----------|
| `notification_preferences` | Preferências |
| `push_subscriptions` | Inscrições push |
| `email_logs` | Logs email |
| `sdr_alert_history` | Histórico SDR |
| `security_alert_history` | Histórico segurança |
| `security_alert_settings` | Config segurança |

### Chat & IA
| Tabela | Propósito |
|--------|-----------|
| `chat_conversations` | Conversas |
| `chat_messages` | Mensagens |
| `deal_chat_history` | Histórico chat deal |
| `objections_library` | Biblioteca objeções |

### Segurança & Logs
| Tabela | Propósito |
|--------|-----------|
| `access_denied_logs` | Logs acesso negado |
| `circuit_breaker_events` | Eventos circuit breaker |
| `user_roles` | Roles usuários |

### Outros
| Tabela | Propósito |
|--------|-----------|
| `sales_goals` | Metas vendas |
| `activity_goals` | Metas atividades |
| `client_portfolio` | Portfólio clientes |
| `portfolio_settings` | Config portfólio |
| `digital_signatures` | Assinaturas digitais |
| `document_signers` | Signatários |
| `lead_routing_log` | Log roteamento |

---

## 🔐 FUNCIONALIDADES DE SEGURANÇA

| Funcionalidade | Implementação |
|----------------|---------------|
| Row Level Security (RLS) | Todas as tabelas |
| Role-Based Access Control | `user_roles` + `has_role()` |
| JWT Authentication | Supabase Auth |
| Protected Routes | `ProtectedRoute` component |
| Access Denied Logging | `access_denied_logs` table |
| Rate Limiting | `RateLimiter` class |
| Circuit Breaker | `useCircuitBreaker` hook |
| Security Alerts | `security_alert_*` tables |

---

## 🎯 FUNCIONALIDADES ESPECIAIS

| Funcionalidade | Ferramentas |
|----------------|-------------|
| **Voice AI (TTS/STT)** | ElevenLabs API via Edge Functions |
| **Chat IA** | Lovable AI / GPT via Edge Functions |
| **Push Notifications** | Web Push API + Service Worker |
| **Realtime Updates** | Supabase Realtime |
| **Drag & Drop Kanban** | @dnd-kit |
| **Confetti Celebrations** | canvas-confetti |
| **Theme Switching** | next-themes |
| **SEO** | react-helmet-async |
| **Keyboard Shortcuts** | Custom hook |
| **Haptic Feedback** | Vibration API |
| **PWA Ready** | Service Worker |
| **Offline Support** | TanStack Query cache |
| **Lazy Loading** | React.lazy + Suspense |
| **Error Boundaries** | Custom components |

---

## 📁 ESTRUTURA DE PASTAS

```
src/
├── components/          # 60+ pastas de componentes
│   ├── ui/             # 50+ componentes shadcn
│   ├── dashboard/      # Dashboard widgets
│   ├── pipeline/       # Kanban pipeline
│   ├── gamification/   # Sistema de gamificação
│   ├── analytics/      # Gráficos e análises
│   ├── auth/           # Autenticação
│   ├── layout/         # Layout principal
│   ├── errors/         # Error boundaries
│   └── ...
├── hooks/              # 100+ hooks customizados
├── pages/              # 41 páginas
├── contexts/           # Auth context
├── types/              # TypeScript types
├── utils/              # Utilitários
├── lib/                # Helpers
└── integrations/       # Supabase client

supabase/
├── functions/          # 22 Edge Functions
├── migrations/         # Database migrations
└── config.toml         # Configuração
```

---

## 📊 ESTATÍSTICAS DO PROJETO

| Métrica | Quantidade |
|---------|------------|
| Páginas | 41 |
| Componentes UI | 50+ |
| Componentes Custom | 200+ |
| Hooks | 100+ |
| Edge Functions | 22 |
| Tabelas DB | 50+ |
| Dependências | 74 |

---

## 🚀 PADRÕES PARA NOVOS PROJETOS

### Checklist de Implementação

1. **Stack Base**
   - [ ] React + TypeScript + Vite
   - [ ] TailwindCSS + shadcn/ui
   - [ ] TanStack Query
   - [ ] React Router DOM

2. **Backend**
   - [ ] Supabase (Lovable Cloud)
   - [ ] RLS Policies
   - [ ] Edge Functions

3. **UI/UX**
   - [ ] Tema claro/escuro
   - [ ] Componentes acessíveis
   - [ ] Animações (Framer Motion)
   - [ ] Loading states (Skeletons)
   - [ ] Error boundaries

4. **Features Avançadas**
   - [ ] Realtime updates
   - [ ] Push notifications
   - [ ] Gamificação
   - [ ] IA integrada

---

*Documentação gerada automaticamente em 31/12/2024*
