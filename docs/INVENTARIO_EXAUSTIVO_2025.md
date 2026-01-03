# 📦 INVENTÁRIO EXAUSTIVO DO PROJETO SALESPRO CRM

**Data da Análise:** 03/01/2025  
**Contexto:** Projeto desenvolvido em parceria Claude (Anthropic) + Lovable  
**Status:** Análise completa de todos os diretórios e arquivos

---

## 📊 RESUMO EXECUTIVO

| Categoria | Quantidade |
|-----------|------------|
| **Páginas (src/pages)** | 41 |
| **Componentes (src/components)** | ~250+ |
| **Hooks Customizados (src/hooks)** | 130+ |
| **Edge Functions (supabase/functions)** | 25 |
| **Migrations (supabase/migrations)** | 61 |
| **Testes E2E (e2e)** | 4 arquivos |
| **Testes Unitários (hooks/__tests__)** | 15 arquivos |
| **Documentação (docs)** | 16 arquivos |
| **Scripts de Automação** | 4 arquivos |
| **Arquivos de Melhoria (improvements)** | 60+ |

---

## 🏗️ ESTRUTURA RAIZ DO PROJETO

```
salespro-crm/
├── .github/                    # GitHub Actions
├── .lovable/                   # Configuração Lovable
├── docs/                       # Documentação
├── e2e/                        # Testes End-to-End
├── improvements/               # Melhorias planejadas (Claude)
├── improvements-180/           # Melhorias adicionais (Claude)
├── node_modules/               # Dependências
├── public/                     # Assets públicos
├── scripts/                    # Scripts de automação
├── src/                        # Código fonte
├── supabase/                   # Backend Supabase
├── .env                        # Variáveis de ambiente
├── .env.example                # Exemplo de variáveis
├── .gitignore                  # Git ignore
├── README.md                   # README principal
├── README_LOVABLE.md           # README Lovable
├── bun.lock                    # Lock Bun
├── bun.lockb                   # Lock Bun binário
├── components.json             # Config shadcn/ui
├── eslint.config.js            # Config ESLint
├── index.html                  # HTML principal
├── package.json                # Dependências npm
├── package-lock.json           # Lock npm
├── playwright.config.ts        # Config Playwright
├── postcss.config.js           # Config PostCSS
├── tailwind.config.ts          # Config Tailwind
├── tsconfig.json               # Config TypeScript
├── tsconfig.app.json           # Config TS App
├── tsconfig.node.json          # Config TS Node
└── vite.config.ts              # Config Vite
```

---

## 📁 DIRETÓRIO: src/

### 📄 Arquivos Raiz
- `App.css` - Estilos globais
- `App.tsx` - Componente principal
- `index.css` - CSS principal com design system
- `main.tsx` - Entry point
- `tailwind.config.lov.json` - Config Lovable Tailwind
- `vite-env.d.ts` - Tipos Vite

---

## 📱 PÁGINAS (src/pages/) - 41 arquivos

| Arquivo | Descrição |
|---------|-----------|
| `AccessDenied.tsx` | Página de acesso negado |
| `AdminDashboard.tsx` | Dashboard administrativo |
| `Analytics.tsx` | Página de analytics |
| `AnimacoesDemo.tsx` | Demo de animações |
| `AssinaturaDigital.tsx` | Assinaturas digitais |
| `Assistente.tsx` | Assistente IA de vendas |
| `Atividades.tsx` | Gestão de atividades |
| `Auth.tsx` | Autenticação |
| `BIGestor.tsx` | BI para gestores |
| `BIVendedor.tsx` | BI para vendedores |
| `Bitrix24.tsx` | Integração Bitrix24 |
| `Cadencias.tsx` | Gestão de cadências |
| `Clientes.tsx` | Gestão de clientes |
| `CloserDashboard.tsx` | Dashboard de closers |
| `ComparadorPrecos.tsx` | Comparador de preços |
| `Configuracoes.tsx` | Configurações gerais |
| `DesafiosSemanais.tsx` | Desafios semanais |
| `FonteLeads.tsx` | Fonte de leads |
| `Fornecedores.tsx` | Gestão de fornecedores |
| `HistoricoDesafiosDiarios.tsx` | Histórico de desafios |
| `ICP.tsx` | Ideal Customer Profile |
| `Index.tsx` | Dashboard principal |
| `Metas.tsx` | Gestão de metas |
| `MetasAtividades.tsx` | Metas de atividades |
| `NotFound.tsx` | Página 404 |
| `Notificacoes.tsx` | Central de notificações |
| `Pipeline.tsx` | Pipeline de vendas |
| `Playbooks.tsx` | Playbooks de vendas |
| `Portfolio.tsx` | Portfólio de clientes |
| `PrevisaoDemanda.tsx` | Previsão de demanda |
| `Produtos.tsx` | Gestão de produtos |
| `RankingCompetitivo.tsx` | Ranking competitivo |
| `RelatorioAtividades.tsx` | Relatório de atividades |
| `Relatorios.tsx` | Central de relatórios |
| `ResetPassword.tsx` | Reset de senha |
| `SDRDashboard.tsx` | Dashboard SDR |
| `Tarefas.tsx` | Gestão de tarefas |
| `Times.tsx` | Gestão de times |
| `Vendas.tsx` | Gestão de vendas |
| `VendedorDashboard.tsx` | Dashboard vendedor |
| `Vendedores.tsx` | Gestão de vendedores |

---

## 🧩 COMPONENTES (src/components/) - 60+ pastas

### 📂 a11y/ (Acessibilidade)
- `SkipLinks.tsx` - Links de navegação rápida
- `index.ts`

### 📂 achievements/ (Conquistas)
- `AchievementComparisonChart.tsx`
- `AchievementTrendChart.tsx`
- `AchievementsHistory.tsx`
- `StreakRanking.tsx`
- `TeamAchievementStats.tsx`

### 📂 activities/ (Atividades)
- `ActivityGoalCard.tsx`
- `ActivityGoalEditDialog.tsx`
- `ActivityList.tsx`
- `ActivityLogForm.tsx`
- `ActivityStats.tsx`
- `DailyActivityRanking.tsx`

### 📂 ai/ (Inteligência Artificial)
- `AIAssistant.tsx`
- `index.ts`

### 📂 analytics/ (Analytics) - 29 arquivos
- `ABCAnalysis.tsx`
- `ActivityOutcomesChart.tsx`
- `ActivityTrendChart.tsx`
- `ActivityVolumeChart.tsx`
- `ChurnPrediction.tsx`
- `ClosingTimeChart.tsx`
- `CoachingComparison.tsx`
- `ConversionAnalysis.tsx`
- `ConversionFunnel.tsx`
- `DealVelocityChart.tsx`
- `DemandForecast.tsx`
- `DemandForecastDashboard.tsx`
- `EmailMetricsDashboard.tsx`
- `InsightComponents.tsx`
- `KPIComponents.tsx`
- `LeadSLAMonitor.tsx`
- `LeadSourceDistribution.tsx`
- `LeadSourceMetrics.tsx`
- `LeadSourceTrendChart.tsx`
- `ObjectionsLibrary.tsx`
- `PerformanceComparison.tsx`
- `ProductMix.tsx`
- `RevenueChart.tsx`
- `SalesForecast.tsx`
- `SalesPerformanceCard.tsx`
- `SalespersonActivityTable.tsx`
- `SalespersonCoaching.tsx`
- `TopProductsWidget.tsx`
- `WinLossAnalysis.tsx`
- `index.ts`

### 📂 assistant/ (Assistente IA)
- `DealChatHistory.tsx`
- `DealContextSelector.tsx`
- `DealPreviewCard.tsx`
- `SalesAssistantChat.tsx`
- `VoiceControls.tsx`

### 📂 audit/ (Auditoria)
- `AuditLog.tsx`
- `index.ts`

### 📂 auth/ (Autenticação)
- `PermissionGate.tsx`
- `ProtectedRoute.tsx`

### 📂 automation/ (Automação)
- `AutomationMonitor.tsx`
- `index.ts`

### 📂 cadence/ (Cadências)
- `CadenceTimeline.tsx`
- `index.ts`

### 📂 cadences/ (Cadências v2)
- `CadenceCard.tsx`
- `CreateCadenceDialog.tsx`
- `EnrollCadenceDialog.tsx`
- `TodaysCadenceTasks.tsx`

### 📂 calculators/ (Calculadoras)
- `CalculatorComponents.tsx`
- `index.ts`

### 📂 calendar/ (Calendário)
- `WeekCalendar.tsx`
- `index.ts`

### 📂 charts/ (Gráficos)
- `InteractiveChart.tsx`
- `LazyChart.tsx`
- `ProgressChart.tsx`
- `SparklineChart.tsx`
- `index.ts`

### 📂 chat/ (Chat)
- `ChatThread.tsx`
- `index.ts`

### 📂 clients/ (Clientes)
- `CreateClientDialog.tsx`
- `EditClientDialog.tsx`

### 📂 closer/ (Closers)
- `CloserPipeline.tsx`
- `CloserRevenueComparison.tsx`
- `CloserRevenueEvolution.tsx`
- `CloserStatCard.tsx`
- `RecentClosedDeals.tsx`
- `TopClosersRanking.tsx`

### 📂 coaching/ (Coaching)
- `CoachingCard.tsx`
- `index.ts`

### 📂 collaboration/ (Colaboração)
- `CommentSection.tsx`
- `index.ts`

### 📂 dashboard/ (Dashboard) - 21 arquivos
- `ActivityChart.tsx`
- `ActivityItem.tsx`
- `AlertsPanel.tsx`
- `ClientInfoCard.tsx`
- `CompactStatCard.tsx`
- `DashboardHeader.tsx`
- `EnhancedStatCard.tsx`
- `FunnelChart.tsx`
- `GoalProgress.tsx`
- `GoalProgressCard.tsx`
- `KPIGrid.tsx`
- `MetricsOverview.tsx`
- `PipelineOverview.tsx`
- `RecentDeals.tsx`
- `SalesChart.tsx`
- `SalesForecast.tsx`
- `StatCard.tsx`
- `StatCardCompact.tsx`
- `TimeRangePicker.tsx`
- `TopProducts.tsx`
- `index.ts`

### 📂 data/ (Dados)
- `FilterBar.tsx`
- `SortableHeader.tsx`
- `index.ts`

### 📂 debug/ (Debug)
- `CircuitBreakerDashboard.tsx`
- `CircuitBreakerTrendChart.tsx`
- `QueryPerformancePanel.tsx`

### 📂 error/ (Erros)
- `ErrorStates.tsx`
- `index.ts`

### 📂 errors/ (Boundaries de Erro)
- `ErrorBoundary.tsx`
- `PageErrorBoundary.tsx`
- `ProductionErrorBoundary.tsx`

### 📂 feedback/ (Feedback)
- `AnimatedProgress.tsx`
- `FeedbackComponents.tsx`
- `ProgressIndicator.tsx`
- `SuccessAnimation.tsx`
- `UndoToast.tsx`
- `index.ts`

### 📂 files/ (Arquivos)
- `FileList.tsx`
- `index.ts`

### 📂 flows/ (Fluxos)
- `FeedbackComponents.tsx`
- `OnboardingFlow.tsx`
- `StepIndicator.tsx`
- `TooltipTour.tsx`
- `WizardContainer.tsx`
- `index.ts`

### 📂 forms/ (Formulários)
- `DatePickerField.tsx`
- `FileUploadZone.tsx`
- `FormField.tsx`
- `MoneyInput.tsx`
- `SearchInput.tsx`
- `SelectField.tsx`
- `index.ts`

### 📂 gamification/ (Gamificação) - 30 arquivos
- `AchievementCard.tsx`
- `BadgeDisplay.tsx`
- `BadgesSystem.tsx`
- `CelebrationOverlayProvider.tsx`
- `CelebrationTestButtons.tsx`
- `CompetitiveLeaderboard.tsx`
- `CompetitiveStatusBar.tsx`
- `CreateChallengeDialog.tsx`
- `DailyChallengesCard.tsx`
- `GamificationCard.tsx`
- `GamificationComparativeChart.tsx`
- `GamificationExportButton.tsx`
- `GamificationProfileModal.tsx`
- `LeaderboardCard.tsx`
- `LevelBadge.tsx`
- `LevelUpOverlay.tsx`
- `PointsDisplay.tsx`
- `ProgressRing.tsx`
- `RealtimeXPRanking.tsx`
- `SalespersonLevelBadge.tsx`
- `StreakAchievementsCard.tsx`
- `StreakCounter.tsx`
- `StreakWidget.tsx`
- `WeeklyChallengesCard.tsx`
- `XPBar.tsx`
- `XPEvolutionChart.tsx`
- `XPHistoryTimeline.tsx`
- `XPMiniWidget.tsx`
- `XPProgressBar.tsx`
- `index.ts`

### 📂 goals/ (Metas)
- `CommissionCalculator.tsx`
- `GoalTracker.tsx`
- `GoalsLeaderboard.tsx`
- `SalespersonGoalCard.tsx`
- `TeamGoalProgress.tsx`
- `index.ts`

### 📂 import/ (Importação)
- `ImportWizard.tsx`
- `index.ts`

### 📂 integrations/ (Integrações)
- `AutomationComponents.tsx`
- `IntegrationCard.tsx`
- `SyncComponents.tsx`
- `index.ts`

### 📂 keyboard/ (Atalhos de Teclado)
- `CommandPalette.tsx`
- `KeyboardShortcuts.tsx`
- `index.ts`

### 📂 layout/ (Layout)
- `AppSidebar.tsx`
- `GlobalSearch.tsx`
- `MainLayout.tsx`
- `SlideOverPanel.tsx`
- `ThemeToggle.tsx`
- `UserRoleBadge.tsx`

### 📂 leads/ (Leads)
- `LeadsToolbar.tsx`

### 📂 mobile/ (Mobile)
- `FloatingActionButton.tsx`
- `MobileComponents.tsx`
- `MobileDrawer.tsx`
- `MobileNavigation.tsx`
- `PullToRefresh.tsx`
- `ResponsiveDialog.tsx`
- `ResponsiveTable.tsx`
- `SwipeableCard.tsx`
- `index.ts`

### 📂 navigation/ (Navegação)
- `Breadcrumbs.tsx`
- `index.ts`

### 📂 notifications/ (Notificações)
- `InAppAlert.tsx`
- `NotificationCenter.tsx`
- `NotificationDropdown.tsx`
- `NotificationList.tsx`
- `index.ts`

### 📂 onboarding/ (Onboarding)
- `FeatureTip.tsx`
- `OnboardingWizard.tsx`
- `index.ts`

### 📂 pipeline/ (Pipeline)
- `AtRiskDealsPanel.tsx`
- `DealCard.tsx`
- `DealTimeline.tsx`
- `PipelineBoard.tsx`
- `PipelineColumn.tsx`
- `StageColumn.tsx`

### 📂 playbooks/ (Playbooks)
- `DealPlaybookChecklist.tsx`
- `PlaybooksManager.tsx`

### 📂 portfolio/ (Portfólio)
- `AssignClientDialog.tsx`
- `AutoRouteDialog.tsx`
- `PerformanceRankingCard.tsx`
- `PortfolioStatsCards.tsx`
- `PortfolioTable.tsx`
- `RoutingHistoryTable.tsx`

### 📂 products/ (Produtos)
- `CreateProductDialog.tsx`
- `EditProductDialog.tsx`
- `InventoryCard.tsx`
- `ProductCard.tsx`
- `index.ts`

### 📂 pwa/ (PWA)
- `PWAComponents.tsx`
- `index.ts`

### 📂 reports/ (Relatórios)
- `ReportBuilder.tsx`
- `index.ts`

### 📂 sales/ (Vendas)
- `CreateSaleDialog.tsx`
- `DealCopilot.tsx`
- `DealRiskIndicator.tsx`
- `ProposalGenerator.tsx`
- `SalesPlaybook.tsx`
- `index.ts`

### 📂 sdr/ (SDR) - 11 arquivos
- `LeadTemperatureChart.tsx`
- `ProspectingFunnel.tsx`
- `RecentProspects.tsx`
- `SDRActivityTrend.tsx`
- `SDRAlertHistory.tsx`
- `SDRConversionEvolution.tsx`
- `SDRConversionRanking.tsx`
- `SDRStatCard.tsx`
- `SchedulingRateGauge.tsx`
- `TestSDRAlertButton.tsx`
- `TopSDRsRanking.tsx`

### 📂 search/ (Busca)
- `GlobalSearch.tsx`
- `KeyboardShortcuts.tsx`
- `index.ts`

### 📂 security/ (Segurança) - 15 arquivos
- `BlockedIPsPanel.tsx`
- `GeoBlockingManager.tsx`
- `IPWhitelistManager.tsx`
- `IPWhitelistPanel.tsx`
- `KnownDevices.tsx`
- `MFASetup.tsx`
- `MFAVerification.tsx`
- `PasskeySettings.tsx`
- `PasswordResetApproval.tsx`
- `PushNotificationSettings.tsx`
- `RateLimitDashboard.tsx`
- `ReauthDialog.tsx`
- `RoleManager.tsx`
- `SessionManager.tsx`
- `index.ts`

### 📂 settings/ (Configurações) - 12 arquivos
- `AccessDeniedLogs.tsx`
- `BrowserPushSettings.tsx`
- `PermissionMatrix.tsx`
- `PortfolioSettings.tsx`
- `RoleManagement.tsx`
- `SecurityAlertHistory.tsx`
- `SecurityAlertSettings.tsx`
- `SecurityAlertSoundSettings.tsx`
- `SettingsPanel.tsx`
- `SoundSettings.tsx`
- `SoundSettingsTabs.tsx`
- `index.ts`

### 📂 shared/ (Compartilhados) - 34 arquivos
- `AdvancedFilters.tsx`
- `BulkActionsToolbar.tsx`
- `BuscaAvancada.tsx`
- `CSVImporter.tsx`
- `ColumnVisibility.tsx`
- `ConfirmDialog.tsx`
- `DataList.tsx`
- `DataTable.tsx`
- `DeleteConfirmDialog.tsx`
- `EmptyState.tsx`
- `EmptyStateActivities.tsx`
- `EmptyStateClients.tsx`
- `EmptyStateNotifications.tsx`
- `EmptyStatePipeline.tsx`
- `EmptyStateProducts.tsx`
- `EmptyStateTasks.tsx`
- `EmptyStateTeams.tsx`
- `ExportButton.tsx`
- `FilterPopover.tsx`
- `HistoryPanel.tsx`
- `ICPBadge.tsx`
- `LoadingStates.tsx`
- `NotificationCenter.tsx`
- `OptimizedImage.tsx`
- `Pagination.tsx`
- `ProgressBar.tsx`
- `QuickFilters.tsx`
- `SavedFiltersDropdown.tsx`
- `SearchHighlight.tsx`
- `StatsCard.tsx`
- `StatusBadge.tsx`
- `TablePagination.tsx`
- `TableSkeleton.tsx`
- `Timeline.tsx`

### 📂 skeletons/ (Skeletons) - 7 arquivos
- `ComparadorPrecosSkeleton.tsx`
- `ComponentSkeletons.tsx`
- `DashboardSkeletons.tsx`
- `FornecedoresSkeleton.tsx`
- `PageLoadingSkeleton.tsx`
- `SkeletonTransition.tsx`
- `index.ts`

### 📂 tasks/ (Tarefas) - 9 arquivos
- `CreateTaskDialog.tsx`
- `DraggableTaskCard.tsx`
- `NextBestAction.tsx`
- `PriorityColumn.tsx`
- `RescheduleDialog.tsx`
- `TaskCard.tsx`
- `TaskListAdvanced.tsx`
- `TaskQueue.tsx`
- `index.ts`

### 📂 teams/ (Times)
- `CreateTeamDialog.tsx`
- `EditTeamDialog.tsx`
- `MemberList.tsx`
- `TeamCard.tsx`
- `index.ts`

### 📂 templates/ (Templates)
- `EmailTemplates.tsx`
- `index.ts`

### 📂 theme/ (Tema)
- `ThemeComponents.tsx`
- `index.ts`

### 📂 transitions/ (Transições)
- `MotionCard.tsx`
- `PageTransition.tsx`

### 📂 ui/ (shadcn/ui) - 52 arquivos
- `accordion.tsx`
- `alert-dialog.tsx`
- `alert.tsx`
- `aspect-ratio.tsx`
- `avatar.tsx`
- `badge.tsx`
- `breadcrumb.tsx`
- `button.tsx`
- `calendar.tsx`
- `card.tsx`
- `carousel.tsx`
- `chart.tsx`
- `checkbox.tsx`
- `collapsible.tsx`
- `command.tsx`
- `context-menu.tsx`
- `dialog.tsx`
- `drawer.tsx`
- `dropdown-menu.tsx`
- `enhanced-accordion.tsx`
- `form.tsx`
- `horizontal-scroll.tsx`
- `hover-card.tsx`
- `input-otp.tsx`
- `input.tsx`
- `label.tsx`
- `menubar.tsx`
- `navigation-menu.tsx`
- `pagination.tsx`
- `password-input.tsx`
- `password-strength.tsx`
- `popover.tsx`
- `progress.tsx`
- `radio-group.tsx`
- `resizable.tsx`
- `scroll-area.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`
- `sidebar.tsx`
- `skeleton.tsx`
- `slider.tsx`
- `sonner.tsx`
- `switch.tsx`
- `table.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `toast.tsx`
- `toaster.tsx`
- `toggle-group.tsx`
- `toggle.tsx`
- `tooltip.tsx`

### 📂 vendedores/ (Vendedores)
- `GoalEditDialog.tsx`
- `PeriodFilter.tsx`
- `SalesChart.tsx`
- `SalespersonForm.tsx`

### 📂 workflow/ (Workflow)
- `WorkflowBuilder.tsx`
- `index.ts`

### 📄 Componentes Raiz
- `BulkActionsBar.tsx`
- `DataImporter.tsx`
- `DuplicateButton.tsx`
- `ExportDropdown.tsx`
- `InfiniteScrollList.tsx`
- `NavLink.tsx`
- `VersionHistory.tsx`

---

## 🪝 HOOKS (src/hooks/) - 130+ arquivos

### 📂 __tests__/ (Testes) - 15 arquivos
- `useActivities.test.ts`
- `useClients.test.ts`
- `useDashboardKPIs.test.ts`
- `useDemandForecast.test.tsx`
- `useGamificationData.test.tsx`
- `usePerformanceComparison.test.ts`
- `usePipeline.test.ts`
- `useProducts.test.ts`
- `useRLSPolicies.test.ts`
- `useReportData.test.ts`
- `useSalesData.test.ts`
- `useSalesForecast.test.ts`
- `useSalespeople.test.ts`
- `useSuppliers.test.tsx`
- `useTasks.test.ts`

### 📂 cadences/ (Cadências)
- `index.ts`
- `useCadenceMutations.ts`
- `useCadenceQueries.ts`
- `useCadenceTaskMutations.ts`
- `useProspectCadenceMutations.ts`

### 📄 Hooks Principais (115+ arquivos)
| Hook | Descrição |
|------|-----------|
| `index.ts` | Exports principais |
| `use-mobile.tsx` | Detecção mobile |
| `use-toast.ts` | Sistema de toasts |
| `useABCAnalysis.ts` | Análise ABC |
| `useAchievementTrends.ts` | Tendências conquistas |
| `useAchievements.ts` | Sistema conquistas |
| `useAchievementsByPerson.ts` | Conquistas por pessoa |
| `useActivities.ts` | Gestão atividades |
| `useActivityGoals.ts` | Metas atividades |
| `useAlerts.ts` | Sistema alertas |
| `useAnalytics.ts` | Analytics gerais |
| `useAsync.ts` | Operações assíncronas |
| `useAtRiskDeals.ts` | Deals em risco |
| `useAuditLog.ts` | Log auditoria |
| `useBIGestor.ts` | BI gestores |
| `useBIVendedor.ts` | BI vendedores |
| `useBitrix24.ts` | Integração Bitrix |
| `useBulkActions.ts` | Ações em lote |
| `useBuscaFulltext.ts` | Busca fulltext |
| `useCRUD.ts` | Operações CRUD |
| `useCadences.ts` | Cadências |
| `useCelebration.ts` | Celebrações |
| `useChallengeProgressUpdater.ts` | Progresso desafios |
| `useChurnPrediction.ts` | Previsão churn |
| `useCircuitBreaker.ts` | Circuit breaker |
| `useCircuitBreakerHistory.ts` | Histórico CB |
| `useClientPortfolio.ts` | Portfólio clientes |
| `useClients.ts` | Gestão clientes |
| `useCloserMetrics.ts` | Métricas closer |
| `useClosingTime.ts` | Tempo fechamento |
| `useCompetitiveRanking.ts` | Ranking competitivo |
| `useContactsReal.ts` | Contatos reais |
| `useConversionAnalysis.ts` | Análise conversão |
| `useCopyToClipboard.ts` | Copiar clipboard |
| `useDailyChallenges.ts` | Desafios diários |
| `useDailyStreakAchievements.ts` | Streak diário |
| `useDashboardKPIs.ts` | KPIs dashboard |
| `useDealChatHistory.ts` | Histórico chat deal |
| `useDealProbability.ts` | Probabilidade deal |
| `useDealTimeline.ts` | Timeline deal |
| `useDealVelocity.ts` | Velocidade deal |
| `useDeals.ts` | Gestão deals |
| `useDealsReal.ts` | Deals reais |
| `useDebounce.ts` | Debounce |
| `useDemandForecast.ts` | Previsão demanda |
| `useDeviceDetection.ts` | Detecção device |
| `useDigitalSignatures.ts` | Assinaturas digitais |
| `useDuplicate.ts` | Duplicação |
| `useElevenLabsVoice.ts` | ElevenLabs voz |
| `useEmailMetrics.ts` | Métricas email |
| `useExportData.ts` | Exportação dados |
| `useFilter.ts` | Filtros |
| `useFormPersist.ts` | Persistência forms |
| `useFunnelData.ts` | Dados funil |
| `useGamificationData.ts` | Dados gamificação |
| `useGoals.ts` | Gestão metas |
| `useGoalsDashboard.ts` | Dashboard metas |
| `useHapticFeedback.ts` | Feedback háptico |
| `useICPData.ts` | Dados ICP |
| `useIPBlocking.ts` | Bloqueio IP |
| `useImportData.ts` | Importação dados |
| `useInfiniteScroll.ts` | Scroll infinito |
| `useIntersectionObserver.ts` | Intersection observer |
| `useInvalidateCache.ts` | Invalidar cache |
| `useKanbanShortcuts.ts` | Atalhos kanban |
| `useLeadRouting.ts` | Roteamento leads |
| `useLeadSLA.ts` | SLA leads |
| `useLeadScoring.ts` | Scoring leads |
| `useLeadSourceAnalysis.ts` | Análise fonte leads |
| `useLevelUpCelebration.ts` | Celebração level up |
| `useLocalStorage.ts` | LocalStorage |
| `useLoginRateLimiter.ts` | Rate limiter login |
| `useMFA.ts` | MFA |
| `useMediaQuery.ts` | Media query |
| `useMediaQueryHooks.ts` | Media query hooks |
| `useMetrics.ts` | Métricas gerais |
| `useNextBestAction.ts` | Próxima melhor ação |
| `useNotificationPreferences.ts` | Pref. notificações |
| `useNotifications.ts` | Notificações |
| `useObjectionsLibrary.ts` | Biblioteca objeções |
| `useOptimisticUpdate.ts` | Update otimista |
| `usePagination.ts` | Paginação |
| `usePerformanceComparison.ts` | Comparação performance |
| `usePermissions.ts` | Permissões |
| `usePipeline.ts` | Pipeline |
| `usePlaybooks.ts` | Playbooks |
| `usePortfolioSettings.ts` | Config portfólio |
| `usePrefetch.ts` | Prefetch |
| `usePriceHistory.ts` | Histórico preços |
| `useProducts.ts` | Produtos |
| `useProductsReal.ts` | Produtos reais |
| `usePushNotifications.ts` | Push notifications |
| `useQueryPerformance.ts` | Performance queries |
| `useRateLimit.ts` | Rate limiting |
| `useRealtime.ts` | Realtime |
| `useRealtimeSync.ts` | Sync realtime |
| `useReauthentication.ts` | Reautenticação |
| `useReportData.ts` | Dados relatórios |
| `useRestore.ts` | Restauração |
| `useRetryMutation.ts` | Retry mutation |
| `useSDRAlertNotifications.ts` | Alertas SDR |
| `useSDRAlertSoundSettings.ts` | Sons alertas SDR |
| `useSDRMetrics.ts` | Métricas SDR |
| `useSalesAssistant.ts` | Assistente vendas |
| `useSalesData.ts` | Dados vendas |
| `useSalesForecast.ts` | Previsão vendas |
| `useSalesRealtime.ts` | Vendas realtime |
| `useSalespeople.ts` | Vendedores |
| `useSalespersonActivityReport.ts` | Relatório atividades |
| `useSalespersonCoaching.ts` | Coaching vendedor |
| `useSalespersonXP.ts` | XP vendedor |
| `useSavedFilters.ts` | Filtros salvos |
| `useSearch.ts` | Busca |
| `useSecurityAlertNotifications.ts` | Alertas segurança |
| `useSecurityAlertSoundSettings.ts` | Sons segurança |
| `useSelection.ts` | Seleção |
| `useSessionManagement.ts` | Gestão sessão |
| `useSort.ts` | Ordenação |
| `useSorting.ts` | Ordenação v2 |
| `useSoundSettings.ts` | Config sons |
| `useStagnantTasks.ts` | Tarefas estagnadas |
| `useSupabaseRealtime.ts` | Supabase realtime |
| `useSuppliers.ts` | Fornecedores |
| `useSystemSoundSettings.ts` | Sons sistema |
| `useTableState.ts` | Estado tabela |
| `useTasks.ts` | Tarefas |
| `useTeamAchievementStats.ts` | Stats conquistas time |
| `useTeams.ts` | Times |
| `useTheme.ts` | Tema |
| `useUndoRedo.ts` | Undo/Redo |
| `useUserRoles.ts` | Roles usuário |
| `useUsers.ts` | Usuários |
| `useVersions.ts` | Versionamento |
| `useWebAuthn.ts` | WebAuthn |
| `useWeeklyChallenges.ts` | Desafios semanais |
| `useWinLossAnalysis.ts` | Análise win/loss |

---

## 📚 BIBLIOTECAS (src/lib/) - 24 arquivos

### 📂 crud/
- `index.ts` - Operações CRUD genéricas

### 📄 Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `apiErrorHandler.ts` | Handler de erros API |
| `arrayHelpers.ts` | Helpers para arrays |
| `bitrix24.ts` | Cliente Bitrix24 |
| `cacheManager.ts` | Gerenciador de cache |
| `csvExporter.ts` | Exportador CSV |
| `csvImporter.ts` | Importador CSV |
| `excelExporter.ts` | Exportador Excel |
| `excelImporter.ts` | Importador Excel |
| `featureFlags.ts` | Feature flags |
| `formatters.ts` | Formatadores |
| `gamification.ts` | Lógica gamificação |
| `healthCheck.ts` | Health check |
| `logger.ts` | Sistema de logs |
| `mockDetector.ts` | Detector de mocks |
| `pdfExporter.ts` | Exportador PDF |
| `performanceMonitor.ts` | Monitor performance |
| `rateLimiter.ts` | Rate limiter |
| `retry.ts` | Lógica de retry |
| `salesproSchemas.ts` | Schemas SalesPro |
| `stringHelpers.ts` | Helpers strings |
| `utils.ts` | Utilitários gerais |
| `validationSchemas.ts` | Schemas validação |
| `validators.ts` | Validadores |

---

## 🔧 UTILITÁRIOS (src/utils/) - 5 arquivos

| Arquivo | Descrição |
|---------|-----------|
| `csvExport.ts` | Exportação CSV |
| `gamificationExport.ts` | Exportação gamificação |
| `performanceExport.ts` | Exportação performance |
| `reportDownload.ts` | Download relatórios |
| `supabase-helpers.ts` | Helpers Supabase |

---

## ⚡ EDGE FUNCTIONS (supabase/functions/) - 25 funções

| Função | Descrição |
|--------|-----------|
| `access-denied-alerts/` | Alertas acesso negado |
| `activity-goal-alerts/` | Alertas metas atividades |
| `auto-reassign-inactive/` | Reatribuição automática |
| `bitrix24-oauth/` | OAuth Bitrix24 |
| `bitrix24-sync/` | Sync Bitrix24 |
| `challenge-expiration-alerts/` | Alertas expiração desafios |
| `check-lead-sla/` | Verificação SLA leads |
| `create-stagnant-tasks/` | Criação tarefas estagnadas |
| `deal-probability/` | Probabilidade deal |
| `demand-forecast/` | Previsão demanda |
| `detect-at-risk-deals/` | Detecção deals risco |
| `elevenlabs-stt/` | Speech-to-text |
| `elevenlabs-tts/` | Text-to-speech |
| `lead-scoring/` | Scoring de leads |
| `new-device-alert/` | Alerta novo dispositivo |
| `next-best-action/` | Próxima melhor ação |
| `push-subscribe/` | Push subscribe |
| `rotate-daily-challenges/` | Rotação desafios |
| `sales-assistant-chat/` | Chat assistente IA |
| `salesperson-coaching/` | Coaching vendedor |
| `sdr-consecutive-alerts/` | Alertas SDR |
| `send-alert-notifications/` | Envio notificações |
| `send-password-reset/` | Reset senha |
| `send-push-notification/` | Push notification |
| `webauthn/` | WebAuthn |

---

## 🗄️ MIGRATIONS (supabase/migrations/) - 61 arquivos

Migrations SQL para estruturação do banco de dados, incluindo:
- Tabelas principais (salespeople, clients, sales, products, etc.)
- Sistema de autenticação e roles
- Gamificação (challenges, achievements, streaks)
- Segurança (MFA, rate limiting, IP blocking)
- Integrações (Bitrix24)
- RLS Policies

---

## 📖 DOCUMENTAÇÃO (docs/) - 16 arquivos

| Arquivo | Descrição |
|---------|-----------|
| `ANALISE_EXAUSTIVA_E_PLANO_IMPLEMENTACAO.md` | Análise e plano |
| `DESIGN_SYSTEM.md` | Design system |
| `EXECUCAO_COMPLETA_69_MELHORIAS.md` | Status 69 melhorias |
| `HOVER_UTILITIES.md` | Utilitários hover |
| `INDICE_ARQUIVOS.md` | Índice arquivos |
| `INVENTARIO_COMPLETO_REPOSITORIO.md` | Inventário repo |
| `INVENTARIO_COMPLETO_SISTEMA.md` | Inventário sistema |
| `MELHORIAS_PENDENTES.md` | Melhorias pendentes |
| `MIGRATION_GUIDE.md` | Guia migração |
| `MODULO_SEGURANCA_STATUS.md` | Status segurança |
| `PLANO_IMPLEMENTACAO_COMPLETO.md` | Plano completo |
| `PLANO_IMPLEMENTACAO_DETALHADO.md` | Plano detalhado |
| `PLANO_MELHORIAS_PRODUCT_DESIGN.md` | Melhorias design |
| `PROJECT_INVENTORY.md` | Inventário projeto |
| `RELATORIO_ERROS_BUGS_ANOMALIAS.md` | Relatório bugs |
| `RELATORIO_PRODUCT_DESIGN_STRATEGY.md` | Estratégia design |

---

## 🔨 MELHORIAS PLANEJADAS (improvements/) - 60+ arquivos

### 📂 components/
- `analytics/` - ABCAnalysis.tsx, SalesForecastChart.tsx
- `performance/` - VirtualScrolling.tsx
- `shared/` - EmptyStates

### 📂 database/ - 6 arquivos
- Soft delete, indexes, materialized views, stored procedures

### 📂 devops/ - 9 arquivos
- CI/CD workflows, deploy scripts, monitoring configs

### 📂 docs/ - 4 arquivos
- README badges, Storybook setup

### 📂 e2e/ - 7 arquivos
- Testes jornada SDR, Closer, gamificação, etc.

### 📂 features/ - 13 arquivos
- Offline, i18n, feature flags, webhooks, collaboration

### 📂 hooks/ - 16 arquivos
- Hooks refatorados

### 📂 performance/ - 5 arquivos
- Code splitting, cache, prefetch, virtual scrolling

### 📂 security/ - 12 arquivos
- 2FA, audit trail, permissions, RLS, rate limiting

### 📂 supabase/migrations/ - 2 arquivos
- 2FA system, audit trail

### 📂 tests/ - 12 arquivos
- Testes unitários hooks

### 📂 typescript/ - 11 arquivos
- Configurações strict, refatorações

### 📂 ui-ux/ - 5 arquivos
- Skeletons, empty states, animations

---

## 🔬 TESTES (e2e/) - 4 arquivos principais

| Arquivo | Descrição |
|---------|-----------|
| `auth.setup.ts` | Setup autenticação |
| `e2e-remaining-tests.spec.ts` | Testes restantes |
| `rls-policies.spec.ts` | Testes RLS |
| `sales-flow.spec.ts` | Fluxo de vendas |

---

## 🤖 SCRIPTS (scripts/) - 4 arquivos

| Script | Descrição |
|--------|-----------|
| `add-aria-labels.py` | Adiciona aria-labels |
| `fix-hardcoded-colors-v2.py` | Fix cores hardcoded |
| `remove-console-logs.py` | Remove console.logs |
| `reorganize-components.sh` | Reorganiza componentes |

---

## ⚙️ GITHUB ACTIONS (.github/workflows/) - 3 arquivos

| Arquivo | Descrição |
|---------|-----------|
| `README.md` | Documentação |
| `e2e-tests.yml` | Testes E2E |
| `pr-checks.yml` | Checks de PR |

---

## 📦 PUBLIC (public/) - 7 arquivos

| Arquivo | Descrição |
|---------|-----------|
| `avatars/gaby.jpg` | Avatar exemplo |
| `favicon.ico` | Favicon |
| `manifest.json` | PWA manifest |
| `offline.html` | Página offline |
| `placeholder.svg` | Placeholder image |
| `robots.txt` | Robots.txt |
| `sw.js` | Service Worker |

---

## 📊 ESTATÍSTICAS FINAIS

| Métrica | Valor |
|---------|-------|
| **Total de Arquivos TypeScript/TSX** | ~350+ |
| **Total de Componentes** | ~250+ |
| **Total de Hooks** | 130+ |
| **Total de Páginas** | 41 |
| **Edge Functions** | 25 |
| **Migrations SQL** | 61 |
| **Testes** | 20+ |
| **Documentação** | 16 arquivos |

---

## 🏷️ NOTAS IMPORTANTES

1. **Projeto Híbrido**: Desenvolvido em parceria Claude (Anthropic) + Lovable
2. **Arquivos improvements/**: Contém melhorias planejadas pelo Claude, prontas para implementação
3. **Arquivos improvements-180/**: Melhorias adicionais do Claude
4. **Edge Functions**: Todas funcionais e deployadas no Supabase
5. **Design System**: Completo com tokens semânticos, temas dark/light
6. **Gamificação**: Sistema completo de XP, levels, achievements, streaks
7. **Segurança**: MFA, WebAuthn, rate limiting, IP blocking, RLS policies

---

*Documento gerado automaticamente em 03/01/2025*
