
Race Arena 2.0 entregue. Próximo bloco rumo a 10/10: **Revenue Forecast Intelligence** — módulo de previsão de receita com IA que combina pipeline atual, histórico de conversão e sazonalidade.

## Revenue Forecast Intelligence

### Conceito
Painel executivo que projeta receita dos próximos 30/60/90 dias usando: deals abertos × probabilidade IA, velocidade média do pipeline, sazonalidade histórica e meta da equipe. Mostra cenários (pessimista/realista/otimista) e gap vs. meta.

### Backend
**Migration** — view `revenue_forecast_view`:
- Agrega deals abertos por estágio × probabilidade média de fechamento
- Calcula velocidade média (dias/estágio) dos últimos 90 dias
- Projeta fechamentos esperados em janelas de 30/60/90d
- Compara com meta mensal/trimestral

**Edge function `revenue-forecast-ai`**:
- Recebe horizonte (30/60/90) e role_type opcional
- Busca dados da view + histórico de 12 meses
- Chama Lovable AI (gemini-2.5-flash) para gerar 3 cenários + insights narrativos
- Retorna `{ scenarios: {pessimistic, realistic, optimistic}, narrative, risks[], opportunities[] }`

### Frontend (`src/components/forecast/`)
- `RevenueForecastHub.tsx` (≤300L): hub principal com seletor de horizonte, cards de cenários, gráfico recharts (área empilhada projeção × meta)
- `ScenarioCard.tsx`: card por cenário com valor projetado, delta vs meta, confidence score
- `ForecastNarrativeCard.tsx`: insights de IA (riscos + oportunidades) com badges semânticos
- `PipelineContributionChart.tsx`: barras horizontais mostrando contribuição esperada por estágio
- `forecastHelpers.ts`: formatters, color tokens por cenário, confidence calculator
- Hook `useRevenueForecast.ts` (React Query)

### Integração
- Nova entrada de menu "Forecast" em Analytics
- Card resumo "Forecast 30d" no Dashboard executivo

### Arquivos
- Migration: view `revenue_forecast_view`
- Edge: `supabase/functions/revenue-forecast-ai/index.ts`
- Hook: `src/hooks/forecast/useRevenueForecast.ts`
- Componentes: 4 em `src/components/forecast/`
- Helpers: `forecastHelpers.ts`
- Editar: navegação Analytics + dashboard

Padrões: semantic tokens, Sora/Inter, framer-motion, skeleton, ≤300L, strict TS, recharts tipado.
