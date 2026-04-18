
Coaching Session Planner 3/4 entregue. Próximo bloco: **Sales Coaching Intelligence 4/4 — Coaching Impact Tracker**.

## Coaching Impact Tracker

Mede o impacto real das sessões de coaching nos KPIs do vendedor (scorecard, conversão, ticket médio) comparando antes/depois.

### Backend
- View `coaching_impact_metrics`: para cada sessão concluída, calcula:
  - `pre_avg_overall` (scorecard 30d antes), `post_avg_overall` (scorecard 30d depois)
  - `pre_conversion`, `post_conversion` (taxa de fechamento)
  - `pre_ticket`, `post_ticket` (ticket médio)
  - `delta_overall`, `delta_conversion`, `delta_ticket` (variação %)
- Edge function `coaching-impact-summary`: agrega impacto por coach/vendedor/skill, retorna ranking de sessões mais impactantes + ROI estimado

### Frontend (`src/components/coaching/impact/`)
- `CoachingImpactTracker.tsx` (≤300L): hub com KPIs gerais (sessões realizadas, delta médio, ROI), gráfico de evolução
- `ImpactSessionCard.tsx`: card por sessão com before/after sparkline e delta badges
- `SkillImpactHeatmap.tsx`: matriz skill × delta médio
- `impactHelpers.ts`: formatters de delta (+/- com cores), ROI calculator
- Hook `useCoachingImpact.ts` (React Query)

### Integração
- Nova tab "Impacto" no `CoachingIntelligenceHub`
- Card "Impacto desta sessão" exibido no `SessionNotesEditor` para sessões concluídas

### Arquivos
- Migration: view `coaching_impact_metrics` + índices auxiliares
- Edge: `supabase/functions/coaching-impact-summary/index.ts`
- Hook: `src/hooks/coaching/useCoachingImpact.ts`
- Componentes: 3 arquivos em `src/components/coaching/impact/`
- Helpers: `impactHelpers.ts`
- Editar: `CoachingIntelligenceHub.tsx` (nova tab)

Padrões: semantic tokens, Sora/Inter, framer-motion, skeleton, ≤300L, strict TS, sparklines via recharts.
