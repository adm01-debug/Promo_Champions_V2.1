
Próxima melhoria atômica da fila Reporting & BI: **3/7 — Funnel Report Visual Rico**.

## Melhoria 3/7 — Funnel Report Visual Rico

### Estado atual
- `useFunnelData` já calcula stages, conversionRate, dropOffRate, totalValue, avgDealSize, topDropOffStage por timeframe.
- Não há componente visual rico que renderize funil + drop-off + comparação de período.
- Custom Report Builder tem `viz_type: "funnel"` declarado mas `ReportPreview` não trata.

### Mudanças

**1. Hook `useFunnelComparison.ts` (novo)**
- Wrapper sobre `useFunnelData` que dispara duas queries: período atual + período anterior (mesmo tamanho de janela)
- Retorna `{ current, previous, deltas: { count, value, conversionRate }[] }` por estágio
- staleTime 5min, memoizado

**2. Componente `FunnelReportView.tsx` (≤350L) em `src/components/reporting/`**
- Header: KPIs (Conversão geral, Total Won, Avg deal size, Top drop-off) com CountUp + delta vs período anterior
- Visual funil custom (SVG/divs trapezoidais) com largura proporcional ao count, gradiente do primary, animação Framer
- Tabela de drop-off por etapa: Stage | Count | Conversão | Drop-off | Δ vs período anterior (badge verde/vermelho)
- Barras horizontais comparativas (Recharts BarChart) atual vs anterior por estágio
- Selector de timeframe (7/30/60/90 dias) controlado
- Skeleton loading, empty state ("Sem dados no período")
- Sora títulos, Inter body, tokens semânticos, dark-ready

**3. Helpers `funnelReportHelpers.ts`**
- `computeStageDeltas(current, previous)` 
- `formatDelta(n, type: 'pct'|'abs'|'currency')`
- `getStageColor(index, total)` — gradiente

**4. Página `/relatorios/funil`**
- Nova rota `FunnelReportPage.tsx` em `src/pages/`
- Lazy load em `lazyPages.ts`
- Registrar em `AppRoutes.tsx` sob ProtectedRoute
- Adicionar entrada no sidebar (Analytics group)

**5. Integração no Custom Report Builder**
- `ReportPreview.tsx`: quando `viz_type === "funnel"` e entity === "sales", renderizar `<FunnelReportView />` embutido (timeframe derivado de filtros de data, fallback 30)

**6. Validação**
- Smoke visual: navegar `/relatorios/funil`, verificar render + comparação
- Trocar timeframe e validar refetch
- Console limpo

### Arquivos
- Criar: `src/hooks/reporting/useFunnelComparison.ts`, `src/components/reporting/FunnelReportView.tsx`, `src/components/reporting/funnelReportHelpers.ts`, `src/pages/FunnelReportPage.tsx`
- Editar: `src/components/reporting/ReportPreview.tsx`, `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, sidebar config

Após esta, sigo automaticamente para 4/7 (Cohort Heatmap), 5/7 (Scheduled robusto), 6/7 (Embedded), 7/7 (widget dashboard + E2E).
