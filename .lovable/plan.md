
Revenue Intelligence fechou 4/4 (10/10). Próximo bloco do roadmap mestre rumo aos 10/10 globais.

**Próximo bloco — Conversation Intelligence Hub (1/4): Talk Ratio & Pace Analyzer**

Já existem (base): transcrição, diarização, sumário, sentiment timeline, momentos críticos, menções a competidores e ações de coaching (`useTranscribeRecording.ts`). Falta a camada de **métricas conversacionais quantitativas** que transforme cada call em score objetivo de qualidade — fundamento para os próximos 3 módulos (Question Quality, Objection Handling, Coaching Scorecard).

## O que entregar

### 1. Migration
- `call_conversation_metrics`: `id`, `recording_id` FK UNIQUE, `seller_talk_ratio numeric` (0-1), `client_talk_ratio numeric`, `silence_ratio numeric`, `longest_monologue_seconds int`, `interruptions_count int`, `seller_words_per_minute int`, `client_words_per_minute int`, `pace_score numeric` (0-100), `engagement_score numeric` (0-100), `health` (`poor|fair|good|excellent`), `factors jsonb`, `calculated_at timestamptz`. RLS authenticated read; admin/manager write.
- `call_metric_benchmarks`: `id`, `metric` text, `p25 numeric`, `p50 numeric`, `p75 numeric`, `target_min numeric`, `target_max numeric`, `updated_at`. Seed com benchmarks padrão (talk_ratio 40-60%, WPM 130-160, etc.).
- Índices em `(recording_id)` e `(health, calculated_at desc)`. Realtime nas duas.

### 2. Edge function `analyze-conversation-metrics` (verify_jwt=true)
- Input: `{ recording_id: string }`.
- Lê `diarization_turns` da recording → calcula talk ratios (segundos por speaker / total), silence ratio, longest monologue, interruptions (turn switch <1s), WPM por speaker.
- Pace score: distância do WPM ideal (130-160). Engagement: combinação de talk balance + low silence + interruption penalty.
- Health: <40 poor, 40-60 fair, 60-80 good, >80 excellent.
- Upsert em `call_conversation_metrics`.

### 3. Hooks `src/hooks/conversational/`
- `useConversationMetrics(recordingId)` — query + realtime.
- `useConversationMetricsFeed(filters?)` — lista agregada (últimas 50) para hub.
- `useAnalyzeConversationMetrics()` — mutation invocando edge function.
- Encadear automaticamente em `useTranscribeRecording.ts` após `diarize-call-recording` (paralelo a summarize).

### 4. Componentes `src/components/conversational/metrics/`
- `ConversationMetricsCard.tsx` (≤200L) — card por recording: talk ratio donut, WPM, health badge, botão "recalcular".
- `TalkRatioDonut.tsx` (≤120L) — donut Recharts seller×client×silence com legenda.
- `PaceGauge.tsx` (≤140L) — gauge semicircular WPM com banda alvo (verde 130-160).
- `EngagementBreakdown.tsx` (≤160L) — barras: talk balance, silence, interruptions, monologue — cada uma colorida por health.
- `ConversationMetricsFeed.tsx` (≤220L) — lista das últimas 50 calls com métricas, filtros por health, ordenação.
- `metricsHelpers.ts` — `classifyHealth`, `calcEngagement`, `formatWPM`, paleta.

### 5. Integração
- Renderizar `ConversationMetricsCard` dentro do `CallRecordingDetailDrawer` (abaixo de Sumário/Sentiment).
- Nova rota/aba **"Conversation Intelligence"** no hub conversacional existente exibindo `ConversationMetricsFeed` + KPIs agregados.
- `supabase/config.toml`: `[functions.analyze-conversation-metrics] verify_jwt = true`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após transcrever uma call, métricas aparecem no drawer; feed lista calls com health badges.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime + índices + seed benchmarks).
- **Edge function**: `analyze-conversation-metrics`.
- **Criar**: 3 hooks, 5 componentes + 1 helper.
- **Editar**: `useTranscribeRecording.ts` (chain), `CallRecordingDetailDrawer.tsx`, hub conversacional, `supabase/config.toml`.

Após esta entrega, sigo automaticamente para **Conversation Intelligence 2/4: Question Quality Scorer** → 3/4 **Objection Handling Tracker** → 4/4 **Coaching Scorecard Aggregator**, fechando o bloco em 10/10.
