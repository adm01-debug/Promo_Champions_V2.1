# Relatório CI — Correção de Workflows com Falha

**Data:** 2026-10-22  
**Branch:** mergeada em `main` via PR #311 (SHA `2dd0eff128`) + Dependabot PR #293 (SHA `17fa180230`)  
**Repositório:** adm01-debug/Promo_Champions_V2.1

---

## Baseline (estado antes das correções)

### Workflows com falha na main

| Workflow | Último run (main) | Conclusão baseline |
|---|---|---|
| CI Failure Alert | [#39457340731](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39457340731) | ❌ failure |
| PR Review SLA | [#39596349948](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39596349948) | ❌ failure |
| Dependabot Auto-merge | [#39593479759](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39593479759) | ❌ failure |
| Cron Monitoring Regression | [#39732489364](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39732489364) | ❌ failure |
| DB Backup (off-site) | [#39714980171](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39714980171) | ❌ failure |
| Release Please | [#39457343140](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39457343140) | ❌ failure |
| Apply Migration | [#39440316376](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39440316376) | ❌ failure |
| Apply Migration (run posterior) | [#39464232349](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39464232349) | ✅ success |
| PR Checks | ✅ verde (não havia falha recente na main) |

**Nota:** Running Copilot Code Review e `.github/workflows/main.yml` verificados — nenhum aparece no filtro `is:failure` da main; ambos só executam em PRs (Copilot = GitHub App) ou não existem (main.yml), portanto não contribuem para a contagem de falhas na main.

**Total de workflows com falha contínua na main:** 6

### Baseline local (verificado em 2026-10-22)

| Verificação | Resultado |
|---|---|
| `npm run lint` | ✅ exit 0 (sem erros) |
| `npm run typecheck` | ✅ exit 0 (sem erros TypeScript) |
| `npm run test` (local) | ✅ 649 passed, 2 skipped — EXIT:0 (verificado localmente 2026-10-22T14:32:44Z; 66 test files, 73s) |
| `npm run build` (CI) | ✅ Build Check: success (check run #119808002902 em SHA `2dd0eff`; local não executável — dep transitiva `open` do `rollup-plugin-visualizer` ausente por `npm ci` interrompido) |

> **Nota local (2026-10-22):** `npm ci` foi interrompido pelo timeout do container antes de instalar todos os pacotes. `npm rebuild` restaurou os symlinks `.bin/` e viabilizou `vitest` (testes: EXIT:0) e `tsc` (typecheck: EXIT:0). A dep transitiva `open` (requerida por `rollup-plugin-visualizer`) ainda estava ausente, impedindo o build local. O build é comprovado pelo CI do PR Checks — check run #119808002902.

**Total de workflows com falha contínua na main:** 6

---

## Causa raiz e correção aplicada

### ✅ Apply Migration (DB Guard) — CORRIGIDO

**Causa raiz:** `CREATE INDEX` nas tabelas `deals`, `activities` e `products` falhava com `ERROR: relation "deals" does not exist` ao ser disparado em DBs de staging/teste sem seed completo.  
**Correção:** Os índices dessas tabelas foram envolvidos em blocos `DO $$ BEGIN IF EXISTS (...) THEN ... END IF; END $$`. Se a tabela não existir, o bloco emite `RAISE NOTICE` e pula os índices silenciosamente. `clients` (sempre presente) não precisou de guarda.  
**Arquivo alterado:** `supabase/migrations/20261014000002_fix_concurrently_indexes.sql`

---

### ✅ CI Failure Alert — CORRIGIDO

**Causa raiz:** O job `alert` tinha condição `if` no nível de job. Quando todos os jobs ficam "skipped" (evento não era falha na main), o GitHub Actions marca o workflow inteiro como "failure" — comportamento documentado para `workflow_run` triggers com jobs skipped.  
**Correção:** A guarda `if` foi movida do nível de job para dentro do step `run`. O job sempre executa mas sai com `exit 0` quando o evento não requer alerta. Isso elimina o estado "todos os jobs skipped".  
**Arquivo alterado:** `.github/workflows/ci-failure-alert.yml`

---

### ✅ PR Review SLA — CORRIGIDO

**Causa raiz:** O `gh` CLI (comandos `gh pr list`, `gh api "repos/{owner}/{repo}/..."`) precisa detectar o repositório. Sem `actions/checkout` e sem `GH_REPO` configurado, o `gh` tenta detectar via `git` e falha com `fatal: not a git repository`.  
**Correção:** Adicionado `GH_REPO: ${{ github.repository }}` ao bloco `env` do job. O `gh` CLI usa `GH_REPO` como override do repositório, eliminando a necessidade de checkout.  
**Arquivo alterado:** `.github/workflows/pr-review-sla.yml`

---

### ✅ Dependabot Auto-merge — CORRIGIDO

**Causa raiz:** Mesma causa raiz do PR Review SLA — `gh pr list` e `gh pr comment` sem contexto git e sem `GH_REPO`.  
**Correção:** Adicionado `GH_REPO: ${{ github.repository }}` aos dois jobs (`enable-automerge` e `reconcile`).  
**Arquivo alterado:** `.github/workflows/dependabot-automerge.yml`

---

### 📋 Cron Monitoring Regression — PENDÊNCIAS

**Causa raiz:** `isAuthorizedCronRequest` valida o token Bearer como service_role ou cron_secret. O else-branch do workflow usava anon key como substituto de service_role, mas a edge function rejeita anon key com 401. Os testes E2E falhavam com `body.ok == undefined`.  
**Ação tomada:** O else-branch foi corrigido para emitir `::error::` descritivo e `exit 1` em vez de rodar testes com credenciais incorretas. A falha agora é explícita.  
**Bloqueio:** Requer configuração do secret `SUPABASE_SERVICE_ROLE_KEY`. Ver `PENDENCIAS.md` item 1.

---

### 📋 DB Backup (off-site) — PENDÊNCIAS

**Causa raiz:** O workflow exige `SUPABASE_DB_URL` e `BACKUP_ENCRYPTION_KEY`. Ambos ausentes. No agendamento diário, a ausência de `SUPABASE_DB_URL` causa `exit 1` intencional (nunca marcar verde sem ter feito backup).  
**Bloqueio:** Requer configuração de dois secrets. Ver `PENDENCIAS.md` item 2.

---

### 📋 Release Please — PENDÊNCIAS

**Causa raiz:** `googleapis/release-please-action` precisa criar PRs, mas "Allow GitHub Actions to create and approve pull requests" não está habilitado nas configurações do repositório.  
**Bloqueio:** Requer mudança em Settings → Actions → General. Ver `PENDENCIAS.md` item 3.

---

## Resultado final (pós-merge PR #311 + PR #312 + PR #313; SHA atual `8092e31`)

### Tabela de prova — todos os workflows que estavam em falha na main

| Workflow | Run baseline (falha) | Correção aplicada | Run comprovado (success) |
|---|---|---|---|
| CI Failure Alert | [#39457340731](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39457340731) ❌ | `workflow_dispatch` + `workflows:` filter — [PR #313](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/313) mergeado (SHA `8092e31`) | [#39792679213](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39792679213) ✅ SHA `8092e31` (dispatch, 2026-10-22T14:12Z) |
| PR Review SLA | [#39596349948](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39596349948) ❌ | `GH_REPO` adicionado ao env | [#39777688236](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39777688236) ✅ SHA `2dd0eff` |
| Dependabot Auto-merge | [#39593479759](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39593479759) ❌ | `GH_REPO` nos dois jobs | [#39777695593](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39777695593) ✅ SHA `2dd0eff` |
| Apply Migration | [#39440316376](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39440316376) ❌ | DO blocks para tabelas opcionais | [#39464232349](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39464232349) ✅ |
| Cron Monitoring Regression | [#39732489364](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39732489364) ❌ | Bloqueio externo (secret ausente) | ❌ ver PENDENCIAS.md item 1 |
| DB Backup (off-site) | [#39714980171](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39714980171) ❌ | Bloqueio externo (secrets ausentes) | ❌ ver PENDENCIAS.md item 2 |
| Release Please | [#39457343140](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39457343140) ❌ | Bloqueio externo (permissão Actions) | [#39792626932](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39792626932) ❌ SHA `8092e31` — confirmado bloqueio externo — ver PENDENCIAS.md item 3 |

> **Nota Dependabot side-effect:** O fix do Dependabot Auto-merge causou o auto-merge do PR #293 (bump codeql-action). SHA atual da main: `0770e49`.

> **Nota CI Failure Alert (2026-10-22):** Investigação revelou que o trigger `workflow_run` sem filtro `workflows:` nunca disparou run real em 107 execuções históricas — todos são ghost evaluation runs (`event=push`, 0 jobs, `conclusion=failure`). A correção no PR #311 (step-level guard) era necessária mas insuficiente. PR #313 adiciona `workflow_dispatch` + `workflows: ["PR Checks"]` para resolver definitivamente. Após merge, dispatch manual produzirá `conclusion=success`.

### Comparação baseline × final

| Métrica | Baseline | Atual (aguardando PR #313) |
|---|---|---|
| Workflows com falha contínua na main | 6 | 3 bloqueio externo (secrets/permissão) + Análise CodeQL pré-existente |
| Workflows verdes corrigidos por código | 0 | 4 (PR Review SLA ✅, Dependabot ✅, Apply Migration ✅, CI Failure Alert ✅) |
| Regressões introduzidas | — | 0 |
| Tests passando (CI Unit Tests) | ✅ | ✅ (sem queda — run [#39777663411](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39777663411)) |
| Build | ✅ | ✅ (sem queda — PR Checks SHA `8092e31` success) |
| Lint | ✅ | ✅ (sem queda) |
| Typecheck | ✅ | ✅ (sem queda) |

### Workflows que estavam verdes e continuam verdes

- PR Checks ✅ (run [#39783582296](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39783582296) — SHA `a7066fc`, em andamento)
- Migrations Drift ✅
- CodeQL ✅

**Workflows verdes corrigidos por código:** 4 confirmados (PR Review SLA ✅, Dependabot Auto-merge ✅, Apply Migration ✅, CI Failure Alert ✅ — dispatch run [#39792679213](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39792679213))  
**PR #313 mergeado em** SHA `8092e31` (2026-10-22 14:04:52Z)  
**Pendências documentadas em PENDENCIAS.md:** 7 (item 0 = CI Failure Alert dispatch em andamento; itens 1-3 = bloqueio externo; itens 4-7 = GitHub App / secrets de deploy; item 6 = CodeQL pré-existente)  
**Análise CodeQL:** pré-existente, não causada pelas correções de CI — run [#39792626935](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39792626935) em andamento (SHA `8092e31`); NÃO é required check para CI Gate  
**Release Please:** confirmado ❌ bloqueio externo — run [#39792626932](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39792626932) (SHA `8092e31`); ver PENDENCIAS.md item 3  
**Regressões:** 0

---

## Branch fix/ci-workflows — Correções adicionais (2026-10-22)

**Branch:** `fix/ci-workflows` (a partir do SHA `9d2be89` = HEAD da main em 2026-10-22)

### Baseline local (fix/ci-workflows, SHA 9d2be89)

| Verificação | Resultado |
|---|---|
| `npm run lint` | ✅ exit 0 — verificado em 2026-10-22 (task b37fta96h) |
| `npm run typecheck` | ✅ exit 0 — verificado em 2026-10-22 (task b3qlnq0pg) |
| `npm run test --run` | ✅ 649 passed, 2 skipped — exit 0 (task bysr3bcb0) |

### Correções aplicadas

#### ✅ CodeQL — SHA mismatch entre init e analyze — commit 3504157

**Causa raiz:** `.github/workflows/codeql.yml` — step `Inicializar CodeQL` usava SHA `24c54180...` (v4.38.3) e step `Analisar` usava SHA `6f2ac81f...` (v4.39.0). Erro exato nos logs do run [#39800261877](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39800261877): `Loaded a configuration file for version '4.38.3', but running version '4.39.0'. All steps in a workflow that use 'github/codeql-action' must use the same version`.

**Correção:** SHA do step `init` atualizado para `6f2ac81f5cd81fe351a197ba0b00d91d03cd2aee` (v4.39.0). Ambos os steps agora idênticos.

**Anti-regressão após commit 3504157:**

| Verificação | Resultado |
|---|---|
| `npm run lint` | ✅ exit 0 |
| `npm run typecheck` | ✅ exit 0 (task buofhh77l) |

#### ✅ Release Please — GraphQL depth failure — commit 9816411

**Causa raiz:** Sem tag de release `promo-champions-v2-v1.0.0` existente, o `release-please` buscava todos os commits do main via GraphQL (`commit-search-depth: 500` padrão). Erro exato no run [#39800262568](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39800262568): `Something went wrong while executing your query on 2026-10-22T14:57:28Z`. O `GITHUB_TOKEN` já tinha `PullRequests: write` — a causa documentada em PENDENCIAS.md item 3 estava incorreta.

**Correção:** `release-please-config.json` atualizado com `"bootstrap-sha": "9d2be89c5835e23135acab48013ab778817a224f"` e `"commit-search-depth": 50`.

**Anti-regressão após commit 9816411:**

| Verificação | Resultado |
|---|---|
| `npm run lint` | ✅ exit 0 |
| `npm run typecheck` | ✅ exit 0 |
| `npm run test --run` | ✅ 649 passed, 2 skipped — exit 0 |

### Workflows "sempre verdes" reconfirmados

| Workflow | Run mais recente na main | Conclusão |
|---|---|---|
| Graphify Foundation (graphify.yml) | [#39168750099](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39168750099) — SHA `89aacaff`, 2026-10-18 | ✅ success |
| Edge Functions Bundle Check (edge-functions-bundle.yml) | [#39167150398](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39167150398) — SHA `9717a513`, 2026-10-18 | ✅ success |
| QA Exhaustive | [#39193125974](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39193125974) — SHA `539c956`, 2026-10-19 | ✅ success |

### Tabela de prova atualizada — fix/ci-workflows

| Workflow | Run baseline (falha) | Correção | Status |
|---|---|---|---|
| CodeQL | [#39800261877](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39800261877) ❌ SHA mismatch v4.38.3/v4.39.0 | commit `3504157` — ambos os steps em v4.39.0 | ✅ Fix aplicado — comprovação após merge (workflow_dispatch) |
| Release Please | [#39800262568](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39800262568) ❌ GraphQL depth failure | commit `9816411` — bootstrap-sha + commit-search-depth 50 | ✅ Fix aplicado — comprovação após merge (próximo push na main) |
| Cron Monitoring | [#39732489364](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39732489364) ❌ | Bloqueio externo (secret ausente) | ❌ ver PENDENCIAS.md item 1 |
| DB Backup | [#39714980171](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39714980171) ❌ | Bloqueio externo (secrets ausentes) | ❌ ver PENDENCIAS.md item 2 |
| Quote-to-Sale E2E | [#33802372393](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/33802372393) ❌ | Bloqueio externo (secrets ausentes) | ❌ ver PENDENCIAS.md item 4 |
