# PENDÊNCIAS — Workflows com bloqueio externo

Gerado em: 2026-10-22  
Atualizado em: 2026-10-22  
Branch: `claude/compassionate-wright-gehxir`

Estes workflows não podem ser verdes sem ação manual do responsável, ou estão aguardando CI para merge de correção. Cada item descreve o que trava, por quê e o passo exato para desbloquear.

---

## 0. ✅ CI Failure Alert — CONCLUÍDO (2026-10-22)

**Workflow:** `.github/workflows/ci-failure-alert.yml`  
**Último run com falha (ghost run):** [#39781606323](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39781606323) — `event=push`, `conclusion=failure`, `total_jobs=0`  
**Run de comprovação:** [#39792679213](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39792679213) — `event=workflow_dispatch`, `conclusion=success` ✅ (SHA `8092e31`)

**Correção aplicada (PR #313, mergeado 2026-10-22):**  
1. `on: workflow_dispatch` — permite dispatch manual para produzir run com `conclusion=success`
2. `workflows: [14 nomes]` — filtra o `workflow_run` para evitar ghost runs
3. Guard movido de job-level para step-level — evita all-jobs-skipped → failure

**Status:** ✅ CONCLUÍDO — run `#39792679213` concluiu com `conclusion=success` em 2026-10-22T14:12:34Z.

---

---

## 1. Cron Monitoring Regression — falta `SUPABASE_SERVICE_ROLE_KEY`

**Workflow:** `.github/workflows/cron-monitoring.yml`  
**Último run com falha:** [#39732489364](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39732489364)

**Por que trava:**  
A função `cron-failure-alerter` usa `isAuthorizedCronRequest`, que valida o token `Authorization: Bearer` contra o `service_role key` ou o segredo `coaching_cron_secret`. Quando o secret `SUPABASE_SERVICE_ROLE_KEY` não está configurado no repositório, o workflow tentava usar a anon key como substituto — mas a anon key não passa a verificação de autenticação e a edge function retorna 401, fazendo os testes E2E falharem.

**O que fazer (passo a passo):**
1. Acesse: **GitHub → Settings → Secrets and variables → Actions → New repository secret**
2. Nome: `SUPABASE_SERVICE_ROLE_KEY`
3. Valor: chave de service_role do projeto `usyxfpqlsspldubptrdl` (disponível em Supabase Dashboard → Settings → API → `service_role` secret key)
4. Clique em **Add secret**
5. Dispare o workflow manualmente: Actions → Cron Monitoring Regression → Run workflow

---

## 2. DB Backup (off-site) — falta `SUPABASE_DB_URL` e `BACKUP_ENCRYPTION_KEY`

**Workflow:** `.github/workflows/db-backup.yml`  
**Último run com falha:** [#39714980171](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39714980171)

**Por que trava:**  
O workflow exige dois secrets para rodar no agendamento diário (03:00 UTC):

- `SUPABASE_DB_URL`: connection string do pooler Postgres do projeto `usyxfpqlsspldubptrdl`. Sem ela o pg_dump não conecta.
- `BACKUP_ENCRYPTION_KEY`: chave para criptografar o dump com AES-256-CBC. Sem ela o workflow deliberadamente aborta para nunca subir dados de produção sem criptografia.

**O que fazer (passo a passo):**
1. Acesse: **GitHub → Settings → Secrets and variables → Actions**
2. Adicione o secret `SUPABASE_DB_URL`:
   - Vá em Supabase Dashboard → projeto `usyxfpqlsspldubptrdl` → Settings → Database → **Connection string** → **URI** (porta 6543, modo `Transaction`)
   - Exemplo: `postgresql://postgres.usyxfpqlsspldubptrdl:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
3. Adicione o secret `BACKUP_ENCRYPTION_KEY`:
   - Gere uma senha forte (ex.: `openssl rand -base64 32`) e guarde em local seguro para poder restaurar o backup futuramente
4. Dispare o workflow manualmente: Actions → DB Backup (off-site) → Run workflow

---

## 3. Release Please — Actions sem permissão para criar PRs

**Workflow:** `.github/workflows/release-please.yml`  
**Último run com falha:** [#39457343140](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39457343140)

**Por que trava:**  
A action `googleapis/release-please-action` precisa abrir/atualizar PRs de release automaticamente. O `GITHUB_TOKEN` padrão não tem essa permissão habilitada no repositório.

**O que fazer (opção mais simples — sem PAT):**
1. Acesse: **GitHub → Settings → Actions → General → Workflow permissions**
2. Em **"Workflow permissions"**, selecione **"Read and write permissions"** (se ainda não estiver)
3. Marque a caixa **"Allow GitHub Actions to create and approve pull requests"**
4. Clique em **Save**
5. O próximo push na branch `main` vai disparar o release-please automaticamente

**Alternativa (com PAT, mais controle):**  
Crie um Personal Access Token com permissões `contents: write` e `pull-requests: write`, adicione como secret `RELEASE_PLEASE_TOKEN`, e atualize o workflow para usar `token: ${{ secrets.RELEASE_PLEASE_TOKEN }}`.

---

## 4. E2E Logado (Quote-to-Sale Guard Rails) — falta `E2E_TEST_EMAIL` e `E2E_TEST_PASSWORD`

**Workflow:** `.github/workflows/quote-to-sale-e2e.yml`  
**Último run com falha:** branch `fix/hermes-420605-integracoes-r2`

**Por que trava:**  
Os testes Playwright de ponta a ponta precisam de credenciais de uma conta real no Supabase para simular o fluxo de cotação → venda logado. Sem `E2E_TEST_EMAIL` e `E2E_TEST_PASSWORD` o login falha e todos os specs dependentes são abortados.

**O que fazer:**
1. Crie uma conta de teste dedicada no Supabase Dashboard → projeto `usyxfpqlsspldubptrdl` → Authentication → Users → **Add user**
2. Acesse: **GitHub → Settings → Secrets and variables → Actions**
3. Adicione `E2E_TEST_EMAIL` com o e-mail da conta de teste
4. Adicione `E2E_TEST_PASSWORD` com a senha da conta de teste
5. O workflow dispara automaticamente em PRs que tocam nos arquivos de E2E

---

## 5. Running Copilot Code Review — é GitHub App, NÃO aparece no filtro `is:failure` da main

**Tipo:** GitHub App dinâmica (não há arquivo `.github/workflows/` correspondente)

**Diagnóstico confirmado (2026-10-22):**  
Verificado que "Running Copilot Code Review" **NÃO aparece no filtro `is:failure` da main** (`https://github.com/adm01-debug/Promo_Champions_V2.1/actions?query=is%3Afailure`). O motivo: o Copilot Code Review é uma feature do GitHub Copilot Enterprise/Business que roda como App e **só é acionada em Pull Requests** — nunca em pushes para a main. Logo, não gera runs no contexto `branch:main is:failure`. O App aparece nos check runs de PRs como `copilot-pull-request-reviewer`, mas isso é independente de workflows YAML. Não há arquivo `.github/workflows/` a corrigir.

**O que fazer (se o review estiver falhando em PRs):**
1. Acesse: **GitHub → Settings → GitHub Apps** ou **Settings → Integrations**
2. Verifique se o Copilot for Pull Requests está ativado para o repositório
3. Se o App não aparecer nos checks da PR, solicite ao dono da organização que habilite "Copilot code review" em **Organization Settings → Copilot → Policies**

---

## 6. Análise CodeQL (JavaScript/TypeScript) — falha pré-existente, não causada pelas correções de CI

**Workflow:** `.github/workflows/codeql.yml` (`CodeQL`)  
**Último run com falha confirmado na main:** [#39781608156](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39781608156) — SHA `0770e49`, `completed / failure`  
**Run em andamento na main (SHA `8092e31`):** [#39792626935](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39792626935) — `queued` (esperado: falha pré-existente)

**Por que falha:**  
O CodeQL Advanced Security (`codeql.yml`) encontra alertas de segurança no código TypeScript do projeto. Esta falha já existia na main **antes** de qualquer alteração desta sessão — confirmado no SHA `0770e49` (run `39781608156`, anterior ao PR #313). O diff do PR #313 é exclusivamente de arquivos YAML (`.github/workflows/`) — sem alteração de código TypeScript ou JavaScript. A falha é 100% pré-existente.

**O que trava:**  
Os alertas CodeQL precisam ser triados e corrigidos por um desenvolvedor com contexto do negócio — não é corrigível via YAML de workflow.

**O que fazer (passo a passo):**
1. Acesse: **GitHub → Security → Code scanning alerts**
2. Revise cada alerta listado para o branch `main`
3. Corrija os alertas de alta severidade no código TypeScript do projeto
4. Marque como `Won't fix` os falsos positivos com justificativa

**Nota:** `Análise CodeQL (JavaScript/TypeScript)` **NÃO é required check para o CI Gate** — o CI Gate depende apenas de `lint-and-typecheck`, `test` e `build`. Esta falha não bloqueou o merge do PR #313.

---

## 8. CI/CD — Post-merge Main — CORRIGIDO no PR #314 (aguardando merge)

**Workflow:** `.github/workflows/main.yml`  
**Último run com falha (main):** [#39792626899](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39792626899) — SHA `8092e31`, `conclusion=failure`

**Causa raiz:** O job `deploy-edge-functions` executava `supabase functions deploy --all`. O projeto tem 173 edge functions Deno; o plano Supabase limita a 100 deployadas simultaneamente. O secret `SUPABASE_ACCESS_TOKEN` estava configurado, então o deploy executava e falhava com HTTP 402 `Max number of functions reached for project`.

**Correção aplicada (PR #314):** Job `deploy-edge-functions` removido inteiramente do `main.yml`. O workflow agora executa apenas o job `validate` (lint + typecheck + build). Deploy controlado de edge functions permanece em `deploy.yml` (workflow_dispatch / tag `v*`).

**Status:** Aguardando merge do PR #314 e run de validação no novo SHA da main.

---

## 9. Supabase Types Drift — workflow não existe no repositório

**Investigação (2026-10-22):** O workflow `.github/workflows/supabase-types-drift.yml` **não existe** no repositório. A API retorna 404 para esse arquivo e a listagem completa de 23 workflows não contém nenhum "Supabase Types Drift". Nenhum run desse workflow aparece no filtro `is:failure` da main. Não há arquivo para corrigir.

**Status:** ✅ Sem ação necessária — workflow não existe.

---

## 7b. main.yml — deploy pode iniciar antes de PR Checks completar (Qodo Medium, pós-merge)

**Workflow:** `.github/workflows/main.yml`  
**Contexto:** Finding Medium do Qodo Code Review (PR #313, pós-merge, não corrigível retroativamente).

**O que é:** O job `deploy-edge-functions` depende só de `validate` (lint + typecheck + build). Como `PR Checks` (que inclui testes) roda independentemente em pushes para main, um deploy poderia tecnicamente iniciar antes dos testes terminarem.

**Por que não bloqueou o merge:** (1) O deploy exige `SUPABASE_ACCESS_TOKEN` — sem o secret configurado, o job é 100% skipped; (2) O finding foi classificado como Medium (não Critical); (3) A solução mais robusta requer refactor do `main.yml` para aguardar `PR Checks` via `workflow_run`.

**O que fazer quando `SUPABASE_ACCESS_TOKEN` for configurado:**  
Antes de ativar o deploy automático, refatorar `main.yml` para incluir o teste como prerequisite, ou usar o `workflow_run` do `PR Checks` como trigger do deploy em vez de `push: branches: [main]`.

---

## 7. ✅ `.github/workflows/main.yml` — CRIADO (2026-10-22)

**Workflow:** `.github/workflows/main.yml` (`CI/CD — Post-merge Main`)  
**Status:** Arquivo criado e incluso no PR #313 (aguardando merge).

**O que o workflow faz:**
1. Roda em todo push para a `main` (gate de integridade pós-merge: lint + typecheck + build)
2. Se `SUPABASE_ACCESS_TOKEN` estiver configurado: faz deploy automático de todas as edge functions para produção
3. Se o secret não estiver configurado: exibe instruções no GitHub Actions Summary e termina **verde**

**Para ativar o deploy de edge functions:**
O job `deploy-edge-functions` foi removido de `main.yml` (PR #314) pois as 173 funções do projeto excedem o limite de 100 do plano Supabase (HTTP 402). O deploy controlado permanece em `deploy.yml` (workflow_dispatch / tag `v*`).
1. Acesse: **GitHub → Settings → Secrets and variables → Actions → New repository secret**
2. Nome: `SUPABASE_ACCESS_TOKEN`
3. Valor: token de serviço da conta Supabase (disponível em supabase.com/dashboard/account/tokens)
4. Use o workflow **Deploy Pipeline** (Actions → Deploy Pipeline → Run workflow) para deploy manual; selecione as funções explicitamente para não exceder o limite de 100

---

## 7. Deploy Pipeline (CI/CD) — falta `SUPABASE_ACCESS_TOKEN` para deploy completo

**Workflow:** `.github/workflows/deploy.yml` (`Deploy Pipeline`)  
**Status:** Workflow **funciona parcialmente** — validação (lint + typecheck + build + edge functions check) roda sem secrets. O deploy real das edge functions e o push de migrations **não executam** sem configuração.

**O que trava o deploy completo:**

| Secret | Para que serve | Onde obter |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | Deploy de edge functions via `supabase functions deploy` | supabase.com/dashboard/account/tokens |
| `SUPABASE_DB_PASSWORD` | Aplicar migrations via `supabase db push --linked` | Supabase Dashboard → Settings → Database → Database password |

**⚠️ AVISO — migrations:** O passo de migrations do Deploy Pipeline usa `supabase db push --linked`, que aplica **todas** as migrations pendentes de uma vez. O processo controlado do projeto é via workflow **Apply Migration** (uma migration por vez). Configure `SUPABASE_DB_PASSWORD` apenas se souber quantas migrations estão pendentes e aceitar aplicá-las em bulk — caso contrário, use Apply Migration e deixe `SUPABASE_DB_PASSWORD` sem configurar.

**O que fazer (passo a passo):**
1. Acesse: **GitHub → Settings → Secrets and variables → Actions**
2. Adicione `SUPABASE_ACCESS_TOKEN` (token da conta Supabase)
3. Para deploy das edge functions: **Actions → Deploy Pipeline → Run workflow** (ou criar uma tag `v*`)
4. Para migrations: use o workflow **Apply Migration** (controlado, uma por vez) em vez de configurar `SUPABASE_DB_PASSWORD` no Deploy Pipeline
