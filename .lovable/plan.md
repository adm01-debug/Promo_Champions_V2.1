
Revenue Intelligence Hub fechado em 4/4 (10/10). Próximo bloco do roadmap mestre.

**Próximo bloco — Sales Coaching Intelligence (1/4): Coaching Opportunity Detector**

Detecta automaticamente oportunidades de coaching analisando gaps de performance entre vendedores. Compara métricas individuais (taxa de conversão por estágio, tempo médio em estágio, win rate, ticket médio, atividades/dia) contra benchmarks da equipe e identifica os 3 maiores gaps de cada vendedor + sugestão de skill a desenvolver.

## Entregáveis

### 1. Migration
- `coaching_opportunities`: `id`, `salesperson_id FK`, `metric_key text` (`conversion_rate|stage_duration|win_rate|avg_ticket|activities_per_day`), `metric_label text`, `current_value numeric`, `team_benchmark numeric`, `gap_pct numeric` (gen), `severity text` (low|medium|high|critical), `skill_focus text` (`discovery|qualification|objection_handling|closing|prospecting|negotiation`), `recommended_action text`, `priority int`, `detected_at timestamptz`. Único `(salesperson_id, metric_key, detected_at::date)`.
- `coaching_skill_benchmarks`: `id`, `metric_key text UNIQUE`, `team_avg numeric`, `top_quartile numeric`, `sample_size int`, `computed_at timestamptz`.
- RLS: read authenticated; write admin/manager. Realtime + índices `(salesperson_id)`, `(severity)`, `(detected_at desc)`.

### 2. Edge function `detect-coaching-opportunities` (verify_jwt=true)
- Para cada vendedor ativo:
  - Calcula 5 métricas a partir de `sales` + `activities` (últimos 90d): conversion rate, stage duration mediana, win rate, avg ticket, activities/dia.
  - Compara cada métrica com `team_avg` (recalcula benchmarks no início do run).
  - `gap_pct = (benchmark - current) / benchmark` (positivo = abaixo da equipe).
  - `severity`: gap ≥ 40% = critical, ≥ 25% = high, ≥ 10% = medium, senão low.
  - Mapeia `skill_focus` por métrica (ex: win_rate → closing, conversion_rate → qualification).
  - Gera `recommended_action` via Lovable AI (`gemini-2.5-flash`) com top 3 gaps por vendedor.
  - Insere apenas top 3 gaps (priority 1-3) por vendedor.

### 3. Hooks `src/hooks/coaching/useCoachingOpportunities.ts`
- `useCoachingOpportunities(filters?)` — lista com join `salespeople(name)`.
- `useCoachingBenchmarks()` — benchmarks da equipe.
- `useCoachingSummary()` — KPIs: total críticas, vendedores afetados, skill mais comum, gap médio.
- `useDetectCoachingOpportunities()` — mutation.

### 4. Componentes `src/components/coaching/opportunities/`
- `CoachingOpportunitySummary.tsx` (≤180L) — 4 KPIs + ação refresh.
- `CoachingGapByRepTable.tsx` (≤200L) — tabela vendedor × top 3 gaps com severity badges.
- `CoachingSkillFocusChart.tsx` (≤160L) — bar chart distribuição por skill.
- `CoachingSeverityHeatmap.tsx` (≤160L) — heatmap vendedor × métrica.
- `CoachingActionsPanel.tsx` (≤180L) — recomendações IA agrupadas por vendedor.
- `CoachingOpportunityPanel.tsx` (container).
- `coachingOpportunityHelpers.ts` — labels severity/skill, cores, formatadores.

### 5. Integração
- Nova rota/aba "Coaching Intelligence" em hub adequado (verifico `BIGestorHub` ou crio `SalesCoachingHub`).
- `supabase/config.toml`: `verify_jwt = true` para `detect-coaching-opportunities`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após detect: KPIs preenchem, tabela mostra top gaps por vendedor, ações IA aparecem.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime + índices).
- **Edge function**: 1.
- **Criar**: 1 hook, 6 componentes + 1 helper.
- **Editar**: hub (1 arquivo), `supabase/config.toml`.

Após esta entrega, sigo automaticamente para **2/4: Skill Gap Analyzer** → **3/4: Coaching Session Planner** → **4/4: Performance Improvement Tracker**, fechando Sales Coaching Intelligence em 10/10.
