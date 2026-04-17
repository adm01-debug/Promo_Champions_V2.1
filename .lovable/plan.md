
Próxima atômica do **Sales Engagement Avançado** (item 4/8): **Email Engagement Scoring** — score 0–100 por contato baseado em open/click/reply rate, recência e velocidade de resposta, com tier (cold/warm/hot/champion) e ranking.

## Estado atual
- Existe `email_tracking_events` (open/click/reply/bounce com `tracked_at` e `sale_id`).
- `lead_scoring` mistura sinais de pipeline mas **não isola engajamento de email** como dimensão própria.
- Sem score por contato dedicado a email, sem tier visual, sem ranking, sem histórico.

## Mudanças

### 1. Migration
- Tabela `email_engagement_scores`: `id`, `sale_id` UNIQUE, `score int` (0–100), `tier text` (`cold|warm|hot|champion`), `open_rate numeric`, `click_rate numeric`, `reply_rate numeric`, `avg_response_minutes int`, `recency_days int`, `total_sent int`, `total_opens int`, `total_clicks int`, `total_replies int`, `last_calculated_at`, `created_at`.
- Tabela `email_engagement_score_history`: snapshot diário (`sale_id`, `score`, `tier`, `captured_at`) — trigger ao update do score.
- RPC `get_engagement_leaderboard(_limit int)` → top contatos por score (apenas dos sales visíveis ao usuário via RLS).
- RLS: owner vê o próprio; admin/manager veem tudo.

### 2. Edge function `email-engagement-scorer` (`verify_jwt = true`)
- Input: `{ sale_ids?: string[], recompute_all?: boolean }` (limite 500).
- Para cada sale: agrega `email_tracking_events` últimos 90 dias.
  - Calcula `open_rate`, `click_rate`, `reply_rate`, `avg_response_minutes`, `recency_days`.
  - Score ponderado: open 25% · click 30% · reply 35% · recency bonus 10%.
  - Tier: <25 cold, 25–50 warm, 50–75 hot, ≥75 champion.
- Upsert em `email_engagement_scores`.
- Output: `{ updated, by_tier: {cold,warm,hot,champion} }`.

### 3. Cron diário
- pg_cron `0 4 * * *` chamando `email-engagement-scorer` com `recompute_all=true`.

### 4. Hook `src/hooks/engagement/useEmailEngagementScore.ts`
- `useEmailEngagementScore(saleId)` — query individual.
- `useEmailEngagementLeaderboard(limit)` — top via RPC.
- `useRecomputeEngagementScores()` — mutation batch.
- `useEngagementScoreHistory(saleId)` — trend para sparkline.

### 5. UI
- `src/components/engagement/EmailScore/EmailScoreBadge.tsx` (≤80L) — chip "🔥 Champion · 87" com cor por tier + tooltip detalhado (open/click/reply rates).
- `src/components/engagement/EmailScore/EmailScoreCard.tsx` (≤180L) — card detalhado com ring de score, métricas, sparkline de histórico.
- `src/components/engagement/EmailScore/EngagementLeaderboard.tsx` (≤180L) — top 20 contatos com badge de tier.
- `src/pages/EmailEngagementScoring.tsx` (≤200L) — `/engagement/email-scoring`:
  - Header + botão "Recalcular tudo" (admin).
  - 4 stats cards (cold/warm/hot/champion totais).
  - Embed leaderboard.

### 6. Integração
- `LeadDetailDrawer` / `ClientDetailDrawer`: `EmailScoreBadge` no header.
- `LeadScoringDashboard`: nova coluna "Engajamento Email" com badge.
- `BulkComposer` Step 1: filtro adicional "Apenas tier ≥ warm".
- Sidebar: item "Email Scoring" sob Engajamento.
- Rota `/engagement/email-scoring` em `AppRoutes` + `lazyPages`.

### 7. Validação
- `supabase--curl_edge_functions /email-engagement-scorer` com 1 sale_id real → confirma upsert + tier correto.
- `supabase--read_query` confirma score válido + history capturado.
- `supabase--linter` zero novos warnings.

### Arquivos
- **Migration**: 1 (2 tabelas + 1 RPC + 1 trigger + cron job + RLS)
- **Criar**: `supabase/functions/email-engagement-scorer/index.ts`
- **Criar**: `src/hooks/engagement/useEmailEngagementScore.ts`
- **Criar**: `src/components/engagement/EmailScore/EmailScoreBadge.tsx`, `EmailScoreCard.tsx`, `EngagementLeaderboard.tsx`, `engagementScoreHelpers.ts`
- **Criar**: `src/pages/EmailEngagementScoring.tsx`
- **Editar**: `src/components/leads/LeadDetailDrawer.tsx`, `src/components/clients/ClientDetailDrawer.tsx`, `src/components/lead-scoring/LeadScoringDashboard.tsx`, `src/components/engagement/BulkComposer/BulkComposerWizard.tsx`, `src/components/layout/sidebar/sidebarMenuData.ts`, `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, `supabase/config.toml`

Após esta entrega, sigo automaticamente para: **Account-Based Engagement** → **Power Dialer** → **Click-to-call Twilio** → fechando Sales Engagement em 10/10.
