
**Bloco Deal Intelligence — item 2/4: Buying Committee Mapping (DMU)**

Próxima atômica: mapear o **Decision Making Unit** de cada deal — quem são os stakeholders (Decision Maker, Champion, Influencer, Blocker, Economic Buyer, User), seu nível de engajamento, sentimento e relação de poder — para que vendedor/gestor enxerguem rapidamente se o deal tem cobertura suficiente para fechar.

## Estado atual
- `sales` tem `client_name` mas zero estrutura de stakeholders.
- `clients` tem `contact_name` único — sem múltiplos contatos com papéis.
- Calls (`call_recordings` + `diarization` + `transcript`) mencionam nomes/cargos que nunca são extraídos como entidades.
- Sem visualização de "quem decide" no deal, sem alerta "deal sem champion identificado", sem score de cobertura do comitê.

## Mudanças

### 1. Migration
- Tabela `deal_stakeholders`: `id`, `sale_id` (FK), `owner_id`, `name`, `role_title`, `dmu_role` (`decision_maker|economic_buyer|champion|influencer|user|blocker|unknown`), `influence_level` (`low|medium|high`), `engagement_score int 0-100`, `sentiment` (`positive|neutral|negative`), `email`, `phone`, `linkedin_url`, `notes`, `last_interaction_at`, `source` (`manual|ai_extracted|email|call`), `created_at`, `updated_at`. Index `(sale_id, dmu_role)`.
- Tabela `deal_committee_coverage`: `id`, `sale_id` UNIQUE, `coverage_score int 0-100`, `tier` (`weak|partial|strong|complete`), `gaps jsonb` (papéis ausentes), `risks jsonb`, `calculated_at`. Realtime.
- RLS: vendedor vê próprios; manager/admin vê tudo.
- Trigger recalcula `coverage` quando stakeholders mudam (chama edge function via pg_net opcional, ou apenas marca dirty — vou usar invalidação client-side).

### 2. Edge function `extract-deal-stakeholders` (`verify_jwt = true`)
- Input: `{ recording_id }` ou `{ sale_id, manual_text }`.
- Lê transcript + diarização da call.
- Lovable AI (`google/gemini-2.5-flash`) com tool calling: array de stakeholders extraídos `{name, role_title, dmu_role, influence_level, sentiment, signals[]}`.
- Faz upsert em `deal_stakeholders` por (`sale_id`, lowercase `name`), preservando edições manuais (`source='manual'` não é sobrescrito).

### 3. Edge function `calculate-committee-coverage` (`verify_jwt = true`)
- Input: `{ sale_id }`.
- Lê stakeholders → calcula score baseado em: presença de Decision Maker (+30), Economic Buyer (+20), Champion (+25), pelo menos 1 Influencer (+10), ausência de Blocker bloqueador (+15).
- Retorna `{coverage_score, tier, gaps[], risks[]}` e upserta em `deal_committee_coverage`.
- Auto-chain: chamada após `extract-deal-stakeholders`.

### 4. Hooks `src/hooks/deal-intelligence/`
- `useDealStakeholders(saleId)` — query + realtime.
- `useUpsertStakeholder()` — mutation manual (CRUD).
- `useDeleteStakeholder()`.
- `useCommitteeCoverage(saleId)` — query + realtime.
- `useExtractStakeholders()` — invoca edge function a partir de uma recording.
- `useRecalculateCoverage()`.

### 5. UI — `src/components/deal-intelligence/`
- `BuyingCommitteeCard.tsx` (≤220L) — card principal com:
  - Header: score de cobertura (ring) + tier badge.
  - Lista de stakeholders agrupados por `dmu_role` (avatar com inicial, nome, cargo, badges de influência/sentimento).
  - Botão "Adicionar stakeholder" + "Extrair da última call".
  - Lista de gaps ("Falta Economic Buyer", etc).
- `StakeholderListItem.tsx` (≤140L) — item com avatar, badges, ações (editar/remover).
- `StakeholderFormDialog.tsx` (≤200L) — dialog com Form/Zod para criar/editar.
- `CommitteeCoverageRing.tsx` (≤100L) — SVG ring colorido por tier.
- `DMURoleBadge.tsx` (≤80L) — pill colorida por papel DMU.
- `committeeHelpers.ts` — labels PT-BR, cores, ícones por papel, formatadores.
- **Integração**:
  - `DealHealthCard.tsx` (item 1/4): adicionar mini-indicador de coverage no rodapé.
  - Página `/deal-intelligence`: nova aba "Comitê de Compra" mostrando deals com `coverage.tier='weak'`.
  - `RecordingSummaryDrawer.tsx`: novo botão "Mapear Comitê desta call" → dispara `useExtractStakeholders`.

### 6. Configuração
- `supabase/config.toml`: blocos `[functions.extract-deal-stakeholders]` e `[functions.calculate-committee-coverage]` com `verify_jwt = true`.

### 7. Validação
- `supabase--curl_edge_functions /extract-deal-stakeholders` em recording real → confirma stakeholders + coverage.
- `supabase--linter` zero novos warnings.
- Card aparece embedado e gaps são listados corretamente.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime)
- **Criar**: `supabase/functions/extract-deal-stakeholders/index.ts`, `supabase/functions/calculate-committee-coverage/index.ts`
- **Criar**: `src/hooks/deal-intelligence/useDealStakeholders.ts`, `useCommitteeCoverage.ts`
- **Criar**: 6 componentes/helpers em `src/components/deal-intelligence/`
- **Editar**: `DealHealthCard.tsx`, `src/pages/DealIntelligence.tsx` (nova aba), `RecordingSummaryDrawer.tsx`, `supabase/config.toml`

Após esta entrega, sigo automaticamente para 3/4: **Deal Velocity Predictor** → 4/4 **Stage Conversion Optimizer**, fechando o bloco em 10/10.
