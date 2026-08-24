# Reporting & BI — 10/10 ✅

Módulo completo de Reporting & BI da Promo Champions. Status: **7/7 melhorias entregues**.

## Melhorias entregues

| # | Melhoria | Status |
|---|----------|--------|
| 1 | Migrations base (`custom_reports`, `cohort_analyses`, `scheduled_reports`, `report_embed_tokens`) + RLS | ✅ |
| 2 | Custom Report Builder (entity, columns, filters, group_by, viz_type) | ✅ |
| 3 | Cross-Object Reports (joins sales↔accounts↔salespeople↔clients) | ✅ |
| 4 | Cohort Heatmap visual (RPC `compute_cohort_retention`) | ✅ |
| 5 | Scheduled Reports robusto (cron, runs, snapshot, e-mail) | ✅ |
| 6 | Embedded Analytics (token público + iframe + rate limit) | ✅ |
| 7 | Custom Report Widget no Dashboard Builder | ✅ |

## Arquitetura

### Tabelas
- `custom_reports` — definições de relatórios (entity, config JSON, owner, shared)
- `cohort_analyses` — agrupamento de coortes mensais
- `scheduled_reports` + `scheduled_report_runs` — agendamentos e histórico
- `report_embed_tokens` — tokens públicos com expiração e origens permitidas

### Edge Functions
- `report-builder-execute` — execução autenticada (allowlist de entidades, validação de operadores)
- `scheduled-reports-runner` — executa schedules pendentes (cron diário)
- `scheduled-report-trigger` — dispara um schedule manualmente
- `report-embed-public` (verify_jwt = false) — execução pública com rate limit (60/min)

### UI
- `/relatorios/builder` — Custom Report Builder
- `/relatorios/funnel` — Funnel visual
- `/relatorios/cohort` — Cohort Heatmap
- `/scheduled-reports` — Gestão de agendamentos
- `/embed/report/:token` — Render público read-only
- Widget `custom_report` no Dashboard Personalizado (`/dashboard-personalizado`)

## Snippets de uso

### Embutir um relatório
```html
<iframe src="https://app.example.com/embed/report/SEU_TOKEN" width="100%" height="600" frameborder="0"></iframe>
```

### Adicionar widget de relatório no dashboard
1. Acesse `/dashboard-personalizado`
2. Clique em **Gerenciar Widgets** → **Relatório Customizado** → **Adicionar**
3. Selecione um relatório do builder e ajuste a altura
4. Salve o layout

## Segurança
- RLS estrita em todas as 4 tabelas (owner ou manager)
- Edge functions usam allowlist de entidades + validação regex de campos/operadores
- Tokens de embed têm CORS dinâmico, expiração opcional e revogação imediata
- Sanitização de campos sensíveis (e-mails/telefones) no endpoint público
