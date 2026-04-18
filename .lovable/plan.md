
Usuário quer reformular Race Arena: 2 corridas mensais separadas (Closer e SDR), cada uma com sistema de pontuação configurável pelo admin baseado em métricas específicas do papel, com auto-atualização das posições conforme as ações acontecem.

## Race Arena 2.0 — Corridas Segmentadas por Papel

### Conceito
- **2 temporadas mensais simultâneas**: uma para Closers, outra para SDRs
- **Pontuação configurável por admin**: pesos por métrica definidos antes da corrida
- **Auto-alimentação**: triggers/views recalculam progresso em tempo real conforme vendas, ativações, etc.

### Backend

**Migration 1 — Schema de pontuação**
- Adicionar `race_seasons.role_type` (`closer` | `sdr`) — permite 2 temporadas ativas (uma por papel)
- Nova tabela `race_scoring_rules`:
  - `season_id`, `metric_code` (sales_value, markup, new_clients, prospecting, stakeholders_captured, conversation_initiated, routine_compliance), `weight` (numeric), `points_per_unit` (numeric)
- Métricas por papel:
  - **Closer**: `sales_value`, `markup_pct`, `new_clients_activated`, `routine_compliance`
  - **SDR**: `stakeholders_captured`, `new_clients_activated`, `conversations_initiated`, `sales_value_originated`, `routine_compliance`

**Migration 2 — View de leaderboard recalculada**
- Substituir `race_leaderboard_view` por versão que:
  - Filtra vendedores por `role_type` da temporada
  - Para cada métrica configurada em `race_scoring_rules`, agrega valor real do período da temporada (de `sales`, `activities`, `salespeople`, etc.)
  - Calcula `score = Σ(metric_value × points_per_unit × weight)`
  - Calcula `progress = LEAST(score / goal_amount, 1.0)`
- Realtime nas tabelas-fonte garante atualização automática

**Edge function `start-race-season` (atualizar)**
- Aceitar `role_type` e array `scoring_rules`
- Finalizar temporada anterior do mesmo `role_type` (não todas)
- Inserir regras em `race_scoring_rules`
- Spawnar power-ups apenas para vendedores do papel correto

### Frontend

**`src/components/race/admin/`**
- `ScoringRulesEditor.tsx` (≤300L): form admin com sliders/inputs por métrica, preview em tempo real do impacto, presets ("Foco em volume", "Foco em qualidade", "Equilibrado")
- Atualizar `NewSeasonDialog` para incluir seletor `role_type` + abrir editor de regras

**`src/components/race/RaceArena.tsx` (atualizar)**
- Tabs "Corrida Closer" / "Corrida SDR" no topo
- Cada tab carrega temporada ativa do papel correspondente
- Exibir breakdown de pontuação no card do vendedor (quanto cada métrica está contribuindo)

**`src/components/race/ScoreBreakdownCard.tsx` (novo, ≤200L)**
- Mostra para cada vendedor: pontos por métrica + barra de contribuição
- Tooltip explicando regra ativa

**Hooks**
- `useRaceScoringRules.ts`: CRUD de regras
- `useRaceLeaderboard.ts` (atualizar): aceitar `role_type` e retornar breakdown

### Arquivos
- 2 migrations (schema + view)
- Editar: `supabase/functions/start-race-season/index.ts`
- Criar: `src/components/race/admin/ScoringRulesEditor.tsx`
- Criar: `src/components/race/ScoreBreakdownCard.tsx`
- Criar: `src/hooks/race/useRaceScoringRules.ts`
- Editar: `src/components/race/RaceArena.tsx`, `src/hooks/race/useRaceLeaderboard.ts`, `NewSeasonDialog`, página `/race-arena`
- Atualizar `src/integrations/supabase/types.ts` (auto)

Padrões: semantic tokens, Sora/Inter, framer-motion, ≤300L, strict TS, RLS preservado.
