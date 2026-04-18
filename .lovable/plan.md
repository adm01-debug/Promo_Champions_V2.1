
Conversation Intelligence 3/4 (Objection Handling) entregue. Última atômica do bloco rumo aos 10/10.

**Conversation Intelligence — 4/4: Coaching Scorecard Aggregator**

Agrega todos os scores conversacionais já existentes (metrics, questions, objections, sentiment, critical moments) em um scorecard unificado por vendedor + por call, com tendências, ranking de coaching e recomendações priorizadas.

## O que entregar

### 1. Migration
- `call_coaching_scorecards`: `id`, `recording_id` FK UNIQUE, `salesperson_id` uuid, `overall_score numeric` (0-100), `talk_score numeric`, `question_score numeric`, `objection_score numeric`, `sentiment_score numeric`, `moments_score numeric`, `health` (`poor|fair|good|excellent`), `top_strengths jsonb` (top 2), `top_gaps jsonb` (top 2), `recommendations jsonb` (3-5 ações), `factors jsonb`, `calculated_at timestamptz`. RLS read authenticated, write admin/manager.
- `salesperson_coaching_aggregates`: `id`, `salesperson_id` UNIQUE, `period_start date`, `period_end date`, `calls_analyzed int`, `avg_overall numeric`, `avg_talk numeric`, `avg_questions numeric`, `avg_objections numeric`, `avg_sentiment numeric`, `trend_direction` (`up|flat|down`), `trend_delta numeric`, `top_recurring_gap text`, `last_calculated_at timestamptz`. RLS igual.
- Índices `(recording_id)`, `(salesperson_id, calculated_at desc)`, realtime nas duas.

### 2. Edge function `aggregate-coaching-scorecard` (verify_jwt=true)
- Input: `{ recording_id }`. Lê analyses existentes (metrics, questions, objections, sentiment, critical_moments).
- Pondera: `overall = talk*0.20 + questions*0.25 + objections*0.25 + sentiment*0.15 + moments*0.15`.
- Identifica top 2 forças (scores mais altos) e top 2 gaps (mais baixos).
- Gera 3-5 recomendações por templates por gap (PT-BR), ex.: gap=questions → "Aumentar perguntas abertas e de descoberta nos primeiros 5min".
- Upsert `call_coaching_scorecards`.
- Recalcula `salesperson_coaching_aggregates` para o vendedor (últimos 30 dias): médias, tendência (delta vs 30 dias anteriores), gap recorrente.
- Encadear em `useTranscribeRecording.ts` após `analyze-objection-handling`.

### 3. Hooks `src/hooks/conversational/useCoachingScorecard.ts`
- `useCoachingScorecard(recordingId)` — query + realtime.
- `useSalespersonCoachingAggregate(salespersonId)` — agregado + realtime.
- `useCoachingLeaderboard(filters?)` — top/bottom vendedores por overall.
- `useAggregateCoachingScorecard()` — mutation.

### 4. Componentes `src/components/conversational/coaching/`
- `CoachingScorecardCard.tsx` (≤220L) — drawer: overall radial, breakdown por dimensão, forças/gaps, recomendações, botão recalcular.
- `ScorecardRadial.tsx` (≤140L) — radial Recharts overall_score com cor por health.
- `ScorecardDimensionsBar.tsx` (≤160L) — 5 barras horizontais: talk/questions/objections/sentiment/moments.
- `RecommendationsList.tsx` (≤140L) — lista priorizada de ações de coaching com ícone + categoria.
- `CoachingLeaderboardPanel.tsx` (≤240L) — hub: top 5 + bottom 5 vendedores, sparkline tendência, gap recorrente.
- `coachingHelpers.ts` — `calcOverall`, `pickStrengthsGaps`, `buildRecommendations`, paletas, labels PT-BR.

### 5. Integração
- `RecordingSummaryDrawer.tsx`: `<CoachingScorecardCard />` após `<ObjectionHandlingCard />` (no topo do drawer como destaque).
- `ConversationalIntelligenceHub.tsx`: `<CoachingLeaderboardPanel onSelect={drawer.open} />` após `<ObjectionLibraryPanel />`.
- `supabase/config.toml`: `[functions.aggregate-coaching-scorecard] verify_jwt = true`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após transcrever uma call: scorecard mostra overall, breakdown e recomendações; hub lista ranking de coaching.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime + índices).
- **Edge function**: `aggregate-coaching-scorecard`.
- **Criar**: 4 hooks (1 arquivo), 5 componentes + 1 helper.
- **Editar**: `useTranscribeRecording.ts`, `RecordingSummaryDrawer.tsx`, `ConversationalIntelligenceHub.tsx`, `supabase/config.toml`.

Após esta entrega, **Conversation Intelligence fecha 4/4 (10/10)** e sigo automaticamente para o próximo bloco do roadmap mestre.
