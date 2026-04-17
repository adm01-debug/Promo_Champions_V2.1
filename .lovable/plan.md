
**Bloco Conversation Intelligence — item 4/4 (último): Momentos Críticos com Notificações**

Próxima atômica: detectar **momentos críticos automaticamente** em cada call (objeções fortes, menções de preço, sinais de churn, sinais de compra, concorrentes, pedidos de desconto) e disparar **notificações em tempo real** para vendedor + gestor, com link direto para o timestamp exato no player.

## Estado atual
- `key_moments` em `call_recordings` é jsonb genérico, sem categorização nem severidade.
- `competitor_mentions` já existe (item 1/4).
- `coaching_actions` já existe (item 2/4).
- `call_sentiment_timeline` já existe (item 3/4).
- **Faltam**: tipos de momentos categorizados (objection/buying_signal/price/discount/churn/competitor) + sistema de notificações ativas + indicador visual no player + feed em tempo real.

## Mudanças

### 1. Migration
- Tabela `call_critical_moments`: `id`, `recording_id`, `owner_id`, `salesperson_id`, `moment_type` (`objection|buying_signal|price_mention|discount_request|churn_signal|competitor|commitment|next_step`), `severity` (`low|medium|high|critical`), `timestamp_sec int`, `quote text`, `context text`, `suggested_action text`, `status` (`new|acknowledged|actioned|dismissed`), `created_at`, `updated_at`. Index `(owner_id, status, severity, created_at desc)`.
- Tabela `critical_moment_notifications`: `id`, `moment_id` (FK), `recipient_user_id`, `delivered bool`, `read_at`, `created_at`.
- RLS: salesperson vê os próprios; manager/admin veem da equipe.
- Trigger `notify_critical_moment_created` que insere row em `critical_moment_notifications` para o vendedor + managers ativos quando severity ∈ (`high`,`critical`).
- Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.call_critical_moments, public.critical_moment_notifications`.

### 2. Edge function `detect-critical-moments` (`verify_jwt = true`)
- Input: `{ recording_id }`.
- Lê `transcript`, `diarization`, `call_sentiment_timeline`.
- Lovable AI (`google/gemini-2.5-flash`) com tool calling estruturado: array `{moment_type, severity, timestamp_sec, quote, context, suggested_action}`.
- Idempotente: deleta `status='new'` antigos da mesma recording.
- Auto-chain: chamada após `analyze-sentiment-timeline` em `useTranscribeRecording`.

### 3. Hooks `src/hooks/conversational/`
- `useCriticalMoments(recordingId)` — lista momentos da call.
- `useMyCriticalMomentsFeed(limit)` — realtime feed dos meus + canal subscribe.
- `useUpdateCriticalMoment()` — mutation para `status`.
- `useDetectCriticalMoments()` — re-roda detecção.

### 4. UI
- `src/components/conversational/CriticalMomentsList.tsx` (≤200L) — lista categorizada por severidade no `RecordingSummaryDrawer`, com timestamp clicável (`onSeek`), badges por tipo/severidade, ações (Acknowledge/Action/Dismiss).
- `src/components/conversational/CriticalMomentsTimeline.tsx` (≤140L) — markers visuais sobrepostos no `SentimentTimelineChart` (linhas verticais coloridas por severidade nos timestamps dos momentos).
- `src/components/conversational/CriticalMomentsFeed.tsx` (≤180L) — feed lateral live para o dashboard do gestor: lista realtime ordenada por severidade/data, com link "Ver na call".
- `src/components/conversational/CriticalMomentBadge.tsx` (≤80L) — pill colorida por tipo/severidade, reusada na lista e no toast.
- `src/components/conversational/criticalMomentsHelpers.ts` — labels PT-BR, ícones por tipo, cores por severidade, formatadores.
- **Toast realtime**: hook `useMyCriticalMomentsFeed` dispara `toast.warning/error` (sonner) ao receber novo momento `high/critical` via realtime, com botão "Abrir call".
- Editar `RecordingSummaryDrawer.tsx`: nova seção "Momentos Críticos" acima de Coaching, embedando `<CriticalMomentsList>` + passar `moments` para `<SentimentTimelineChart>` para overlay.
- Editar dashboard do gestor (`BIGestorHub.tsx` ou similar): novo card lateral `<CriticalMomentsFeed>`.

### 5. Configuração
- `supabase/config.toml`: `[functions.detect-critical-moments] verify_jwt = true`.

### 6. Validação
- `supabase--curl_edge_functions /detect-critical-moments` em recording real → confirma rows + notification trigger.
- `supabase--linter` zero novos warnings.
- Realtime: abrir 2 abas, criar momento via curl, toast aparece na aba do vendedor.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + trigger + realtime)
- **Criar**: `supabase/functions/detect-critical-moments/index.ts`
- **Criar**: `src/hooks/conversational/useCriticalMoments.ts`
- **Criar**: 5 arquivos em `src/components/conversational/` (list, timeline overlay, feed, badge, helpers)
- **Editar**: `src/components/conversational/RecordingSummaryDrawer.tsx`, `src/components/conversational/SentimentTimelineChart.tsx` (aceita `moments` prop), `src/hooks/conversational/useTranscribeRecording.ts` (auto-chain), dashboard do gestor, `supabase/config.toml`

Após esta entrega, **Conversation Intelligence fecha 4/4 (10/10)** e sigo automaticamente para o próximo bloco do `GAPS_CLASSE_MUNDIAL.md`.
