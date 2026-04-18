
Deal Intelligence 2/4 entregue. Próxima atômica.

**Deal Intelligence — 3/4: Stage Velocity Analyzer**

Mede tempo que cada deal passa em cada estágio, compara com baseline da equipe/segmento, identifica deals "presos" e estágios-gargalo, e gera recomendações de desbloqueio.

## Entregáveis

### 1. Migration
- `deal_stage_transitions`: `id`, `sale_id` FK, `from_stage text`, `to_stage text`, `entered_at timestamptz`, `exited_at timestamptz`, `duration_hours numeric` (gerado), `transitioned_by uuid`, `created_at`. Índices `(sale_id, entered_at)`, `(to_stage)`.
- `stage_velocity_baselines`: `id`, `stage text`, `segment text` (smb/mid/enterprise/all), `p50_hours numeric`, `p75_hours numeric`, `p90_hours numeric`, `sample_size int`, `computed_at`. Único `(stage, segment)`.
- `deal_velocity_alerts`: `id`, `sale_id` FK UNIQUE, `current_stage text`, `hours_in_stage numeric`, `baseline_p75 numeric`, `severity` (`watch|stuck|critical`), `recommendation text`, `detected_at`. 
- Trigger em `sales` para registrar transição quando `stage` muda.
- RLS read authenticated, write admin/manager. Realtime + índices.

### 2. Edge functions (verify_jwt=true)
- `recompute-stage-baselines`: agrega `deal_stage_transitions` últimos 90d em percentis por estágio×segmento, upsert `stage_velocity_baselines`.
- `detect-stuck-deals`: para cada deal aberto, calcula horas no estágio atual, compara com baseline p75/p90, classifica severidade, upsert `deal_velocity_alerts` com recomendação por estágio.

### 3. Hooks `src/hooks/deal-intelligence/useStageVelocity.ts`
- `useDealVelocity(saleId)` — alerta + transições do deal.
- `useStageBaselines()` — baselines globais.
- `useStuckDeals(limit?)` — leaderboard stuck/critical.
- `useStageBottlenecks()` — agregado: estágios com maior tempo médio + nº deals presos.
- `useRecomputeBaselines()` / `useDetectStuckDeals()` — mutations.

### 4. Componentes `src/components/deal-intelligence/velocity/`
- `StageVelocityCard.tsx` (≤220L) — card no drawer do deal: tempo no estágio atual vs baseline, badge severidade, timeline horizontal das transições, recomendação.
- `StageTransitionsTimeline.tsx` (≤160L) — chips horizontais com tempo por estágio.
- `StuckDealsPanel.tsx` (≤220L) — hub: top 10 deals stuck/critical com horas, baseline, dono, ação sugerida.
- `StageBottlenecksChart.tsx` (≤180L) — Recharts bar: tempo médio por estágio + linha de baseline p75.
- `velocityHelpers.ts` — labels severidade, cores, recomendações por estágio, formatador horas→legível.

### 5. Integração
- Drawer do deal (Pipeline): `<StageVelocityCard saleId />` abaixo do `<DealHealthCard />`.
- `DealIntelligence.tsx`: nova aba "Velocidade" com `<StuckDealsPanel />` + `<StageBottlenecksChart />`.
- `supabase/config.toml`: blocos `verify_jwt = true` para as duas funções.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após detect: alertas aparecem no card e no painel; bottlenecks mostram estágio mais lento.

## Arquivos
- **Migration**: 1 (3 tabelas + trigger + RLS + realtime + índices).
- **Edge functions**: 2.
- **Criar**: 5 hooks (1 arquivo), 4 componentes + 1 helper.
- **Editar**: drawer do deal, `DealIntelligence.tsx`, `supabase/config.toml`.

Após esta entrega, sigo para **4/4: Win/Loss Pattern Miner**, fechando Deal Intelligence em 10/10.
