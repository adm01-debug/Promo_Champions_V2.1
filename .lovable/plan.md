
Sales Coaching Intelligence 1/4 entregue. Próxima atômica.

**Sales Coaching Intelligence — 2/4: Skill Gap Analyzer**

Aprofunda o detector de oportunidades com análise longitudinal de skills: agrega gaps recorrentes ao longo do tempo, classifica vendedores em níveis de maturidade por skill (iniciante/intermediário/avançado/expert) e gera trilhas de desenvolvimento personalizadas.

## Entregáveis

### 1. Migration
- `skill_assessments`: `id`, `salesperson_id FK`, `skill text` (6 skills do enum coaching), `current_level text` (beginner|intermediate|advanced|expert), `score numeric` (0-100), `trend text` (improving|stable|declining), `gap_count_30d int`, `gap_count_90d int`, `last_assessed_at timestamptz`, `factors jsonb`. Único `(salesperson_id, skill)`.
- `skill_development_tracks`: `id`, `salesperson_id FK`, `skill text`, `priority int`, `current_level text`, `target_level text`, `milestones jsonb` (array de marcos), `estimated_weeks int`, `ai_plan text`, `created_at timestamptz`. Único `(salesperson_id, skill)`.
- RLS: read authenticated; write admin/manager. Realtime + índices.

### 2. Edge function `analyze-skill-gaps` (verify_jwt=true)
- Para cada vendedor:
  - Agrega `coaching_opportunities` últimos 90d por `skill_focus` → contagem + severidade média.
  - Calcula `score` por skill: 100 - (críticas × 30 + altas × 20 + médias × 10 + baixas × 5), clamp 0–100.
  - Determina `current_level`: ≥85 expert, ≥65 advanced, ≥40 intermediate, <40 beginner.
  - Compara com janela 90–180d para `trend`.
  - Para top 3 skills com menor score: gera `ai_plan` via Lovable AI (Gemini Flash) com 4 milestones acionáveis e estimativa em semanas.
  - Upserts `skill_assessments` (todas) e `skill_development_tracks` (top 3).

### 3. Hooks `src/hooks/coaching/useSkillGapAnalyzer.ts`
- `useSkillAssessments(salespersonId?)`, `useSkillTracks(salespersonId?)`, `useSkillSummary()` (KPIs: skill mais fraca, vendedores em beginner, melhoria média), `useAnalyzeSkillGaps()` mutation.

### 4. Componentes `src/components/coaching/skills/`
- `SkillGapSummary.tsx` (≤180L) — 4 KPIs + ação refresh.
- `SkillRadarChart.tsx` (≤180L) — radar 6 skills × score médio da equipe.
- `SkillMaturityMatrix.tsx` (≤200L) — matriz vendedor × skill com nível colorido.
- `SkillTrackCards.tsx` (≤200L) — cards trilhas de desenvolvimento (top 12) com milestones e plano IA.
- `SkillGapAnalyzerPanel.tsx` (container).
- `skillGapHelpers.ts` — labels nível, cores, formatadores.

### 5. Integração
- Nova aba "Skill Gap Analyzer" em `CoachingIntelligenceHub.tsx`.
- `supabase/config.toml`: `verify_jwt = true` para `analyze-skill-gaps`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após analyze: KPIs preenchem, radar mostra forças/fraquezas, matriz colorida por nível, trilhas com plano IA aparecem.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime + índices).
- **Edge function**: 1.
- **Criar**: 1 hook, 5 componentes + 1 helper.
- **Editar**: `CoachingIntelligenceHub.tsx`, `supabase/config.toml`.

Após esta entrega, sigo automaticamente para **3/4: Coaching Session Planner** → **4/4: Performance Improvement Tracker**, fechando Sales Coaching Intelligence em 10/10.
