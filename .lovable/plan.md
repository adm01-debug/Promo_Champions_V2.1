
**Bloco Deal Intelligence ✅ fechado em 4/4 (10/10).** Avançando para o próximo bloco do `GAPS_CLASSE_MUNDIAL.md`.

---

**Próximo bloco — Revenue Intelligence (1/4): AI Forecast Engine**

Próxima atômica: gerar **forecast de receita por período** (semana/mês/trimestre) baseado em pipeline real + velocity predictions + health scores + committee coverage, com cenários (commit/best/upside) e variação vs. meta — para gestor saber exatamente quanto vai entrar e onde focar.

## Estado atual
- `sales_goals` existe mas forecast é manual/estático.
- Pipeline tem health (1/4), committee (2/4), velocity (3/4), conversion (4/4) — sinais ricos não consolidados em projeção financeira.
- Sem cenários, sem confidence interval, sem "gap to goal" automático.

## Mudanças

### 1. Migration
- `revenue_forecasts`: `id`, `owner_id` (nullable=team), `period_type` (`week|month|quarter`), `period_start date`, `period_end date`, `commit_amount numeric`, `best_case_amount numeric`, `upside_amount numeric`, `confidence_score int`, `goal_amount numeric`, `gap_to_goal numeric`, `deals_count int`, `weighted_pipeline numeric`, `factors jsonb`, `ai_summary text`, `model_version`, `calculated_at`, timestamps. Unique `(owner_id, period_type, period_start)`. RLS + realtime.
- `forecast_deal_contributions`: `id`, `forecast_id` FK, `sale_id` FK, `category` (`commit|best|upside|omitted`), `weighted_amount numeric`, `probability numeric`, `reasoning text`. Index `(forecast_id, category)`.

### 2. Edge function `generate-revenue-forecast` (verify_jwt=true)
- Input: `{owner_id?, period_type, period_start}`.
- Lê: deals abertos + velocity predictions + health + coverage + sales_goals.
- Classifica cada deal em commit/best/upside via heurística (health≥75+velocity on_track+coverage≥strong = commit) com refinamento Lovable AI (`google/gemini-2.5-flash` tool calling) para gerar `ai_summary` + `factors`.
- Upsert idempotente em `revenue_forecasts` + `forecast_deal_contributions`.

### 3. Hooks `src/hooks/revenue-intelligence/`
- `useRevenueForecast(periodType, periodStart, ownerId?)` + realtime.
- `useForecastContributions(forecastId)`.
- `useGenerateForecast()` mutation.

### 4. UI — `src/components/revenue-intelligence/`
- `RevenueForecastCard.tsx` (≤220L) — 3 cenários lado a lado (commit/best/upside) + ring de confidence + gap to goal.
- `ForecastDealsTable.tsx` (≤200L) — deals por categoria com weighted amount e razão.
- `ForecastScenarioBar.tsx` (≤140L) — barra empilhada commit→best→upside vs. meta.
- `PeriodSelector.tsx` (≤100L) — week/month/quarter + navegação.
- `forecastHelpers.ts` — labels, cores por cenário, formatadores BRL.
- **Página nova**: `src/pages/RevenueIntelligence.tsx` com tab "Forecast" (próximos itens 2-4 adicionarão tabs).
- **Rota**: `/revenue-intelligence` em `AppRoutes.tsx` + `lazyPages.ts`.
- **Sidebar**: novo item em `sidebarMenuData.ts` (grupo Analytics, ícone TrendingUp).

### 5. Configuração
- `supabase/config.toml`: `[functions.generate-revenue-forecast] verify_jwt = true`.

### 6. Validação
- `supabase--curl_edge_functions /generate-revenue-forecast` para mês corrente.
- `supabase--linter` zero novos warnings.
- Página renderiza 3 cenários + tabela.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime)
- **Criar**: edge function, 2 hooks, 5 componentes/helpers, 1 página
- **Editar**: `AppRoutes.tsx`, `lazyPages.ts`, `sidebarMenuData.ts`, `supabase/config.toml`

Após esta entrega, sigo automaticamente para 2/4: **Pipeline Coverage Analyzer** → 3/4 **Win Probability Calibration** → 4/4 **Quota Attainment Predictor**, fechando Revenue Intelligence em 10/10.
