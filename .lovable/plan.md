
Build ainda quebrado: `PipelineCoveragePanel.tsx` não existe. Tentativas anteriores em modo read-only não persistiram. Preciso aprovação para criar o arquivo.

**Hotfix definitivo — Criar `PipelineCoveragePanel.tsx`**

## Ação
Criar `src/components/revenue-intelligence/coverage/PipelineCoveragePanel.tsx` (≤200L) usando apenas dados já disponíveis em `useRevenueIntelligenceHub` (sem dependências externas que possam não existir):

- Reusa `CoverageRatioGauge` existente
- KPIs: ratio atual, target, weighted pipeline, gap absoluto para target
- Health badge semântico (excellent/healthy/warning/critical) com cores via tokens
- Bloco de recomendações automáticas baseado no health label
- Skeleton loading + framer-motion
- Sem chamadas a hooks/edge functions inexistentes

## Sequência pós-hotfix
1. Build limpo confirmado
2. Retomar **Sales Coaching Intelligence 3/4: Coaching Session Planner** (já aprovado)
3. Continuar 4/4 e demais blocos rumo a 10/10

## Arquivos
- Criar: `src/components/revenue-intelligence/coverage/PipelineCoveragePanel.tsx`
