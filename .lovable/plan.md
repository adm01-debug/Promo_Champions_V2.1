
Próxima atômica do **Sales Engagement Avançado** (item 5/8): **Account-Based Engagement (ABE)** — agrupar contatos por conta (empresa), ver buying committee, score consolidado da conta, atividade multi-stakeholder e playbooks ABM.

## Estado atual
- `sales` tem `client_name` mas sem agrupamento formal por conta/empresa.
- Engajamento, scoring e sequences operam por contato individual — sem visão consolidada da conta.
- Sem conceito de buying committee, sem score agregado por empresa, sem dashboard ABM.

## Mudanças

### 1. Migration
- Tabela `accounts`: `id`, `name`, `domain text`, `industry text`, `size_bucket text` (smb/mid/enterprise), `tier text` (tier1/tier2/tier3), `owner_id`, `created_at`. Unique em `lower(name)`.
- Tabela `account_contacts`: `id`, `account_id`, `sale_id`, `role text` (champion/decision_maker/influencer/user/blocker), `seniority text` (c_level/vp/director/manager/ic), `is_primary bool`, `created_at`. Unique `(account_id, sale_id)`.
- Coluna `account_id uuid` em `sales` (nullable, FK).
- RPC `get_account_engagement_summary(_account_id uuid)` → agrega score médio, total contatos, interações 30d, tier dominante.
- RPC `get_top_accounts(_limit int)` → ranking por score consolidado.
- RLS: owner vê o próprio; admin/manager veem tudo.
- Trigger: ao inserir/atualizar `sales` com `client_name` novo, criar/vincular `account` automaticamente.

### 2. Edge function `account-engagement-aggregator` (`verify_jwt = true`)
- Input: `{ account_ids?: string[], recompute_all?: boolean }`.
- Para cada account: agrega `email_engagement_scores` dos contatos vinculados.
  - Calcula `account_score` (média ponderada por seniority), `engaged_contacts`, `coverage` (% de contatos com tier ≥ warm).
  - Identifica `champion_count`, `decision_maker_count`.
- Atualiza colunas computadas em `accounts` (adicionar via migration: `account_score`, `coverage`, `engaged_contacts`, `last_aggregated_at`).
- Cron diário `0 5 * * *`.

### 3. Hook `src/hooks/engagement/useAccountEngagement.ts`
- `useAccount(accountId)`, `useAccountContacts(accountId)`, `useTopAccounts(limit)`, `useRecomputeAccountEngagement()`.

### 4. UI
- `src/components/engagement/Account/AccountScoreBadge.tsx` (≤80L) — chip "🏢 Tier 1 · 78".
- `src/components/engagement/Account/BuyingCommitteeCard.tsx` (≤180L) — lista contatos por role com seniority + EmailScoreBadge inline.
- `src/components/engagement/Account/AccountCoverageBar.tsx` (≤80L) — barra de cobertura (% engajados).
- `src/components/engagement/Account/TopAccountsLeaderboard.tsx` (≤180L) — top 20 contas.
- `src/pages/AccountBasedEngagement.tsx` (≤200L) — `/engagement/abm`:
  - Header + botão "Recalcular contas" (admin).
  - 4 stats (total contas, tier1, coverage médio, top score).
  - Embed leaderboard.
- `src/pages/AccountDetail.tsx` (≤180L) — `/engagement/abm/:accountId` com BuyingCommittee + score histórico + sequences ativas.

### 5. Integração
- `LeadDetailDrawer` / `ClientDetailDrawer`: link "Ver conta" + AccountScoreBadge.
- Sidebar: item "ABM (Contas)" sob Engajamento.
- Rotas em `AppRoutes` + `lazyPages`.

### 6. Validação
- `supabase--curl_edge_functions /account-engagement-aggregator` com 1 account → confirma upsert.
- `supabase--read_query` confere `account_score` + `coverage` populados.
- Linter zero novos warnings.

### Arquivos
- **Migration**: 1 (2 tabelas + coluna em sales + 4 colunas em accounts + 2 RPCs + trigger + cron + RLS)
- **Criar**: `supabase/functions/account-engagement-aggregator/index.ts`
- **Criar**: `src/hooks/engagement/useAccountEngagement.ts`
- **Criar**: 4 componentes em `src/components/engagement/Account/` + helpers
- **Criar**: `src/pages/AccountBasedEngagement.tsx`, `AccountDetail.tsx`
- **Editar**: `src/components/leads/LeadDetailDrawer.tsx`, `src/components/clients/ClientDetailDrawer.tsx`, `src/components/layout/sidebar/sidebarMenuData.ts`, `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, `supabase/config.toml`

Após esta entrega, sigo automaticamente para: **Power Dialer** → **Click-to-call Twilio** → fechando Sales Engagement em 10/10.
