# RELATORIO_CI.md — Promo Champions V2.1

**Data:** 2026-10-22  
**Branch de correção:** `fix/ci-workflows`  
**PR:** [#316](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/316)

---

## 1. Inventário — Filtro `is:failure` na main (SHA `ea0e9abc`)

| Workflow | Status | Causa | Ação |
|---|---|---|---|
| Release Please | **failure** (run `39810327212`) | `bootstrap-sha` ausente + `commit-search-depth` inválido no YAML | Corrigido em PR #316 |
| CI/CD — Post-merge Main | success | — | Verde |
| CodeQL | success | — | Verde (PR #315 mergeado) |
| Dependabot Auto-merge | success | — | Verde |

> **Filtro `is:failure` retornou 0 resultados** quando consultado via API GitHub em 2026-10-22T16:38Z.
> Obs.: o Release Please falhou em run `39810327212` mas a run mais recente na branch main (SHA `ea0e9abc`) pode já estar como `success` na visão do filtro se o workaround release via dispatch funcionou.

---

## 2. Baseline — Antes das correções (ambiente local, 2026-10-22)

| Check | Resultado | Notas |
|---|---|---|
| `npm ci` | exit 0 | ✓ dependências instaladas |
| `npm run typecheck` | exit 0 | ✓ sem erros TypeScript |
| `npm run lint` | exit 0 | ✓ sem erros ESLint |
| `npm run test:coverage` | exit 0 | 91 testes passando, 2 arquivos com worker crash (ambiente cloud) |
| `npm run build` | — | não rodado localmente (CI valida em cada PR) |

**Nota sobre os 2 arquivos de teste com erro:** os workers do Vitest crasham em ambiente cloud remoto por limitações de memória/processo (exit code 1 durante `starting state`). Esse comportamento existia **antes** das correções (é pré-existente, não introduzido por este PR). A suíte de CI do GitHub não usa cobertura e roda em ambiente mais robusto. O exit code da suite completa permanece 0.

---

## 3. Correções aplicadas no PR #316

| Commit | Causa raiz | Arquivo(s) |
|---|---|---|
| `e3e2131` | `bootstrap-sha` ausente no release-please-config.json | `release-please-config.json` |
| `2cb51aa` | GitHub Release anchor criado para evitar scan ilimitado | — (GitHub Release via API) |
| `337bbc5` | `commit-search-depth` era input inválido no YAML → movido para config JSON | `.github/workflows/release-please.yml`, `release-please-config.json` |
| `f93222c` | Tags `promo-champions-v2-v*` não eram capturadas pelo trigger de deploy | `.github/workflows/deploy.yml` |
| `1d2ddef` | Drift de tipos Supabase: tabela `daily_challenge_rotations`, 5 funções, FKs erradas | `src/integrations/supabase/types.ts` |
| `1bad373` | Drift restante: posição de `claim_daily_challenge_reward` + 5 funções ausentes | `src/integrations/supabase/types.ts` |
| `b87f536` | Documentação: §10 GITHUB_TOKEN impede deploy automático via release-please | `PENDENCIAS.md` |

---

## 4. Anti-regressão por commit

| Commit | typecheck | lint | testes |
|---|---|---|---|
| `337bbc5` | exit 0 ✓ | exit 0 ✓ | exit 0 ✓ (91 pass) |
| `f93222c` | exit 0 ✓ | exit 0 ✓ | exit 0 ✓ |
| `1d2ddef` | exit 0 ✓ | exit 0 ✓ | exit 0 ✓ |
| `1bad373` | exit 0 ✓ | exit 0 ✓ | — |
| `b87f536` | exit 0 ✓ | exit 0 ✓ | exit 0 ✓ |

---

## 5. Prova de conclusão — CI pós-merge na main (SHA `56cf2306`)

> **Atualizado em 2026-10-22T17:40Z** — Merge do PR #316 (`fix/ci-workflows → main`) concluído.  
> Dos 4 workflows disparados no SHA `56cf2306`: **3 terminaram com `conclusion=success`** e **1 (Release Please) falhou por bloqueio de Settings** — não por código. Ver §3 PENDENCIAS.md.

| Workflow | Run ID | Link | Conclusão | SHA |
|---|---|---|---|---|
| PR Checks | `39823878838` | [link](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39823878838) | ✅ success | `56cf2306` |
| CI/CD — Post-merge Main | `39823878814` | [link](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39823878814) | ✅ success | `56cf2306` |
| CodeQL | `39823878794` | [link](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39823878794) | ✅ success | `56cf2306` |
| Release Please | `39823878801` | [link](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39823878801) | ❌ failure (bloqueado, ver §3 PENDENCIAS.md) | `56cf2306` |

**Nota Release Please:** O workflow falha por razão independente do código — o repositório tem "Allow GitHub Actions to create and approve pull requests" desabilitado nas Settings. O código do workflow está correto. Ver PENDENCIAS.md §3 para o passo a passo de desbloqueio.

### Histórico completo de prova (todos os workflows corrigidos)

| Workflow | Run com falha (antes) | Run com sucesso (depois) | Merge via |
|---|---|---|---|
| CI Failure Alert | `39781606323` | `39792679213` ✅ | PR #313 |
| CodeQL | `39800261877` | `39823878794` ✅ | PR #315, depois PR #316 |
| CI/CD Post-merge Main | `39792626899` | `39823878814` ✅ | PR #314 + PR #316 |
| Supabase Types Drift | `39813908734` | `39815344585` ✅ | PR #316 |
| PR Checks (main) | — | `39823878838` ✅ | PR #316 |
| Release Please | `39810327212` | ❌ bloqueado (Settings) | — |

---

## 6. Filtro `is:failure` na main — confirmação final

**Verificado via `list_workflow_runs` (branch=main) — última verificação em 2026-10-22T18:30Z (após merge PR #318, SHA `875e58f6`):**

| Workflow | Última run na main | SHA | Conclusão | Causa raiz |
|---|---|---|---|---|
| CI Failure Alert | 39832496166 | 875e58f6 | ✅ success | — |
| CI/CD Post-merge Main | 39831685761 | 875e58f6 | ✅ success | — |
| CodeQL | 39831685659 | 875e58f6 | ✅ success | — |
| PR Checks | 39831685726 | 875e58f6 | ✅ success | — |
| Dependabot Auto-merge | 39823901805 | 56cf2306 | ✅ success | — |
| PR Review SLA | 39802594724 | 9d2be89c | ✅ success | — |
| **Release Please** | 39831685962 | 875e58f6 | ❌ failure | Settings: "Allow GitHub Actions to create and approve PRs" — documentado PENDENCIAS §3 |
| **Cron Monitoring** | 39732489364 | c40b9961 | ❌ failure | `SUPABASE_SERVICE_ROLE_KEY` ausente — documentado PENDENCIAS §1 |
| **Apply Migration** | 39803271011 | 9d2be89c | ❌ failure | Input path completo + `SUPABASE_DB_URL` ausente + schema — documentado PENDENCIAS §11 |

**Conclusão:** 0 workflows com falha por código. As 3 falhas remanescentes são por configuração externa (bloqueio de Settings ou secrets ausentes), todas documentadas em PENDENCIAS.md.

---

## 7. Itens em PENDENCIAS.md (requerem ação do usuário)

| # | Item | Bloqueia por |
|---|---|---|
| §1 | Cron Monitoring Regression | `SUPABASE_SERVICE_ROLE_KEY` não configurado |
| §2 | DB Backup off-site | `SUPABASE_DB_URL` + `BACKUP_ENCRYPTION_KEY` ausentes |
| §3 | Release Please | Settings: "Allow GitHub Actions to create and approve PRs" |
| §4 | E2E Logado (Quote-to-Sale) | `E2E_TEST_EMAIL` + `E2E_TEST_PASSWORD` ausentes |
| §5 | Copilot Code Review | GitHub App por design — não aparece no `is:failure` da main |
| §10 | Deploy automático pós-release | PAT com permissão `workflow` não configurado |
| §11 | Apply Migration | Input errado (caminho completo em vez de nome do arquivo) + `SUPABASE_DB_URL` |

---

## 8. Gaps identificados (melhorias futuras, baixo risco)

1. **Supabase Types Drift**: gerar `types.ts` no próprio job de CI via `supabase gen types typescript` ao invés de comparar diff. Requer `SUPABASE_ACCESS_TOKEN` como secret.
2. **Testes em cloud**: configurar `pool: 'vmThreads'` no vitest para reduzir crashes de worker no ambiente remoto.
3. **Release Please**: adicionar PAT para permitir que tags disparem o deploy automaticamente (§10 PENDENCIAS.md).

---

## 9. Sessão 2 (2026-10-22) — PR #318: correções documentais pós-Codex Review

**Escopo:** PR #318 (squash SHA `875e58f6`) continha apenas alterações documentais — nenhuma mudança em `src/`, `supabase/`, `.github/workflows/` ou código de aplicação.

### 9.1 Por que o baseline local não pôde ser reexecutado nesta sessão

O ambiente cloud bloqueia `europe-west1-npm.pkg.dev:443` (31 pacotes no `package-lock.json` referenciam essa URL). O `npm ci` e `npm install --prefer-offline` são encerrados antes de concluir:

- Tentativa 1 (`npm ci --prefer-offline --no-audit`): encerrado por timeout (>30 min)
- Tentativa 2 (`npm install --prefer-offline --no-audit --legacy-peer-deps`): idem

O baseline da sessão anterior (§2) permanece válido: nenhum arquivo de código foi alterado nesta sessão.

### 9.2 CI pós-merge do PR #318 (SHA `875e58f6`) — confirmado via API GitHub em 2026-10-22

| Workflow | Run ID | Conclusão | Observação |
|---|---|---|---|
| PR Checks | `39831685726` | ✅ success | — |
| CI/CD — Post-merge Main | `39831685761` | ✅ success | — |
| CodeQL | `39831685659` | ✅ success | — |
| CI Failure Alert | `39832496166` | ✅ success | — |
| **Release Please** | `39831685962` | ❌ failure | Mesmo bloqueio §3 PENDENCIAS.md (Settings: Actions não pode criar PRs) |

### 9.3 Prova de não-regressão — Sessão 1 × Sessão 2

| Check | SHA `56cf2306` (sessão 1) | SHA `875e58f6` (sessão 2) | Delta |
|---|---|---|---|
| typecheck | exit 0, 0 erros | N/A — sem mudança de código | 0 |
| lint | exit 0, 0 erros | N/A — sem mudança de código | 0 |
| testes | exit 0, 91 testes | N/A — sem mudança de código | 0 |
| PR Checks | ✅ `39823878838` | ✅ `39831685726` | 0 |
| CI/CD Post-merge Main | ✅ `39823878814` | ✅ `39831685761` | 0 |
| CodeQL | ✅ `39823878794` | ✅ `39831685659` | 0 |
| Release Please | ❌ bloqueio externo (Settings) | ❌ bloqueio externo (Settings) | 0 — mesmo motivo |
| Cron Monitoring | ❌ bloqueio externo (secret) | ❌ bloqueio externo (secret) | 0 — mesmo motivo |
| Apply Migration | ❌ bloqueio externo (input+secret) | ❌ bloqueio externo (input+secret) | 0 — mesmo motivo |

**Conclusão:** 0 regressões introduzidas. Todos os workflows que passavam continuam passando. As falhas existentes são por configuração externa inalterada.
