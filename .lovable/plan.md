
# Módulo de Conexões — Hub Central de Integrações

Cria a rota `/admin/conexoes` (`AdminConexoesPage`) e todos os componentes/hook/edge functions referenciados no esqueleto enviado. Reaproveita o que já existe (`useBitrix24`, `useWebhooks`, `ExternalDBSettings`, `dispatch-webhook`, `external-db-bridge`, `bitrix24-oauth`).

## 1. Banco de dados (migration)

Novas tabelas (RLS: somente admin):

- **`integration_connections`** — registro unificado de cada integração (id, kind: `database|bitrix24|n8n|mcp|webhook|other`, label, config jsonb, secret_refs text[], enabled bool, source: `db|env|secret`, created_by, timestamps).
- **`integration_health_checks`** — histórico de testes (connection_id, status `success|failure|degraded`, latency_ms, error, checked_at, triggered_by `manual|auto`).
- **`integration_autotest_settings`** — singleton (interval_minutes, failure_window_minutes, enabled, updated_by, updated_at).
- **`integration_autotest_jobs`** — última execução do job agendado (started_at, finished_at, status, results jsonb).

Trigger + função `has_role(auth.uid(),'admin')` em todas as policies (segue padrão do projeto).

## 2. Edge functions

- **`test-integration-connection`** — recebe `{ connection_id }`, executa probe específico por kind:
  - `database` → reutiliza `external-db-bridge` com `select limit 1`.
  - `bitrix24` → chama `bitrix24-oauth` para validar token.
  - `n8n` → `GET {base_url}/healthz` com header `X-N8N-API-KEY`.
  - `mcp` → `POST {url}` com `{"jsonrpc":"2.0","method":"initialize",...}` e `Accept: application/json, text/event-stream`.
  - `webhook` → reaproveita `dispatch-webhook` com `event_type:"test.ping"`.
  - Persiste resultado em `integration_health_checks`.
- **`run-integration-autotests`** — varre `integration_connections` ativos e dispara `test-integration-connection` em paralelo (com limite). Grava `integration_autotest_jobs`.
- **`schedule-integration-autotests`** — cron via `pg_cron` (extensão já habilitada se possível; senão expõe endpoint para acionar via Lovable scheduler externo). Lê `interval_minutes` da tabela settings.

Padrões obrigatórios: `corsHeaders` de `_shared/cors.ts`, import `@supabase/supabase-js@2.49.4` via `npm:`, validação Zod, `verify_jwt = true` (admin only via RPC `has_role`).

## 3. Hooks novos

- `src/hooks/admin/useSecretsManager.ts` — lista secrets do projeto via edge function dedicada (`list-project-secrets`, somente nomes — nunca valores). Expõe `{ secrets, list, refresh }`.
- `src/hooks/admin/useIntegrationConnections.ts` — CRUD via React Query usando `updatePayload`/`insertPayload` (typed helpers já existentes).
- `src/hooks/admin/useIntegrationHealth.ts` — histórico + `runTest(connectionId)`.
- `src/hooks/admin/useAutoTestSettings.ts` — get/update settings + status do último job.

## 4. Componentes (`src/components/admin/connections/`)

Mantém limite de 400 linhas por arquivo (extrair helpers em `*Helpers.ts` quando necessário).

- `CredentialsSourceFilterContext.tsx` — Context com `source: 'all'|'db'|'env'|'secret'` + setter.
- `CredentialsSourceFilter.tsx` — `Tabs`/`SegmentedControl` que controla o context.
- `GlobalRefreshFromDbButton.tsx` — botão que invalida queries + chama `useSecretsManager.refresh()` e dispara `onRefreshed`.
- `IntegrationsHealthCard.tsx` — cards de status agregado (total, OK, falhando, degradados) com sparkline das últimas execuções.
- `ConnectionsOverviewTable.tsx` — tabela unificada com kind, label, source badge, last check, latency, ações (Testar, Editar, Toggle, Excluir).
- `SmokeTestChecklist.tsx` — checklist visual rodando todos os testes em sequência com progresso animado (Framer motion).
- `AutoTestIntervalCard.tsx` — slider + input numérico para `interval_minutes` (5–1440).
- `FailureWindowCard.tsx` — input para janela de tolerância (min) antes de marcar como degradado.
- `AutoTestJobStatusCard.tsx` — última execução, próximo agendamento, botão "Rodar agora".
- `SupabaseConnectionsTab.tsx` — engloba `ExternalDBSettings` + cadastro de DBs adicionais (form com URL, anon key, label) gravando em `integration_connections` (kind=database) com secrets via `add_secret`.
- `Bitrix24Tab.tsx` — usa `useBitrix24` (status, sync logs, botão sync, OAuth reconnect).
- `N8nTab.tsx` — form (base URL, API key secret name), lista workflows (via `GET /workflows` se API key presente), test ping.
- `McpTab.tsx` — form para servidor MCP (URL, auth header opcional), valida com `initialize` JSON-RPC, lista tools retornadas.
- `WebhooksTab.tsx` — embute hooks `useWebhooks`, formulário CRUD existente, deliveries recentes, botão "Testar" (`useTestWebhook`).

Todos respeitam tokens semânticos (sem cores hardcoded), Sora para títulos / Inter para corpo, skeletons + empty states padronizados.

## 5. Página

`src/pages/admin/AdminConexoesPage.tsx` — usa o esqueleto enviado, envolto em:
- `ProtectedRoute requiredRole="admin"`
- `PageTransition`
- `PageSEO` com title "Conexões | Promo Champions"
- `CredentialsSourceFilterProvider`
- Layout: header (ícone `Plug`, título, subtítulo, `GlobalRefreshFromDbButton`, `CredentialsSourceFilter`) → `IntegrationsHealthCard` → `ConnectionsOverviewTable` → grid de cards (`AutoTestIntervalCard`, `FailureWindowCard`, `AutoTestJobStatusCard`) → `SmokeTestChecklist` → `Tabs` (Bancos, Bitrix24, n8n, MCP, Webhooks).

## 6. Rotas e navegação

- Adicionar em `src/routes/AppRoutes.tsx`:
  ```tsx
  <Route path="/admin/conexoes" element={<Admin><AdminConexoesPage /></Admin>} />
  ```
- Adicionar item no `AdminQuickLinks.tsx` ("Conexões", ícone `Plug`, rota `/admin/conexoes`).
- Adicionar entrada na sidebar (grupo Admin) respeitando RBAC (admin only).

## 7. Validação e qualidade

- TypeScript: 100% tipado via `TableUpdate`/`TableInsert` + types gerados do Supabase.
- `tsc --noEmit` e `bun run lint` limpos.
- Testes Deno básicos para `test-integration-connection` (mock fetch para cada kind).
- Telemetria: emitir evento `integration.tested` via `useTelemetry`.
- Memória nova: `mem://admin/connections-hub` documentando arquitetura, kinds suportados e padrão de probe.

## 8. Fora de escopo (próxima iteração)

- Realtime subscriptions na tabela de health checks.
- Rotação automática de secrets.
- Importação em massa via CSV.
- Integração direta com MCP connectors do Lovable (apenas servidores MCP externos nesta versão).
