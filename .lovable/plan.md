
Próxima melhoria atômica da fila Reporting & BI: **7/7 — Custom Report Widget no Dashboard Builder + E2E Final**.

## Melhoria 7/7 — Custom Report Widget + E2E

### Estado atual
- Dashboard Builder existe com widgets nativos (KPIs, gráficos, listas).
- Custom Reports executáveis via `report-builder-execute` mas não embutíveis em dashboards internos.
- Falta closing loop: usar relatórios criados no Builder dentro de dashboards customizáveis.

### Mudanças

**1. Novo widget type: `custom_report`**
- Adicionar `"custom_report"` à lista de tipos suportados em `dashboardBuilderHelpers.ts` / tipos do Dashboard.
- Config: `{ report_id: string, height?: number }`.

**2. Componente `CustomReportWidget.tsx` (≤200L)**
- Recebe `report_id` via config.
- Hook interno: busca `custom_reports` por id + chama `report-builder-execute` (auth).
- Renderiza via `ReportPreview` reaproveitado (table/kpi/bar/heatmap) em modo compacto.
- Skeleton loading, empty state, erro amigável.
- Header: nome do relatório + botão "Abrir no builder" (link `/relatorios/builder?id=...`).

**3. Editor do widget no Dashboard Builder**
- `CustomReportWidgetEditor.tsx`: select com lista de `custom_reports` do usuário (hook `useCustomReports`).
- Slider de altura (300-800px).
- Integrar no `WidgetConfigPanel` existente.

**4. Renderer no grid**
- Editar `DashboardWidgetRenderer.tsx`: case `custom_report` → `<CustomReportWidget />`.
- Editar `WidgetPicker.tsx`: novo card "Relatório Customizado" com ícone `FileBarChart`.

**5. E2E Validation Suite (Reporting & BI completo)**
- Smoke navegacional:
  - `/relatorios/builder` → criar report cross-object → executar → salvar.
  - `/relatorios/funnel` → render visual.
  - `/relatorios/cohort` → render heatmap.
  - `/scheduled-reports` → criar schedule diário → executar manual.
  - `/embed/report/:token` → token válido (incógnito).
  - `/dashboard-builder` → adicionar widget custom_report → render.
- Validar via `read_query` integridade RLS de todas as 4 tabelas (custom_reports, scheduled_reports, scheduled_report_runs, report_embed_tokens).
- Linter Supabase: zero warnings novos.
- Console limpo em todas as rotas.

**6. Doc final**
- Atualizar `docs/REPORTING_BI_COMPLETE.md` com status 7/7 ✅, screenshots, snippets de uso.

### Arquivos
- Criar: `src/components/dashboard-builder/widgets/CustomReportWidget.tsx`, `CustomReportWidgetEditor.tsx`
- Editar: `src/components/dashboard-builder/dashboardBuilderHelpers.ts`, `DashboardWidgetRenderer.tsx`, `WidgetPicker.tsx`, `WidgetConfigPanel.tsx`
- Criar: `docs/REPORTING_BI_COMPLETE.md`

Esta é a última melhoria da fila Reporting & BI (7/7) — após esta, o módulo atinge 10/10 de classe mundial.
