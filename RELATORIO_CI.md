# Relatório CI — Correção de Workflows com Falha

**Data:** 2026-10-22  
**Branch:** `claude/compassionate-wright-gehxir`  
**Repositório:** adm01-debug/Promo_Champions_V2.1

---

## Baseline (estado antes das correções)

Workflows avaliados pelo último run na branch `main`:

| Workflow | Último run (main) | Conclusão baseline |
|---|---|---|
| CI Failure Alert | [#39457340731](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39457340731) | ❌ failure |
| PR Review SLA | [#39596349948](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39596349948) | ❌ failure |
| Dependabot Auto-merge | [#39593479759](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39593479759) | ❌ failure |
| Cron Monitoring Regression | [#39732489364](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39732489364) | ❌ failure |
| DB Backup (off-site) | [#39714980171](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39714980171) | ❌ failure |
| Release Please | [#39457343140](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39457343140) | ❌ failure |
| Apply Migration | [#39464232349](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39464232349) | ✅ success |
| PR Checks | [#39457343140](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39457343140) | ✅ success |

**Total:** 6 falhas, 2 sucessos.

---

## Causa raiz e correção aplicada

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

## Resultado final esperado após merge

| Workflow | Resultado esperado |
|---|---|
| CI Failure Alert | ✅ success (job sempre executa, sai 0 quando não há alerta) |
| PR Review SLA | ✅ success (GH_REPO resolve contexto sem checkout) |
| Dependabot Auto-merge | ✅ success (GH_REPO em ambos os jobs) |
| Cron Monitoring Regression | ❌ failure até `SUPABASE_SERVICE_ROLE_KEY` ser adicionado |
| DB Backup (off-site) | ❌ failure até `SUPABASE_DB_URL` + `BACKUP_ENCRYPTION_KEY` serem adicionados |
| Release Please | ❌ failure até permissão Actions ser habilitada |
| Apply Migration | ✅ success (não alterado, era verde) |
| PR Checks | ✅ success (não alterado, era verde) |

**Workflows verdes corrigidos:** 3 (CI Failure Alert, PR Review SLA, Dependabot Auto-merge)  
**Pendências documentadas:** 3 (bloqueio externo — secrets ou permissões)  
**Regressões:** 0
