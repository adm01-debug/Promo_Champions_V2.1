
Auditoria rápida do que existe vs gaps:

**Existente:**
- ✅ `CustomizableDashboard` (`/dashboard-custom`) — drag-and-drop básico de widgets
- ✅ `/scheduled-reports` — agendamento básico
- ✅ Cohort analysis parcial (`retention-and-ltv-modules`)
- ✅ `useFunnelData` — funil com drop-off por etapa (já implementado)

**Gaps a implementar (Reporting & BI 360º):**
- ❌ **Custom Report Builder no-code** — usuário escolhe entidade, colunas, filtros, agrupamentos, visualização
- ❌ **Cross-object reports** — joins entre sales+accounts+activities+salespeople
- ❌ **Embedded Analytics** — geração de token público + rota iframe-friendly
- ❌ **Scheduled Reports robusto** — vincular reports salvos, frequência, destinatários, formato (PDF/CSV/XLSX), histórico de execução
- ❌ **Cohort visual avançada** — heatmap de retenção mês×mês
- ❌ **Funnel report visual rico** — usar `useFunnelData` com gráfico de funil + tabela de drop-off + comparação período
- ❌ **Dashboard builder evoluído** — adicionar widgets de reports customizados criados pelo usuário

## Plano — Reporting & BI 360º

### 1. Migration
**Tabelas:**
- `custom_reports` — id, owner_id, name, description, entity ('sales'|'accounts'|'activities'|'leads'|'cross'), config jsonb (columns, filters, group_by, order_by, viz_type), is_shared, created_at, updated_at
- `report_schedules` — id, report_id, frequency ('daily'|'weekly'|'monthly'), day_of_week, day_of_month, time_of_day, recipients text[], format ('pdf'|'csv'|'xlsx'), is_active, last_run_at, next_run_at, created_by
- `report_executions` — id, schedule_id, report_id, executed_at, status, file_url, recipients_sent, error_message, rows_count
- `embedded_report_tokens` — id, report_id, public_token uuid, expires_at, allowed_domains text[], view_count, last_viewed_at, created_by
- `cohort_analyses` — id, owner_id, name, cohort_field, metric_field, period_type ('week'|'month'), config jsonb

**RLS:** owner total; is_shared=true SELECT para autenticados; admin total. Embedded tokens: SECURITY DEFINER RPC para acesso público.

**RPC:**
- `execute_custom_report(_report_id, _date_range)` — retorna jsonb com rows
- `get_embedded_report_by_token(_token)` SECURITY DEFINER — valida domínio + retorna config+dados
- `compute_cohort_retention(_cohort_id, _periods)` — matriz de retenção

### 2. Edge Functions
- `report-builder-execute` — executa custom report (entity + filters + joins) com paginação
- `report-scheduler-runner` — invocada por cron, busca schedules due, gera arquivo (CSV/XLSX/PDF), salva no Storage, envia email, registra execution
- `report-embed-public` (`verify_jwt=false`) — valida token + domínio (Referer) + retorna dados sanitizados
- `cohort-analyzer` — computa retenção por cohort

**Storage bucket:** `report-exports` (signed URLs).

### 3. Hooks (`src/hooks/reporting/`)
- `useCustomReports.ts` — CRUD reports
- `useReportExecution.ts` — executar e cachear resultado
- `useReportSchedules.ts` — CRUD schedules + histórico executions
- `useEmbeddedReports.ts` — gerar/revogar tokens
- `useCohortAnalysis.ts` — listar/criar/computar
- `reportBuilderHelpers.ts` — schema de entidades, validação config, montagem de query

### 4. Componentes (`src/components/reporting/`)
- `ReportBuilder.tsx` (≤350L) — wizard: entidade → colunas → filtros → grupo → viz
- `ReportFieldPicker.tsx` — checkbox de colunas disponíveis por entidade
- `ReportFilterBuilder.tsx` — operadores (=, >, <, between, in, contains)
- `ReportPreview.tsx` — renderiza tabela/bar/line/pie/funnel/heatmap conforme viz_type
- `ReportSchedulerDialog.tsx` — frequência, destinatários, formato
- `ReportExecutionHistory.tsx` — timeline de runs com download
- `EmbedTokenManager.tsx` — gerar link público + copy + revogar + analytics de views
- `CohortHeatmap.tsx` — matriz visual de retenção
- `FunnelReportView.tsx` — funil + drop-off por etapa + comparação período
- `CrossObjectJoinPanel.tsx` — UI para definir joins (sales+accounts, activities+salespeople, etc.)

### 5. Páginas / Rotas
- `/relatorios-custom` — lista + criar/editar reports
- `/relatorios-custom/:id` — detalhe + preview + ações (schedule/embed/export)
- `/embed/report/:token` — pública (sem layout, sem auth) → renderiza embed
- Adicionar em `AppRoutes.tsx` + `lazyPages.ts`
- Integrar widget "Custom Report" no `CustomizableDashboard`

### 6. Integração
- `/scheduled-reports`: vincular a custom_reports criados
- Dashboard builder: novo widget tipo `custom_report` referenciando report_id
- Sidebar: item "Relatórios Personalizados" sob Analytics

### 7. Padrões obrigatórios
- ≤400 linhas/arquivo (helpers em `*Helpers.ts`)
- Sora títulos / Inter body, tokens semânticos, dark
- Framer motion, skeleton, React.memo
- React Query 5min staleTime
- Strict TS, RLS, zero console errors
- Validação Zod em edge functions
- Sonner toasts em mutations

### 8. Validação pós-implementação
- Deploy edge functions
- `curl_edge_functions` smoke test em cada função
- `read_query` validar RLS
- Testar criar report → preview → schedule → embed token → acesso público

Ordem de execução atômica (1 melhoria por vez):
1. Custom Report Builder (tabela + edge + UI)
2. Cross-object Reports (joins no executor)
3. Funnel Report visual rico
4. Cohort Heatmap visual
5. Scheduled Reports robusto (cron + storage + email)
6. Embedded Analytics (token público + rota)
7. Widget custom_report no Dashboard Builder + testes E2E
