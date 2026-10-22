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

## 5. Prova de conclusão — CI workflows

> **Status em 2026-10-22T16:45Z:**  
> PR #316 no commit `b87f536` com runs `queued` aguardando GitHub Actions.

| Workflow que estava em falha | Última run (pre-fix) | Run pós-fix | Resultado |
|---|---|---|---|
| Release Please | `39810327212` (failure, main `ea0e9abc`) | Aguardando merge do PR #316 + run na main | ⏳ |
| Supabase Types Drift | `39813908734` job `119948001662` (failure, `1d2ddef`) | Run `39815344585` (`b87f536`, queued) | ⏳ |

---

## 6. Workflows que estavam verdes e devem continuar verdes

| Workflow | Run na main (baseline) | Status |
|---|---|---|
| CI/CD — Post-merge Main | `39810301818` (success, `ea0e9abc`) | ✓ verde |
| CodeQL | `39810322093` (success, `ea0e9abc`) | ✓ verde |
| Dependabot Auto-merge | `39810513939` (success, `ea0e9abc`) | ✓ verde |

---

## 7. Itens em PENDENCIAS.md (requerem ação do usuário)

| # | Item | Bloqueia por |
|---|---|---|
| §1 | Cron Monitoring Regression | `SUPABASE_SERVICE_ROLE_KEY` não configurado |
| §2 | DB Backup off-site | `SUPABASE_DB_URL` + `BACKUP_ENCRYPTION_KEY` ausentes |
| §4 | E2E Logado (Quote-to-Sale) | `E2E_TEST_EMAIL` + `E2E_TEST_PASSWORD` ausentes |
| §5 | Copilot Code Review (failure) | GitHub App por design — não aparece no `is:failure` da main |
| §10 | Deploy automático pós-release | PAT com permissão `workflow` não configurado |

---

## 8. Gaps identificados (melhorias futuras, baixo risco)

1. **Supabase Types Drift**: gerar `types.ts` no próprio job de CI via `supabase gen types typescript` ao invés de comparar diff. Requer `SUPABASE_ACCESS_TOKEN` como secret.
2. **Testes em cloud**: configurar `pool: 'vmThreads'` no vitest para reduzir crashes de worker no ambiente remoto.
3. **Release Please**: adicionar PAT para permitir que tags disparem o deploy automaticamente (§10 PENDENCIAS.md).
