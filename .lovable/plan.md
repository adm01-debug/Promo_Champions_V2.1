
Próxima melhoria atômica da fila Reporting & BI: **5/7 — Scheduled Reports Robusto**.

## Melhoria 5/7 — Scheduled Reports Robusto

### Estado atual
- Página `/scheduled-reports` existe mas é básica (sem cron real, sem entrega).
- Custom Report Builder gera relatórios on-demand via `report-builder-execute`.
- Sem storage de snapshots, sem e-mail, sem histórico de execuções.

### Mudanças

**1. Migration SQL**
- Tabela `scheduled_reports`:
  - `id`, `created_by`, `report_id` (FK custom_reports), `name`, `cron_expression` (text simples: daily/weekly/monthly + hora), `recipients` (text[] emails), `format` ('csv'|'pdf'|'json'), `enabled` (bool), `last_run_at`, `next_run_at`, `created_at`
- Tabela `scheduled_report_runs`:
  - `id`, `schedule_id`, `started_at`, `finished_at`, `status` ('success'|'failed'), `rows_count`, `file_path`, `error_message`
- RLS: owner-only (created_by = auth.uid()) + Manager pode ver todos
- Storage bucket `report-snapshots` (privado), policies por owner
- Trigger `compute_next_run_at` antes de insert/update

**2. Edge function `scheduled-reports-runner` (cron a cada 5min)**
- Busca `scheduled_reports` onde `enabled=true` e `next_run_at <= now()`
- Para cada: chama `report-builder-execute` internamente, gera CSV/JSON, faz upload no bucket, registra `scheduled_report_runs`, atualiza `last_run_at`/`next_run_at`
- Envia e-mail (via `send-email` se existir, ou Resend) com link signed-url do snapshot
- Logs estruturados, retry com backoff

**3. Edge function `scheduled-report-trigger` (manual)**
- Endpoint POST para disparar execução imediata de um schedule (botão "Executar agora")

**4. Cron setup**
- `pg_cron` job que invoca `scheduled-reports-runner` a cada 5 minutos via pg_net

**5. UI — refatorar `/scheduled-reports`**
- Lista de schedules com toggle enabled, próxima execução, última execução, status badge
- Modal "Novo agendamento": seleciona report existente do builder, frequência (diário/semanal/mensal), hora, destinatários (chips de email), formato
- Drawer de histórico por schedule: lista `scheduled_report_runs` com download do snapshot
- Botão "Executar agora" → chama trigger
- Sora títulos, Inter body, tokens semânticos, animação Framer

**6. Hooks**
- `useScheduledReports.ts` — list/create/update/delete/toggle
- `useScheduledReportRuns.ts` — histórico por schedule
- `useTriggerScheduledReport.ts` — mutation para executar

**7. Validação**
- Smoke test edge functions via `curl_edge_functions`
- Criar schedule diário, executar manual, verificar arquivo no storage e e-mail
- Verificar RLS via `read_query`

### Arquivos
- Migration: nova tabela + RLS + bucket + cron
- Criar: `supabase/functions/scheduled-reports-runner/index.ts`, `supabase/functions/scheduled-report-trigger/index.ts`
- Criar: `src/hooks/reporting/useScheduledReports.ts`, `useScheduledReportRuns.ts`, `useTriggerScheduledReport.ts`
- Criar: `src/components/reporting/ScheduledReportFormDialog.tsx`, `ScheduledReportRunsDrawer.tsx`, `scheduledReportHelpers.ts`
- Editar: `src/pages/ScheduledReportsPage.tsx`

Após esta, sigo automaticamente para 6/7 (Embedded Analytics) e 7/7 (widget custom_report no Dashboard Builder + E2E).
