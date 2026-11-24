# Varredura por erro de leitura engolido (etapa 127 / achado A-06)

**Etapa:** 127 · **Onda 5** · **Camada:** Frontend · **Data:** 2026-11-24

## Por que este documento existe

As etapas 122-126 corrigiram oito telas por leitura dirigida das paginas de maior risco. A varredura
completa nao tinha sido feita, e o padrao `const { data, isLoading } = useQuery(...)` sem `isError` e
comum. O objetivo aqui e **levantar**, nao corrigir: o plano proibe correcao em massa, porque parte das
telas tolera lista vazia sem prejuizo e o lote esconderia as que importam.

## Metodo (reproduzivel)

1. Inventario de hooks que buscam dados: arquivos em `src/hooks/` que chamam `useQuery`, `useInfiniteQuery`
   ou `useQueries`.

2. Inventario de consumidores diretos: arquivos fora de `src/hooks/` que **desestruturam** o retorno de
   `useQuery`/`useInfiniteQuery`/`useQueries` sem citar `isError` nem `error` na desestruturacao.

3. Classificacao por area de impacto e prioridade (dinheiro, dado pessoal/seguranca, auditoria, demais).

4. Amostra auditada a mao para validar o criterio (`DealPreviewCard.tsx`, `WinLossDealsDrawer.tsx`,

   `WinLossLastRunCard.tsx`, `useUserRoles.ts`, `useDealSLAs.ts`) - os cinco confirmam o padrao.


### O que o metodo NAO conta como falha

- Hooks que devolvem a query inteira (`return useQuery({...})`): o consumidor recebe `isError` e decide.

- Arquivos que tratam erro por outro caminho (`ErrorBoundary`, `onError`, `throwOnError`, `retry`).

- Telas que so exibem contagem/lista e cuja lista vazia e estado legitimo de negocio.


## Numeros

| Medida | Valor |
| --- | --- |
| Arquivos em `src/hooks/` com consulta react-query | 261 |
| Hooks que devolvem a query inteira (consumidor pode tratar) | 201 |
| Arquivos de hook que montam o retorno sem `error`/`isError` em nenhum `return` | 73 |
| Consumidores diretos sem `isError`/`error` na desestruturacao | 101 |
| Arquivos com consulta react-query e **nenhum** token de erro em todo o arquivo | 46 (15 fora de `src/hooks/`) |

## Prioridade

### P1 - dinheiro (17)

| Arquivo:linha | Desestruturacao | Efeito hoje quando a leitura falha |
| --- | --- | --- |
| `src/components/admin/QuoteSyncLogsPanel.tsx:11` | `{ data: logs = [], isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/admin/churn/ChurnHistoryChart.tsx:54` | `{ data, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/assistant/DealContextSelector.tsx:50` | `{ data: deals, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/assistant/DealPreviewCard.tsx:54` | `{ data: dealDetails }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/clients/ClientChurnJustificationCard.tsx:40` | `{ data }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/dashboard/PredictiveRevenueForecast.tsx:16` | `{ data: forecast, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/dashboard/RecentDeals.tsx:11` | `{ data: deals, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/dashboard/SalesForecast.tsx:43` | `{ data, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/dashboard/TopProducts.tsx:10` | `{ data: products, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/dashboard/widgets/PipelineFunnelWidget.tsx:45` | `{ data, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/dashboard/widgets/TopDealsWidget.tsx:19` | `{ data, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/forecast/RevenueForecastHub.tsx:50` | `{ data: salespeople }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/reports/EmailReportConfig.tsx:62` | `{ data: config, isLoading: _isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/pages/AdminHistoricoAlertasChurn.tsx:126` | `{ data: salespeople }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/pages/AdminHistoricoAlertasChurn.tsx:167` | `{ data, isLoading, isFetching }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/pages/admin/AdminQuoteSyncInboundPage.tsx:55` | `{     data = [],     isLoading,     refetch,     isFetching,   }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/pages/admin/AdminQuoteSyncInboundPage.tsx:249` | `{ data = [], isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |

### P2 - dado pessoal e seguranca (22)

| Arquivo:linha | Desestruturacao | Efeito hoje quando a leitura falha |
| --- | --- | --- |
| `src/components/lead-routing/CapacityDashboard.tsx:12` | `{ data: openCounts, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/map/ClientsMap.tsx:197` | `{ data: clients, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/profile/MyRaceCarMiniCard.tsx:18` | `{ data: car }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/purchase-intelligence/ClientSelector.tsx:17` | `{ data, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/sdr/LeadScoreBreakdown.tsx:60` | `{ data: fetched }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/sdr/RecentProspects.tsx:54` | `{ data: prospects, refetch }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/security/GeoBlockingManager.tsx:119` | `{ data: allowedCountries, isLoading: isLoadingCountries }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/security/GeoBlockingManager.tsx:131` | `{ data: accessLogs, isLoading: isLoadingLogs }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/security/GeoBlockingMap.tsx:18` | `{ data: blockedRegions, isLoading: _isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/security/IPWhitelistManager.tsx:52` | `{ data: whitelistedIPs, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/security/PasswordResetApproval.tsx:54` | `{ data: requests, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/settings/AccessDeniedLogs.tsx:71` | `{ data: logs, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/settings/PermissionMatrix.tsx:55` | `{ data: permissions, isLoading: loadingPermissions }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/settings/PermissionMatrix.tsx:67` | `{ data: rolePermissions, isLoading: loadingRolePermissions }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/settings/SecurityAlertHistory.tsx:41` | `{ data: alerts, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/settings/SecurityAlertSettings.tsx:34` | `{ data: settings, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/pages/ClientHealthScore.tsx:64` | `{ data: clients, isLoading: clientsLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/pages/ClientHealthScore.tsx:75` | `{ data: sales }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/pages/ClientHealthScore.tsx:356` | `{ data: renewals, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/pages/ClientHealthScore.tsx:445` | `{ data: usage, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/pages/ClientHealthScore.tsx:497` | `{ data: tickets, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/pages/TeamActivityFeed.tsx:40` | `{ data: activities, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |

### P3 - auditoria e observabilidade (7)

| Arquivo:linha | Desestruturacao | Efeito hoje quando a leitura falha |
| --- | --- | --- |
| `src/components/admin/AdminSystemStatus.tsx:55` | `{ data: cronJobs }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/admin/connections/AutoTestJobStatusCard.tsx:15` | `{ data }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/competitive/CreateBattleDialog.tsx:61` | `{ data: currentSp }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/race/admin/OverlayTelemetryPanel.tsx:21` | `{ data, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/race/admin/RaceAuditFeed.tsx:23` | `{ data = [], isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/sdr/SDRAlertHistory.tsx:53` | `{ data: preferences }` | mostra vazio/valores default como se fosse ausencia de dado |
| `src/components/sdr/SDRAlertHistory.tsx:107` | `{ data: history, isLoading }` | mostra vazio/valores default como se fosse ausencia de dado |

### P4 - demais telas (55)

Lista completa no anexo; sem tela de dinheiro, de dado pessoal ou de auditoria entre elas.

## Hooks que escondem o erro por construcao (amostra auditada)

| Hook | Retorno |
| --- | --- |
| `src/hooks/useDealSLAs.ts:112` | `return { slaStatuses, summary }` - sem `isError` |
| `src/hooks/useUserRoles.ts:175` | objeto montado a mao a partir de duas consultas |
| `src/hooks/dashboard/useDashboardKPIsPeriod.ts:299` | objeto de KPIs montado a mao |

Dos 73, revisar primeiro os consumidos por tela de dinheiro (79 pontos de consumo medidos).

## Padrao pronto (nao inventar outro)

A etapa 126 deixou o componente de erro em `src/components/QueryErrorState.tsx` (PR #663), com
`error`, `onRetry` e `variant` (`inline` para card, `full` para pagina). A correcao de cada item deste
documento e sempre a mesma forma, sem componente novo:

```tsx
const { data, isLoading, isError, error, refetch } = useQuery({ ... });
if (isError) return <QueryErrorState error={error} onRetry={refetch} variant="inline" />;
```

O que **nao** fazer: trocar `isLoading` por `isPending` (muda o comportamento de `enabled: false`),
criar estado de erro local com `useState`, ou envolver a tela inteira em `Suspense` para "resolver" o
caso - isso esconde o problema em vez de mostrar.

## Etapas recomendadas (abrir depois deste levantamento)

1. **Painel e cards de venda** (`RecentDeals`, `TopDealsWidget`, `WinLossLastRunCard`, `DealPreviewCard`):
   sao os primeiros que o vendedor ve - erro silencioso ali vira decisao errada.

2. **Admin comercial** (`src/pages/admin/AdminComercial.tsx`, 7 consultas): regras de comissao e metas
   aparecendo vazias por falha de leitura e o pior caso do conjunto.

3. **Seguranca e permissoes** (`PermissionMatrix`, `AccessDeniedLogs`, `SecurityAlertHistory`, `IPWhitelistManager`):
   leitura vazia em tela de auditoria e indistinguivel de "nada aconteceu".

4. **Previsao de receita** (`PredictiveRevenueForecast`, `SalesForecast`, `RevenueForecastHub`).

5. **Observabilidade de cron e integracao** (`AdminSystemStatus`, `AutoTestJobStatusCard`, `FailureWindowCard`).


## Limites deste levantamento

- A deteccao e textual: nao segue tipos. Hook que devolve `isError` com outro nome (`hasError`, `failed`)
  conta como gap e precisa de conferencia antes da correcao.

- Nao mede gravidade: a coluna "efeito hoje" e inferida do padrao de desestruturacao, nao da UI renderizada.

- Snapshot no commit `e4459d789`; qualquer PR posterior muda a contagem.


## Anexo - lista completa dos 101 consumidores diretos

| Arquivo:linha | Desestruturacao |
| --- | --- |
| `src/components/admin/AdminSystemStatus.tsx:55` | `{ data: cronJobs }` |
| `src/components/admin/QuoteSyncLogsPanel.tsx:11` | `{ data: logs = [], isLoading }` |
| `src/components/admin/churn/ChurnHistoryChart.tsx:54` | `{ data, isLoading }` |
| `src/components/admin/connections/AutoTestJobStatusCard.tsx:15` | `{ data }` |
| `src/components/admin/connections/FailureWindowCard.tsx:23` | `{ data }` |
| `src/components/analytics/ActivityHeatmap.tsx:77` | `{ data: fetchedData }` |
| `src/components/assistant/DealContextSelector.tsx:50` | `{ data: deals, isLoading }` |
| `src/components/assistant/DealPreviewCard.tsx:54` | `{ data: dealDetails }` |
| `src/components/clients/ClientChurnJustificationCard.tsx:40` | `{ data }` |
| `src/components/closer/CloserHandoffs.tsx:24` | `{ data: handoffs, isLoading }` |
| `src/components/closer/SDRHandoffContext.tsx:26` | `{ data: activities, isLoading }` |
| `src/components/competitive/ActivityHeatmap.tsx:14` | `{ data: heatmapData, isLoading }` |
| `src/components/competitive/ActivityHeatmap.tsx:47` | `{ data: salesHeatmap }` |
| `src/components/competitive/CreateBattleDialog.tsx:61` | `{ data: currentSp }` |
| `src/components/competitive/EnhancedTVMode.tsx:49` | `{ data: salespeople = [] }` |
| `src/components/competitive/EnhancedTVMode.tsx:68` | `{ data: latestSales = [] }` |
| `src/components/competitive/EnhancedTVMode.tsx:84` | `{ data: goals = [] }` |
| `src/components/competitive/PerformanceBets.tsx:65` | `{ data: currentSp }` |
| `src/components/competitive/PerformanceBets.tsx:82` | `{ data: bets = [] }` |
| `src/components/competitive/TerritoryWars.tsx:22` | `{ data: salesData = [] }` |
| `src/components/competitive/TerritoryWars.tsx:33` | `{ data: salespeople = [] }` |
| `src/components/competitive/TournamentBrackets.tsx:65` | `{ data: currentSp }` |
| `src/components/competitive/TournamentBrackets.tsx:82` | `{ data: tournaments = [] }` |
| `src/components/competitive/TournamentBrackets.tsx:95` | `{ data: salespeople = [] }` |
| `src/components/competitive/WallOfFame.tsx:35` | `{ data: salespeople }` |
| `src/components/conversational/BattleCardSuggestion.tsx:21` | `{ data: asset, isLoading }` |
| `src/components/dashboard/PredictiveRevenueForecast.tsx:16` | `{ data: forecast, isLoading }` |
| `src/components/dashboard/RecentDeals.tsx:11` | `{ data: deals, isLoading }` |
| `src/components/dashboard/SalesForecast.tsx:43` | `{ data, isLoading }` |
| `src/components/dashboard/TopProducts.tsx:10` | `{ data: products, isLoading }` |
| `src/components/dashboard/widgets/ActivitiesTodayWidget.tsx:14` | `{ data, isLoading }` |
| `src/components/dashboard/widgets/CalendarPreviewWidget.tsx:16` | `{ data, isLoading }` |
| `src/components/dashboard/widgets/ConversionRateWidget.tsx:17` | `{ data: trend, isLoading: trendLoading }` |
| `src/components/dashboard/widgets/PipelineFunnelWidget.tsx:45` | `{ data, isLoading }` |
| `src/components/dashboard/widgets/RecentActivitiesWidget.tsx:23` | `{ data, isLoading }` |
| `src/components/dashboard/widgets/TopDealsWidget.tsx:19` | `{ data, isLoading }` |
| `src/components/dialer/CurrentCallCard.tsx:31` | `{ data: sale }` |
| `src/components/dialer/CurrentCallCard.tsx:49` | `{ data: contactPhone }` |
| `src/components/forecast/RevenueForecastHub.tsx:50` | `{ data: salespeople }` |
| `src/components/icp/ICPPerformanceChart.tsx:20` | `{ data: stats, isLoading }` |
| `src/components/intelligence/ActivityPulse.tsx:11` | `{ data: events }` |
| `src/components/intelligence/PerformanceTrends.tsx:25` | `{ data }` |
| `src/components/lead-routing/CapacityDashboard.tsx:12` | `{ data: openCounts, isLoading }` |
| `src/components/map/ClientsMap.tsx:197` | `{ data: clients, isLoading }` |
| `src/components/profile/MyRaceCarMiniCard.tsx:18` | `{ data: car }` |
| `src/components/purchase-intelligence/ClientSelector.tsx:17` | `{ data, isLoading }` |
| `src/components/race/admin/GarageAdminTable.tsx:27` | `{ data = [], isLoading }` |
| `src/components/race/admin/OverlayTelemetryPanel.tsx:21` | `{ data, isLoading }` |
| `src/components/race/admin/RaceAuditFeed.tsx:23` | `{ data = [], isLoading }` |
| `src/components/race/admin/SeasonRulesPanel.tsx:92` | `{ data = [], isLoading }` |
| `src/components/race/admin/SeasonsManagerTable.tsx:38` | `{ data = [], isLoading }` |
| `src/components/reports/EmailReportConfig.tsx:62` | `{ data: config, isLoading: _isLoading }` |
| `src/components/sdr/LeadScoreBreakdown.tsx:60` | `{ data: fetched }` |
| `src/components/sdr/RecentProspects.tsx:54` | `{ data: prospects, refetch }` |
| `src/components/sdr/SDRAlertHistory.tsx:53` | `{ data: preferences }` |
| `src/components/sdr/SDRAlertHistory.tsx:107` | `{ data: history, isLoading }` |
| `src/components/sdr/SDRIntelligenceHighlights.tsx:28` | `{ data: recommendations }` |
| `src/components/sdr/SDRSequenceOrchestrator.tsx:31` | `{ data: enrollments }` |
| `src/components/sdr/TopSDRsRanking.tsx:21` | `{ data: ranking }` |
| `src/components/security/GeoBlockingManager.tsx:119` | `{ data: allowedCountries, isLoading: isLoadingCountries }` |
| `src/components/security/GeoBlockingManager.tsx:131` | `{ data: accessLogs, isLoading: isLoadingLogs }` |
| `src/components/security/GeoBlockingMap.tsx:18` | `{ data: blockedRegions, isLoading: _isLoading }` |
| `src/components/security/IPWhitelistManager.tsx:52` | `{ data: whitelistedIPs, isLoading }` |
| `src/components/security/PasswordResetApproval.tsx:54` | `{ data: requests, isLoading }` |
| `src/components/settings/AccessDeniedLogs.tsx:71` | `{ data: logs, isLoading }` |
| `src/components/settings/CustomFieldsManager.tsx:36` | `{ data: teams = [] }` |
| `src/components/settings/CustomFieldsManager.tsx:48` | `{ data: fields = [], isLoading }` |
| `src/components/settings/FollowUpSettings.tsx:65` | `{ data: versions = [] }` |
| `src/components/settings/FollowUpTerritoryRules.tsx:55` | `{ data: rules, isLoading: isLoadingRules }` |
| `src/components/settings/FollowUpTerritoryRules.tsx:68` | `{ data: templates }` |
| `src/components/settings/FollowUpTerritoryRules.tsx:80` | `{ data: salespersons }` |
| `src/components/settings/PermissionMatrix.tsx:55` | `{ data: permissions, isLoading: loadingPermissions }` |
| `src/components/settings/PermissionMatrix.tsx:67` | `{ data: rolePermissions, isLoading: loadingRolePermissions }` |
| `src/components/settings/SecurityAlertHistory.tsx:41` | `{ data: alerts, isLoading }` |
| `src/components/settings/SecurityAlertSettings.tsx:34` | `{ data: settings, isLoading }` |
| `src/components/win-loss/WinLossLastRunCard.tsx:15` | `{ data }` |
| `src/pages/AdminHistoricoAlertasChurn.tsx:126` | `{ data: salespeople }` |
| `src/pages/AdminHistoricoAlertasChurn.tsx:167` | `{ data, isLoading, isFetching }` |
| `src/pages/ArenaCompetitiva.tsx:144` | `{ data: currentSalesperson }` |
| `src/pages/CategoryMetrics.tsx:56` | `{ data: categories, isLoading }` |
| `src/pages/ClientHealthScore.tsx:64` | `{ data: clients, isLoading: clientsLoading }` |
| `src/pages/ClientHealthScore.tsx:75` | `{ data: sales }` |
| `src/pages/ClientHealthScore.tsx:356` | `{ data: renewals, isLoading }` |
| `src/pages/ClientHealthScore.tsx:445` | `{ data: usage, isLoading }` |
| `src/pages/ClientHealthScore.tsx:497` | `{ data: tickets, isLoading }` |
| `src/pages/CompetitiveSeasonsAdmin.tsx:26` | `{ data: seasons, isLoading }` |
| `src/pages/HistoricoDesafiosDiarios.tsx:47` | `{ data: history, isLoading }` |
| `src/pages/RankingCompetitivo.tsx:33` | `{ data: monthlyHistory }` |
| `src/pages/RelatoriosExecutivos.tsx:78` | `{ data: salesData, isLoading }` |
| `src/pages/RelatoriosExecutivos.tsx:93` | `{ data: salespeople }` |
| `src/pages/RelatoriosExecutivos.tsx:102` | `{ data: activities }` |
| `src/pages/TeamActivityFeed.tsx:40` | `{ data: activities, isLoading }` |
| `src/pages/admin/AdminComercial.tsx:61` | `{ data: user }` |
| `src/pages/admin/AdminComercial.tsx:71` | `{ data: salespeople, isLoading: loadingSalespeople }` |
| `src/pages/admin/AdminComercial.tsx:83` | `{ data: commissionConfigs, isLoading: loadingCommissions }` |
| `src/pages/admin/AdminComercial.tsx:95` | `{ data: goals, isLoading: loadingGoals }` |
| `src/pages/admin/AdminComercial.tsx:107` | `{ data: rules, isLoading: loadingRules }` |
| `src/pages/admin/AdminComercial.tsx:129` | `{ data: approvalRequests, isLoading: loadingApprovals }` |
| `src/pages/admin/AdminComercial.tsx:141` | `{ data: auditLogs, isLoading: loadingLogs }` |
| `src/pages/admin/AdminQuoteSyncInboundPage.tsx:55` | `{     data = [],     isLoading,     refetch,     isFetching,   }` |
| `src/pages/admin/AdminQuoteSyncInboundPage.tsx:249` | `{ data = [], isLoading }` |
