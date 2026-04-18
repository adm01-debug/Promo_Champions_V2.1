
**Bloco Deal Intelligence — item 3/4: Deal Velocity Predictor**

Próxima atômica: prever **quanto tempo cada deal aberto vai levar até fechar** (won ou lost) com base em histórico de velocidade por estágio, tamanho do deal, saúde, cobertura de comitê e sinais de calls — para vendedor/gestor anteciparem forecast e priorizarem deals que realmente vão fechar no período.

## Estado atual
- `sales` tem `created_at`, `updated_at`, `stage`, mas sem cálculo de tempo médio por estágio nem ETA de fechamento.
- `deal_health_scores` (item 1/4) e `deal_committee_coverage` (item 2/4) já fornecem sinais ricos não usados em forecast.
- `Analytics > Deal Velocity` mostra média histórica agregada, mas não gera previsão por deal individual.
- Sem comparação "este deal está X dias acima da média do estágio", sem confidence interval, sem alerta de deals "presos".

## Mudanças

### 1. Migration
- Tabela `deal_velocity_predictions`: `id`, `sale_id` UNIQUE FK, `owner_id`, `predicted_close_date date`, `predicted_days_remaining int`, `confidence_score int 0-100`, `confidence_tier` (`low|medium|high`), `velocity_status` (`ahead|on_track|slow|stalled`), `current_stage`, `days_in_stage int`, `expected_days_in_stage int`, `stage_velocity_ratio numeric`, `factors jsonb` (drivers + brakes), `model_version text`, `calculated_at`, `created_at`, `updated_at`. Index `(owner_id, velocity_status)`.
- Tabela `stage_velocity_baselines`: `id`, `stage`, `owner_id` (nullable = global), `avg_days numeric`, `median_days numeric`, `p75_days numeric`, `sample_size int`, `calculated_at`. Refresh por job/manual.
- RLS padrão (próprios + manager/admin).
- Realtime em ambas.

### 2. Edge function `predict-deal-velocity` (`verify_jwt = true`)
- Input: `{ sale_id }` ou `{ batch: true }`.
- Lê: sale + health_score + coverage + baselines do estágio + sinais de critical_moments.
- Lovable AI (`google/gemini-2.5-flash`) com tool calling: `{predicted_days_remaining, confidence_score, velocity_status, factors[]}`.
- Fallback heurístico robusto se IA falhar (usa baselines + dias parado).
- Upsert idempotente em `deal_velocity_predictions`.

### 3. Edge function `refresh-stage-baselines` (`verify_jwt = true`)
- Calcula avg/median/p75 dias por estágio com base em deals fechados (won/lost) dos últimos 90 dias, global e por owner.
- Upsert em `stage_velocity_baselines`.

### 4. Hooks `src/hooks/deal-intelligence/`
- `useDealVelocity(saleId)` — query individual + realtime.
- `useDealVelocityBatch(filters)` — lista filtrada por status.
- `usePredictVelocity()` — single ou batch mutation.
- `useStageBaselines()` — leitura + refresh mutation.

### 5. UI — `src/components/deal-intelligence/`
- `DealVelocityCard.tsx` (≤220L) — card com ETA, days remaining, confidence ring, status badge, comparação com baseline do estágio.
- `VelocityStatusBadge.tsx` (≤80L) — pill colorida (`ahead/on_track/slow/stalled`).
- `VelocityForecastTimeline.tsx` (≤140L) — linha visual mostrando passado (dias decorridos por estágio) + futuro previsto até close.
- `StageBaselinesPanel.tsx` (≤160L) — admin panel com baselines globais, refresh manual.
- `velocityHelpers.ts` — labels PT-BR, cores, formatadores de dias/datas.
- **Integração**:
  - `DealHealthCard.tsx`: mini-indicador "Fecha em ~X dias" no rodapé.
  - `BuyingCommitteeCard.tsx`: ícone de velocidade no header.
  - Página `/deal-intelligence`: nova aba "Velocidade & Forecast" com tabela de deals priorizada por confidence × valor.
  - `KanbanCard`: badge ETA inline (compacto).

### 6. Configuração
- `supabase/config.toml`: `[functions.predict-deal-velocity]` e `[functions.refresh-stage-baselines]` com `verify_jwt = true`.

### 7. Validação
- `supabase--curl_edge_functions /predict-deal-velocity` em sale real → confirma row + ETA coerente.
- `supabase--linter` zero novos warnings.
- Card aparece e badges são consistentes.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime)
- **Criar**: `supabase/functions/predict-deal-velocity/index.ts`, `supabase/functions/refresh-stage-baselines/index.ts`
- **Criar**: `src/hooks/deal-intelligence/useDealVelocity.ts`, `useStageBaselines.ts`
- **Criar**: 5 componentes/helpers em `src/components/deal-intelligence/`
- **Editar**: `DealHealthCard.tsx`, `BuyingCommitteeCard.tsx`, `src/pages/DealIntelligence.tsx` (nova aba), `KanbanCard` (ou equivalente), `supabase/config.toml`

Após esta entrega, sigo automaticamente para 4/4: **Stage Conversion Optimizer**, fechando o bloco Deal Intelligence em 10/10.
