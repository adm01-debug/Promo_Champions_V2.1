# 12 — INFRA, CI/CD, TESTES E QUALIDADE (estado medido)

> **Método:** análise estática. Todo item abaixo foi lido de `arquivo:linha` neste checkout.
> **Nenhuma suíte foi executada** — `node_modules` não está instalado neste ambiente (ver seção final).
> Documentação prévia do repo (`TEST_QUALITY_REPORT.md`, `docs/reports/*`) foi tratada como hipótese e,
> onde testada, **refutada** (§4.1).

---

## 1. Sumário executivo

| # | Achado | Severidade |
|---|--------|-----------|
| 1 | **44 de 60 arquivos de teste Deno (73%) não são executados por nenhum pipeline.** Inclui as 25 suítes de `detect-winloss-at-risk/` e as 11 de `winloss-webhook-dispatcher/` | 🔴 Crítico |
| 2 | **Job E2E de PR roda sem nenhum secret** → `HAS_AUTH=false` → **27 de 37 specs E2E pulam e o job fica verde** | 🔴 Crítico |
| 3 | `TEST_QUALITY_REPORT.md` (97,6% cobertura, "10/10") é **string hardcoded** em `scripts/generate-quality-report.ts:23-26` — não mede nada, e o script não é chamado por ninguém | 🔴 Crítico |
| 4 | `qa-exhaustive.yml:38` roda `npx tsgo --noEmit`; **`tsgo` não está declarado em `package.json`** | 🔴 Crítico |
| 5 | `.husky/pre-commit` roda `npx lint-staged`; **`lint-staged` não está em `devDependencies`** | 🟠 Alto |
| 6 | `supabase/functions/**` é **ignorado pelo ESLint** (`eslint.config.js:17`) sob a justificativa de "linted via `deno lint`" — **nenhum workflow roda `deno lint`** | 🟠 Alto |
| 7 | Teste-espelho puro: `useDashboardKPIs.contract.test.ts` (179 linhas, 5 casos) **nunca importa o hook**; asserta o próprio mock | 🟠 Alto |
| 8 | `generate-audit-pdf.yml` dispara em `paths: AUDIT_REPORT.md` — **arquivo não existe no repo** | 🟡 Médio |
| 9 | `scripts/quality-gate.sh` imprime "ALL QUALITY GATES PASSED! 10/10" tendo como "validação E2E" um `test -f` (linha 30) — e não é chamado por ninguém | 🟡 Médio |
| 10 | 3 pipelines redundantes (`lint.yml`, `pr-checks.yml`, `enterprise-quality.yml`) rodam lint+typecheck+test+build no mesmo PR | 🟡 Médio |
| 11 | **Zero pipelines de deploy.** Não há CD no repositório | ℹ️ Nota |

---

## 2. Inventário medido

| Categoria | Contagem | Fonte |
|---|---|---|
| Workflows GitHub Actions | **11** (+ `README.md`) | `.github/workflows/` |
| Testes Vitest (`src/**/*.test.{ts,tsx}`) | **42** | `find src` |
| Specs Playwright E2E (`tests/e2e/*.spec.ts`) | **37** | `ls tests/e2e` |
| Spec Playwright a11y | **1** (`tests/a11y/axe-sweep.spec.ts`) | — |
| Testes Deno (`supabase/**/*_test.ts` + `*.test.ts`) | **60** (50 + 10) | `find supabase` |
| Suítes SQL | **2** (`supabase/tests/*.sql`) | — |
| Script de carga | **1** (`tests/load/load-test.ts`) | — |
| **TOTAL de arquivos de teste** | **140** (+2 SQL) | — |
| Scripts em `scripts/` | **17** | `ls scripts/` |

> ⚠️ O briefing desta auditoria falava em "80 arquivos de teste". A contagem real é **140** (+2 SQL).
> O erro vem de contar só `*.test.*`/`*.spec.*` e ignorar a convenção Deno `*_test.ts` (50 arquivos).

---

## 3. Workflows — o que roda, quando, e se é bloqueante de verdade

| Workflow | Gatilho (arquivo:linha) | O que executa | Bloqueante? | Classificação |
|---|---|---|---|---|
| `lint.yml` ("CI") | `push` **sem filtro de branch** + `pull_request → main` (`lint.yml:4-6`) | tsc, lint, `vitest run`, `npm audit`, build + `du` | ✅ Sim (todo step falha o job) | ✅ IMPLEMENTADO_TOTAL |
| `pr-checks.yml` | `pull_request → main` (`:4-5`) | 6 jobs: lint+typecheck → test / e2e / build → lighthouse / bundle-size | ✅ Sim, **mas o job `e2e` é vácuo** (§4.2) | 🟨 PARCIAL |
| `enterprise-quality.yml` | `push → main` + `pull_request → main` (`:4-7`) | lint, typecheck, test, **test:coverage**, build, `npm audit`; job 2 = Playwright completo | ✅ Coverage gate real (§9); **e2e vácuo** (§4.2) | 🟨 PARCIAL |
| `edge-functions-bundle.yml` | push/PR **filtrado** por `supabase/functions/**` (`:4-15`) | `deno run scripts/bundle-edge-functions.ts` | ✅ Sim (exit code propagado, `:50-51`) | ✅ IMPLEMENTADO_TOTAL |
| `edge-functions-request-id.yml` | push/PR filtrado por `supabase/functions/**` (`:3-17`) | `scripts/lint-request-id.ts` + `deno test _shared/request-id-fuzz_test.ts` | ✅ Sim | ✅ IMPLEMENTADO_TOTAL |
| `cron-monitoring.yml` | PR/push filtrado + **cron diário 06:00 UTC** + dispatch (`:3-18`) | `deno test cron-failure-alerter/index.test.ts` | 🟨 **Auto-desarma sem secrets** (`:38-47`) | 🟨 PARCIAL |
| `quote-to-sale-e2e.yml` | `pull_request` com `paths:` estreitíssimo + `workflow_dispatch` (`:3-13`) | vitest (2 arquivos) → invariantes → Playwright quote-to-sale | 🟨 **Auto-desarma sem `E2E_TEST_EMAIL`** (`:55-58`, `:80-86`) | 🟨 PARCIAL |
| `qa-exhaustive.yml` | **apenas** `schedule` semanal (seg 03:00 UTC) + `workflow_dispatch` (`:8-12`) | tsgo, lint, depcruise, vitest full, 3 blocos Deno, bundle budget, Lighthouse, a11y sweep | ❌ **Nunca roda em PR** — não protege merge | 🟨 PARCIAL |
| `codeql.yml` | `workflow_dispatch` + cron semanal seg 00:00 (`:4-6`) | CodeQL JavaScript | ❌ Não bloqueia PR | ✅ IMPLEMENTADO_TOTAL (como scan) |
| `generate-audit-pdf.yml` | `push` com `paths: AUDIT_REPORT.md` (`:5-6`) | md-to-pdf + commit&push | ❌ **Nunca dispara** — arquivo inexistente | ⬛ MORTO_OU_ABANDONADO |
| `.github/workflows/README.md` | — | Documenta **3** workflows (`:5-12`) de **11** existentes | — | ⬛ Desatualizado |

**Deploy:** `grep -niE "deploy\|vercel\|netlify\|publish" .github/workflows/` → nenhum job de deploy.
Não há CD versionado. Não existe, portanto, o cenário de "dois pipelines concorrendo pelo mesmo alvo" —
existe o oposto: **zero**.

---

## 4. CI QUE MENTE — achados detalhados

### 4.1 `TEST_QUALITY_REPORT.md` é ficção literal
`scripts/generate-quality-report.ts:23-26` escreve os números com `+=` de string:
```
content += `| Core Logic | 98% | 95% | 99% | 98% | ✅ PASSED |\n`;
...
content += `| **TOTAL** | **97.6%** | **95%** | **97.6%** | **97.6%** | **🏆 10/10** |\n\n`;
```
Não lê `coverage/`, não invoca vitest, não olha um arquivo sequer. Idem para
"1000 concurrent requests… 0% failure rate… P95 <220ms" (`:35-37`) e
"E2E Readiness … ✅ Verified" (`:40-41`).
O arquivo gerado (`TEST_QUALITY_REPORT.md:20`) reproduz esses valores.
**O script não é invocado por `package.json` nem por nenhum workflow** (grep = 0 chamadores).
→ ⬛ MORTO_OU_ABANDONADO, e a documentação derivada dele é inválida.

### 4.2 Job E2E verde com 27 de 37 specs puladas
Cadeia medida:
- `tests/e2e/helpers/auth.ts:32` — `HAS_AUTH = Boolean(SUPABASE_URL && SUPABASE_ANON && SESSION_JSON && STORAGE_KEY)`
- `SESSION_JSON` vem do arquivo `tests/e2e/.auth/session.json`, escrito por `tests/e2e/global-setup.ts:62-73`
- `global-setup.ts:41-49` — sem `E2E_TEST_EMAIL/PASSWORD/URL/ANON/PROJECT_ID` faz `console.warn` e **`return`** (não falha)
- 27 dos 37 specs abrem com `test.skip(!HAS_AUTH, …)` (ex.: `quote-to-sale.spec.ts:19`, `quote-to-sale-concurrent-x5.spec.ts:25`, `pipeline-flows.spec.ts:26`, `auth-logout.spec.ts:13`, `sales-markup-rls-salesperson.spec.ts:53`)

Agora o CI:
- `pr-checks.yml:82-83` — `run: npm run test:e2e` **sem bloco `env:` algum**
- `enterprise-quality.yml:65-66` — idem, sem `env:`

→ Nesses dois workflows **nenhuma credencial chega ao Playwright**, todas as 27 specs autenticadas
são puladas, o processo sai 0 e o check aparece verde. O único workflow que injeta os secrets é
`quote-to-sale-e2e.yml:92-97` — e esse tem `paths:` de 7 padrões (`:6-12`) que **não incluem
`src/components/**`, `src/pages/**`, `src/services/**` nem `supabase/functions/**`**. Uma
alteração em qualquer um deles não dispara a única E2E que de fato autentica.

Ironia registrada: `enterprise-quality.yml:61-62` traz o comentário
`# Running `vitest run tests/e2e` collected 0 tests and exited 0 (false green).` —
o falso-verde foi diagnosticado, corrigido pela metade (trocou-se o runner) e o
falso-verde por *skip* permaneceu.

### 4.3 Gate obrigatório que roda `npx` num pacote não declarado
`qa-exhaustive.yml:37-38`:
```
- name: TypeScript strict check
  run: npx tsgo --noEmit
```
`tsgo` (binário do `@typescript/native-preview`) **não aparece em `dependencies` nem
`devDependencies`** de `package.json:31-139`. `npx` resolveria o nome contra o registry público,
baixando um pacote arbitrário — ou falhando. O repo tem `typescript@^5.3.0` e o script
`typecheck: tsc --noEmit` (`package.json:23`), usado corretamente nos outros workflows.
→ Step é ao mesmo tempo gate quebrado e risco de supply-chain.

### 4.4 `continue-on-error` em steps apresentados como enforcement
- `qa-exhaustive.yml:104` — Lighthouse CI com `continue-on-error: true` **e** `|| echo "::warning::"` na linha 102 (duplo engolimento). Mesmo assim o "Summary" (`:139`) anuncia "Lighthouse CI: perf/a11y/best-practices/SEO + Web Vitals" como se fosse gate.
- `qa-exhaustive.yml:50` — `deps:graph` com `continue-on-error` (aceitável: é só artefato SVG).
- `qa-exhaustive.yml:131-140` — o bloco Summary declara números fixos ("Vitest: 293+ cenários", "Deno: 37+ cenários") em `echo` hardcoded, **não lidos da execução**, com `if: always()`. Ou seja: mesmo com a suíte quebrada o resumo publica "293+ cenários".

### 4.5 Auto-desarme silencioso por ausência de secret
| Local | Comportamento |
|---|---|
| `cron-monitoring.yml:38-47` | Sem `SUPABASE_URL`/`SUPABASE_ANON_KEY` emite `::warning::` e pula a suíte inteira → job verde |
| `quote-to-sale-e2e.yml:55-58` | Sem `E2E_TEST_EMAIL`: `exit 0` explícito nas invariantes de produção |
| `quote-to-sale-e2e.yml:80-86` | Sem `E2E_TEST_EMAIL`: pula install do Playwright e a execução |
| `src/test/security/fn-cleanup-webhook-dedupe-privileges.test.ts:45` | `describe.skipIf(!canRun)` com `canRun` = env `VITE_SUPABASE_*` (`:11-23`) → **teste de privilégio de `service_role` nunca roda em CI** |

Padrão consistente: a ausência de configuração é tratada como sucesso, nunca como falha.

### 4.6 Gate obrigatório com `paths:` que raramente dispara
`quote-to-sale-e2e.yml:5-12` — a suíte de 22 specs de quote→sale só é acionada se o PR tocar
`src/hooks/useQuotes.ts`, `src/hooks/quoteErrorMessages.ts`, `tests/e2e/quote-to-sale-*`,
`scripts/verify-quote-to-sale-invariants.ts`, `supabase/migrations/**convert**` ou
`supabase/tests/quote-to-sale-stress.sql`. A RPC de conversão, os componentes de UI de venda e
os serviços ficam **fora** do filtro.

### 4.7 Configuração de lint órfã coexistindo com a ativa
`.eslintrc.json` (24 linhas, formato legado) convive com `eslint.config.js` (flat config).
Com `eslint@^9.39.5` (`package.json:123`) o flat config é o padrão e `.eslintrc.json` é
**ignorado silenciosamente** — inclusive suas regras `eslint:recommended`, que **não existem**
no flat config ativo. → `.eslintrc.json` = ⬛ MORTO.

### 4.8 Redundância de pipeline
Num PR para `main` disparam simultaneamente `lint.yml`, `pr-checks.yml` e `enterprise-quality.yml`
— **3× `npm ci` + 3× lint + 3× typecheck + 3× vitest + 4× build**. Nenhum tem `concurrency:`
(só os 4 workflows de edge/cron/qa têm). Custo triplicado, sinal idêntico.

---

## 5. As 5 patologias — resultado da varredura

### 5.1 Teste-espelho (reimplementa/simula em vez de importar o alvo)

Varredura: arquivos de teste sem **nenhum** `from '@/…'`, `from './…'` nem `import('./…')`.
Resultado bruto: **23 de 140**. Triados manualmente:

| Arquivo | Veredito |
|---|---|
| `src/hooks/dashboard/__tests__/useDashboardKPIs.contract.test.ts` | 🔴 **ESPELHO PURO** — ver abaixo |
| `src/lib/supabase/all-in-calls.test.ts:6-30` | ✅ Legítimo — guard estático que lê arquivos do disco (`readFileSync`); não importar é o design |
| `supabase/functions/_shared/notification-inserters_test.ts:16-30` | ✅ Legítimo — mesmo padrão (varre `supabase/functions/` com `walk`) |
| `src/test/security/fn-cleanup-webhook-dedupe-privileges.test.ts` | ⚠️ Integração via `fetch` na Data API — legítimo, mas **desligado** (§5.3) |
| 9 testes Deno de edge function (`cron-failure-alerter/index.test.ts`, `receive-quote-sync/index.test.ts`, `forecast-narrative/index.test.ts`, `create-stagnant-tasks`, `notify-v4-quote-status`, `dead-letter-rbac`, `process-race-event`, `race-commentary`, `start-race-season`) | ⚠️ Integração HTTP contra ambiente vivo — não são espelhos, mas **44 deles não têm runner** (§5.4) |
| 11 specs Playwright (`smoke`, `core-flows`, `dashboard-navigation`, `auth-navigation`, `win-loss-analysis`, `rls-authorization-edge-cases`, `security-definer-rpc-access`, `revenue-forecast-v2`, `reset-password-hibp`, `v4-callbacks-admin`, `mobile-auth-smoke`) | ✅ Esperado — E2E exercita a app pelo browser, não por import |

**O caso confirmado — `src/hooks/dashboard/__tests__/useDashboardKPIs.contract.test.ts`:**
179 linhas, 5 casos de teste, e o hook `useDashboardKPIs` **não é importado em lugar nenhum do arquivo**.
O teste monta um mock (`:3-18`), configura o retorno e depois asserta o retorno que ele próprio configurou:

- `:33-61` — `rpcMock.mockResolvedValueOnce({data:{totalRevenue:12000,…}})` → `expect(data).toMatchObject({totalRevenue: expect.any(Number), …})`
- `:80-110` — `mockResolvedValueOnce({data:{…tudo zero}})` → `expect(data).toEqual({…tudo zero})` (literalmente o mesmo objeto duas vezes)
- `:126-149` — cenário "vendedor": mocka `newClients: 0` → asserta `expect(kpis.newClients).toBe(0)`
- `:151-176` — cenário "manager": mocka `newClients: 42` → asserta `expect(kpis.newClients).toBeGreaterThan(0)`

O próprio arquivo admite em `:113-118`: *"We don't simulate Postgres here — we lock in the shape contract"*.
Mas nem o contrato de forma é protegido: **nada no `src/` é executado**, o hook pode ser deletado
que o teste continua verde. Protege exatamente zero linha de produção.

**Falsos positivos corrigidos:** `src/hooks/useProductRecommendations.test.tsx:66` usa
`await import('./useProductRecommendations')` (import dinâmico após registrar o mock) — importa o alvo
de verdade e verifica particionamento real em 3 chunks (`:73-84`). É um bom teste.

### 5.2 Suíte desligada (`describe.skip`, `it.skip`, `xit`, comentada)

Zero ocorrências de `describe.skip` / `it.skip` / `xit` / `xdescribe` estáticos.
O desligamento aqui é **condicional**, o que é pior porque não aparece no diff:

| Padrão | Ocorrências | Arquivos |
|---|---|---|
| `test.skip(!HAS_AUTH, …)` | 27 arquivos | Todos os `tests/e2e/quote-to-sale-*`, `pipeline-flows`, `auth-logout`, `sales-markup-rls-salesperson` |
| `test.skip(!SUPABASE_ANON_KEY, …)` | 2 | `tests/e2e/v4-callbacks-admin.spec.ts:17,32` |
| `describe.skipIf(!canRun)` | 1 | `src/test/security/fn-cleanup-webhook-dedupe-privileges.test.ts:45` |
| `test.skip(true, …)` incondicional dentro de branch | 6 | `quote-to-sale-api-forbidden.spec.ts:46,84`; `quote-to-sale-forbidden.spec.ts:47,74`; `quote-to-sale-error-payload-ui.spec.ts:111,127`; `quote-to-sale-backfill.spec.ts:44` |
| Skip por viewport | 4 | `pipeline-flows.spec.ts:52,80`; `auth-logout.spec.ts:14` |
| **Total de arquivos com skip** | **31 de 140** | — |

Destaque: os testes de autorização `[FORBIDDEN]` (`quote-to-sale-forbidden.spec.ts:74`,
`quote-to-sale-api-forbidden.spec.ts:84`) se auto-pulam com a mensagem
*"Sessão E2E tem bypass de ownership; FORBIDDEN não aplicável"* — ou seja, quando o usuário de teste é
privilegiado (o caso normal em CI), a verificação de negação de acesso simplesmente não acontece.

### 5.3 Asserção vacuamente verdadeira / dependente de env sem guarda

| Arquivo:linha | Env | Consequência |
|---|---|---|
| `src/test/security/fn-cleanup-webhook-dedupe-privileges.test.ts:11-23,45` | `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | `canRun=false` em CI (nenhum workflow injeta `VITE_*` no vitest) → **suíte inteira pulada, 0 asserções, job verde**. É o único teste automatizado do privilégio `service_role` sobre `fn_cleanup_webhook_dedupe` |
| `supabase/functions/cron-failure-alerter/index.test.ts:19-20` | `Deno.env.get("VITE_SUPABASE_URL")!` — **non-null assertion sem guarda** | Se ausente, a URL vira `"undefined/rest/v1/rpc/…"` e o `fetch` lança. Falha ruidosa (bom), mas o workflow que o chama já pulou antes (`cron-monitoring.yml:41-44`) |
| `supabase/functions/forecast-narrative/index.test.ts:10-14` | idem + `TEST_USER_ACCESS_TOKEN ?? ""` | Cenários autenticados degradam silenciosamente |
| `supabase/functions/receive-quote-sync/index.test.ts:25-26` | `EDGE_BASE_URL ?? "${VITE_SUPABASE_URL}/functions/v1/…"`, `ANON ?? ""` | Sem env, chama `"undefined/functions/v1/…"` |
| `supabase/functions/receive-quote-sync/index.test.ts:36-39` | — | `assert([404, 405, 400].includes(res.status))` — aceita **3 status diferentes** para "GET não permitido". Passaria com um 404 de rota inexistente |

Nenhum destes chega a produzir `expect(undefined).toBe(undefined)` literal, mas o efeito prático é o
mesmo: cobertura de segurança que **não executa** no pipeline e não emite erro.

### 5.4 Sem runner — arquivos de teste que nenhum pipeline executa

Cruzamento entre os `include`/`testDir` dos configs e os arquivos reais:

| Runner | Padrão (arquivo:linha) | Arquivos casados | Órfãos |
|---|---|---|---|
| `vitest.config.ts` | `include: ['src/**/*.{test,spec}.{ts,tsx}']` (`:9`) | **42 de 42** | 0 ✅ |
| `vitest.node.config.ts` | 2 arquivos fixos (`:14-17`) | 2 | — (ver abaixo) |
| `playwright.config.ts` | `testDir: './tests/e2e'` (`:12`), 4 projetos (`:31-61`) | **37 de 37** | 0 ✅ |
| `playwright.a11y.config.ts` | `testDir: './tests/a11y'` (`:14`) | 1 de 1 | 0 ✅ |
| Deno (3 workflows) | `_shared/` + 2 arquivos nomeados + `cron-failure-alerter/index.test.ts` | **16 de 60** | **44** 🔴 |
| SQL | — | 0 de 2 | **2** 🔴 |
| Load | — | 0 de 1 | **1** 🔴 |

**Órfãos Deno — 44 de 60 (73%):**

| Diretório | Órfãos | Observação |
|---|---|---|
| `detect-winloss-at-risk/` | **15** (`scoring_test.ts`, `action_matrix_combinations_test.ts`, `breakdown_invariants_test.ts`, `fallback_determinism_test.ts`, `lse_fixtures_test.ts`, `scenarios_test.ts`, `urgency_scale_outcome_symmetry_test.ts`, `competitor_critical_test.ts`, `critical_imperative_tokens_test.ts`, `reasons_codes_test.ts`, `history_catalog_test.ts`, `non_empty_strings_test.ts`, `action_validation_test.ts`, `debug_breakdown_test.ts`, `_testHelpers_test.ts`) | A suíte mais densa do repo, 100% invisível ao CI |
| `winloss-webhook-dispatcher/` | **11** (`retry_test.ts`, `retry_parametric_test.ts`, `retry_backoff_sleep_test.ts`, `retry_dlq_body_headers_test.ts`, `retry_insert_failure_dlq_test.ts`, `retry_persist_status_test.ts`, `retry_delivery_before_sleep_test.ts`, `retry_error_naming_test.ts`, `retry_log_counts_test.ts`, `request_id_consistency_test.ts`, `schema_test.ts`) | `retry_test.ts:2` importa `./retry.ts` corretamente e usa harness de injeção de dependência — **teste de boa qualidade que ninguém roda** |
| `run-retry-tests/` | 4 | — |
| `winloss-webhook-replay/` + `-batch/` | 3 | — |
| `personal-assistant-stream/` | 2 | — |
| Edge functions diversas | 9 (`check-v4-callback-alerts`, `create-stagnant-tasks`, `cron-failure-alerter/dead-letter-rbac`, `forecast-narrative`, `notify-v4-quote-status`, `process-race-event`, `race-commentary`, `receive-quote-sync`, `start-race-season`) | — |

Notar que `qa-exhaustive.yml:64-73` roda Deno em **três alvos apenas** (`_shared/`, `lead-scoring`,
`execute-workflow`) — e mesmo esses só semanalmente.

**Outros órfãos:**
- `tests/load/load-test.ts` — a única referência é `scripts/quality-gate.sh:24`, e `quality-gate.sh` não é chamado por ninguém.
- `supabase/tests/rls_test_suite.sql` — **grep = 0 referências** em todo o repo.
- `supabase/tests/quote-to-sale-stress.sql` — aparece **apenas** como `paths:` filter em `quote-to-sale-e2e.yml:12`; nenhum step o executa.
- `vitest.node.config.ts` — nenhum workflow o usa (`quote-to-sale-e2e.yml:31` roda os 2 arquivos direto com `npx vitest run <arquivo>`, o que usa o `vitest.config.ts` padrão **com** o `setupFiles` que o comentário do `vitest.node.config.ts:5-8` diz que trava). O próprio `docs/auditoria/RELATORIO_FALHAS.md:353` já registrava isso.

### 5.5 Alvo inexistente (teste importa módulo que sumiu)

Nenhum encontrado nos testes. Mas há dois **configs** apontando para alvos inexistentes:

| Referência | Alvo | Estado |
|---|---|---|
| `deno.json:3` — `"check": "deno check src/main.ts"` | `src/main.ts` | 🔴 **Não existe** (o arquivo é `src/main.tsx`). E a task nunca é invocada |
| `generate-audit-pdf.yml:5-6,19` | `AUDIT_REPORT.md` | 🔴 **Não existe** no repo |

---

## 6. `.husky/` — hooks de commit

| Hook | Conteúdo | Estado |
|---|---|---|
| `.husky/pre-commit:1` | `npx lint-staged` | 🔴 **`lint-staged` NÃO está em `devDependencies`** (`package.json:109-139`). Só existe a chave de *configuração* `lint-staged` em `package.json:143-150`. `npx` tentaria baixar do registry a cada commit — falha offline, e é vetor de supply-chain |
| `.husky/commit-msg:1` | `npx --no -- commitlint --edit ${1}` | ✅ `@commitlint/cli@^21` e `config-conventional` estão declarados (`package.json:111-112`). `--no` impede download. **Este funciona.** |

**O que o commit-msg bloqueia** (`commitlint.config.js`):
- `type-enum` nível **2 (error)** (`:4-15`): só `feat, fix, docs, style, refactor, perf, test, chore, ci, build`
- `scope-enum` nível **2 (error)** (`:16-27`): só `auth, bi, crm, gamification, ui, hooks, services, db, config, deps`
  → um commit `feat(reporting): …` ou `feat(pwa): …` é **rejeitado**; escopo tem de estar na lista fechada.

**Ativação:** `package.json:24` tem `"prepare": "husky"`, que cria `.husky/_/` e seta `core.hooksPath`
no `npm install`. Neste checkout `.husky/_/` **não existe** e `git config core.hooksPath` está vazio
(`.git/hooks/` só tem `*.sample`) → **hooks inativos aqui**. É esperado num clone sem `npm install`,
mas significa que a proteção depende inteiramente de cada dev rodar install.
Todos os workflows setam `HUSKY: 0` (`lint.yml:12`, `pr-checks.yml:13,40,64,99,128,158`,
`enterprise-quality.yml:13,51`, `quote-to-sale-e2e.yml:21,39,67`) — correto para CI.

**Classificação:** `commit-msg` ✅ IMPLEMENTADO_TOTAL · `pre-commit` 🟨 PARCIAL (dependência faltando)

---

## 7. `scripts/` — 17 arquivos, quem chama cada um

| Script | Chamador | Classificação |
|---|---|---|
| `bundle-edge-functions.ts` | `edge-functions-bundle.yml:48` | ✅ IMPLEMENTADO_TOTAL |
| `lint-request-id.ts` | `edge-functions-request-id.yml:37` | ✅ IMPLEMENTADO_TOTAL |
| `request-id-lint-allowlist.txt` | consumido por `lint-request-id.ts` | ✅ |
| `check-bundle-budget.mjs` | `qa-exhaustive.yml:82` | 🟨 PARCIAL — só no cron semanal; budgets em `:19-41` |
| `verify-quote-to-sale-invariants.ts` | `quote-to-sale-e2e.yml:59` | 🟨 PARCIAL — auto-pula sem secret (`:55-58`) |
| `smoke-target-backend.ts` | `package.json:29` (`smoke:target`) | 🟨 PARCIAL — nenhum workflow roda `smoke:target` |
| `smokeTargetHelpers.ts` | importado pelo anterior + `src/test/smoke-target-helpers.test.ts` | 🟨 PARCIAL |
| `generate-quality-report.ts` | **ninguém** | ⬛ MORTO (e gera dado falso, §4.1) |
| `quality-gate.sh` | **ninguém** | ⬛ MORTO (§8) |
| `ci-check-forbidden.sh` | **ninguém** (apesar do nome "ci-") | ⬛ MORTO |
| `codemod-typography.mjs` | **ninguém** | ⬛ MORTO (codemod one-shot) |
| `dev-kpis-as-role.sh` | **ninguém** | 🟦 SUGERIDO_OU_INICIADO (ferramenta de dev) |
| `load-test-sim.ts` | **ninguém** | ⬛ MORTO |
| `pack-quote-to-sale-artifacts.ts` | **ninguém** em workflow; invocado por `tests/e2e/helpers/quote-to-sale-failure-reporter.ts` | 🟨 PARCIAL |
| `prod-health-check.ts` | **ninguém** | 🟦 SUGERIDO_OU_INICIADO |
| `verify-dispatcher-request-id.sh` | **ninguém** | ⬛ MORTO |

**Placar: 3 de 17 scripts (18%) são executados por um pipeline.** 6 são código morto.

### 7.1 `scripts/quality-gate.sh` — o gate teatral
Nunca é chamado, mas o que ele *faria* é instrutivo:
- `:24` — `deno run --allow-net tests/load/load-test.ts` (única referência ao teste de carga do repo)
- `:27-30` — sob o título **"🚀 Validating E2E Test Suite"**, o comentário admite
  *"we just check if it's installable/ready … For now, we verify the files exist"* e executa
  literalmente `test -f tests/e2e/core-flows.spec.ts`
- `:31` — imprime `"✅ ALL QUALITY GATES PASSED! 10/10"`

Verificar que um arquivo existe e declarar "10/10" é a assinatura do padrão que se repete neste repo.

---

## 8. PWA (`vite-plugin-pwa`)

| Item | Evidência | Estado |
|---|---|---|
| Plugin habilitado | `vite.config.ts:4,11` — `VitePWA({…})` incondicional no array de plugins | ✅ |
| Service worker gerado | `vite.config.ts:13` — `filename: 'pwa-sw.js'`; `registerType: 'autoUpdate'` (`:14`) | ✅ Sim, gera SW |
| Auto-registro | `vite.config.ts:12` — `injectRegister: false` → o plugin **não** injeta o registro | — |
| Registro manual | `index.html:90-92` — `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/pwa-sw.js')` | ✅ Fecha o ciclo |
| Ciclo de update | `src/main.tsx:5` importa `installSwAutoUpdate` de `@/lib/swUpdater`; `swUpdater.ts:9` conhece `['/sw.js','/pwa-sw.js','/service-worker.js']`, `:175` escuta `controllerchange` | ✅ |
| Precache | `workbox.globPatterns` (`:18`) cobre css/html/ico/png/svg/woff2 — **não inclui `js`** | 🟨 JS fora do precache |
| Runtime caching | `:19-29` — `NetworkFirst` para `*.supabase.co`, `maxEntries:50`, `maxAge:300s`, timeout 5s | ✅ |
| Manifest | `:31-43` — nome, cores, `display: standalone`, ícones 192/512 | ✅ |
| Cobertura de teste | `swUpdater.ts` está no `exclude` de coverage (`vitest.config.ts:52`); nenhum teste do SW | 🟨 |

**Classificação PWA: ✅ IMPLEMENTADO_TOTAL** (funcionalmente completo; a omissão de `js` no
`globPatterns` é uma escolha, provavelmente deliberada dado o comentário em `vite.config.ts:45-47`
sobre não estourar o precache).

---

## 9. Cobertura — configuração de threshold

`vitest.config.ts:54-59`:
```
thresholds: { lines: 85, branches: 75, functions: 85, statements: 85 }
```
**Existe, é numérico, e é enforced** — vitest falha o processo se não atingir. `enterprise-quality.yml:36-39`
roda `npm run test:coverage`, então o gate é real **nesse** workflow (é o único que roda coverage).

**Mas o escopo é minúsculo.** `vitest.config.ts:17-34` restringe `coverage.include` a uma lista
branca de **16 arquivos**:
`winloss/severityFromScore.ts`, `winloss/scenarioChartKey.ts`, `winloss/riskReasons.ts`, `mergeTags.ts`,
`gamification.ts`, `orderTracking/stages.ts`, `utils.ts`, `utils/dateHelpers.ts`, `utils/fuzzing.ts`,
`revenueForecast/forecastEngine.ts`, `revenueForecast/csvExport.ts`, `auth/passwordErrorMessages.ts`,
`components/reporting/funnelReportHelpers.ts`, `hooks/reports/salesReportHelpers.ts`,
`services/salesService.ts`, `staleAssetRecovery.ts`.

Ou seja: **85% de 16 arquivos**, não 85% do `src/`. O comentário em `:14-16` é honesto sobre isso
("Escopo Tier-1… Expandir esta lista"). O que é desonesto é `TEST_QUALITY_REPORT.md:20` traduzir
isso como "TOTAL 97.6%".

Observações adicionais:
- `enterprise-quality.yml:38` traz o comentário `# Block if coverage is below 80% (example gate)` e
  `# Note: this requires vitest coverage to be configured with thresholds` — o comentário está
  **desatualizado** (os thresholds existem e são 85/75/85/85, não 80).
- `edge functions` e `tests/` não têm cobertura medida por nenhum runner.

**Classificação: 🟨 PARCIAL.**

---

## 10. Outras ferramentas de qualidade

| Ferramenta | Config | Quem executa | Classificação |
|---|---|---|---|
| ESLint (flat) | `eslint.config.js` — `--max-warnings 0` (`package.json:19`) | `lint.yml:27`, `pr-checks.yml:29`, `enterprise-quality.yml:27`, `qa-exhaustive.yml:41` | ✅ IMPLEMENTADO_TOTAL |
| ESLint (legado) | `.eslintrc.json` | ninguém (ESLint 9 = flat) | ⬛ MORTO |
| **Lint de `supabase/functions/**`** | `eslint.config.js:17` exclui; comentário `:8-9` promete `deno lint` | **ninguém** — grep por `deno lint` em workflows = 0 | 🔴 ⬛ **Lacuna: código Deno sem lint algum** |
| `deno.json` | `tasks.check` aponta p/ `src/main.ts` inexistente; `lint.files.include:["src"]` (frontend React, não edge functions) | ninguém | ⬛ MORTO |
| dependency-cruiser | `.dependency-cruiser.cjs` — 6 regras, 5 em `error` (no-circular, not-to-test, lib-not-to-ui, components-not-to-pages, shared-not-to-function) | **só** `qa-exhaustive.yml:44` (semanal) | 🟨 PARCIAL — regras boas, cadência errada |
| Prettier | `.prettierrc.json`, scripts `format`/`format:check` (`package.json:21-22`) | **nenhum workflow roda `format:check`** | 🟨 PARCIAL |
| Lighthouse CI | `.lighthouserc.json` — a11y e best-practices em `error ≥0.85`, CLS `error ≤0.1` | `pr-checks.yml:146-150` (**bloqueante**) e `qa-exhaustive.yml:92-104` (`continue-on-error`) | 🟨 PARCIAL |
| commitlint | `commitlint.config.js` | `.husky/commit-msg` | ✅ IMPLEMENTADO_TOTAL |
| CodeQL | `codeql.yml` | cron semanal + dispatch | ✅ IMPLEMENTADO_TOTAL |
| Dependabot | `.github/dependabot.yml` — npm + actions, semanal, reviewer `@adm01-debug` | GitHub | ✅ IMPLEMENTADO_TOTAL |
| CODEOWNERS | `.github/CODEOWNERS` — **um único owner** (`@adm01-debug`) para todo o repo | GitHub | 🟨 PARCIAL (bus factor 1) |
| `npm audit` | `--production --audit-level=high` | `lint.yml:33`, `enterprise-quality.yml:45` | ✅ (nota: `--production` está deprecado em npm ≥9 em favor de `--omit=dev`) |
| Bundle budget | `scripts/check-bundle-budget.mjs:19-41` — teto gzip por chunk | só `qa-exhaustive.yml:82` | 🟨 PARCIAL |
| a11y sweep (axe) | `playwright.a11y.config.ts` + `tests/a11y/axe-sweep.spec.ts` | só `qa-exhaustive.yml:106-118` | 🟨 PARCIAL |

---

## 11. Classificação consolidada

| Item | Classificação |
|---|---|
| Workflow `lint.yml` | ✅ IMPLEMENTADO_TOTAL |
| Workflow `pr-checks.yml` (exceto job `e2e`) | ✅ IMPLEMENTADO_TOTAL |
| Job `e2e` de `pr-checks.yml` / `enterprise-quality.yml` | ⬛ MORTO_OU_ABANDONADO *(verde por skip)* |
| Workflow `enterprise-quality.yml` (job quality-gate) | ✅ IMPLEMENTADO_TOTAL |
| Workflow `edge-functions-bundle.yml` | ✅ IMPLEMENTADO_TOTAL |
| Workflow `edge-functions-request-id.yml` | ✅ IMPLEMENTADO_TOTAL |
| Workflow `codeql.yml` | ✅ IMPLEMENTADO_TOTAL |
| Workflow `cron-monitoring.yml` | 🟨 PARCIAL |
| Workflow `quote-to-sale-e2e.yml` | 🟨 PARCIAL |
| Workflow `qa-exhaustive.yml` | 🟨 PARCIAL *(step `tsgo` quebrado)* |
| Workflow `generate-audit-pdf.yml` | ⬛ MORTO_OU_ABANDONADO |
| Pipeline de deploy / CD | 🟦 SUGERIDO_OU_INICIADO *(inexistente no repo)* |
| Suíte Vitest (`src/`, 42 arquivos) | ✅ IMPLEMENTADO_TOTAL |
| Suíte Playwright E2E (37 specs) | 🟨 PARCIAL *(27 auto-puladas em CI)* |
| Suíte a11y (axe) | 🟨 PARCIAL |
| Suíte Deno edge functions (60 arquivos) | ⬛ MORTO_OU_ABANDONADO *(44 sem runner)* |
| Suítes SQL (`supabase/tests/*.sql`) | ⬛ MORTO_OU_ABANDONADO |
| Teste de carga (`tests/load/`) | ⬛ MORTO_OU_ABANDONADO |
| `.husky/commit-msg` + commitlint | ✅ IMPLEMENTADO_TOTAL |
| `.husky/pre-commit` + lint-staged | 🟨 PARCIAL |
| PWA (vite-plugin-pwa) | ✅ IMPLEMENTADO_TOTAL |
| Threshold de cobertura | 🟨 PARCIAL |
| Lint de `supabase/functions/**` | 🟦 SUGERIDO_OU_INICIADO *(prometido, nunca implementado)* |
| dependency-cruiser | 🟨 PARCIAL |
| Prettier em CI | 🟦 SUGERIDO_OU_INICIADO |
| `.eslintrc.json`, `deno.json`, `TEST_QUALITY_REPORT.md`, `scripts/quality-gate.sh`, `scripts/generate-quality-report.ts`, `scripts/ci-check-forbidden.sh`, `scripts/load-test-sim.ts`, `scripts/verify-dispatcher-request-id.sh`, `scripts/codemod-typography.mjs`, `vitest.node.config.ts` | ⬛ MORTO_OU_ABANDONADO |

---

## 12. O QUE NÃO PUDE VERIFICAR

**Declaração explícita: nenhuma suíte de teste foi executada nesta auditoria.**
`node_modules/` não está instalado neste ambiente e a instalação de dependências foi proibida
pelo escopo. Consequentemente **não posso afirmar** — e nada acima deve ser lido como afirmando —
que os testes passam, que o projeto compila, ou que o lint está limpo.

Especificamente **não verificado**:

1. **Resultado de qualquer teste.** `vitest`, `playwright`, `deno test` não foram invocados.
   Quando digo "44 testes sem runner", afirmo que *nenhum pipeline os invoca* — não que eles falhariam.
2. **Percentual de cobertura atingido.** Sei que o threshold configurado é 85/75/85/85 sobre 16
   arquivos (`vitest.config.ts:17-59`); **não sei** qual número a execução produz. Qualquer valor de
   cobertura em `TEST_QUALITY_REPORT.md` é hardcoded (§4.1), não medido.
3. **Se `npm ci` / `tsc --noEmit` / `eslint` passam.** Não executados.
4. **Regras de branch protection do GitHub.** Não são versionadas no repo. Digo que um job "é
   bloqueante" no sentido de *falhar o job em caso de erro*; se esse check é **exigido para merge**
   depende de configuração no GitHub que não posso ler daqui. É plausível que jobs como `lighthouse`
   ou `e2e` nem sequer sejam required checks.
5. **Se os secrets existem.** `secrets.E2E_TEST_EMAIL`, `secrets.VITE_SUPABASE_*`,
   `secrets.SUPABASE_URL`, `secrets.SUPABASE_ANON_KEY` são referenciados; não tenho acesso às
   Actions secrets. Os achados de §4.2/§4.5 valem **independentemente**: os workflows
   `pr-checks.yml` e `enterprise-quality.yml` não passam `env:` algum ao Playwright, então mesmo
   com secrets configurados na org eles não chegam ao processo.
6. **Histórico de execução dos workflows.** Não consultei a API do GitHub Actions — não sei quantas
   vezes `qa-exhaustive` rodou, se falha há meses, nem se `quote-to-sale-e2e` já disparou.
7. **Comportamento real de `npx tsgo`.** Verifiquei que `tsgo` não está em `package.json`; não testei
   o que o registry resolve para esse nome.
8. **Se os 44 testes Deno órfãos são *corretos*.** Amostrei 4 (`winloss-webhook-dispatcher/retry_test.ts`
   importa `./retry.ts` com harness de DI e parece sólido). Os outros 40 não foram lidos linha a linha.
9. **Se o Service Worker funciona em runtime.** Verifiquei config + registro + updater no código;
   não fiz build nem abri um browser.
10. **Estado do `.husky/_` num ambiente de dev real.** Aqui não existe porque `npm install` não rodou.
    Não sei se os devs da equipe têm os hooks ativos.

---

*Auditoria estática — `promo-champions-v2.1` — 2026-08-16*
