
Build verde. Hora de retomar o roadmap rumo a 10/10. Próximo bloco aprovado: **Sales Coaching Intelligence 3/4 — Coaching Session Planner**.

## Coaching Session Planner

Ferramenta para gestores planejarem sessões 1:1 de coaching com base em dados reais (scorecards, gaps, oportunidades).

### Backend
- Tabela `coaching_sessions`: `id`, `salesperson_id`, `coach_id`, `scheduled_at`, `duration_min`, `status` (scheduled/completed/canceled), `focus_skills` (text[]), `agenda` (jsonb), `notes`, `action_items` (jsonb), `outcome_rating` (1-5), `created_at`
- RLS: gestor vê/edita sessões que coacha; vendedor vê próprias sessões
- Edge function `coaching-session-prep`: dado um `salesperson_id`, retorna agenda sugerida (top 3 gaps, deals em risco, recomendações IA via Lovable AI gemini-2.5-flash)

### Frontend (`src/components/coaching/sessions/`)
- `CoachingSessionPlanner.tsx` (≤300L): hub principal com lista de sessões + botão "Nova sessão"
- `SessionScheduleDialog.tsx`: form para agendar (vendedor, data, duração, foco)
- `SessionPrepCard.tsx`: mostra agenda gerada pela IA (gaps, deals, talking points)
- `SessionNotesEditor.tsx`: durante/pós-sessão — anotações + action items + rating
- `sessionPlannerHelpers.ts`: status badges, formatters, color tokens
- Hook `useCoachingSessions.ts` (React Query)

### Integração
- Adicionar tab "Sessões 1:1" no hub de coaching existente
- CTA "Agendar sessão" nos cards de `CoachingTarget` críticos

### Arquivos
- Migration: `coaching_sessions` + RLS + índices
- Edge: `supabase/functions/coaching-session-prep/index.ts`
- Hook: `src/hooks/coaching/useCoachingSessions.ts`
- Componentes: 4 arquivos em `src/components/coaching/sessions/`
- Helpers: `sessionPlannerHelpers.ts`
- Editar: hub de coaching para adicionar nova tab

Padrões: semantic tokens, Sora/Inter, framer-motion, skeleton, ≤300L por arquivo, strict TS.
