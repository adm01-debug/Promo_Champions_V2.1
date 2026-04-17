
Próxima melhoria atômica da fila Sales Engagement: **5/7 — Email Engagement Scoring**.

## Melhoria 5/7 — Email Engagement Scoring

### Estado atual
- 1-4/7 ✅ entregues. Já capturamos `opens`/`clicks`/`replies` no `contact_send_time_profile` (granular por hora/dia).
- Não há score consolidado por contato/deal nem visualização de "temperatura" de engajamento ao longo do tempo.
- `lead_scores` existe mas mistura sinais ICP+atividade; não isola engajamento de email/sequence.

### Mudanças

**1. Migration**
- Tabela `contact_engagement_score`:
  - `id`, `contact_id`, `contact_type` ('lead'|'client'), `score` numeric (0-100), `tier` text ('cold'|'warm'|'hot'|'on_fire'), `total_opens`, `total_clicks`, `total_replies`, `last_signal_at timestamptz`, `decay_applied_at`, `updated_at`
  - Unique (contact_id, contact_type)
- Tabela `engagement_score_history`: snapshot diário (`contact_id`, `contact_type`, `score`, `tier`, `captured_at date`) p/ sparkline
- View `engagement_score_leaderboard`: top contatos por score nas últimas 2 semanas (filtra por owner via JOIN)
- RPC `recompute_engagement_score(_contact_id, _contact_type)`:
  - SECURITY DEFINER. Score = soma ponderada dos sinais nos últimos 30d com decay exponencial (half-life 7d): open=1, click=3, reply=8, bounce=-5, unsub=-20. Normaliza para 0-100. Atualiza tier (0-20 cold, 21-50 warm, 51-80 hot, 81+ on_fire).
- RPC `bulk_recompute_engagement(_owner_id uuid)`: recomputa para todos contatos do owner (cron-friendly)
- Trigger em `contact_send_time_profile` AFTER INSERT/UPDATE → enfileira recomputação via `pg_notify` ou direta (chamada RPC)
- RLS: SELECT para owner via has_role + ownership

**2. Edge function `engagement-score-recompute` (nova, verify_jwt=false, scheduled)**
- POST `{ ownerId? }` → roda `bulk_recompute_engagement`
- Após recompute: insere snapshot em `engagement_score_history` se score mudou ≥2pts
- Retorna `{ updated, snapshots }`

**3. Edge function `sequence-record-reply` (update)**
- Após gravar reply + signal: chama `recompute_engagement_score` inline para o contato

**4. Edge function `sequence-runner` (update)**
- Após registrar open/click sintético em `record_engagement_signal`: dispara `recompute_engagement_score`

**5. Hooks**
- `useEngagementScore(contactId, contactType)` — score atual + histórico 30d
- `useEngagementLeaderboard(limit=10)` — top contatos
- `useRecomputeEngagement()` — botão manual

**6. Componentes UI (≤300L cada)**
- `EngagementScoreBadge.tsx`: chip colorido (cold=blue, warm=yellow, hot=orange, on_fire=red) com score numérico e ícone (Snowflake/Sun/Flame/Zap)
- `EngagementScoreCard.tsx`: card grande com score, tier, sparkline 30d (recharts), breakdown (opens/clicks/replies), última atividade
- `EngagementLeaderboardWidget.tsx`: top 10 hot leads no Dashboard com link p/ contato
- `engagementScoreHelpers.ts`: cálculo de cor/ícone/label por tier, formatação

**7. Integração**
- `LeadDetailDrawer.tsx` / `ClientDetailDrawer.tsx`: adiciona `EngagementScoreCard` no topo
- `LeadsTable.tsx` / `ClientsTable.tsx`: nova coluna "Engagement" com `EngagementScoreBadge`
- `Dashboard/Index.tsx`: novo widget `EngagementLeaderboardWidget`
- `SequenceEnrollmentsDrawer.tsx`: badge ao lado do nome do contato

**8. Validação**
- Smoke RLS via `read_query` na nova tabela + view
- Inserir sinais sintéticos (5 opens, 2 clicks, 1 reply) p/ contato → recompute → score >40 tier=warm/hot
- Aguardar 7d simulado (manipular `decay_applied_at`) → score decai
- Verificar leaderboard ordenado corretamente
- Linter Supabase: zero novos warnings; console limpo; zero erros TS

### Arquivos
- Criar: migration nova (2 tabelas + 1 view + 2 RPCs + trigger + RLS)
- Criar: `supabase/functions/engagement-score-recompute/index.ts`
- Criar: `src/hooks/engagement/useEngagementScore.ts`
- Criar: `src/components/engagement/EngagementScoreBadge.tsx`, `EngagementScoreCard.tsx`, `EngagementLeaderboardWidget.tsx`, `engagementScoreHelpers.ts`
- Editar: `supabase/functions/sequence-runner/index.ts`, `supabase/functions/sequence-record-reply/index.ts`, `supabase/config.toml`, `src/components/leads/LeadDetailDrawer.tsx`, `src/components/clients/ClientDetailDrawer.tsx`, `src/pages/Index.tsx`, `src/components/sequences/SequenceEnrollmentsDrawer.tsx`

Após esta, sigo automaticamente para 6/7 (Reply Detection & Auto-Pause) e 7/7 (Multichannel Native Send: WhatsApp+SMS).
