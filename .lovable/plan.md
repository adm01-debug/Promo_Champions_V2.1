
Próxima melhoria atômica da fila Reporting & BI: **6/7 — Embedded Analytics**.

## Melhoria 6/7 — Embedded Analytics (relatórios embutíveis)

### Estado atual
- Custom Reports existem em `custom_reports` e são executados via `report-builder-execute` (auth obrigatória).
- Não há forma de compartilhar um relatório fora da plataforma (link público read-only / iframe embed).
- Sem tokens de embed, sem rota pública, sem rate limit.

### Mudanças

**1. Migration SQL**
- Tabela `report_embed_tokens`:
  - `id`, `report_id` (FK custom_reports), `token` (text único, gerado), `created_by`, `expires_at` (nullable), `allowed_origins` (text[]), `view_count` (int default 0), `last_viewed_at`, `revoked` (bool), `created_at`
- RLS: owner ou manager gerenciam; SELECT público apenas via edge function (service role)
- Índice em `token` único

**2. Edge function `report-embed-public` (verify_jwt = false)**
- Endpoint `GET /report-embed-public?token=xxx`
- Valida token (não revogado, não expirado), incrementa `view_count`, atualiza `last_viewed_at`
- Executa o relatório via lógica reaproveitada de `report-builder-execute` (entity allowlist, sem campos sensíveis)
- Retorna JSON `{ name, viz_type, columns, rows, generated_at }`
- CORS dinâmico baseado em `allowed_origins` (default `*` se vazio)
- Rate limit simples: max 60 req/min por token (Map em memória)

**3. Hooks**
- `useReportEmbedTokens.ts` — list/create/revoke por report_id
- `useEmbeddedReportPreview.ts` — fetch público via edge function (para preview interno)

**4. Componentes**
- `EmbedTokenManagerDialog.tsx` — modal aberto a partir do `ReportBuilder`:
  - Lista tokens existentes com view_count, status, expires_at
  - Botão "Gerar novo token" (com expiração opcional + origens permitidas via chips)
  - Copy-to-clipboard do snippet `<iframe src="/embed/report/TOKEN" />` e do link direto
  - Botão revogar
- `EmbeddedReportView.tsx` — renderizador read-only (tabela / KPI / barra) reutilizando componentes existentes em modo "embed"

**5. Rota pública**
- `EmbedReportPage.tsx` em `/embed/report/:token` (fora do `ProtectedRoute`)
- Helmet com `noindex`, layout minimalista (sem sidebar/topbar), branding rodapé
- Loading skeleton, empty state, erro amigável (token revogado/expirado)
- Lazy load + registro em `AppRoutes.tsx`

**6. Integração no Custom Report Builder**
- Botão "Compartilhar / Embutir" no header do `ReportBuilder` que abre `EmbedTokenManagerDialog`

**7. Validação**
- Smoke test edge function via `curl_edge_functions` (token válido/inválido/revogado)
- Validar RLS de `report_embed_tokens` via `read_query`
- Abrir `/embed/report/TOKEN` em incógnito e verificar render
- Console limpo

### Arquivos
- Migration: nova tabela + RLS + índice
- Criar: `supabase/functions/report-embed-public/index.ts`
- Criar: `src/hooks/reporting/useReportEmbedTokens.ts`, `useEmbeddedReportPreview.ts`
- Criar: `src/components/reporting/EmbedTokenManagerDialog.tsx`, `EmbeddedReportView.tsx`, `embedHelpers.ts`
- Criar: `src/pages/EmbedReportPage.tsx`
- Editar: `src/components/reporting/ReportBuilder.tsx`, `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, `supabase/config.toml` (verify_jwt=false para `report-embed-public`)

Após esta, sigo automaticamente para 7/7 (widget custom_report no Dashboard Builder + E2E).
