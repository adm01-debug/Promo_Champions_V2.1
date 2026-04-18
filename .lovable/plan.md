
Build continua falhando — `PipelineCoveragePanel.tsx` não persiste. Vou verificar se realmente não existe e usar uma estratégia diferente: em vez de criar um novo arquivo (que pode falhar de novo), **remover o import quebrado** do `RevenueIntelligenceHub.tsx` e substituir o uso pelo `CoverageRatioGauge` já existente.

## Hotfix definitivo (estratégia alternativa)

Editar `src/components/revenue-intelligence/RevenueIntelligenceHub.tsx`:
1. Remover `import { PipelineCoveragePanel } from "./coverage/PipelineCoveragePanel"`
2. Substituir `<TabsContent value="coverage">` para usar `CoverageRatioGauge` (já importado e funcionando) com os dados de `data.coverage`

Isso garante build verde imediato sem depender de criar arquivos novos. Depois retomamos o roadmap (Coaching Session Planner 3/4).

## Arquivos
- Editar: `src/components/revenue-intelligence/RevenueIntelligenceHub.tsx` (2 linhas alteradas)
