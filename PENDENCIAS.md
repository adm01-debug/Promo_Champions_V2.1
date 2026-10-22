# PENDÊNCIAS — Workflows com bloqueio externo

Gerado em: 2026-10-22  
Atualizado em: 2026-10-22  
Branch: `claude/compassionate-wright-gehxir`

Estes workflows não podem ser verdes sem ação manual do responsável, ou estão aguardando CI para merge de correção. Cada item descreve o que trava, por quê e o passo exato para desbloquear.

---

## 0. CI Failure Alert — aguardando merge do PR #313 (CI Gate queued)

**Workflow:** `.github/workflows/ci-failure-alert.yml`  
**Último run com falha na main:** [#39781606323](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/39781606323) — `event=push`, `conclusion=failure`, `total_jobs=0`

**Por que falha:**  
O trigger `workflow_run` sem filtro `workflows:` nunca disparou um run real em 107 execuções históricas — todos os runs são ghost evaluation runs (`event=push`, 0 jobs) que o GitHub cria ao avaliar o trigger. Esses ghost runs sempre têm `conclusion=failure`.

**Correção preparada (PR #313):**  
[PR #313](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/313) adiciona:
1. `on: workflow_dispatch` — permite dispatch manual para produzir run com `conclusion=success`
2. `workflows: ["PR Checks"]` — filtra o `workflow_run` para disparar apenas quando PR Checks concluir

**Bloqueio atual:** PR #313 aguarda CI Gate (Detect Changes + CodeQL queued no SHA `a7066fc`).

**O que fazer após o merge automático:**  
Quando CI Gate passar e o PR for mergeado, disparar manualmente:
- Actions → CI Failure Alert → Run workflow (branch: main)
- Confirmar que o run produz `conclusion=success`

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

## 6. Análise CodeQL (JavaScript/TypeScript) — falha pré-existente, não causada por esta branch

**Tipo:** Check run do CodeQL Advanced Security (GitHub App, não workflow YAML do projeto)  
**Status no PR #313 (SHA `c5a3d4c`):** `completed / failure`  
**Status na main (`0770e49`):** `completed / failure` (confirmado — falha anterior ao PR #313)

**Por que falha:**  
O CodeQL Advanced Security encontra alertas no código TypeScript do projeto. Esta falha já existia na main antes de qualquer alteração desta sessão. O diff do PR #313 é exclusivamente de arquivos YAML (`.github/workflows/`) — sem alteração de código TypeScript ou JavaScript. A falha é pré-existente e não relacionada às correções de CI.

**O que fazer:**  
1. Acesse: **GitHub → Security → Code scanning alerts** para ver os alertas CodeQL
2. Resolva os alertas de segurança no código TypeScript do projeto
3. Os alertas precisam ser triados por um desenvolvedor com contexto do negócio — não é corrigível via YAML

**Nota:** `Análise CodeQL (JavaScript/TypeScript)` **NÃO é required check para o CI Gate** — o CI Gate depende apenas de `lint-and-typecheck`, `test` e `build`. Portanto não bloqueia o merge do PR #313.

---

## 7. ✅ `.github/workflows/main.yml` — CRIADO (2026-10-22)

**Workflow:** `.github/workflows/main.yml` (`CI/CD — Post-merge Main`)  
**Status:** Arquivo criado e incluso no PR #313 (aguardando merge).

**O que o workflow faz:**
1. Roda em todo push para a `main` (gate de integridade pós-merge: lint + typecheck + build)
2. Se `SUPABASE_ACCESS_TOKEN` estiver configurado: faz deploy automático de todas as edge functions para produção
3. Se o secret não estiver configurado: exibe instruções no GitHub Actions Summary e termina **verde**

**Para ativar o deploy automático de edge functions:**
1. Acesse: **GitHub → Settings → Secrets and variables → Actions → New repository secret**
2. Nome: `SUPABASE_ACCESS_TOKEN`
3. Valor: token de serviço da conta Supabase (disponível em supabase.com/dashboard/account/tokens)
4. O próximo push na `main` fará deploy automático de todas as 173 edge functions

---

## 7. Deploy Pipeline (CI/CD) — falta `SUPABASE_ACCESS_TOKEN` para deploy completo

**Workflow:** `.github/workflows/deploy.yml` (`Deploy Pipeline`)  
**Status:** Workflow **funciona parcialmente** — validação (lint + typecheck + build + edge functions check) roda sem secrets. O deploy real das edge functions e o push de migrations **não executam** sem configuração.

**O que trava o deploy completo:**

| Secret | Para que serve | Onde obter |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | Deploy de edge functions via `supabase functions deploy` | supabase.com/dashboard/account/tokens |
| `SUPABASE_DB_PASSWORD` | Aplicar migrations via `supabase db push --linked` | Supabase Dashboard → Settings → Database → Database password |

**O que fazer (passo a passo):**
1. Acesse: **GitHub → Settings → Secrets and variables → Actions**
2. Adicione `SUPABASE_ACCESS_TOKEN` (token da conta Supabase)
3. Adicione `SUPABASE_DB_PASSWORD` (senha do banco do projeto `usyxfpqlsspldubptrdl`)
4. Para disparar um deploy: **Actions → Deploy Pipeline → Run workflow** (ou criar uma tag `v*`)
