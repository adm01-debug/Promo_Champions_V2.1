# Suítes de teste no CI — Deno, SQL, carga e flakes

Como rodar cada camada introduzida pelo pacote de CI/testes (2026-10).

## Edge functions (Deno)

```bash
npm run test:deno            # unit + live
node scripts/deno-test-suite.mjs --mode unit   # só self-contained
node scripts/deno-test-suite.mjs --mode live   # só suites com secrets
```

- **unit**: todo `supabase/functions/**/*_test.ts` / `*.test.ts` fora de
  `tests/deno-live-tests.json`. Sem secrets nem rede — deve passar sempre.
- **live**: suites que dependem de backend vivo (listadas no manifesto com o
  motivo). Roda quando `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`
  existem e passam num pre-flight contra `/rest/v1/` — chave inválida (401) ou
  backend inacessível pulam o tier inteiro com `::warning::` listando cada
  suite, sem reprovar. Suites marcadas com `"requer_service_role": true` no
  manifesto exigem também `SUPABASE_SERVICE_ROLE_KEY` válida (mesmo pre-flight).
  Rodando, uma suite que falha por credencial/autorização (backend respondendo
  401, "Invalid API key", JWT inválido, env ausente) vira warning listado;
  qualquer outra falha reprova o build.

No CI: job **Edge Functions Tests (deno)** do `pr-checks.yml`.

## Suites SQL (RLS/contrato)

```bash
npm run test:sql                        # static + remote (se houver secret)
scripts/run-sql-tests.sh static         # higiene de migrations + matriz
SUPABASE_DB_URL=postgres://postgres:<senha>@db.usyxfpqlsspldubptrdl.supabase.co:5432/postgres \
  scripts/run-sql-tests.sh remote       # executa as 4 suites via psql
```

- `static`: roda `scripts/check-migrations.mjs` quando presente (com `--base`
  em PR) e gera `sql-coverage-matrix.md` — matriz tabelas `public.*` × suites.
- `remote`: `rls_test_suite`, `canonical_post_migration_assertions`,
  `canonical_role_simulation` (single-transaction) e `quote-to-sale-stress`
  (auto-descobre admin/salesperson). Requer o secret `SUPABASE_DB_URL`.

No CI: job **SQL Suites** — sem `SUPABASE_DB_URL`, ou com o banco
inalcançável (pre-flight `select 1`), o remoto é pulado com warning. Atenção:
hosts `db.<ref>.supabase.co` são IPv6-only e os runners do GitHub não os
alcançam — o secret deve apontar para o **pooler IPv4**
(`aws-<regiao>.pooler.supabase.com`) do projeto `usyxfpqlsspldubptrdl` (o valor
atual do secret aponta para outro ref e falha no pre-flight).

## Carga (k6)

```bash
k6 run scripts/load/k6-smoke.js
K6_BASE_URL=https://usyxfpqlsspldubptrdl.supabase.co \
  K6_VUS=10 K6_DURATION=1m k6 run scripts/load/k6-smoke.js
```

Alvo real: `/auth/v1/health` + preflight OPTIONS das edge functions
`log-web-vitals`, `get-client-ip`, `ranking-api`, `ai-copilot`. Thresholds:
p95 < 2.5s, `http_req_failed` < 5%, checks > 95%.

No CI: job **k6 Load Smoke** só executa com a var `K6_TARGET_BASE_URL`
definida (Settings > Variables) ou via `workflow_dispatch`; sem alvo, o comando
fica documentado no step summary.

## Flaky tests e quarentena

O job **Unit Tests** roda `vitest --coverage --retry=2` com JSON por spec.
`scripts/flaky-report.mjs` classifica:

- **flaky** — passou com `failureMessages` registradas (só ocorre após retry);
  vira `::warning::` + entra no relatório `test-results/flaky-report.md`;
- **falha real** — reprova o build;
- **quarentenada** — listada em `tests/flaky-quarantine.json`, roda mas não
  reprova (`::warning::` com prazo e motivo).

Formato da quarentena:

```json
{
  "specs": [
    {
      "id": "src/lib/x.test.ts::suite > caso",
      "ate": "2026-11-15",
      "motivo": "race condition em investigação",
      "issue": "#000"
    }
  ]
}
```

`id` = `<arquivo>::<fullName>` do JSON do vitest, ou só `<arquivo>` para a
suite inteira. `ate` vencido invalida a quarentena (volta a reprovar).

## Sweep de acessibilidade em PRs de UI

`a11y-sweep.yml` roda o axe-core do `playwright.a11y.config.ts` em todo PR que
toca `src/**`, `index.html`, `tailwind.config.ts` ou `tests/a11y/**` — o mesmo
sweep que o QA semanal já fazia, agora no caminho curto.

## Novos smokes E2E

`tests/e2e/pages-critical-routes.spec.ts` cobre 8 rotas críticas que os specs
`pages-*` não tocavam: `/sdr`, `/closer`, `/produtos`, `/comparador-precos`,
`/notificacoes`, `/multichannel`, `/automacoes`, `/analytics`.
