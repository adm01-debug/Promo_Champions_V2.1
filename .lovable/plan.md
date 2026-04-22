

## Relatório Semanal/Mensal de Vendas com Gráficos e Exportação PDF

Adicionar uma nova seção ao dashboard onde o usuário gera relatórios de vendas (semanal ou mensal) com KPIs, gráficos e exportação em PDF.

### Escopo funcional

1. **Nova rota `/relatorios/vendas`** (lazy-loaded, protegida por auth) acessível via card no dashboard ("Relatório de Vendas") e item no menu Relatórios.
2. **Seletor de período** no topo: toggle "Semanal" / "Mensal" + date picker para escolher a semana/mês de referência. Padrão: semana/mês atual.
3. **KPIs animados** (4 cards): Receita total, Nº de vendas, Ticket médio, Taxa de conversão — cada um com Δ% vs. período anterior (badge `success`/`destructive`).
4. **Gráficos** (Recharts, tipagem estrita via `src/types/recharts.ts`):
   - **Linha**: Receita por dia (semanal) ou por semana (mensal).
   - **Barras**: Top 5 produtos por receita.
   - **Pizza/Donut**: Distribuição por status (`completed`, `pending`, `cancelled`).
   - **Barras horizontais**: Ranking de vendedores (top 5).
5. **Tabela "Top negócios"**: 10 maiores vendas do período (cliente, produto, vendedor, valor, status).
6. **Botão "Exportar PDF"** no header da página: gera PDF A4 com cabeçalho institucional, KPIs, snapshots dos gráficos (via `html2canvas`) e tabelas, usando `jsPDF` + `jspdf-autotable` (já presentes no projeto via `pdfExporter.ts`).
7. **Loading**: Skeletons. **Empty**: banner "Sem vendas no período" com CTA para criar venda.

### Backend

Sem novas tabelas. Consome `sales`, `daily_metrics`, `salespeople`, `sales_goals` (já existentes). 

Um único hook `useSalesReport(period, refDate)` em `src/hooks/reports/useSalesReport.ts` agrega tudo em paralelo via React Query (chave: `["sales-report", period, refDate]`, staleTime 5min). Lógica de agregação extraída para `src/hooks/reports/salesReportHelpers.ts` (cálculo de Δ%, agrupamento por dia/semana, top N).

### Geração do PDF

- Usar **`jsPDF` + `jspdf-autotable`** (já no bundle) + **`html2canvas`** para snapshot dos gráficos.
- Estrutura do PDF:
  1. Capa: logo Promo Champions, título, período, data de geração.
  2. Página 2: KPIs em grid + gráfico de receita.
  3. Página 3: Top produtos + distribuição por status.
  4. Página 4: Ranking de vendedores + tabela de top negócios.
- Função pura `generateSalesReportPdf(data, period)` em `src/lib/reports/salesReportPdf.ts` (≤300 linhas), reutilizável fora do componente.

### Detalhes técnicos

**Arquivos novos**:
- `src/pages/SalesReportPage.tsx` (≤200 linhas) — orquestra seletor + hook + renderização.
- `src/components/reports/sales/SalesReportHeader.tsx` — seletor de período + botão exportar.
- `src/components/reports/sales/SalesReportKpis.tsx` — 4 cards com CountUp + Δ.
- `src/components/reports/sales/SalesRevenueChart.tsx` — LineChart Recharts.
- `src/components/reports/sales/SalesTopProductsChart.tsx` — BarChart.
- `src/components/reports/sales/SalesStatusDonut.tsx` — PieChart.
- `src/components/reports/sales/SalesTeamRankingChart.tsx` — BarChart horizontal.
- `src/components/reports/sales/SalesTopDealsTable.tsx` — tabela.
- `src/hooks/reports/useSalesReport.ts` — React Query.
- `src/hooks/reports/salesReportHelpers.ts` — agregações puras (testável).
- `src/lib/reports/salesReportPdf.ts` — geração do PDF.

**Arquivos editados**:
- `src/routes/AppRoutes.tsx` — rota lazy `/relatorios/vendas`.
- `src/components/dashboard/DashboardHeader.tsx` — botão "Exportar PDF" existente passa a navegar para `/relatorios/vendas` (mantém comportamento atual como fallback rápido).
- Item de menu em "Relatórios" (sidebar/topbar).

**Padrões aplicados**: React Query, Framer Motion (stagger nos KPIs e gráficos), Skeleton loading, Helmet (SEO), semantic tokens (`success`/`destructive`/`warning`/`primary`), Sora em títulos / Inter em corpo, formato BRL via `Intl.NumberFormat('pt-BR')`, `Recharts` com `RechartsTooltipProps`. Limite de 400 linhas por arquivo respeitado via extração de helpers.

### Diagrama da página

```text
┌────────────────────────────────────────────────────────┐
│ Relatório de Vendas    [Semanal|Mensal] [📅] [⬇ PDF]  │
├────────────────────────────────────────────────────────┤
│ [Receita ↑12%] [Vendas ↑8%] [Ticket ↓3%] [Conv ↑5%]   │
├────────────────────────────────────┬───────────────────┤
│  Receita por dia (linha)            │ Top produtos     │
│                                     │ (barras)         │
├────────────────────────────────────┼───────────────────┤
│  Status (donut)                     │ Ranking vendedor │
├────────────────────────────────────┴───────────────────┤
│  Top 10 negócios (tabela)                              │
└────────────────────────────────────────────────────────┘
```

