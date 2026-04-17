
Próxima melhoria atômica da fila Reporting & BI: **4/7 — Cohort Heatmap Visual**.

## Melhoria 4/7 — Cohort Heatmap Visual

### Estado atual
- Tabela `cohort_analyses` já criada na migration 1/7.
- RPC `compute_cohort_retention(_cohort_id, _periods)` declarada mas precisa ser validada/usada.
- Existe módulo parcial de cohort em `retention-and-ltv-modules` (texto/tabela), sem heatmap visual.
- `ReportPreview` declara `viz_type: "heatmap"` mas não trata.

### Mudanças

**1. Hook `useCohortRetention.ts`**
- Query Supabase: agrupa `clients` por mês de `created_at` (cohort) e cruza com `sales.created_at` para calcular % de retenção por mês relativo (M0..M11).
- Retorna matriz `{ cohortLabel, cohortSize, retention: number[] }[]`.
- Parâmetro: `periods` (default 12), `metric` ('orders'|'revenue').
- staleTime 5min.

**2. Helpers `cohortHelpers.ts`**
- `buildCohortMatrix(clients, sales, periods)` — pura, testável.
- `getHeatmapColor(value, max)` — interpola opacidade do primary (0.05 → 1.0).
- `formatCohortLabel(date)` — "Jan/24".

**3. Componente `CohortHeatmap.tsx` (≤300L)**
- Header: KPIs (Cohorts ativas, Retenção média M1, M3, M6) com CountUp.
- Grid responsivo: linhas = cohorts, colunas = M0..M11.
- Cada célula: cor proporcional + tooltip com % e contagem absoluta.
- Animação Framer stagger por linha.
- Selector: período (6/12/24 meses), métrica (pedidos/receita).
- Skeleton + empty state.
- Sora títulos, Inter body, tokens semânticos.

**4. Página `/relatorios/cohort`**
- `CohortReportPage.tsx` com Helmet + PageTransition.
- Lazy load + rota Manager-only.
- Entrada no sidebar (Gestão > Análises).

**5. Integração no Custom Report Builder**
- `ReportPreview.tsx`: quando `viz_type === "heatmap"`, renderizar `<CohortHeatmap embedded />`.

**6. Validação**
- Smoke visual: navegar `/relatorios/cohort`.
- Trocar período/métrica e validar refetch.
- Console limpo.

### Arquivos
- Criar: `src/hooks/reporting/useCohortRetention.ts`, `src/components/reporting/cohortHelpers.ts`, `src/components/reporting/CohortHeatmap.tsx`, `src/pages/CohortReportPage.tsx`.
- Editar: `src/components/reporting/ReportPreview.tsx`, `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, `src/components/layout/sidebar/sidebarMenuData.ts`.

Após esta, sigo automaticamente para 5/7 (Scheduled robusto), 6/7 (Embedded), 7/7 (widget dashboard + E2E).
