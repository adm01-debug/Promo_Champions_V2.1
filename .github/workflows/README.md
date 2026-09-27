# CI/CD — GitHub Actions

Todos os workflows rodam com `permissions: contents: read` mínimo; os que
fazem upload de artefato também têm `actions: write`.

## Workflows

### `pr-checks.yml` — Pipeline canônico por PR/push
Lint, TypeScript, secrets scan, testes + cobertura, Deno lint, E2E, build,
Lighthouse e orçamento dos bundles. Em `push:main` roda só os gates essenciais.

Gatilhos: `pull_request`, `push:main`, `workflow_dispatch`

### `cron-monitoring.yml` — Regressão do alarme de crons
Roda o test suite Deno da `cron-failure-alerter`. Diário às 06:00 UTC e em
PRs que tocam a função ou suas migrations.

Gatilhos: `pull_request` (paths), `push:main` (paths), `schedule` (06:00 UTC diário), `workflow_dispatch`

### `edge-functions-bundle.yml` — Bundle de Edge Functions
Valida que todas as ~170 edge functions fazem bundle sem erros de importação.

Gatilhos: `pull_request` e `push:main` (paths: supabase/functions/**)

### `edge-functions-request-id.yml` — Lint de X-Request-Id
Garante que toda edge function usa `withRequestId` e faz fuzz de propagação.

Gatilhos: `pull_request` e `push:main` (paths: supabase/functions/**)

### `quote-to-sale-e2e.yml` — Guard rails cotação → venda
Vitest unitário + invariantes de produção + Playwright E2E no fluxo crítico.

Gatilhos: `pull_request` (paths específicos), `workflow_dispatch`

### `qa-exhaustive.yml` — Bateria exaustiva semanal
Vitest completo, Deno lint/fuzz, todos os lints de arquitetura.
Detecta regressões de padrão introduzidas por dependabot ou outros PRs.

Gatilhos: `schedule` (segunda 03:00 UTC), `workflow_dispatch`

### `graphify.yml` — Foundation do grafo de código
Valida o Graphify (node graph), roda os testes da ferramenta e faz um
smoke test de extração sobre `src/lib/revenueForecast`.

Gatilhos: `pull_request` (paths), `push:main` (paths), `workflow_dispatch`

### `codeql.yml` — Análise de segurança
CodeQL (JavaScript/TypeScript) — análise estática de vulnerabilidades.

Gatilhos: `push:main`, `schedule` (semanal), `workflow_dispatch`

---

## Rodar CI localmente

```sh
npm run ci   # lint + typecheck + secrets + tests + build + bundle budget
```
