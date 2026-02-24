# 📋 Documentação Completa do Sistema — SalesPro (Sales Arena)

> **Versão:** 1.0  
> **Última atualização:** 24/02/2026  
> **Stack:** React 18 · Vite · TypeScript · Tailwind CSS · Lovable Cloud (Supabase)  
> **Banco:** Lovable Cloud (PostgreSQL — CRM, pipeline, gamificação, segurança)

---

## 📑 Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Autenticação & Segurança](#3-autenticação--segurança)
4. [Dashboard Principal](#4-dashboard-principal)
5. [Pipeline de Vendas (Kanban)](#5-pipeline-de-vendas-kanban)
6. [Vendas (Deals)](#6-vendas-deals)
7. [Clientes / CRM](#7-clientes--crm)
8. [Produtos](#8-produtos)
9. [Atividades & Cadências](#9-atividades--cadências)
10. [Tarefas](#10-tarefas)
11. [Metas & Objetivos](#11-metas--objetivos)
12. [Gamificação](#12-gamificação)
13. [Dashboards Especializados (BI)](#13-dashboards-especializados-bi)
14. [SDR Dashboard](#14-sdr-dashboard)
15. [Closer Dashboard](#15-closer-dashboard)
16. [Analytics & Relatórios](#16-analytics--relatórios)
17. [Orçamentos](#17-orçamentos)
18. [Playbooks](#18-playbooks)
19. [Portfólio de Clientes](#19-portfólio-de-clientes)
20. [ICP (Ideal Customer Profile)](#20-icp-ideal-customer-profile)
21. [Fornecedores & Comparador de Preços](#21-fornecedores--comparador-de-preços)
22. [Previsão de Demanda](#22-previsão-de-demanda)
23. [Assinatura Digital](#23-assinatura-digital)
24. [Assistente de Vendas (IA)](#24-assistente-de-vendas-ia)
25. [Integração Bitrix24](#25-integração-bitrix24)
26. [Times & Equipes](#26-times--equipes)
27. [Ranking Competitivo](#27-ranking-competitivo)
28. [Desafios (Semanais & Diários)](#28-desafios-semanais--diários)
29. [Notificações](#29-notificações)
30. [Configurações](#30-configurações)
31. [Edge Functions (Backend)](#31-edge-functions-backend)
32. [Banco de Dados](#32-banco-de-dados)
33. [Hooks Customizados (Catálogo Completo)](#33-hooks-customizados-catálogo-completo)
34. [Componentes UI (Design System)](#34-componentes-ui-design-system)
35. [Layout & Navegação](#35-layout--navegação)
36. [Componentes Compartilhados](#36-componentes-compartilhados)
37. [Acessibilidade](#37-acessibilidade)
38. [Performance & Otimização](#38-performance--otimização)
39. [Animações & Transições](#39-animações--transições)
40. [PWA & Offline](#40-pwa--offline)
41. [Tipos TypeScript](#41-tipos-typescript)
42. [Constantes do Sistema](#42-constantes-do-sistema)
43. [Utilitários & Bibliotecas](#43-utilitários--bibliotecas)
44. [Testes Automatizados](#44-testes-automatizados)
45. [Design System (Tokens)](#45-design-system-tokens)
46. [Rotas da Aplicação](#46-rotas-da-aplicação)
47. [Secrets & Variáveis de Ambiente](#47-secrets--variáveis-de-ambiente)
48. [Resumo Quantitativo](#48-resumo-quantitativo)

---

## 1. Visão Geral

O **SalesPro (Sales Arena)** é uma plataforma completa de CRM e gestão comercial projetada para equipes de vendas. O sistema abrange todo o ciclo de vida de vendas — desde a prospecção (SDR) até o fechamento (Closer) — com pipeline Kanban, gamificação, IA assistente, analytics avançados e gestão de equipes.

### Objetivo Principal
Fornecer uma plataforma unificada para equipes de vendas gerenciarem leads, deals, clientes, atividades, metas e performance, com gamificação para engajamento e IA para produtividade.

### Perfis de Usuário

| Papel | Descrição |
|---|---|
| **Admin** | Acesso total: configurações, relatórios, gestão de equipes, segurança |
| **Manager (Gestor)** | Gestão de equipe, relatórios, metas, pipeline, playbooks |
| **Sales Rep (Vendedor)** | Dashboard individual, pipeline, atividades, metas pessoais |
| **Sales Ops** | Operações de vendas, dados, configurações |

### Evolução do Projeto
- **Fase 1:** CRM básico — vendas, clientes, produtos
- **Fase 2:** Pipeline Kanban com drag-and-drop
- **Fase 3:** Gamificação, desafios, XP e rankings
- **Fase 4:** BI especializado (Vendedor, Gestor, SDR, Closer)
- **Fase 5:** IA Assistente, cadências, automações
- **Fase Atual:** Plataforma completa com orçamentos, previsão de demanda, fornecedores

---

## 2. Arquitetura do Sistema

### Diagrama de Alto Nível

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                      │
│                                                          │
│  App.tsx → HelmetProvider → QueryClientProvider           │
│  → TooltipProvider → PageErrorBoundary → XPToastProvider  │
│  → BrowserRouter → KeyboardShortcutsProvider              │
│  → AuthProvider → CommandPalette → Routes                 │
└──────────────────────────────────────────────────────────┘
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────────┐
    │ Supabase │  │  Edge     │  │  External    │
    │ Client   │  │ Functions │  │  APIs        │
    │ (SDK)    │  │ (Deno)    │  │  (Bitrix24)  │
    └──────────┘  └──────────┘  └──────────────┘
           │             │
           ▼             ▼
    ┌──────────────────────────┐
    │  Lovable Cloud           │
    │  (PostgreSQL + Auth +    │
    │   Storage + Realtime)    │
    └──────────────────────────┘
```

### Padrão de Camadas

```
Página (Page) → Componentes (UI) → Hooks (Lógica) → Supabase Client / Edge Functions
```

### Stack Técnico

| Camada | Tecnologia |
|---|---|
| UI Framework | React 18 |
| Linguagem | TypeScript |
| Build Tool | Vite |
| Estilização | Tailwind CSS + shadcn/ui |
| Estado Global | Contextos React (AuthContext) |
| Fetching | TanStack React Query v5 |
| Animações | Framer Motion |
| Drag & Drop | @dnd-kit (core, sortable, utilities) |
| Formulários | React Hook Form + Zod |
| Roteamento | React Router DOM v6 |
| Gráficos | Recharts |
| Data | date-fns |
| PDF | jsPDF + jspdf-autotable |
| Excel | xlsx + PapaParse |
| Busca Fuzzy | Fuse.js |
| Backend | Lovable Cloud (Supabase) |
| SEO | react-helmet-async |
| Testes | Vitest + Testing Library |
| Confetti | canvas-confetti |

---

## 3. Autenticação & Segurança

### 3.1 Autenticação

| Funcionalidade | Componente(s) | Descrição |
|---|---|---|
| Login/Cadastro | `Auth.tsx` | Página de autenticação com email/senha |
| Reset de senha | `ResetPassword.tsx` | Fluxo de recuperação de senha |
| Rota protegida | `ProtectedRoute.tsx` | Verifica autenticação e role |
| Permission Gate | `PermissionGate.tsx` | Controle de acesso por permissão |
| Contexto de Auth | `AuthContext.tsx` | Provider global de autenticação |

### 3.2 Segurança

| Funcionalidade | Componente(s) | Descrição |
|---|---|---|
| MFA Setup (2FA) | `MFASetup.tsx` | Configuração de autenticação 2 fatores |
| MFA Verificação | `MFAVerification.tsx` | Verificação de código MFA |
| Passkeys/WebAuthn | `PasskeySettings.tsx` | Gerenciar chaves de segurança |
| IP Whitelist | `IPWhitelistManager.tsx` / `IPWhitelistPanel.tsx` | Whitelist de IPs permitidos |
| IPs Bloqueados | `BlockedIPsPanel.tsx` | Gerenciar IPs bloqueados |
| Geoblocking | `GeoBlockingManager.tsx` | Restrição por região geográfica |
| Dispositivos Conhecidos | `KnownDevices.tsx` | Gerenciar dispositivos confiáveis |
| Gerenciador de Sessões | `SessionManager.tsx` | Monitorar sessões ativas |
| Gerenciador de Roles | `RoleManager.tsx` | Administração de papéis |
| Reautenticação | `ReauthDialog.tsx` | Dialog para ações sensíveis |
| Aprovação Reset Senha | `PasswordResetApproval.tsx` | Admin aprova resets de senha |
| Push Notifications | `PushNotificationSettings.tsx` | Configurar notificações push |
| Rate Limit Dashboard | `RateLimitDashboard.tsx` | Monitoramento de rate limiting |

### 3.3 RBAC (Controle de Acesso)

| Papel | Permissões |
|---|---|
| **Admin** | Acesso total: painel admin, roles, configurações, relatórios, segurança |
| **Manager** | Vendedor + gestão de equipe, relatórios avançados, metas, playbooks |
| **Sales Rep** | Dashboard individual, pipeline, atividades, metas pessoais |
| **Sales Ops** | Operações de vendas, configurações operacionais |

- **Hooks:** `useUserRoles.ts`, `usePermissions.ts`, `useMFA.ts`, `useWebAuthn.ts`
- **Hooks de segurança:** `useIPBlocking.ts`, `useSessionManagement.ts`, `useLoginRateLimiter.ts`, `useReauthentication.ts`
- **Funções DB:** `has_role()`, `is_admin_or_manager()`, `get_current_salesperson_id()`, `is_authenticated()`

---

## 4. Dashboard Principal

**Rota:** `/`  
**Página:** `Index.tsx`

### Componentes do Dashboard

| Componente | Descrição |
|---|---|
| `DashboardHeader.tsx` | Header com saudação, filtros e ações |
| `EnhancedDashboard.tsx` | Dashboard aprimorado |
| `KPIGrid.tsx` | Grid de KPIs principais |
| `StatCard.tsx` / `CompactStatCard.tsx` | Cards de estatísticas |
| `EnhancedStatCard.tsx` | Card com tendência e gráfico |
| `StatCardCompact.tsx` | Card compacto |
| `GoalProgress.tsx` / `GoalProgressCard.tsx` | Progresso de metas |
| `PipelineOverview.tsx` | Visão geral do pipeline |
| `RecentDeals.tsx` | Negócios recentes |
| `TopProducts.tsx` | Produtos mais vendidos |
| `SalesChart.tsx` | Gráfico de vendas |
| `SalesForecast.tsx` | Previsão de vendas |
| `FunnelChart.tsx` | Funil de conversão |
| `ActivityChart.tsx` | Gráfico de atividades |
| `ActivityItem.tsx` | Item de atividade |
| `AlertsPanel.tsx` | Painel de alertas |
| `ClientInfoCard.tsx` | Informações de cliente |
| `TimeRangePicker.tsx` | Seletor de período |

**Hooks:** `useDashboardKPIs.ts`, `useSalesData.ts`, `useFunnelData.ts`, `useAlerts.ts`

---

## 5. Pipeline de Vendas (Kanban)

**Rota:** `/pipeline`  
**Página:** `Pipeline.tsx`

### Estágios do Pipeline

| Estágio | Descrição |
|---|---|
| Lead | Novo lead identificado |
| Qualificado | Lead qualificado (SDR) |
| Proposta | Proposta enviada |
| Negociação | Em negociação |
| Fechado | Negócio fechado |

### Componentes

| Componente | Descrição |
|---|---|
| `PipelineBoard.tsx` | Board Kanban completo com drag-and-drop |
| `PipelineColumn.tsx` | Coluna do pipeline (estágio) |
| `DealCard.tsx` | Card de negócio no kanban |
| `DealTimeline.tsx` | Timeline do negócio |
| `AtRiskDealsPanel.tsx` | Painel de deals em risco |

**Hooks:** `usePipeline.ts`, `useDeals.ts`, `useDealTimeline.ts`, `useDealVelocity.ts`, `useDealProbability.ts`, `useAtRiskDeals.ts`, `useDragAndDrop.ts`

**Tecnologia:** @dnd-kit para drag-and-drop entre estágios

---

## 6. Vendas (Deals)

**Rota:** `/vendas`  
**Página:** `Vendas.tsx`

### Funcionalidades

| Funcionalidade | Componente(s) | Descrição |
|---|---|---|
| Criar venda | `CreateSaleDialog.tsx` | Dialog para criar novo deal |
| Lista de vendas | Página `Vendas.tsx` | Lista/grid com filtros |

**Hooks:** `useSalesData.ts`, `useSalesRealtime.ts`, `useSalesForecast.ts`, `useClosingTime.ts`, `useConversionAnalysis.ts`, `useWinLossAnalysis.ts`

---

## 7. Clientes / CRM

**Rota:** `/clientes`  
**Página:** `Clientes.tsx`

### Funcionalidades

| Funcionalidade | Componente(s) | Descrição |
|---|---|---|
| Lista de clientes | Página `Clientes.tsx` | Lista com busca e filtros |
| Criar cliente | `CreateClientDialog.tsx` | Dialog para novo cliente |
| Editar cliente | `EditClientDialog.tsx` | Dialog para edição |
| Empty state | `EmptyStateClients.tsx` | Estado vazio personalizado |

**Hooks:** `useClients.ts`, `useChurnPrediction.ts`, `useLeadScoring.ts`, `useLeadRouting.ts`

### Modelo de Dados

```
clients
  ├── name, email, phone, company
  ├── total_value (agregado)
  ├── created_at, updated_at
  └── Relacionamentos:
       ├── sales (deals)
       ├── activities
       ├── client_portfolio (atribuição)
       └── icp_data (perfil ideal)
```

---

## 8. Produtos

**Rota:** `/produtos`  
**Página:** `Produtos.tsx`

### Funcionalidades

| Funcionalidade | Componente(s) | Descrição |
|---|---|---|
| Lista de produtos | Página `Produtos.tsx` | Grid/lista de produtos |
| Criar produto | `CreateProductDialog.tsx` | Dialog para novo produto |
| Editar produto | `EditProductDialog.tsx` | Dialog para edição |
| Empty state | `EmptyStateProducts.tsx` | Estado vazio personalizado |

**Hook:** `useProducts.ts`

### Modelo de Dados

```
products
  ├── name, category, price, rating
  ├── sales_count, status
  └── created_at, updated_at
```

---

## 9. Atividades & Cadências

### 9.1 Atividades

**Rota:** `/atividades`  
**Página:** `Atividades.tsx`

| Componente | Descrição |
|---|---|
| `ActivityLogForm.tsx` | Formulário de registro de atividade |
| `ActivityList.tsx` | Lista de atividades |
| `ActivityStats.tsx` | Estatísticas de atividades |
| `ActivityGoalCard.tsx` | Card de meta de atividade |
| `ActivityGoalEditDialog.tsx` | Edição de meta de atividade |
| `DailyActivityRanking.tsx` | Ranking diário de atividades |

**Tipos de Atividade:** `call`, `email`, `meeting`, `whatsapp`, `linkedin`, `note`

**Outcomes:** `successful`, `no_answer`, `callback`, `not_interested`, `meeting_scheduled`

**Hooks:** `useActivities.ts`, `useActivityGoals.ts`, `useSalespersonActivityReport.ts`

### 9.2 Cadências

**Rota:** `/cadencias`  
**Página:** `Cadencias.tsx`

| Componente | Descrição |
|---|---|
| `CadenceCard.tsx` | Card de cadência |
| `CreateCadenceDialog.tsx` | Criar nova cadência |
| `EnrollCadenceDialog.tsx` | Inscrever prospect em cadência |
| `TodaysCadenceTasks.tsx` | Tarefas de cadência do dia |

**Hooks (subpasta `cadences/`):**
| Hook | Descrição |
|---|---|
| `useCadenceQueries.ts` | Queries de cadências |
| `useCadenceMutations.ts` | Mutations CRUD de cadências |
| `useProspectCadenceMutations.ts` | Mutations de prospects em cadências |
| `useCadenceTaskMutations.ts` | Mutations de tarefas de cadência |

### 9.3 Relatório de Atividades

**Rota:** `/relatorio-atividades` (Admin/Manager)  
**Rota:** `/metas-atividades`

---

## 10. Tarefas

**Rota:** `/tarefas`  
**Página:** `Tarefas.tsx`

| Componente | Descrição |
|---|---|
| `TaskListAdvanced.tsx` | Lista avançada de tarefas |
| `TaskCard.tsx` | Card de tarefa |
| `DraggableTaskCard.tsx` | Card arrastável (prioridade) |
| `CreateTaskDialog.tsx` | Criar tarefa |
| `RescheduleDialog.tsx` | Reagendar tarefa |
| `PriorityColumn.tsx` | Coluna por prioridade |
| `TaskQueue.tsx` | Fila de tarefas |
| `NextBestAction.tsx` | Próxima melhor ação (IA) |

**Prioridades:** `low`, `medium`, `high`, `urgent`

**Tipos:** `call`, `email`, `meeting`, `follow_up`, `other`

**Hooks:** `useTasks.ts`, `useStagnantTasks.ts`, `useNextBestAction.ts`

---

## 11. Metas & Objetivos

**Rota:** `/metas` (Admin/Manager)  
**Página:** `Metas.tsx`

### Componentes de Metas

| Componente | Descrição |
|---|---|
| `GoalTracker.tsx` | Tracker visual de progresso |
| `GoalsLeaderboard.tsx` | Leaderboard de metas |
| `SalespersonGoalCard.tsx` | Card de meta individual |
| `TeamGoalProgress.tsx` | Progresso da equipe |
| `CommissionCalculator.tsx` | Calculadora de comissões |

**Tipos de Meta:** `revenue`, `deals`, `calls`, `meetings`, `emails`

**Períodos:** `daily`, `weekly`, `monthly`, `quarterly`, `yearly`

**Hooks:** `useGoals.ts`, `useGoalsDashboard.ts`

---

## 12. Gamificação

### 12.1 Sistema de XP e Níveis

| Componente | Descrição |
|---|---|
| `XPBar.tsx` | Barra de progresso de XP |
| `XPProgressBar.tsx` | Barra de XP detalhada |
| `XPToast.tsx` | Toast de ganho de XP |
| `EpicXPToast.tsx` | Toast épico de XP |
| `XPHistoryTimeline.tsx` | Timeline de histórico de XP |
| `LevelBadge.tsx` | Badge de nível |
| `SalespersonLevelBadge.tsx` | Badge de nível do vendedor |
| `LevelUpOverlay.tsx` | Overlay de level up |
| `PointsDisplay.tsx` | Exibição de pontos |
| `ProgressRing.tsx` | Anel de progresso |

### 12.2 Conquistas

| Componente | Descrição |
|---|---|
| `AchievementCard.tsx` | Card de conquista |
| `AchievementsHistory.tsx` | Histórico de conquistas |
| `AchievementComparisonChart.tsx` | Gráfico de comparação |
| `AchievementTrendChart.tsx` | Gráfico de tendência |
| `TeamAchievementStats.tsx` | Estatísticas da equipe |
| `BadgeDisplay.tsx` | Exibição de badges |

### 12.3 Streaks

| Componente | Descrição |
|---|---|
| `StreakCounter.tsx` | Contador de sequência |
| `StreakFlame.tsx` | Ícone de chama |
| `StreakWidget.tsx` | Widget de streak |
| `StreakAchievementsCard.tsx` | Card de conquistas de streak |
| `StreakRanking.tsx` | Ranking de streaks |

### 12.4 Competição & Rankings

| Componente | Descrição |
|---|---|
| `CompetitiveLeaderboard.tsx` | Leaderboard competitivo |
| `CompetitiveStatusBar.tsx` | Barra de status competitivo |
| `LeaderboardCard.tsx` | Card de leaderboard |
| `RealtimeXPRanking.tsx` | Ranking em tempo real |
| `GamificationCard.tsx` | Card geral de gamificação |
| `GamificationProfileModal.tsx` | Modal de perfil gamificado |
| `GamificationExportButton.tsx` | Exportar dados de gamificação |

### 12.5 Celebrações

| Componente | Descrição |
|---|---|
| `EnhancedCelebration.tsx` | Celebração visual completa |
| `CelebrationOverlayProvider.tsx` | Provider de overlay |
| `CelebrationTestButtons.tsx` | Botões de teste |

### 12.6 Desafios

| Componente | Descrição |
|---|---|
| `WeeklyChallengesCard.tsx` | Card de desafios semanais |
| `DailyChallengesCard.tsx` | Card de desafios diários |
| `CreateChallengeDialog.tsx` | Criar novo desafio |

**Hooks:** `useGamificationData.ts`, `useSalespersonXP.ts`, `useAchievements.ts`, `useAchievementsByPerson.ts`, `useAchievementTrends.ts`, `useTeamAchievementStats.ts`, `useCompetitiveRanking.ts`, `useWeeklyChallenges.ts`, `useDailyChallenges.ts`, `useDailyStreakAchievements.ts`, `useChallengeProgressUpdater.ts`, `useLevelUpCelebration.ts`, `useCelebration.ts`

**Lib:** `lib/gamification.ts` — Lógica de níveis, XP e cálculos

---

## 13. Dashboards Especializados (BI)

### 13.1 BI Vendedor

**Rota:** `/bi-vendedor`  
**Página:** `BIVendedor.tsx`

Métricas individuais: performance pessoal, pipeline individual, atividades, streaks, conquistas.

**Hook:** `useBIVendedor.ts`

### 13.2 BI Gestor

**Rota:** `/bi-gestor` (Admin/Manager)  
**Página:** `BIGestor.tsx`

Métricas consolidadas: equipe, previsão de pipeline, rankings, evolução de receita, análise ABC.

**Hook:** `useBIGestor.ts`

### 13.3 BI SDR

**Rota:** `/bi-sdr`  
**Página:** `BISDR.tsx`

Métricas de prospecção: leads gerados, taxa de qualificação, conversão para meeting.

**Hook:** `useBISDR.ts`

### 13.4 BI Closer

**Rota:** `/bi-closer`  
**Página:** `BICloser.tsx`

Métricas de fechamento: deals fechados, ticket médio, win rate, velocidade.

**Hook:** `useBICloser.ts`

### Componentes BI Comuns

| Componente | Descrição |
|---|---|
| `BIFilterBar.tsx` | Barra de filtros BI |
| `BIMetricCard.tsx` | Card de métrica BI |
| `BIProjectionCard.tsx` | Card de projeção |
| `BIClientList.tsx` | Lista de clientes BI |

**Hook comum:** `useBIFilters.ts`

---

## 14. SDR Dashboard

**Rota:** `/sdr`  
**Página:** `SDRDashboard.tsx`

| Componente | Descrição |
|---|---|
| `SDRStatCard.tsx` | Card de estatística SDR |
| `ProspectingFunnel.tsx` | Funil de prospecção |
| `LeadTemperatureChart.tsx` | Temperatura de leads |
| `SDRActivityTrend.tsx` | Tendência de atividades |
| `SDRConversionEvolution.tsx` | Evolução de conversão |
| `SDRConversionRanking.tsx` | Ranking de conversão |
| `SchedulingRateGauge.tsx` | Gauge de taxa de agendamento |
| `RecentProspects.tsx` | Prospects recentes |
| `TopSDRsRanking.tsx` | Ranking dos melhores SDRs |
| `SDRAlertHistory.tsx` | Histórico de alertas SDR |
| `TestSDRAlertButton.tsx` | Botão de teste de alerta |

**Hooks:** `useSDRMetrics.ts`, `useSDRAlertNotifications.ts`, `useSDRAlertSoundSettings.ts`

---

## 15. Closer Dashboard

**Rota:** `/closer`  
**Página:** `CloserDashboard.tsx`

| Componente | Descrição |
|---|---|
| `CloserStatCard.tsx` | Card de estatística Closer |
| `CloserPipeline.tsx` | Pipeline do Closer |
| `CloserRevenueEvolution.tsx` | Evolução de receita |
| `CloserRevenueComparison.tsx` | Comparação de receita |
| `RecentClosedDeals.tsx` | Deals fechados recentes |
| `TopClosersRanking.tsx` | Ranking dos melhores Closers |

**Hook:** `useCloserMetrics.ts`

---

## 16. Analytics & Relatórios

### 16.1 Analytics

**Rota:** `/analytics` (Admin/Manager)  
**Página:** `Analytics.tsx`

### 16.2 Relatórios

**Rota:** `/relatorios` (Admin/Manager)  
**Página:** `Relatorios.tsx`

### 16.3 Componentes de Analytics

| Componente | Descrição |
|---|---|
| `ABCAnalysis.tsx` | Análise ABC (Pareto) |
| `ActivityOutcomesChart.tsx` | Gráfico de resultados de atividades |
| `ActivityTrendChart.tsx` | Tendência de atividades |
| `ActivityVolumeChart.tsx` | Volume de atividades |
| `ChurnPrediction.tsx` | Previsão de churn |
| `ClosingTimeChart.tsx` | Tempo de fechamento |
| `CoachingComparison.tsx` | Comparação para coaching |
| `ConversionAnalysis.tsx` | Análise de conversão |
| `ConversionFunnel.tsx` | Funil de conversão |
| `DealVelocityChart.tsx` | Velocidade de deals |
| `DemandForecast.tsx` | Previsão de demanda |
| `DemandForecastDashboard.tsx` | Dashboard de previsão |
| `EmailMetricsDashboard.tsx` | Métricas de email |
| `LeadSLAMonitor.tsx` | Monitor de SLA de leads |
| `LeadSourceDistribution.tsx` | Distribuição por fonte |
| `LeadSourceMetrics.tsx` | Métricas por fonte |
| `LeadSourceTrendChart.tsx` | Tendência por fonte |
| `ObjectionsLibrary.tsx` | Biblioteca de objeções |
| `PerformanceComparison.tsx` | Comparação de performance |
| `ProductMix.tsx` | Mix de produtos |
| `SalesForecast.tsx` | Previsão de vendas |
| `SalespersonActivityTable.tsx` | Tabela de atividades por vendedor |
| `SalespersonCoaching.tsx` | Coaching de vendedor |
| `WinLossAnalysis.tsx` | Análise Win/Loss |

### 16.4 Componentes de Gráficos

| Componente | Descrição |
|---|---|
| `GaugeChart.tsx` | Gráfico gauge (velocímetro) |
| `KPICard.tsx` | Card de KPI |
| `RadialProgress.tsx` | Progresso radial |
| `SparklineChart.tsx` | Mini gráfico inline |
| `TrendIndicator.tsx` | Indicador de tendência |

**Hooks de Analytics:**
`useABCAnalysis.ts`, `useConversionAnalysis.ts`, `useWinLossAnalysis.ts`, `useDealVelocity.ts`, `useClosingTime.ts`, `useSalesForecast.ts`, `useLeadSourceAnalysis.ts`, `usePerformanceComparison.ts`, `useEmailMetrics.ts`, `useSalespersonCoaching.ts`, `useChurnPrediction.ts`, `useReportData.ts`

---

## 17. Orçamentos

**Rota:** `/orcamentos`  
**Página:** `Orcamentos.tsx`

### Status do Orçamento

```
Rascunho → Enviado → Aprovado / Rejeitado / Expirado
```

### Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| Cards de resumo | Total, Enviados, Aprovados, Expirando |
| Filtro por status | Tabs de filtro rápido |
| Alerta de expiração | Indicador visual para orçamentos próximos ao vencimento (3 dias) |
| Referência externa | Campo para ID de sistema externo (integração futura via API) |
| Controle de acesso | Apenas Closers (criadores) e Admin/Manager |

**Hook:** `useQuotes.ts`

### Modelo de Dados

```
quotes
  ├── client_name, total_value
  ├── status (draft, sent, approved, rejected, expired)
  ├── valid_until (data de validade)
  ├── external_reference (referência ao sistema externo)
  ├── notes
  ├── created_by (uuid do criador)
  └── created_at, updated_at
```

---

## 18. Playbooks

**Rota:** `/playbooks` (Admin/Manager)  
**Página:** `Playbooks.tsx`

| Componente | Descrição |
|---|---|
| `PlaybooksManager.tsx` | Gerenciador completo de playbooks |

**Hook:** `usePlaybooks.ts`

### Modelo de Dados

```
playbooks
  ├── title, description, stage
  └── playbook_items
       ├── content, item_type, item_order
       └── is_required
  
playbook_progress
  ├── playbook_item_id, sale_id
  ├── completed_by, completed_at
```

---

## 19. Portfólio de Clientes

**Rota:** `/portfolio` (Admin/Manager)  
**Página:** `Portfolio.tsx`

| Componente | Descrição |
|---|---|
| `PortfolioTable.tsx` | Tabela de portfólio |
| `PortfolioStatsCards.tsx` | Cards de estatísticas |
| `AssignClientDialog.tsx` | Atribuir cliente |
| `AutoRouteDialog.tsx` | Roteamento automático |
| `PerformanceRankingCard.tsx` | Card de ranking |
| `RoutingHistoryTable.tsx` | Histórico de roteamento |

**Hooks:** `useClientPortfolio.ts`, `usePortfolioSettings.ts`, `useLeadRouting.ts`

---

## 20. ICP (Ideal Customer Profile)

**Rota:** `/icp` (Admin/Manager)  
**Página:** `ICP.tsx`

**Hook:** `useICPData.ts`

### Dados ICP

```
icp_data
  ├── client_id (FK → clients)
  ├── ramo_atividade, grupo_nicho
  ├── num_colaboradores, capital_social
  ├── is_icp_match (bool)
  └── bitrix_id (referência externa)
```

---

## 21. Fornecedores & Comparador de Preços

### 21.1 Fornecedores

**Rota:** `/fornecedores` (Admin/Manager)  
**Página:** `Fornecedores.tsx`

**Hook:** `useSuppliers.ts`

### 21.2 Comparador de Preços

**Rota:** `/comparador-precos` (Admin/Manager)  
**Página:** `ComparadorPrecos.tsx`

**Hook:** `usePriceHistory.ts`

### Modelo de Dados

```
suppliers
  ├── name, contact_name, email, phone
  ├── website, rating, is_active
  └── supplier_products
       ├── product_id, supplier_price
       ├── min_order_quantity, lead_time_days
       └── is_preferred

price_history
  ├── product_id, supplier_id
  ├── old_price, new_price, price_change_percent
  └── recorded_at

price_alerts
  ├── product_id, supplier_id
  ├── alert_type, old_price, new_price
  └── is_read
```

---

## 22. Previsão de Demanda

**Rota:** `/previsao-demanda` (Admin/Manager)  
**Página:** `PrevisaoDemanda.tsx`

**Hook:** `useDemandForecast.ts`

### Modelo de Dados

```
demand_forecasts
  ├── product_id, forecast_date
  ├── predicted_quantity, predicted_revenue
  ├── confidence_score, factors (jsonb)
  └── model_version

inventory_levels
  ├── product_id
  ├── current_stock, min_stock_level, max_stock_level
  ├── reorder_point, lead_time_days
  └── last_restock_date
```

---

## 23. Assinatura Digital

**Rota:** `/assinatura-digital` (Admin/Manager)  
**Página:** `AssinaturaDigital.tsx`

**Hook:** `useDigitalSignatures.ts`

### Modelo de Dados

```
digital_signatures
  ├── title, description, status
  ├── file_url, created_by
  ├── signed_at, expires_at
  └── document_signers
       ├── name, email, status
       ├── sign_order, signed_at
```

---

## 24. Assistente de Vendas (IA)

**Rota:** `/assistente`  
**Página:** `Assistente.tsx`

| Componente | Descrição |
|---|---|
| `SalesAssistantChat.tsx` | Chat principal com IA |
| `DealChatHistory.tsx` | Histórico de conversas sobre deals |
| `DealContextSelector.tsx` | Seletor de contexto (deal) |
| `DealPreviewCard.tsx` | Preview do deal selecionado |
| `VoiceControls.tsx` | Controles de voz |

**Hooks:** `useSalesAssistant.ts`, `useDealChatHistory.ts`, `useElevenLabsVoice.ts`

**Edge Function:** `sales-assistant-chat` — Backend do assistente com modelos de IA

---

## 25. Integração Bitrix24

**Rota:** `/bitrix24` (Admin/Manager)  
**Página:** `Bitrix24.tsx`

**Hook:** `useBitrix24.ts`

### Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| OAuth2 com Bitrix24 | Autenticação e autorização |
| Sync de empresas | Importar/exportar empresas |
| Sync de deals | Sincronizar negócios |
| Logs de sincronização | Histórico de syncs |

**Edge Functions:** `bitrix24-oauth`, `bitrix24-sync`

---

## 26. Times & Equipes

**Rota:** `/times` (Admin/Manager)  
**Página:** `Times.tsx`

| Componente | Descrição |
|---|---|
| `TeamCard.tsx` | Card de equipe |
| `CreateTeamDialog.tsx` | Criar equipe |
| `EditTeamDialog.tsx` | Editar equipe |
| `MemberList.tsx` | Lista de membros |

**Hook:** `useTeams.ts`

---

## 27. Ranking Competitivo

**Rota:** `/ranking`  
**Página:** `RankingCompetitivo.tsx`

**Hooks:** `useCompetitiveRanking.ts`, `useRankingByRole.ts`

---

## 28. Desafios (Semanais & Diários)

### 28.1 Desafios Semanais

**Rota:** `/desafios`  
**Página:** `DesafiosSemanais.tsx`

**Hook:** `useWeeklyChallenges.ts`

### 28.2 Histórico de Desafios Diários

**Rota:** `/desafios-diarios`  
**Página:** `HistoricoDesafiosDiarios.tsx`

**Hook:** `useDailyChallenges.ts`

### Modelo de Dados

```
weekly_challenges
  ├── title, description, challenge_type
  ├── target_value, xp_reward
  ├── start_date, end_date, is_active

challenge_progress
  ├── challenge_id, salesperson_id
  ├── current_value, completed_at, xp_claimed

daily_challenges
  ├── title, description, challenge_type
  ├── target_value, xp_reward
  ├── challenge_date, is_active

daily_challenge_progress
  ├── challenge_id, salesperson_id
  ├── current_value, completed_at, xp_claimed
```

---

## 29. Notificações

**Rota:** `/notificacoes`  
**Página:** `Notificacoes.tsx`

| Componente | Descrição |
|---|---|
| `NotificationCenter.tsx` | Central de notificações |

**Hooks:** `useNotifications.ts`, `useNotificationPreferences.ts`, `usePushNotifications.ts`

---

## 30. Configurações

**Rota:** `/configuracoes`  
**Página:** `Configuracoes.tsx`

| Componente | Descrição |
|---|---|
| `SettingsPanel.tsx` | Painel principal de configurações |
| `ThemeCustomizer.tsx` | Customizador de tema |
| `SoundSettings.tsx` | Configurações de som |
| `SoundSettingsTabs.tsx` | Abas de configurações de som |
| `AIAssistantSettings.tsx` | Configurações do assistente IA |
| `AccessDeniedLogs.tsx` | Logs de acesso negado |
| `BrowserPushSettings.tsx` | Push notifications do navegador |
| `PermissionMatrix.tsx` | Matriz de permissões |
| `PortfolioSettings.tsx` | Configurações de portfólio |
| `RoleManagement.tsx` | Gestão de papéis |
| `SecurityAlertHistory.tsx` | Histórico de alertas de segurança |
| `SecurityAlertSettings.tsx` | Configurações de alertas |
| `SecurityAlertSoundSettings.tsx` | Sons de alerta de segurança |

**Hooks de som:** `useSoundEffects.ts`, `useSoundSettings.ts`, `useSystemSoundSettings.ts`, `useSecurityAlertSoundSettings.ts`, `useSecurityAlertNotifications.ts`

---

## 31. Edge Functions (Backend)

| # | Função | Descrição | Auth |
|---|---|---|---|
| 1 | `access-denied-alerts` | Alertas de acesso negado | JWT |
| 2 | `activity-goal-alerts` | Alertas de metas de atividade | JWT |
| 3 | `auto-reassign-inactive` | Reatribuição automática de inativos | Service |
| 4 | `bitrix24-oauth` | OAuth2 com Bitrix24 | JWT |
| 5 | `bitrix24-sync` | Sincronização com Bitrix24 | JWT |
| 6 | `challenge-expiration-alerts` | Alertas de expiração de desafios | Service |
| 7 | `check-lead-sla` | Verificação de SLA de leads | Service |
| 8 | `create-stagnant-tasks` | Criar tarefas para deals estagnados | Service |
| 9 | `deal-probability` | Cálculo de probabilidade de deal | JWT |
| 10 | `demand-forecast` | Previsão de demanda | JWT |
| 11 | `detect-at-risk-deals` | Detecção de deals em risco | Service |
| 12 | `elevenlabs-stt` | Speech-to-Text (ElevenLabs) | JWT |
| 13 | `elevenlabs-tts` | Text-to-Speech (ElevenLabs) | JWT |
| 14 | `lead-scoring` | Pontuação de leads | JWT |
| 15 | `new-device-alert` | Alerta de novo dispositivo | JWT |
| 16 | `next-best-action` | Próxima melhor ação (IA) | JWT |
| 17 | `push-subscribe` | Inscrição em push notifications | JWT |
| 18 | `rotate-daily-challenges` | Rotação de desafios diários | Service |
| 19 | `sales-assistant-chat` | Chat do assistente de vendas (IA) | JWT |
| 20 | `salesperson-coaching` | Coaching inteligente | JWT |
| 21 | `sdr-consecutive-alerts` | Alertas consecutivos SDR | Service |
| 22 | `send-alert-notifications` | Enviar notificações de alerta | Service |
| 23 | `send-password-reset` | Enviar email de reset de senha | Service |
| 24 | `send-push-notification` | Enviar push notification | Service |
| 25 | `webauthn` | WebAuthn/Passkeys backend | JWT |

---

## 32. Banco de Dados

### 32.1 Tabelas (Lovable Cloud)

| Tabela | Descrição | RLS |
|---|---|---|
| `access_denied_logs` | Logs de acesso negado | ✅ Admin read, auth insert |
| `achievements` | Conquistas de vendedores | ✅ Auth read/insert |
| `active_sessions` | Sessões ativas | ✅ Admin all, user own |
| `activities` | Atividades/interações | ✅ Own or admin |
| `activity_goals` | Metas de atividade | ✅ Auth all |
| `bitrix24_sync_logs` | Logs de sync Bitrix24 | ✅ Admin/manager read |
| `blocked_ips` | IPs bloqueados | ✅ Admin only |
| `cadences` | Cadências de prospecção | ✅ Admin/manager write, auth read |
| `cadence_steps` | Etapas da cadência | ✅ Admin/manager write, auth read |
| `cadence_tasks` | Tarefas da cadência | ✅ Auth all |
| `category_metrics` | Métricas por categoria | ✅ Admin/manager write, auth read |
| `challenge_progress` | Progresso em desafios | ✅ Auth read/insert/update |
| `chat_conversations` | Conversas do assistente | ✅ Auth all |
| `chat_messages` | Mensagens do assistente | ✅ Auth read/insert |
| `circuit_breaker_events` | Eventos de circuit breaker | ✅ Auth insert, admin read |
| `client_portfolio` | Atribuição de clientes | ✅ Auth read/insert/update, admin delete |
| `clients` | Clientes | ✅ Admin/manager write, auth read |
| `daily_challenge_progress` | Progresso diário | ✅ Auth read/insert/update |
| `daily_challenges` | Desafios diários | ✅ Admin/manager write, auth read |
| `daily_metrics` | Métricas diárias | ✅ Admin/manager write, auth read |
| `daily_streak_achievements` | Conquistas de streak | ✅ Auth read/insert/update |
| `deal_chat_history` | Chat sobre deals | ✅ Auth read/insert, own delete |
| `deal_outcomes` | Resultados de deals | ✅ Own or admin |
| `deal_stage_history` | Histórico de estágios | ✅ Auth read/insert/update |
| `demand_forecasts` | Previsões de demanda | ✅ Admin/manager write, auth read |
| `digital_signatures` | Assinaturas digitais | ✅ Auth read/insert/update, admin delete |
| `document_signers` | Signatários | ✅ Auth read/insert/update, admin delete |
| `email_logs` | Logs de email | ✅ Admin/manager read, service insert |
| `geo_access_logs` | Logs de acesso geográfico | ✅ Admin read, service insert |
| `geo_blocked_regions` | Regiões bloqueadas | ✅ Admin manage, auth read |
| `icp_data` | Dados de ICP | ✅ Auth read/insert/update |
| `inventory_levels` | Níveis de estoque | ✅ Admin/manager write, auth read |
| `ip_whitelist` | IPs permitidos | ✅ Admin only |
| `known_devices` | Dispositivos conhecidos | ✅ Own user only |
| `lead_routing_log` | Log de roteamento | ✅ Auth read/insert |
| `lead_scores` | Pontuação de leads | ✅ Own or admin |
| `login_alerts` | Alertas de login | ✅ |
| `login_attempts` | Tentativas de login | ✅ |
| `mfa_verification_attempts` | Tentativas MFA | ✅ |
| `notification_preferences` | Preferências de notificação | ✅ |
| `objections_library` | Biblioteca de objeções | ✅ |
| `password_reset_requests` | Solicitações de reset | ✅ |
| `permissions` | Permissões do sistema | ✅ |
| `playbooks` | Playbooks de vendas | ✅ |
| `playbook_items` | Itens do playbook | ✅ |
| `playbook_progress` | Progresso no playbook | ✅ |
| `portfolio_settings` | Configurações de portfólio | ✅ |
| `price_alerts` | Alertas de preço | ✅ |
| `price_history` | Histórico de preços | ✅ |
| `products` | Produtos | ✅ |
| `prospect_cadences` | Prospects em cadências | ✅ |
| `quotes` | Orçamentos | ✅ Creator or admin/manager |
| `suppliers` | Fornecedores | ✅ |
| `supplier_products` | Produtos de fornecedores | ✅ |

**+ Tabelas de sistema:** `salespeople`, `sales`, `sales_goals`, `teams`, `weekly_challenges`

### 32.2 Funções do Banco

| Função | Descrição |
|---|---|
| `has_role(user_id, role)` | Verifica se usuário tem determinado papel |
| `is_admin_or_manager(user_id)` | Verifica se é admin ou gestor |
| `get_current_salesperson_id()` | Retorna ID do vendedor logado |
| `is_authenticated()` | Verifica se está autenticado |
| `update_updated_at_column()` | Trigger para timestamp automático |

---

## 33. Hooks Customizados (Catálogo Completo)

### 33.1 Dados & CRM

| Hook | Descrição |
|---|---|
| `useClients.ts` | CRUD de clientes |
| `useProducts.ts` | CRUD de produtos |
| `useSalesData.ts` | Dados de vendas |
| `useSalesRealtime.ts` | Vendas em tempo real |
| `useSalespeople.ts` | Lista de vendedores |
| `useSalespersonPreferences.ts` | Preferências do vendedor |
| `useDeals.ts` | Gestão de deals |

### 33.2 Pipeline & Deals

| Hook | Descrição |
|---|---|
| `usePipeline.ts` | Pipeline kanban |
| `useDealTimeline.ts` | Timeline do deal |
| `useDealVelocity.ts` | Velocidade de fechamento |
| `useDealProbability.ts` | Probabilidade de conversão |
| `useDealChatHistory.ts` | Histórico de chat do deal |
| `useAtRiskDeals.ts` | Deals em risco |
| `useDragAndDrop.ts` | Drag & drop |

### 33.3 Atividades & Cadências

| Hook | Descrição |
|---|---|
| `useActivities.ts` | Atividades |
| `useActivityGoals.ts` | Metas de atividade |
| `useCadences.ts` | Re-export de cadências |
| `useSalespersonActivityReport.ts` | Relatório de atividades |

### 33.4 Metas & Performance

| Hook | Descrição |
|---|---|
| `useGoals.ts` | Metas |
| `useGoalsDashboard.ts` | Dashboard de metas |
| `useCompetitiveRanking.ts` | Ranking competitivo |
| `useRankingByRole.ts` | Ranking por papel |
| `usePerformanceComparison.ts` | Comparação de performance |

### 33.5 Gamificação

| Hook | Descrição |
|---|---|
| `useGamificationData.ts` | Dados gerais de gamificação |
| `useSalespersonXP.ts` | XP do vendedor |
| `useAchievements.ts` | Conquistas |
| `useAchievementsByPerson.ts` | Conquistas por pessoa |
| `useAchievementTrends.ts` | Tendências de conquistas |
| `useTeamAchievementStats.ts` | Estatísticas de equipe |
| `useWeeklyChallenges.ts` | Desafios semanais |
| `useDailyChallenges.ts` | Desafios diários |
| `useDailyStreakAchievements.ts` | Conquistas de streak |
| `useChallengeProgressUpdater.ts` | Atualizar progresso |
| `useLevelUpCelebration.ts` | Celebração de level up |
| `useCelebration.ts` | Celebrações gerais |

### 33.6 BI & Analytics

| Hook | Descrição |
|---|---|
| `useBIVendedor.ts` | BI do vendedor |
| `useBIGestor.ts` | BI do gestor |
| `useBISDR.ts` | BI do SDR |
| `useBICloser.ts` | BI do closer |
| `useBIFilters.ts` | Filtros de BI |
| `useDashboardKPIs.ts` | KPIs do dashboard |
| `useFunnelData.ts` | Dados do funil |
| `useReportData.ts` | Dados de relatórios |
| `useABCAnalysis.ts` | Análise ABC |
| `useConversionAnalysis.ts` | Análise de conversão |
| `useWinLossAnalysis.ts` | Análise Win/Loss |
| `useDealVelocity.ts` | Velocidade de deals |
| `useClosingTime.ts` | Tempo de fechamento |
| `useSalesForecast.ts` | Previsão de vendas |
| `useLeadSourceAnalysis.ts` | Análise de fonte de leads |
| `useEmailMetrics.ts` | Métricas de email |
| `useChurnPrediction.ts` | Previsão de churn |

### 33.7 SDR & Closer

| Hook | Descrição |
|---|---|
| `useSDRMetrics.ts` | Métricas SDR |
| `useSDRAlertNotifications.ts` | Alertas SDR |
| `useSDRAlertSoundSettings.ts` | Sons de alerta SDR |
| `useCloserMetrics.ts` | Métricas Closer |

### 33.8 Leads & Scoring

| Hook | Descrição |
|---|---|
| `useLeadScoring.ts` | Pontuação de leads |
| `useLeadRouting.ts` | Roteamento de leads |

### 33.9 Tarefas

| Hook | Descrição |
|---|---|
| `useTasks.ts` | Gestão de tarefas |
| `useStagnantTasks.ts` | Tarefas estagnadas |
| `useNextBestAction.ts` | Próxima melhor ação |

### 33.10 Portfólio & ICP

| Hook | Descrição |
|---|---|
| `useClientPortfolio.ts` | Portfólio de clientes |
| `usePortfolioSettings.ts` | Configurações de portfólio |
| `useICPData.ts` | Dados de ICP |

### 33.11 Fornecedores & Preços

| Hook | Descrição |
|---|---|
| `useSuppliers.ts` | Fornecedores |
| `usePriceHistory.ts` | Histórico de preços |
| `useDemandForecast.ts` | Previsão de demanda |

### 33.12 Orçamentos

| Hook | Descrição |
|---|---|
| `useQuotes.ts` | Orçamentos (CRUD + status) |

### 33.13 Notificações

| Hook | Descrição |
|---|---|
| `useNotifications.ts` | Notificações |
| `useNotificationPreferences.ts` | Preferências |
| `usePushNotifications.ts` | Push notifications |

### 33.14 Segurança

| Hook | Descrição |
|---|---|
| `useMFA.ts` | Multi-Factor Auth |
| `useWebAuthn.ts` | Passkeys/WebAuthn |
| `useIPBlocking.ts` | Bloqueio de IPs |
| `useSessionManagement.ts` | Gerenciamento de sessões |
| `useLoginRateLimiter.ts` | Rate limiting de login |
| `useReauthentication.ts` | Reautenticação |
| `useUserRoles.ts` | Papéis de usuário |
| `usePermissions.ts` | Permissões |
| `useSecurityAlertNotifications.ts` | Alertas de segurança |
| `useSecurityAlertSoundSettings.ts` | Sons de segurança |

### 33.15 Assistente IA & Voz

| Hook | Descrição |
|---|---|
| `useSalesAssistant.ts` | Assistente de vendas |
| `useDealChatHistory.ts` | Chat sobre deals |
| `useElevenLabsVoice.ts` | Voz ElevenLabs |
| `useSmartSuggestions.ts` | Sugestões inteligentes |
| `useSalespersonCoaching.ts` | Coaching de vendedor |

### 33.16 Equipes

| Hook | Descrição |
|---|---|
| `useTeams.ts` | Gestão de equipes |

### 33.17 Integração

| Hook | Descrição |
|---|---|
| `useBitrix24.ts` | Integração Bitrix24 |
| `useDigitalSignatures.ts` | Assinaturas digitais |

### 33.18 UI & UX

| Hook | Descrição |
|---|---|
| `use-mobile.tsx` | Detecção mobile |
| `use-toast.ts` | Sistema de toast |
| `useAutoSave.ts` | Auto-save |
| `useAsync.ts` | Async wrapper |
| `useBulkSelection.ts` | Seleção em massa |
| `useCopyToClipboard.tsx` | Copiar clipboard |
| `useCustomTheme.ts` | Tema customizado |
| `useDataExport.ts` | Exportação de dados |
| `useDataImport.ts` | Importação de dados |
| `useDebounce.ts` | Debounce |
| `useEnhancedToast.ts` | Toast aprimorado |
| `useFilter.ts` | Filtros genéricos |
| `useFocusMode.ts` | Modo foco |
| `useFuzzySearch.ts` | Busca fuzzy |
| `useGlobalKeyboardShortcuts.ts` | Atalhos globais |
| `useHapticFeedback.ts` | Feedback háptico |
| `useIdleDetection.ts` | Detecção de ociosidade |
| `useIntersection.ts` | Intersection Observer |
| `useLocalStorage.ts` | Local Storage |
| `useMediaQuery.ts` | Media queries |
| `useMobileNavigation.ts` | Navegação mobile |
| `useOnboarding.ts` | Onboarding |
| `useOnlineStatus.ts` | Status online |
| `usePagination.ts` | Paginação |
| `usePrefetch.ts` | Prefetch de dados |
| `useProductTour.ts` | Tour do produto |
| `usePWA.ts` | Progressive Web App |
| `useQueryPerformance.ts` | Performance de queries |
| `useRateLimit.ts` | Rate limiting |
| `useRetry.ts` | Retry pattern |
| `useRetryMutation.ts` | Retry em mutations |
| `useScrollPosition.ts` | Posição de scroll |
| `useSoundEffects.ts` | Efeitos sonoros |
| `useSoundSettings.ts` | Configurações de som |
| `useSystemSoundSettings.ts` | Sons do sistema |
| `useTheme.ts` | Tema |
| `useThrottle.ts` | Throttle |
| `useTimer.ts` | Timer |
| `useUndoable.ts` | Undo/Redo |
| `useCircuitBreaker.ts` | Circuit breaker pattern |
| `useCircuitBreakerHistory.ts` | Histórico circuit breaker |
| `useObjectionsLibrary.ts` | Biblioteca de objeções |
| `useAlerts.ts` | Alertas |

---

## 34. Componentes UI (Design System)

### 34.1 Shadcn/Radix (60+ componentes)

```
accordion, alert, alert-dialog, animated-counter, aspect-ratio,
avatar, badge, breadcrumb, button, calendar, card, carousel, chart,
checkbox, collapsible, command, command-palette, context-menu,
dialog, drawer, dropdown-menu, enhanced-select, expandable-card,
floating-action-button, form, hover-card, input, input-otp, label,
menubar, navigation-menu, pagination, password-input,
password-strength, popover, progress, radio-group, resizable,
ripple-button, scroll-area, select, separator, sheet, sidebar,
skeleton, skeleton-shimmer, slider, sonner, stepper,
swipeable-card, switch, table, tabs, textarea, toast, toaster,
toggle, toggle-group, tooltip, touch-carousel
```

### 34.2 Componente UI Especial

| Componente | Descrição |
|---|---|
| `NotificationBadge.tsx` | Badge de contagem de notificações |

---

## 35. Layout & Navegação

| Componente | Descrição |
|---|---|
| `MainLayout.tsx` | Layout principal (sidebar + conteúdo) |
| `AppSidebar.tsx` | Sidebar com navegação completa |
| `GlobalSearch.tsx` | Busca global no header |
| `SlideOverPanel.tsx` | Painel lateral deslizante |
| `ThemeToggle.tsx` | Toggle de tema (dark/light) |
| `UserRoleBadge.tsx` | Badge do papel do usuário |
| `CommandPalette.tsx` | Command palette (Ctrl+K) |
| `KeyboardShortcutsProvider.tsx` | Provider de atalhos |
| `Breadcrumbs.tsx` | Breadcrumbs de navegação |
| `NavLink.tsx` | Link de navegação |

### Navegação Mobile

| Componente | Descrição |
|---|---|
| `MobileNavigation.tsx` | Navegação mobile |
| `MobileComponents.tsx` | Componentes mobile |
| `MobileDrawer.tsx` | Drawer mobile |
| `MobilePageHeader.tsx` | Header mobile |

---

## 36. Componentes Compartilhados

| Componente | Descrição |
|---|---|
| `ContextMenu.tsx` | Menu de contexto |
| `DeleteConfirmDialog.tsx` | Dialog de confirmação de exclusão |
| `EmptyState.tsx` | Estado vazio genérico |
| `EmptyStateClients.tsx` | Estado vazio de clientes |
| `EmptyStateProducts.tsx` | Estado vazio de produtos |
| `ExportButton.tsx` | Botão de exportação |
| `FilterPopover.tsx` | Popover de filtros |
| `FloatingActionButton.tsx` | FAB flutuante |
| `ICPBadge.tsx` | Badge de ICP |
| `InfiniteScroll.tsx` | Scroll infinito |
| `StatusBadge.tsx` | Badge de status |
| `TablePagination.tsx` | Paginação de tabela |
| `Tooltip.tsx` | Tooltip customizado |
| `SmartFilters.tsx` | Filtros inteligentes |
| `SmartSuggestions.tsx` | Sugestões inteligentes |
| `BulkActions.tsx` | Ações em massa |
| `ImportDropzone.tsx` | Dropzone de importação |
| `ExportButton.tsx` (export) | Exportação de dados |

### Formulários

| Componente | Descrição |
|---|---|
| `AutoSaveIndicator.tsx` | Indicador de auto-save |
| `FormField.tsx` | Campo de formulário |
| `MultiStepForm.tsx` | Formulário multi-etapas |

### Feedback

| Componente | Descrição |
|---|---|
| `EnhancedToast.tsx` | Toast aprimorado |
| `UndoToast.tsx` | Toast com undo |

---

## 37. Acessibilidade

| Componente | Descrição |
|---|---|
| `FocusTrap.tsx` | Trap de foco em modais |
| `KeyboardNavigation.tsx` | Navegação por teclado |
| `LiveRegion.tsx` | ARIA live region |
| `ReducedMotion.tsx` | Respeitar reduced motion |
| `SkipLinks.tsx` | Links de pular para conteúdo |
| `VisuallyHidden.tsx` | Conteúdo apenas para screen readers |

---

## 38. Performance & Otimização

| Componente / Técnica | Descrição |
|---|---|
| `LazyImage.tsx` | Carregamento preguiçoso de imagens |
| `VirtualizedList.tsx` | Lista virtualizada |
| `PageLoadingSkeleton.tsx` | Skeleton de carregamento de página |
| `SkeletonTransition.tsx` | Transição suave de skeleton |
| Lazy loading de páginas | Todas as 44 páginas são lazy-loaded |
| React Query cache | `staleTime: 2min`, `gcTime: 10min` |
| Code splitting | Vite com dynamic imports |
| `usePrefetch.ts` | Prefetch de dados |
| `useQueryPerformance.ts` | Monitor de performance |

---

## 39. Animações & Transições

| Componente | Descrição |
|---|---|
| `PageTransition.tsx` | Transição entre páginas (Framer Motion) |
| `AnimateOnScroll.tsx` | Animação ao scroll |
| `AnimacoesDemo.tsx` | Página de demonstração de animações |

**Rota demo:** `/animacoes`

---

## 40. PWA & Offline

| Componente | Descrição |
|---|---|
| `InstallPrompt.tsx` | Prompt de instalação PWA |
| `OfflineIndicator.tsx` | Indicador de status offline |
| `UpdatePrompt.tsx` | Prompt de atualização |
| `OfflineFallback.tsx` | Fallback offline |

**Hooks:** `usePWA.ts`, `useOnlineStatus.ts`

---

## 41. Tipos TypeScript

### 41.1 Tipos Principais (`src/types/index.ts`)

| Tipo | Descrição |
|---|---|
| `Deal` | Oportunidade de negócio no pipeline |
| `Client` | Cliente/empresa no sistema |
| `Activity` | Atividade/interação com cliente |
| `User` | Usuário do sistema |
| `PipelineStage` | Estágio do pipeline |
| `Pipeline` | Pipeline completo com estágios |
| `Product` | Produto do catálogo |
| `DealProduct` | Produto vinculado a deal |
| `Cadence` | Cadência de prospecção |
| `CadenceStep` | Etapa da cadência |
| `Achievement` | Conquista (gamificação) |
| `Goal` | Meta/objetivo |
| `Task` | Tarefa |
| `DateRange` | Intervalo de datas |
| `MetricData` | Dados de métrica |
| `FilterOptions` | Opções de filtro |
| `PaginationParams` | Parâmetros de paginação |
| `PaginatedResponse<T>` | Resposta paginada |
| `ApiResponse<T>` | Resposta de API |
| `ApiError` | Erro de API |

### 41.2 Tipos Auto-gerados

| Arquivo | Descrição |
|---|---|
| `src/integrations/supabase/types.ts` | Tipos do banco de dados (auto-gerado, read-only) |

---

## 42. Constantes do Sistema

**Arquivo:** `src/constants/index.ts`

| Constante | Valores |
|---|---|
| `CACHE_TIMES` | `STALE_TIME: 5min`, `GC_TIME: 10min`, `REFETCH_INTERVAL: 30min` |
| `RATE_LIMITS` | `REQUESTS_PER_HOUR: 100`, `WINDOW_MS: 1h` |
| `VALIDATION` | `MAX_STRING_LENGTH: 1000`, `MAX_ARRAY_SIZE: 100` |
| `PAGINATION` | `DEFAULT_PAGE_SIZE: 20`, `MAX_PAGE_SIZE: 100` |
| `DEAL_STATUS` | `draft`, `open`, `won`, `lost`, `cancelled` |
| `ACTIVITY_TYPE` | `call`, `email`, `meeting`, `task`, `note` |
| `TIMEOUTS` | `API_TIMEOUT: 30s`, `DEBOUNCE: 300ms`, `THROTTLE: 1s` |
| `ERROR_MESSAGES` | Mensagens de erro padronizadas em PT-BR |

---

## 43. Utilitários & Bibliotecas

### 43.1 Utilitários (`src/utils/`)

| Arquivo | Descrição |
|---|---|
| `csvExport.ts` | Exportação para CSV |
| `gamificationExport.ts` | Exportação de dados de gamificação |
| `performanceExport.ts` | Exportação de dados de performance |
| `reportDownload.ts` | Download de relatórios |

### 43.2 Bibliotecas (`src/lib/`)

| Arquivo | Descrição |
|---|---|
| `utils.ts` | Utilitários gerais (`cn()` para class merging) |
| `gamification.ts` | Lógica de gamificação (XP, níveis, cálculos) |
| `csvExporter.ts` | Exportador CSV |
| `excelExporter.ts` | Exportador Excel (xlsx) |
| `pdfExporter.ts` | Exportador PDF (jsPDF) |

---

## 44. Testes Automatizados

### 44.1 Testes de Hooks (17 testes)

| Teste | Hook testado |
|---|---|
| `useDemandForecast.test.tsx` | Previsão de demanda |
| `useFunnelData.test.ts` | Dados do funil |
| `useGamificationData.test.tsx` | Dados de gamificação |
| `useLeadRouting.test.ts` | Roteamento de leads |
| `useLeadScoring.test.ts` | Pontuação de leads |
| `useNextBestAction.test.ts` | Próxima melhor ação |
| `usePerformanceComparison.test.ts` | Comparação de performance |
| `usePipeline.test.ts` | Pipeline |
| `useProducts.test.ts` | Produtos |
| `useReportData.test.ts` | Dados de relatórios |
| `useSalesAssistant.test.ts` | Assistente de vendas |
| `useSalesData.test.ts` | Dados de vendas |
| `useSalesForecast.test.ts` | Previsão de vendas |
| `useSalespeople.test.ts` | Vendedores |
| `useSalespersonCoaching.test.ts` | Coaching |
| `useSuppliers.test.tsx` | Fornecedores |
| `useTasks.test.ts` | Tarefas |

### 44.2 Infraestrutura de Testes

| Arquivo | Descrição |
|---|---|
| `src/test/setup.ts` | Setup global (Vitest) |
| `src/test/test-utils.tsx` | Utilitários de teste |

**Framework:** Vitest + @testing-library/react

---

## 45. Design System (Tokens)

### 45.1 Tipografia

| Uso | Fonte |
|---|---|
| Display / Títulos | Sora, Space Grotesk |
| Body / Textos | Inter |
| Código / Mono | JetBrains Mono |

### 45.2 Paleta de Cores (HSL)

| Token | Valor (Light) | Uso |
|---|---|---|
| `--primary` | `262 83% 58%` | Electric Violet — cor primária |
| `--secondary` | `172 66% 45%` | Deep Teal — cor secundária |
| `--accent` | `185 90% 48%` | Neon Cyan — acentos |
| `--background` | `220 20% 97%` | Fundo principal |
| `--foreground` | `230 25% 12%` | Texto principal |
| `--card` | `0 0% 100%` | Fundo de cards |
| `--muted` | `220 15% 92%` | Elementos secundários |
| `--destructive` | `0 84% 60%` | Ações perigosas |
| `--success` | `152 76% 42%` | Sucesso |
| `--warning` | `38 95% 50%` | Aviso |
| `--info` | `200 95% 50%` | Informação |

### 45.3 Tokens de Gamificação

| Token | Uso |
|---|---|
| `--xp` | Cor de XP (roxo) |
| `--coins` | Moedas (dourado) |
| `--streak` | Streak (laranja) |
| `--rank-gold` / `--rank-silver` / `--rank-bronze` | Cores de ranking |

### 45.4 Tokens Especiais

| Token | Uso |
|---|---|
| `--live-pulse` | Indicadores em tempo real |
| `--online` / `--offline` / `--busy` | Status de presença |
| `--primary-glow` | Glow da cor primária |
| `--card-elevated` | Card elevado |

---

## 46. Rotas da Aplicação

### 46.1 Rotas Públicas

| Rota | Página | Descrição |
|---|---|---|
| `/auth` | `Auth.tsx` | Login/Cadastro |
| `/reset-password` | `ResetPassword.tsx` | Reset de senha |

### 46.2 Rotas Protegidas (Todas)

| Rota | Página | Acesso |
|---|---|---|
| `/` | `Index.tsx` | Todos |
| `/vendas` | `Vendas.tsx` | Todos |
| `/clientes` | `Clientes.tsx` | Todos |
| `/produtos` | `Produtos.tsx` | Todos |
| `/pipeline` | `Pipeline.tsx` | Todos |
| `/tarefas` | `Tarefas.tsx` | Todos |
| `/atividades` | `Atividades.tsx` | Todos |
| `/cadencias` | `Cadencias.tsx` | Todos |
| `/metas-atividades` | `MetasAtividades.tsx` | Todos |
| `/ranking` | `RankingCompetitivo.tsx` | Todos |
| `/configuracoes` | `Configuracoes.tsx` | Todos |
| `/notificacoes` | `Notificacoes.tsx` | Todos |
| `/sdr` | `SDRDashboard.tsx` | Todos |
| `/closer` | `CloserDashboard.tsx` | Todos |
| `/bi-vendedor` | `BIVendedor.tsx` | Todos |
| `/bi-sdr` | `BISDR.tsx` | Todos |
| `/bi-closer` | `BICloser.tsx` | Todos |
| `/desafios` | `DesafiosSemanais.tsx` | Todos |
| `/desafios-diarios` | `HistoricoDesafiosDiarios.tsx` | Todos |
| `/assistente` | `Assistente.tsx` | Todos |
| `/orcamentos` | `Orcamentos.tsx` | Todos |
| `/admin` | `AdminDashboard.tsx` | Todos |
| `/animacoes` | `AnimacoesDemo.tsx` | Todos |
| `/vendedor/:id` | `VendedorDashboard.tsx` | Todos |
| `/relatorios` | `Relatorios.tsx` | Admin/Manager |
| `/vendedores` | `Vendedores.tsx` | Admin/Manager |
| `/analytics` | `Analytics.tsx` | Admin/Manager |
| `/playbooks` | `Playbooks.tsx` | Admin/Manager |
| `/metas` | `Metas.tsx` | Admin/Manager |
| `/fonte-leads` | `FonteLeads.tsx` | Admin/Manager |
| `/relatorio-atividades` | `RelatorioAtividades.tsx` | Admin/Manager |
| `/times` | `Times.tsx` | Admin/Manager |
| `/bitrix24` | `Bitrix24.tsx` | Admin/Manager |
| `/portfolio` | `Portfolio.tsx` | Admin/Manager |
| `/icp` | `ICP.tsx` | Admin/Manager |
| `/bi-gestor` | `BIGestor.tsx` | Admin/Manager |
| `/previsao-demanda` | `PrevisaoDemanda.tsx` | Admin/Manager |
| `/fornecedores` | `Fornecedores.tsx` | Admin/Manager |
| `/comparador-precos` | `ComparadorPrecos.tsx` | Admin/Manager |
| `/assinatura-digital` | `AssinaturaDigital.tsx` | Admin/Manager |
| `/acesso-negado` | `AccessDenied.tsx` | Todos |
| `*` | `NotFound.tsx` | Todos |

---

## 47. Secrets & Variáveis de Ambiente

### 47.1 Secrets Configurados

| Secret | Uso |
|---|---|
| `BITRIX24_CLIENT_ID` | Client ID do Bitrix24 |
| `BITRIX24_CLIENT_SECRET` | Client Secret do Bitrix24 |
| `BITRIX24_DOMAIN` | Domínio do Bitrix24 |
| `ELEVENLABS_API_KEY` | API Key do ElevenLabs (TTS/STT) |
| `LOVABLE_API_KEY` | API Key do Lovable (IA) |
| `RESEND_API_KEY` | API Key do Resend (emails) |
| `VAPID_PRIVATE_KEY` | Chave privada VAPID (push) |
| `VAPID_PUBLIC_KEY` | Chave pública VAPID (push) |

### 47.2 Variáveis de Ambiente (Frontend)

| Variável | Uso |
|---|---|
| `VITE_SUPABASE_URL` | URL do backend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública |
| `VITE_SUPABASE_PROJECT_ID` | ID do projeto |

---

## 48. Resumo Quantitativo

| Métrica | Quantidade |
|---|---|
| 📄 Páginas | **44** |
| ⚡ Edge Functions | **25** |
| 🧩 Componentes (total) | **~250+** |
| 🪝 Hooks customizados | **~130+** |
| 🌐 Contextos globais | **1** (AuthContext) |
| 📊 Tabelas no banco | **55+** |
| 🔧 Funções no banco (DB) | **5+** |
| 🧪 Testes automatizados | **17** |
| 🎨 Componentes UI (Shadcn) | **60+** |
| 📚 Tipos TypeScript | **1 arquivo principal + auto-gerados** |
| 🛠️ Utilitários | **4** |
| 📦 Bibliotecas de negócio | **5** |
| 🔐 Secrets configurados | **8** |
| 🛣️ Rotas da aplicação | **44** (2 públicas + 42 protegidas) |
| 🎮 Sistema de Gamificação | XP, Níveis, Conquistas, Streaks, Desafios, Rankings |
| 🤖 IA Integrada | Assistente de vendas, Coaching, Next Best Action, Lead Scoring |
| 📱 Mobile | Componentes responsivos, navegação mobile, PWA |
| ♿ Acessibilidade | 6 componentes dedicados |
| 🔒 Segurança | MFA, Passkeys, IP blocking, Geoblocking, Rate limiting |

---

> **Documento gerado em 24/02/2026**  
> **Total de funcionalidades mapeadas: ~400+**  
> **Nenhuma funcionalidade foi omitida.** ✅
