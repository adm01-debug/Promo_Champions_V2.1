# 📊 MAPEAMENTO COMPLETO DE FUNCIONALIDADES - SALESPRO CRM

## Última Atualização: Janeiro 2026

---

## 🎯 RESUMO EXECUTIVO

| Perfil | Foco Principal | Páginas | Funcionalidades Exclusivas |
|--------|----------------|---------|---------------------------|
| **Admin** | Gestão Total | 41 | Configurações, Usuários, Integrações |
| **Manager** | Gestão de Equipe | 35 | Metas, Relatórios, Analytics |
| **SDR** | Prospecção | 18 | Cadências, Qualificação, SLA |
| **Closer** | Fechamento | 20 | Vendas, Propostas, Assinaturas |

---

## 📱 PÁGINAS DO SISTEMA (41 total)

### 🔴 ADMIN ONLY (6 páginas)
| Página | Rota | Descrição | Hooks Utilizados |
|--------|------|-----------|------------------|
| AdminDashboard | `/admin` | Painel administrativo completo | useUserRoles, useAuditLog |
| Bitrix24 | `/bitrix24` | Integração CRM externo | useBitrix24 |
| Configuracoes | `/configuracoes` | Settings do sistema | useNotificationPreferences |
| Fornecedores | `/fornecedores` | Gestão de fornecedores | useSuppliers |
| ComparadorPrecos | `/comparador-precos` | Comparação de preços | usePriceHistory |
| AnimacoesDemo | `/animacoes` | Demo de animações UI | - |

### 🟣 MANAGER + ADMIN (12 páginas)
| Página | Rota | Descrição | Hooks Utilizados |
|--------|------|-----------|------------------|
| Index (Dashboard) | `/` | Dashboard principal | useDashboardKPIs, useGoalsDashboard |
| BIGestor | `/bi-gestor` | Business Intelligence gestão | useBIGestor |
| Vendedores | `/vendedores` | Gestão de vendedores | useSalespeople, useCompetitiveRanking |
| Times | `/times` | Gestão de equipes | useTeams |
| Metas | `/metas` | Definição de metas | useGoals |
| Portfolio | `/portfolio` | Gestão de portfólio | useClientPortfolio, usePortfolioSettings |
| ICP | `/icp` | Perfil Ideal de Cliente | useICPData |
| Playbooks | `/playbooks` | Scripts de vendas | usePlaybooks |
| FonteLeads | `/fonte-leads` | Análise de fontes | useLeadSourceAnalysis |
| Analytics | `/analytics` | Analytics avançado | useAnalytics, useConversionAnalysis |
| Relatorios | `/relatorios` | Relatórios gerenciais | useReportData |
| RelatorioAtividades | `/relatorio-atividades` | Relatório de atividades | useSalespersonActivityReport |
| PrevisaoDemanda | `/previsao-demanda` | Forecast de demanda | useDemandForecast |

### 🔵 SDR (Prospecção - 18 páginas)
| Página | Rota | Descrição | Hooks Utilizados |
|--------|------|-----------|------------------|
| SDRDashboard | `/sdr` | Dashboard SDR | useSDRMetrics, useSDRAlertNotifications |
| BIVendedor | `/bi-vendedor` | BI pessoal | useBIVendedor |
| Pipeline | `/pipeline` | Kanban de deals | usePipeline, useOptimisticPipelineUpdate |
| Cadencias | `/cadencias` | Sequências de contato | useCadences |
| Atividades | `/atividades` | Registro de atividades | useActivities |
| MetasAtividades | `/metas-atividades` | Metas de atividades | useActivityGoals |
| Clientes | `/clientes` | Base de clientes | useClients, useBuscaFulltext |
| Tarefas | `/tarefas` | Gestão de tarefas | useTasks, useStagnantTasks |
| Assistente | `/assistente` | IA assistente | useSalesAssistant, useElevenLabsVoice |
| RankingCompetitivo | `/ranking` | Ranking gamificado | useCompetitiveRanking |
| DesafiosSemanais | `/desafios` | Desafios semanais | useWeeklyChallenges |
| HistoricoDesafiosDiarios | `/desafios-diarios` | Desafios diários | useDailyChallenges |
| Notificacoes | `/notificacoes` | Central de notificações | useNotifications, useAlerts |

### 🟢 CLOSER (Fechamento - 20 páginas)
| Página | Rota | Descrição | Hooks Utilizados |
|--------|------|-----------|------------------|
| CloserDashboard | `/closer` | Dashboard Closer | useCloserMetrics, useClosingTime |
| BIVendedor | `/bi-vendedor` | BI pessoal | useBIVendedor |
| Pipeline | `/pipeline` | Kanban de deals | usePipeline, useDealProbability |
| Cadencias | `/cadencias` | Sequências de follow-up | useCadences |
| Vendas | `/vendas` | Gestão de vendas | useSalesData, useDeals |
| Atividades | `/atividades` | Registro de atividades | useActivities |
| MetasAtividades | `/metas-atividades` | Metas de atividades | useActivityGoals |
| Clientes | `/clientes` | Base de clientes | useClients |
| Tarefas | `/tarefas` | Gestão de tarefas | useTasks |
| AssinaturaDigital | `/assinatura-digital` | Assinatura de contratos | useDigitalSignatures |
| Assistente | `/assistente` | IA assistente | useSalesAssistant |
| RankingCompetitivo | `/ranking` | Ranking gamificado | useCompetitiveRanking |
| DesafiosSemanais | `/desafios` | Desafios semanais | useWeeklyChallenges |
| HistoricoDesafiosDiarios | `/desafios-diarios` | Desafios diários | useDailyChallenges |
| Notificacoes | `/notificacoes` | Central de notificações | useNotifications |

---

## 🧩 COMPONENTES POR CATEGORIA

### 📊 ANALYTICS (25 componentes)
| Componente | Descrição | Perfis |
|------------|-----------|--------|
| SalesVelocityCard | Métricas de velocidade | Manager, Admin |
| PredictiveScoringCard | Score preditivo IA | Manager, Admin |
| WinLossAnalysisCard | Análise win/loss | Manager, Admin |
| ForecastAccuracyCard | Precisão de forecast | Manager, Admin |
| RevenueIntelligenceCard | Inteligência de receita | Manager, Admin |
| CustomerHealthCard | Saúde do cliente | Manager, Admin |
| CompetitiveWinRateCard | Win rate competitivo | Manager, Admin |
| TerritoryManagementCard | Gestão de territórios | Manager, Admin |
| ABCAnalysis | Análise ABC de clientes | Manager, Admin |
| ChurnPrediction | Previsão de churn | Manager, Admin |
| ConversionFunnel | Funil de conversão | Todos |
| DemandForecast | Previsão de demanda | Manager, Admin |
| LeadSLAMonitor | Monitor de SLA | SDR, Manager, Admin |
| LeadSourceDistribution | Distribuição de leads | Manager, Admin |
| ObjectionsLibrary | Biblioteca de objeções | Todos |
| PerformanceComparison | Comparação de performance | Manager, Admin |
| SalesForecast | Previsão de vendas | Manager, Admin |
| DealVelocityChart | Velocidade de deals | Manager, Admin |
| ClosingTimeChart | Tempo de fechamento | Closer, Manager, Admin |
| ActivityTrendChart | Tendência de atividades | Todos |
| ActivityVolumeChart | Volume de atividades | Todos |
| ActivityOutcomesChart | Resultados de atividades | Todos |
| CoachingComparison | Comparação de coaching | Manager, Admin |
| SalespersonCoaching | Coaching individual | Manager, Admin |
| EmailMetricsDashboard | Métricas de email | SDR, Closer |

### 🎮 GAMIFICATION (15 componentes)
| Componente | Descrição | Perfis |
|------------|-----------|--------|
| CompetitiveStatusBar | Barra de status competitivo | Todos |
| CompetitiveLeaderboard | Leaderboard competitivo | Todos |
| WeeklyChallengesCard | Card de desafios semanais | Todos |
| DailyChallengesCard | Card de desafios diários | Todos |
| StreakWidget | Widget de sequência | Todos |
| XPBar | Barra de experiência | Todos |
| ProgressRing | Anel de progresso | Todos |
| BadgeDisplay | Exibição de badges | Todos |
| AchievementCard | Card de conquistas | Todos |
| LevelBadge | Badge de nível | Todos |
| CollaborativeMissionsCard | Missões colaborativas | Todos |
| RewardsMarketplaceCard | Marketplace de recompensas | Todos |
| SeasonalTournamentsCard | Torneios sazonais | Todos |
| StreakCounter | Contador de sequência | Todos |
| PointsDisplay | Exibição de pontos | Todos |

### 📞 SDR ESPECÍFICO (12 componentes)
| Componente | Descrição |
|------------|-----------|
| SDRDashboardContent | Conteúdo do dashboard SDR |
| SDRMetricsGrid | Grid de métricas SDR |
| SDRLeadQueue | Fila de leads |
| SDRActivityFeed | Feed de atividades |
| SDRAlertPanel | Painel de alertas |
| CadenceBuilder | Construtor de cadências |
| CadenceStepEditor | Editor de etapas |
| CadenceTimeline | Timeline de cadência |
| ProspectCard | Card de prospecto |
| QualificationForm | Formulário de qualificação |
| LeadScoreIndicator | Indicador de score |
| SLACountdown | Countdown de SLA |

### 🤝 CLOSER ESPECÍFICO (10 componentes)
| Componente | Descrição |
|------------|-----------|
| CloserDashboardContent | Conteúdo do dashboard Closer |
| CloserMetricsGrid | Grid de métricas Closer |
| CloserStatCard | Card de estatísticas |
| DealNegotiationPanel | Painel de negociação |
| ProposalBuilder | Construtor de propostas |
| ContractViewer | Visualizador de contratos |
| SignatureCanvas | Canvas de assinatura |
| WinLossModal | Modal de resultado |
| ClosingProbability | Probabilidade de fechamento |
| DealValueCalculator | Calculadora de valor |

### 🏢 GESTÃO (18 componentes)
| Componente | Descrição | Perfis |
|------------|-----------|--------|
| TeamManagementPanel | Painel de gestão de times | Manager, Admin |
| SalespersonTable | Tabela de vendedores | Manager, Admin |
| GoalSettingForm | Formulário de metas | Manager, Admin |
| PerformanceMatrix | Matriz de performance | Manager, Admin |
| CoachingDashboard | Dashboard de coaching | Manager, Admin |
| PortfolioManager | Gerenciador de portfólio | Manager, Admin |
| ICPConfigurator | Configurador de ICP | Manager, Admin |
| PlaybookEditor | Editor de playbooks | Manager, Admin |
| LeadRoutingConfig | Configuração de roteamento | Manager, Admin |
| ReportBuilder | Construtor de relatórios | Manager, Admin |
| ExportManager | Gerenciador de exportação | Manager, Admin |
| BulkActionsBar | Barra de ações em massa | Manager, Admin |
| UserRoleManager | Gerenciador de roles | Admin |
| AuditLogViewer | Visualizador de audit log | Admin |
| SecuritySettings | Configurações de segurança | Admin |
| IntegrationPanel | Painel de integrações | Admin |
| SystemHealthMonitor | Monitor de saúde do sistema | Admin |
| BackupManager | Gerenciador de backup | Admin |

### 🔧 COMPONENTES COMPARTILHADOS (45+ componentes)
| Categoria | Componentes |
|-----------|-------------|
| **Dashboard** | StatCard, SalesChart, FunnelChart, GoalProgress, RecentDeals, KPIGrid, AlertsPanel |
| **Pipeline** | KanbanBoard, DealCard, StageColumn, DragDropContext, QuickActions |
| **Clientes** | ClientTable, ClientCard, ClientForm, ClientDetails, ContactList |
| **Atividades** | ActivityList, ActivityForm, ActivityTimeline, CallLogger, MeetingScheduler |
| **Tarefas** | TaskList, TaskCard, TaskForm, TaskPriority, TaskReminder |
| **UI** | Button, Card, Dialog, Dropdown, Input, Select, Table, Tabs, Toast, etc. |

---

## 🔄 HOOKS POR FUNCIONALIDADE (130+ hooks)

### 📊 Analytics & BI
| Hook | Descrição | Perfis |
|------|-----------|--------|
| useDashboardKPIs | KPIs do dashboard | Todos |
| useBIVendedor | BI individual | SDR, Closer |
| useBIGestor | BI gerencial | Manager, Admin |
| useSalesVelocity | Velocidade de vendas | Manager, Admin |
| usePredictiveDealScoring | Score preditivo | Manager, Admin |
| useForecastAccuracy | Precisão de forecast | Manager, Admin |
| useRevenueIntelligence | Inteligência de receita | Manager, Admin |
| useCustomerHealthScore | Saúde do cliente | Manager, Admin |
| useCompetitiveWinRate | Win rate competitivo | Manager, Admin |
| useTerritoryManagement | Gestão de territórios | Manager, Admin |
| useWinLossAnalysisDetailed | Análise win/loss | Manager, Admin |
| useConversionAnalysis | Análise de conversão | Manager, Admin |
| useChurnPrediction | Previsão de churn | Manager, Admin |
| useDemandForecast | Previsão de demanda | Manager, Admin |

### 🎮 Gamificação
| Hook | Descrição | Perfis |
|------|-----------|--------|
| useCompetitiveRanking | Ranking competitivo | Todos |
| useWeeklyChallenges | Desafios semanais | Todos |
| useDailyChallenges | Desafios diários | Todos |
| useAchievements | Conquistas | Todos |
| useSalespersonXP | XP do vendedor | Todos |
| useLevelUpCelebration | Celebração de level up | Todos |
| useCollaborativeMissions | Missões colaborativas | Todos |
| useRewardsMarketplace | Marketplace de recompensas | Todos |
| useSeasonalTournaments | Torneios sazonais | Todos |
| useCelebration | Celebrações | Todos |
| useDailyStreakAchievements | Conquistas de sequência | Todos |

### 📞 SDR
| Hook | Descrição |
|------|-----------|
| useSDRMetrics | Métricas SDR |
| useSDRAlertNotifications | Alertas SDR |
| useLeadScoring | Score de leads |
| useLeadSLA | SLA de leads |
| useLeadRouting | Roteamento de leads |
| useCadences | Cadências |
| useNextBestAction | Próxima melhor ação |

### 🤝 Closer
| Hook | Descrição |
|------|-----------|
| useCloserMetrics | Métricas Closer |
| useClosingTime | Tempo de fechamento |
| useDealProbability | Probabilidade de deal |
| useDigitalSignatures | Assinaturas digitais |
| useDealVelocity | Velocidade de deals |
| useDealTimeline | Timeline de deals |

### 🏢 Gestão
| Hook | Descrição |
|------|-----------|
| useGoals | Metas |
| useGoalsDashboard | Dashboard de metas |
| useTeams | Times |
| useSalespeople | Vendedores |
| usePlaybooks | Playbooks |
| useClientPortfolio | Portfólio de clientes |
| useICPData | Dados ICP |
| useReportData | Dados de relatórios |
| useSalespersonActivityReport | Relatório de atividades |
| usePerformanceComparison | Comparação de performance |
| useSalespersonCoaching | Coaching |

### 🔐 Segurança (Admin)
| Hook | Descrição |
|------|-----------|
| useUserRoles | Roles de usuário |
| usePermissions | Permissões |
| useAuditLog | Log de auditoria |
| useIPBlocking | Bloqueio de IP |
| useRateLimit | Rate limiting |
| useMFA | Autenticação 2 fatores |
| useSessionManagement | Gestão de sessões |
| useLoginRateLimiter | Limitador de login |

---

## 🗂️ ESTRUTURA DE ACESSO POR PERFIL

### 🔴 ADMIN
```
├── 📊 Dashboards
│   ├── Dashboard Principal (/)
│   ├── BI Gestão (/bi-gestor)
│   └── Admin Dashboard (/admin)
├── 👥 Gestão de Pessoas
│   ├── Vendedores (/vendedores)
│   ├── Times (/times)
│   └── Roles & Permissões
├── 🎯 Metas & Objetivos
│   ├── Metas (/metas)
│   ├── Portfólio (/portfolio)
│   └── ICP (/icp)
├── 📈 Analytics & Relatórios
│   ├── Analytics (/analytics)
│   ├── Relatórios (/relatorios)
│   ├── Previsão de Demanda (/previsao-demanda)
│   └── Fonte de Leads (/fonte-leads)
├── 🔧 Configurações
│   ├── Configurações (/configuracoes)
│   ├── Integrações (/bitrix24)
│   ├── Segurança
│   └── Audit Logs
└── 🎮 Gamificação
    ├── Ranking (/ranking)
    └── Desafios
```

### 🟣 MANAGER
```
├── 📊 Dashboards
│   ├── Dashboard Principal (/)
│   └── BI Gestão (/bi-gestor)
├── 👥 Gestão de Equipe
│   ├── Vendedores (/vendedores)
│   ├── Times (/times)
│   └── Coaching
├── 🎯 Metas & Planejamento
│   ├── Metas (/metas)
│   ├── Portfólio (/portfolio)
│   ├── ICP (/icp)
│   └── Playbooks (/playbooks)
├── 📈 Analytics
│   ├── Analytics (/analytics)
│   ├── Relatórios (/relatorios)
│   └── Fonte de Leads (/fonte-leads)
└── 🎮 Gamificação
    ├── Ranking (/ranking)
    └── Desafios
```

### 🔵 SDR
```
├── 📊 Dashboard
│   ├── SDR Dashboard (/sdr)
│   └── Meu BI (/bi-vendedor)
├── 📞 Prospecção
│   ├── Pipeline (/pipeline)
│   ├── Cadências (/cadencias)
│   ├── Clientes (/clientes)
│   └── Tarefas (/tarefas)
├── 📝 Atividades
│   ├── Atividades (/atividades)
│   └── Metas Atividades (/metas-atividades)
├── 🤖 Assistente
│   └── Assistente IA (/assistente)
├── 🔔 Notificações
│   └── Central (/notificacoes)
└── 🎮 Gamificação
    ├── Ranking (/ranking)
    ├── Desafios Semanais (/desafios)
    └── Desafios Diários (/desafios-diarios)
```

### 🟢 CLOSER
```
├── 📊 Dashboard
│   ├── Closer Dashboard (/closer)
│   └── Meu BI (/bi-vendedor)
├── 💰 Fechamento
│   ├── Vendas (/vendas)
│   ├── Pipeline (/pipeline)
│   └── Assinatura Digital (/assinatura-digital)
├── 📞 Prospecção (compartilhado)
│   ├── Cadências (/cadencias)
│   ├── Clientes (/clientes)
│   └── Tarefas (/tarefas)
├── 📝 Atividades
│   ├── Atividades (/atividades)
│   └── Metas Atividades (/metas-atividades)
├── 🤖 Assistente
│   └── Assistente IA (/assistente)
├── 🔔 Notificações
│   └── Central (/notificacoes)
└── 🎮 Gamificação
    ├── Ranking (/ranking)
    ├── Desafios Semanais (/desafios)
    └── Desafios Diários (/desafios-diarios)
```

---

## 📋 FUNCIONALIDADES DESABILITADAS (Para Integração Futura)

| Funcionalidade | Motivo | Projeto de Destino |
|----------------|--------|-------------------|
| Produtos | Módulo separado | Projeto Produtos |
| Fornecedores | Módulo separado | Projeto Produtos |
| Comparador de Preços | Módulo separado | Projeto Produtos |
| Previsão de Demanda de Produtos | Módulo separado | Projeto Produtos |

---

## 🔒 TABELAS SUPABASE POR MÓDULO

### Core (Todos)
- `sales`, `clients`, `activities`, `tasks`, `salespeople`

### SDR
- `cadences`, `cadence_steps`, `cadence_tasks`, `prospect_cadences`
- `lead_scores`, `lead_routing_log`

### Closer
- `deals`, `deal_outcomes`, `deal_stage_history`
- `digital_signatures`, `document_signers`

### Gamificação
- `achievements`, `weekly_challenges`, `daily_challenges`
- `challenge_progress`, `daily_challenge_progress`
- `daily_streak_achievements`

### Gestão
- `sales_goals`, `activity_goals`, `teams`
- `client_portfolio`, `icp_data`, `playbooks`, `playbook_items`

### Segurança
- `user_roles`, `permissions`, `role_permissions`
- `login_attempts`, `active_sessions`, `blocked_ips`
- `audit_logs`, `access_denied_logs`

---

## 📊 ESTATÍSTICAS DO SISTEMA

| Métrica | Quantidade |
|---------|------------|
| Páginas | 41 |
| Componentes | ~250+ |
| Hooks | 130+ |
| Tabelas Supabase | 61 |
| Edge Functions | 25 |
| Migrações | 61 |

---

*Documento gerado automaticamente - SalesPro CRM v1.0*
