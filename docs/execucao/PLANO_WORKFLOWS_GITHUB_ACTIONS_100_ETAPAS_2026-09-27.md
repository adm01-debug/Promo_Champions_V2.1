# Plano de correções e melhorias — GitHub Actions (100 etapas)

| Campo | Valor |
|---|---|
| Data | 2026-09-27 |
| Commit analisado | `9a3adb6` (`main`) |
| Escopo | 9 workflows em `.github/workflows/`, `dependabot.yml`, `CODEOWNERS`, ruleset `main-protection`, secrets/variables do repo, 2.363 execuções no Actions, 12 PRs abertas, alertas Dependabot e CodeQL |
| Método | Leitura integral dos YAML + `actionlint` 1.7.7 (0 erros de sintaxe) + histórico de runs via API + reprodução local da falha Deno com `deno 2.2.15` |
| Estado | **Plano. Nada foi executado.** |

---

## 1. Diagnóstico — o que está quebrado hoje

### P0 — quebrado em produção do CI agora

| # | Achado | Evidência |
|---|---|---|
| A | **`deno.lock` desatualizado derruba todo job Deno com `--frozen`.** As PRs #154 (framer-motion 13) e #157 (react-router 7) mudaram `package.json` sem regenerar `deno.lock` (que ainda aponta `framer-motion@11` e `react-router-dom@^6.21.0`). | Cron Monitoring: **12 falhas consecutivas** (16→27/09, runs 35062726142…36299422345). QA Exhaustive 21/09 (35556382875). Reproduzido localmente: `deno run --frozen …` sai com "lockfile out of date"; sem `--frozen` o lint passa (169/169). |
| B | **Nenhum gate de PR valida `deno.lock`** e os workflows Deno têm `paths:` que **não incluem `package.json`/`deno.lock`** → mudança de dependência npm quebra Deno sem nenhuma PR ficar vermelha. Já aconteceu antes (#153 "fix do deno.lock"). | `edge-functions-bundle.yml:6-15`, `edge-functions-request-id.yml:6-17`, `cron-monitoring.yml:4-13` |
| C | **Edge Functions Bundle e X-Request-Id Lint não rodam desde 14/09** (path filter) e X-Request-Id está **vermelho em `main` desde 13/09** sem ninguém notar. | runs 34896221105, 34763125580, 34762684851 (failure em `main`) |
| D | **QA Exhaustive nunca ficou verde: 9/9 execuções falharam desde 27/07.** Causas variadas (tsc em 31/08, Deno frozen em 14 e 21/09). Sem notificação → sinal ignorado por 2 meses. | runs 30236573257 … 35556382875 |
| E | **Secrets E2E inválidos ("Invalid API key")** → job `E2E Tests` falha em **toda PR humana** (por design do passo `precheck`). Como não é required, PRs mergeiam sem E2E. | run 35516990322 (20/09); secrets criados em 03/09 |
| F | **Vitest 1.6.1 com CVE crítica (GHSA-5xrq-8626-4rwp, CVSS 9.8)** + `vite 5.4.21` e `esbuild 0.21.5` transitivos com 4 CVEs. `dependabot.yml` **proíbe major do vitest**, e `npm audit --omit=dev` **não enxerga devDeps** → nunca será corrigido pelo pipeline atual. | Dependabot alerts #1, #2, #4, #7, #8; `dependabot.yml:18-24`; `pr-checks.yml:84` |

### P1 — risco alto / sinal falso

| # | Achado | Evidência |
|---|---|---|
| G | **Repositório é público** (`private: false`), mas o comentário em `pr-checks.yml:14-15` assume privado. `allowed_actions: all` e `sha_pinning_required: false` → cadeia de suprimento de actions sem pin por SHA. | `github_get_repo`, `github_get_actions_permissions` |
| H | **Ruleset `main-protection` exige só 3 checks** (Lint & Type Check, Unit Tests, Build Check). Edge Functions Lint, Security Audit, Bundle, Request-Id, CodeQL, Graphify não bloqueiam merge. `strict=false` (branch desatualizada mergeia), 0 aprovações. | ruleset 22148182 |
| I | **`gen-types-drift` sempre pula** (`SUPABASE_ACCESS_TOKEN` inexistente) → verde falso desde a criação. | secrets do repo (5): E2E_TEST_EMAIL, E2E_TEST_PASSWORD, VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_URL |
| J | **`cron-monitoring` roda só E2E** (sem `SUPABASE_SERVICE_ROLE_KEY`), comentário diz que secrets "não existem (verificado 03/09)" — existem desde 03/09. Falha agendada 12× sem alerta. | `cron-monitoring.yml:39-77` |
| K | **`notify-failure` é no-op** (`SLACK_CI_WEBHOOK_URL` ausente) e só cobre `pr-checks`. Nenhum schedule (cron, QA, CodeQL) tem canal de alerta. | `pr-checks.yml:364-387` |
| L | **12 PRs Dependabot abertas** (desde 13/09), sem grouping/auto-merge. #165 (`@types/react` 19) quebra `tsc` (JSX namespace). Majors (tailwind 4, react-leaflet 5, react-helmet-async 3) sem triagem. Actions `checkout@v4`/`setup-node@v4`/`setup-uv@v5` em `graphify.yml` divergem dos `@v7` do resto (PRs #164, #166, #167). | `github_list_pull_requests` |
| M | **50 alertas CodeQL abertos, 11 `high`** (regex sem âncora, insecure randomness, file-system race, double-escaping, incomplete hostname regexp), 18 `stack-trace-exposure` em edge functions. Nenhum gate. | `github_list_code_scanning_alerts` |
| N | **Nenhum workflow deploya edge functions ou migrations** ("merge ≠ produção", já documentado em `docs/execucao/RECONCILIACAO_GITHUB_SUPABASE_2026-08-31.md`). O PR template exige "evidência pós-aplicação" manual. | grep em `.github/` |

### P2 — desperdício, duplicação, débito

| # | Achado | Evidência |
|---|---|---|
| O | `npm ci` roda **7×** por PR (7 jobs) e `npm run build` **3×** (build, lighthouse, bundle-size). Sem artefato compartilhado. | `pr-checks.yml` |
| P | Cache Deno de **1,97 GB em 24 entradas**; chave usa `hashFiles('supabase/functions/**/*.ts')` → miss em quase toda PR. `pr-checks` (job Deno lint) e `cron-monitoring` **não têm cache**. | `github_get_actions_cache_usage`, `edge-functions-bundle.yml:37-43` |
| Q | Playwright browsers (chromium **e webkit**) baixados a cada run; webkit não é usado por nenhum projeto do `playwright.config.ts`. | `pr-checks.yml:211` |
| R | `concurrency.cancel-in-progress: true` também em `push: main` → 2 runs de `main` cancelados em 25/09 (perde sinal do commit anterior). | runs 36076454126, 36076434813 |
| S | QA Exhaustive **duplica** tsc, eslint, complexity, build e budget do `pr-checks`; Lighthouse com `continue-on-error` + `npm install -g @lhci/cli@0.14.x` sem lock; a11y sweep só semanal (e nunca rodou porque o job morre antes). | `qa-exhaustive.yml` |
| T | `quote-to-sale-e2e.yml`: `paths` não inclui `supabase/functions/**convert**` nem RPCs; usa `secrets.VITE_SUPABASE_PROJECT_ID` enquanto `pr-checks` hardcoda `usyxfpqlsspldubptrdl`; skip silencioso com `exit 0`. Última execução manual (03/09) falhou nos specs. | run 33802372393 |
| U | Lighthouse (`treosh/lighthouse-ci-action@v12`) com `upload.target: temporary-public-storage` → relatório em URL pública; `numberOfRuns: 3` em PR. | `.lighthouserc.json` |
| V | `permissions:` ausente em 6 de 9 workflows (herdam default `read`, mas não explícito). | actionlint OK, mas sem hardening |
| W | Docs desatualizados: PR template pede `npm run health` (script não existe); `CLAUDE.md` diz `bun run`, CI usa `npm`; `.github/workflows/README.md` não lista gates reais; comentários "etapa X do plano de 50 etapas" espalhados. | `package.json`, `.github/pull_request_template.md` |
| X | `coverage-baseline.json` = 2,89% linhas → ratchet é cosmético; `lint:complexity` tolera 126 warnings. | `coverage-baseline.json`, `package.json` |
| Y | Environments `Preview`/`Production` (Vercel) sem protection rules; `CODEOWNERS` 100% um único handle e `require_code_owner_review=false`. | `github_list_environments`, ruleset |
| Z | `graphify.yml` roda em **toda** PR (33 runs) sem path filter; `uv sync --locked` sem `python-version` pinado. | `graphify.yml` |

---

## 2. Plano em 100 etapas

Convenções: **[arquivo]** = onde mexer · **Risco** = impacto se der errado · Etapas em ordem de execução; cada fase pode virar 1 PR (exceto onde indicado "PR própria").

### Fase 0 — Estancar o sangramento (etapas 1–12) · P0

1. **Regenerar `deno.lock`** (`deno install --frozen=false` na raiz) e commitar. Corrige A/C/D de uma vez. [`deno.lock`] Risco: baixo.
2. **Rodar localmente os 4 alvos Deno com `--frozen`** antes do push (bundle script, request-id lint, fuzz test, cron suite E2E) e colar saída no PR. Prova, não suposição.
3. **Adicionar `package.json`, `package-lock.json` e `deno.lock` aos `paths:`** de `edge-functions-bundle.yml`, `edge-functions-request-id.yml` e `cron-monitoring.yml`. Fecha a brecha B.
4. **Novo step em `pr-checks.yml` → job `edge-functions-lint`: `deno install --frozen`** (falha se lock divergir). Gate de PR para o lockfile Deno. [`pr-checks.yml:117-136`]
5. **Disparar manualmente (`workflow_dispatch`) Cron Monitoring, X-Request-Id e Bundle** após o merge da fase 0 e registrar os 3 verdes.
6. **Rotacionar `VITE_SUPABASE_PUBLISHABLE_KEY` / `E2E_TEST_PASSWORD`** para os valores atuais do projeto `usyxfpqlsspldubptrdl` (via MCP Supabase + `github_set_actions_secret`). Corrige E.
7. **Validar credenciais E2E com `node scripts/e2e-precheck.mjs` em `workflow_dispatch`** e anexar run verde ao PR da fase.
8. **Criar `SUPABASE_SERVICE_ROLE_KEY` como secret** (ou decidir explicitamente não criar e remover o ramo morto do `cron-monitoring.yml`). Elimina o "E2E-only" silencioso (J).
9. **Atualizar os comentários stale** em `cron-monitoring.yml:43-46` e `pr-checks.yml:14-15,368-370` para o estado real (secrets existem; repo é público).
10. **Endurecer `cron-monitoring`: `exit 1` quando secrets ausentes em `schedule`/`push`** (mantém warning só em `pull_request` de fork). Sem verde silencioso.
11. **Fechar/rebasear as 12 PRs Dependabot**: mergear as 3 de actions (#164, #166, #167) após fase 0; fechar #165 com comentário (bloqueada por React 18); agrupar o resto na fase 7.
12. **Publicar `docs/execucao/STATUS_CI_2026-09.md`** com a tabela "workflow × último verde × causa da última falha" — baseline para medir as fases seguintes.

### Fase 1 — Cadeia de suprimento e permissões (etapas 13–27) · P1

13. **Pinar todas as actions por SHA completo** com comentário de versão (`actions/checkout@<sha> # v7.x`). 9 arquivos, ~30 usos.
14. **Ativar `sha_pinning_required: true`** nas Actions permissions do repo (`github_set_actions_permissions`). Só depois da etapa 13.
15. **Restringir `allowed_actions` para `selected`** com allowlist: `actions/*`, `github/*`, `denoland/setup-deno`, `supabase/setup-cli`, `treosh/lighthouse-ci-action`, `astral-sh/setup-uv`.
16. **Adicionar `permissions: contents: read` no topo** dos 6 workflows que não declaram (pr-checks, cron, bundle, request-id, qa, quote-to-sale).
17. **Elevar `permissions` por job só onde necessário** (`security-events: write` no CodeQL já está; nenhum outro precisa de write).
18. **Adicionar guard de fork em `quote-to-sale-e2e.yml` e `cron-monitoring.yml`** (`github.event.pull_request.head.repo.full_name == github.repository`), igual ao E2E de `pr-checks.yml:147`.
19. **Nunca usar `pull_request_target`** — registrar como regra em `.github/workflows/README.md` (hoje não é usado; manter assim).
20. **Trocar `npm audit --omit=dev` por dois níveis**: prod `--audit-level=high` (bloqueante) e dev `--audit-level=critical` (bloqueante). Torna F visível.
21. **Remover o `ignore` de major do vitest/coverage-v8 em `dependabot.yml`** e abrir PR única de upgrade vitest 1.6 → 3.2.6+ (elimina GHSA-5xrq crítica e leva vite/esbuild transitivos junto). PR própria; risco médio (API de mocks).
22. **Conferir e fechar os alertas Dependabot #1, #2, #4, #7, #8** após a etapa 21 (esperado: 0 abertos).
23. **Habilitar `secret_scanning_non_provider_patterns`** e `validity_checks` no repo (hoje `disabled`).
24. **Adicionar `zizmor`** (auditor estático de workflows) como step no `lint-and-typecheck` ou workflow próprio semanal — cobre injection via `${{ }}` em `run:`.
25. **Corrigir o único ponto de injeção potencial**: `pr-checks.yml:386` interpola `${{ github.workflow }}`/`github.event_name` direto no `-d` do curl → mover para `env:` e usar `"$VAR"`.
26. **Substituir o `curl` Slack por `slackapi/slack-github-action` pinado** ou remover o job até existir o webhook (hoje é código morto).
27. **Rodar `actionlint` + `zizmor` em pre-commit** para `.github/workflows/*.yml` via lint-staged. [`package.json` lint-staged]

### Fase 2 — Gates e ruleset (etapas 28–40)

28. **Adicionar aos required checks do ruleset**: `Edge Functions Lint (deno)`, `Security Audit (production deps)`, `Bundle Size Check`. (Não adicionar E2E/Lighthouse até fase 5.)
29. **Ativar `strict_required_status_checks_policy: true`** (branch precisa estar atualizada com `main` antes do merge). Evita o "verde em base antiga".
30. **Exigir 1 aprovação** e `dismiss_stale_reviews_on_push: true` — ou, se o fluxo é 1 pessoa + agentes, registrar a decisão de manter 0 e o porquê.
31. **Adicionar `required_linear_history`** e manter `allowed_merge_methods: [squash]` só (hoje permite `merge`).
32. **Criar job agregador `ci-ok`** em `pr-checks.yml` com `needs: [todos]` + `if: always()` que falha se qualquer `needs.*.result != 'success'/'skipped'` → o ruleset passa a exigir **um** check em vez de N (facilita renomear jobs sem quebrar o ruleset).
33. **Tornar `Edge Functions Bundle Check` e `X-Request-Id Lint` jobs do `pr-checks.yml`** (com `paths-filter` via `dorny/paths-filter` ou `tj-actions/changed-files` pinado) em vez de workflows separados — passam a contar no `ci-ok`.
34. **Fazer o `push: main` não cancelar runs anteriores**: `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`. Corrige R.
35. **Adicionar `paths-ignore: ['docs/**', '**/*.md']`** em `pr-checks.yml` e `graphify.yml` para PRs só de documentação (mantém `ci-ok` verde via job vazio).
36. **Path filter em `graphify.yml`**: `scripts/graphify/**`, `tools/graphify/**`, `src/lib/revenueForecast/**`, `.github/workflows/graphify.yml`.
37. **Pinar Python em `tools/graphify/.python-version` (3.12)** e passar `python-version` ao `setup-uv`.
38. **CodeQL: separar `security-extended` (bloqueante via `security-events` + ruleset "Code scanning results")** de `security-and-quality` (não bloqueante). Zera o ruído de 21 alertas de qualidade misturados.
39. **Adicionar regra de ruleset `code_scanning`** exigindo 0 alertas `high`/`critical` novos por PR.
40. **Triar os 11 alertas CodeQL `high`** em 1 PR por domínio (regex sem âncora, hostname regexp, insecure randomness, fs race, double-escaping) e os 18 `stack-trace-exposure` em edge functions. PR própria; toca `supabase/functions/**` → evidência pós-aplicação obrigatória.

### Fase 3 — Agendados confiáveis e alertas reais (etapas 41–52)

41. **Criar `SLACK_CI_WEBHOOK_URL`** (ou webhook do WhatsApp via Evolution/N8N — já existe `wpp2`) e apontar `notify-failure` para ele.
42. **Extrair `notify-failure` para workflow reutilizável `.github/workflows/_notify.yml`** (`workflow_call`) e chamá-lo de `cron-monitoring`, `qa-exhaustive`, `codeql` em `if: failure()`.
43. **Alerta de "N falhas consecutivas" para schedules** via N8N (poll `github_list_runs_for_workflow` a cada 6h) — cobre o cenário de 12 falhas ignoradas.
44. **Cron Monitoring: adicionar `actions/cache` para `~/.cache/deno`** (hoje sem cache) com chave `hashFiles('deno.lock')`.
45. **Cron Monitoring: remover upload de `~/.cache/deno` em falha** (13 MB/866 arquivos por run, inútil para debug) → subir só stdout/stderr do `deno test` em arquivo.
46. **QA Exhaustive: remover passos duplicados** (`tsc`, `eslint`, `lint:complexity`, `build`, `check-bundle-budget`) que já rodam em toda PR. Fica: `deps:check`, `deps:graph`, Vitest full, Deno `_shared`, contract tests, Lighthouse, a11y.
47. **QA Exhaustive: quebrar em jobs paralelos** (`deps`, `vitest-full`, `deno-shared`, `lighthouse`, `a11y`) com `fail-fast: false` — hoje 1 job serial de 30 min morre no primeiro erro e esconde os demais.
48. **QA Exhaustive: pinar `@lhci/cli` como devDependency** e usar `npx lhci` (remove `npm install -g` sem lock).
49. **QA Exhaustive: remover `continue-on-error` do Lighthouse** e transformar assertions `warn` em `error` só para `accessibility` e `best-practices` (já são). Sem mascarar.
50. **Validar que `bundle-stats/` é gerado com `ANALYZE_BUNDLE=1`** (21/09 o upload avisou "No files were found") — se o plugin não grava nesse path, corrigir `vite.config.ts` ou o `path:` do upload.
51. **Mover a11y sweep (`playwright.a11y.config.ts`) para `pr-checks.yml`** com `paths: src/**` e `chromium` only — sinal por PR, não semanal.
52. **Adicionar `schedule` de smoke diário para `edge-functions-bundle`** (`deno check` de 170 funções) — detecta `esm.sh`/`npm:` quebrado mesmo sem PR.

### Fase 4 — Velocidade e custo (etapas 53–65)

53. **Job `setup` único**: `npm ci` + `actions/cache/save` de `node_modules` (chave `hashFiles('package-lock.json')`), demais jobs `actions/cache/restore` com `fail-on-cache-miss: true`. De 7 installs para 1.
54. **Build uma vez**: job `build` sobe `dist/` como artefato; `lighthouse` e `bundle-size` baixam em vez de rebuildar (2 builds a menos por PR).
55. **Lighthouse: usar o build normal com envs placeholder já no job `build`** (hoje `build` compila sem env e `lighthouse` recompila com placeholder).
56. **Playwright: remover `webkit` do `npx playwright install`** (nenhum projeto usa) e cachear `~/.cache/ms-playwright` por versão do `@playwright/test`.
57. **Deno cache: chave = `hashFiles('deno.lock')`** em todos os jobs Deno (hoje inclui `supabase/functions/**/*.ts` → miss constante, 2 GB acumulados).
58. **Limpar caches órfãos** (`github_delete_actions_cache_by_key`) após a etapa 57 e definir política: máx 5 caches Deno ativos.
59. **`timeout-minutes` realistas**: `lint-and-typecheck` 10→8, `test` 10→8, `e2e` 20→15, `qa-exhaustive` 30→20 por job (após etapa 47). Mediana atual do PR Checks é 4,3 min, p90 5,8.
60. **Vitest com `--reporter=dot` em CI** e `--coverage.reporter=json-summary,text` (remove HTML de 30 MB gerado e descartado).
61. **`npm run lint` e `lint:complexity` em um único `eslint` run** com `--max-warnings` por regra via config em vez de 2 passadas completas.
62. **`actions/setup-node` com `cache-dependency-path: package-lock.json`** explícito e `node-version-file: .nvmrc`** (criar `.nvmrc` = 22).
63. **Adicionar `.nvmrc`/`engines.npm`** e checar no `setup` que a versão do `npm` bate com a do `package-lock.json` (`lockfileVersion`).
64. **Concurrency por workflow em schedules** (`group: qa-exhaustive` já existe) → replicar em `cron-monitoring` (hoje `${{ github.ref }}` deixa 2 schedules coexistirem).
65. **Relatório mensal de minutos** via `github_get_workflow_usage` no N8N → planilha; meta: −40% após fases 3–4.

### Fase 5 — E2E e qualidade que valem alguma coisa (etapas 66–78)

66. **E2E: conta dedicada `e2e@promobrindes` no projeto oficial** com role mínimo e senha rotacionada trimestralmente (documentar em `docs/RUNBOOK.md`).
67. **E2E: unificar origem do `VITE_SUPABASE_PROJECT_ID`** (`pr-checks` hardcoda, `quote-to-sale` lê secret) → usar `vars.SUPABASE_PROJECT_ID` (Actions variable, não secret; não é segredo).
68. **E2E: substituir `exit 0` silencioso do `quote-to-sale-e2e.yml:59-62,86-91`** pelo mesmo padrão tri-estado do `pr-checks` (skip só sem nenhum secret; parcial = erro).
69. **E2E: `quote-to-sale` paths** incluir `supabase/functions/**convert**`, `supabase/migrations/**quote**`, `src/pages/*Quote*`, `src/components/quotes/**`.
70. **E2E: `retries: 2` + `trace: on-first-retry` já existem; adicionar `--shard`** (2 shards) no job `e2e` quando os secrets estiverem válidos (suite de 40+ specs).
71. **E2E: publicar `playwright-report` como GitHub Pages ou artefato com link no `$GITHUB_STEP_SUMMARY`** (hoje só artefato sem link).
72. **Tornar `E2E Tests` required no ruleset** somente após 10 runs verdes consecutivos (registrar contagem na etapa 12).
73. **Coverage: subir `coverage-baseline.json` para o valor real após a fase** e definir meta trimestral (+5 pp/trimestre) — hoje 2,89% linhas é piso decorativo.
74. **Coverage: publicar delta no PR** via `$GITHUB_STEP_SUMMARY` (o ratchet já calcula; só não mostra).
75. **`lint:complexity`: baixar teto 126 → 100** na fase e ratchet automático (script lê o número atual e falha se subir).
76. **Contract tests Deno (`lead-scoring_test`, `execute-workflow/contracts_test`) para o `pr-checks`** com path filter em `supabase/functions/{lead-scoring,execute-workflow}/**`.
77. **`deno test` com `--no-check` no QA** → remover (`--no-check` esconde erro de tipo em `_shared`); se ficar lento, `deno check` separado.
78. **`gen-types-drift`: criar `SUPABASE_ACCESS_TOKEN`** (token de CI, escopo leitura) ou **remover o job** — verde falso não pode ficar.

### Fase 6 — Deploy rastreável (etapas 79–88)

79. **Decidir e documentar o modelo de deploy de edge functions**: (a) workflow `deploy-functions.yml` em `push: main` com `supabase functions deploy --project-ref usyxfpqlsspldubptrdl` (precisa `SUPABASE_ACCESS_TOKEN`), ou (b) manter manual via MCP com evidência obrigatória. Decisão de negócio — apresentar custo/risco.
80. **Se (a): workflow `deploy-functions.yml`** com `environment: Production`, path filter `supabase/functions/**`, `concurrency` sem cancel, e `deploy` só das funções alteradas (`changed-files`).
81. **Se (a): protection rule em `Production`** (required reviewer = dono) para o deploy de funções; `Preview` sem regra.
82. **Migrations: workflow `migrations-check.yml`** que valida versão estritamente crescente (`SELECT max(version)` regra 3 do CLAUDE.md) e cabeçalho descritivo nos arquivos novos — sem aplicar nada.
83. **Migrations: job `db-drift` semanal** comparando `supabase/migrations/` com `supabase_migrations.schema_migrations` do banco (via MCP/N8N) e abrindo issue se divergir (o caso do PR #66 não repetir).
84. **Front: registrar deployment no GitHub** (`github_create_deployment`) a partir do webhook do Vercel/Lovable via N8N → `Environments` passa a refletir realidade.
85. **Rollback documentado por workflow**: `workflow_dispatch` com input `function_name` + `git_sha` que redeploya versão anterior (só se etapa 79 = a).
86. **Smoke pós-deploy**: `workflow_run` após deploy chama `scripts/smoke-target-backend.ts` contra produção e falha com alerta (etapa 41).
87. **Release notes automáticas**: `release-drafter` ou `github_generate_release_notes` em tag semanal — rastreabilidade do que foi a produção.
88. **Remover do PR template a seção "Evidência Pós-Aplicação" manual** quando a etapa 80 estiver ativa (ou mantê-la e referenciar o run de deploy).

### Fase 7 — Dependabot e manutenção contínua (etapas 89–95)

89. **`dependabot.yml`: `groups`** — `radix` (`@radix-ui/*`), `react` (react, react-dom, @types/react*), `testing` (vitest, @vitest/*, @playwright/*), `build` (vite, @vitejs/*, esbuild), `actions`. 12 PRs → ~4.
90. **`dependabot.yml`: `cooldown` de 7 dias** para majors e `versioning-strategy: increase`.
91. **Trocar `reviewers` (deprecado) por `assignees`** e remover label `automated`.
92. **Auto-merge de patch/minor** de devDeps quando `ci-ok` verde (`github_enable_pr_auto_merge` via workflow com `pull_request_target`? **Não** — usar app Dependabot auto-merge nativo com regra no ruleset).
93. **Fechar majors sem plano** (#152 tailwind 4, #151 react-leaflet 5, #159 react-helmet-async 3) com comentário e `ignore` temporário até PR de upgrade dedicada.
94. **Adicionar ecossistema `uv` (`tools/graphify`) ao Dependabot** — já aparece como "Graph Update: uv" dinâmico; formalizar.
95. **Workflow mensal `stale.yml`** para PRs > 30 dias sem atividade (marcar, não fechar).

### Fase 8 — Documentação e governança (etapas 96–100)

96. **Reescrever `.github/workflows/README.md`**: tabela workflow × gatilho × gates × required × secrets necessários × dono.
97. **Corrigir PR template**: `npm run health` → `npm run ci`; alinhar checklist aos gates reais.
98. **Alinhar `CLAUDE.md` §7 (bun → npm)** e `CONTRIBUTING.md`; remover comentários "etapa X do plano de 50 etapas" dos YAML (histórico vai para `docs/`).
99. **`CODEOWNERS`**: adicionar `.github/workflows/` e `supabase/migrations/` com `require_code_owner_review: true` no ruleset (mesmo com 1 owner, bloqueia merge de agente sem revisão humana nesses paths).
100. **Revisão trimestral**: item recorrente no N8N (1º dia do trimestre) que reabre este documento, roda `actionlint`/`zizmor`, lista actions desatualizadas e falhas de schedule dos últimos 90 dias.

---

## 3. Ordem recomendada de execução

| Lote | Etapas | Efeito no negócio | PRs |
|---|---|---|---|
| 1 (hoje) | 1–12 | CI volta a dizer a verdade: 4 workflows vermelhos → verdes; E2E volta a rodar | 2 (lockfile+paths; secrets é config, não PR) |
| 2 | 13–27 | Repo público protegido contra action maliciosa; CVE crítica do vitest some | 3 |
| 3 | 28–40 | Merge só com todos os gates; CodeQL deixa de ser ruído | 2 + config ruleset |
| 4 | 41–52 | Falha de sábado às 6h chega no WhatsApp/Slack em vez de sumir | 2 |
| 5 | 53–65 | PR de 4–6 min para ~3; −40% minutos | 2 |
| 6 | 66–78 | E2E vira gate real; cobertura para de ser decorativa | 3 |
| 7 | 79–88 | "Mergeado" = "em produção" com rastro | decisão de negócio + 2 |
| 8 | 89–100 | Manutenção deixa de acumular 12 PRs | 2 |

Itens que exigem decisão do dono antes de executar (regra 8 do fluxo Git): 14, 15, 28–31, 39, 79–81, 92, 99.
