# As 22 migrations que só existem em branch fechada — 17/11/2026

Tag preserva conteúdo, mas não responde se o trabalho foi **incorporado** ou ficou
**obsoleto**. Este documento responde, uma por uma, consultando o banco de produção.

## Como as 22 foram encontradas

Varredura de conteúdo das 42 tags `archive/` e `snapshot/` contra `main`:

```
caminhos distintos fora de main: 1350
  em 1 tag só:   1181   <- candidatos a trabalho único da branch
  em 2+ tags:     169   <- conteúdo da main pré-reescrita
```

Dos 1.181, **1.154** são de `snapshot/261117/contexto` (tudo `docs/contexto/`, gerado
por `contexto[bot]`: 443 `.md`, 690 `.sql` que são dumps de `pg_get_functiondef` e
21 `.json`). Sobram **27 caminhos** em 7 tags: 22 migrations e 5 outros arquivos.

## Método

Um agente por migration. Cada um lê o arquivo, extrai **todo** objeto que ela cria ou
altera (tabela, coluna, função, policy, índice, trigger, constraint, grant, tipo) e
consulta produção objeto por objeto em `pg_class`, `pg_proc`, `pg_policy`, `pg_index`,
`pg_trigger`, `pg_constraint`, `pg_enum` e `information_schema`. Somente leitura.

Critério:

- **INCORPORADA** — todos os objetos existem. O trabalho chegou lá por outro caminho.
- **PARCIAL** — alguns existem. O documento diz quais faltam.
- **OBSOLETA** — não existem, e o alvo também não existe mais.
- **PENDENTE** — faltam objetos e a tabela-alvo **existe**.

Esse último critério estava **errado**. Perguntar "os objetos desta migration existem?"
marca como pendência todo trabalho que foi **refeito melhor em outro lugar**. A pergunta
certa é: **o problema que ela resolve continua aberto?** As 6 marcadas PENDENTE foram
re-revisadas com essa pergunta — uma por agente, lendo produção e `origin/main` — e o
resultado mudou:

- **SUPERADA** — o problema está resolvido hoje por outro mecanismo.
- **PARCIALMENTE_COBERTA** — parte resolvida; o resto é lacuna real.

**5 das 6 eram falso positivo meu.** Sobrou **uma** lacuna real, tratada na PR #551.
E aplicar qualquer uma das 6 hoje seria **inseguro** — detalhe em cada verbete.

## Resultado

| veredicto | n |
|---|---:|
| PARCIAL | 10 |
| **SUPERADA** (eram PENDENTE) | **5** |
| **PARCIALMENTE_COBERTA** (era PENDENTE) | **1** |
| INCORPORADA | 5 |
| OBSOLETA | 1 |

Trabalho perdido ao fechar as 22 branches: **nenhum**. Trabalho que precisava ser
terminado: **um**, e está na PR #551.

| veredicto | objetos | presentes | arquivo | tag |
|---|---:|---:|---|---|
| **SUPERADA** | 15 | 0 | `20260725000002_audit_2fa_auth_fixes.sql` | `audit/rlx-security-fix` |
| **PARC.COB.** | 28 | 7 | `20260725000008_audit_log_fixes.sql` | `audit/rlx-security-fix` |
| **SUPERADA** | 19 | 4 | `20260727000003_audit_schema_unification.sql` | `audit/rlx-security-fix` |
| **SUPERADA** | 14 | 2 | `20260727000004_uuid_consistency_cleanup.sql` | `audit/rlx-security-fix` |
| **SUPERADA** | 19 | 0 | `20260727000007_twilio_webhook_security.sql` | `audit/rlx-security-fix` |
| **SUPERADA** | 16 | 0 | `20261019120000_bitrix24_sync_run_lock.sql` | `fix/hermes-420605-integracoes-r2` |
| **PARCIAL** | 23 | 5 | `20260725000001_audit_rls_critical_fixes.sql` | `audit/rlx-security-fix` |
| **PARCIAL** | 22 | 14 | `20260725000003_audit_webhook_security_fixes.sql` | `audit/rlx-security-fix` |
| **PARCIAL** | 8 | 6 | `20260725000004_audit_sql_injection_fixes.sql` | `audit/rlx-security-fix` |
| **PARCIAL** | 16 | 7 | `20260726000001_audit_critical_fixes.sql` | `audit/rlx-security-fix` |
| **PARCIAL** | 11 | 2 | `20260727000002_audit_optimistic_locking.sql` | `audit/rlx-security-fix` |
| **PARCIAL** | 33 | 3 | `20260727000005_check_constraints_business_logic.sql` | `audit/rlx-security-fix` |
| **PARCIAL** | 32 | 5 | `20260727000006_unique_constraints_partial_indexes.sql` | `audit/rlx-security-fix` |
| **PARCIAL** | 22 | 6 | `20260727000008_rls_missing_policies.sql` | `audit/rlx-security-fix` |
| **PARCIAL** | 12 | 1 | `20260728000001_observability_rls.sql` | `audit/rlx-security-fix` |
| **PARCIAL** | 22 | 10 | `20260904000002_recreate_performance_indexes.sql` | `claude/auditoria-tecnica-sistema-t98xtr` |
| **OBSOLETA** | 10 | 0 | `20260725000007_audit_rbac_fixes.sql` | `audit/rlx-security-fix` |
| **INCORPORADA** | 31 | 22 | `20260727000001_audit_fk_on_delete.sql` | `audit/rlx-security-fix` |
| **INCORPORADA** | 3 | 3 | `20260904000001_fix_broadcast_sale_completed.sql` | `claude/auditoria-tecnica-sistema-t98xtr` |
| **INCORPORADA** | 13 | 13 | `20261018152917_lost_deals_benchmark.sql` | `v2/hidden-features-26101409158c38` |
| **INCORPORADA** | 6 | 6 | `20261019150000_agent_run_owner_check.sql` | `fix/hermes-420603-sec-agent-runs` |
| **INCORPORADA** | 18 | 18 | `20261019151000_sales_status_canon_r2.sql` | `fix/hermes-420639-sales-status-canon` |

## As 6 que eu tinha marcado PENDENTE, uma a uma

Cada verbete traz: o problema, o mecanismo que o resolve hoje (com arquivo:linha ou nome
de objeto em produção) e por que aplicar a arquivada seria ruim.

### `20261019120000_bitrix24_sync_run_lock.sql` — SUPERADA

`archive/fix/hermes-420605-integracoes-r2` — 0 de 16 objetos.

Era a trava que impede duas sincronizações com o Bitrix24 ao mesmo tempo. **Essa trava
já existe**, construída 8 dias depois, de forma mais geral: `20261027120100_edge_job_lock_lease.sql`
criou `public.edge_job_locks` + `try_edge_job_lock`/`release_edge_job_lock`, todos
presentes em produção, e a edge function de `main` os chama no run inteiro — o comentário
dela cita o **mesmo** modo de falha (`ux_icp_data_bitrix_id`). Nenhum objeto `bitrix24_sync_*`
existe em produção.

**Aplicar hoje criaria uma segunda trava concorrente**, com dois mecanismos disputando o
mesmo run. Esta era a que eu tinha chamado de "a mais acionável das 6".

### `20260725000008_audit_log_fixes.sql` — PARCIALMENTE_COBERTA

`archive/audit/rlx-security-fix` — 7 de 28 objetos.

Das 6 tabelas que ela queria auditar, **4 já são** (`quotes`, `orders`, `sales`,
`activities`), pelo mecanismo canônico `audit_business_changes` → `audit_log_row_change`
→ `public.audit_logs`, criado em `20261001193100_audit_log_canonical.sql:196` e :288-291.
Esse mecanismo é mais amplo (10 tabelas), redige senha/token/segredo via `audit_scrub` e
grava `request_id` — nada disso existe na arquivada. Está vivo: `audit_logs` tem 17.236
linhas de `quotes` (última em 14/11), 5.301 de `orders`, 4.649 de `sales`.

**Em aberto, e é lacuna real:** `webhooks` e `winloss_webhook_subscriptions` ficaram de
fora da lista canônica. Nenhum trigger de auditoria, `0` linhas de webhook em
`audit_logs`, e a escrita vem direto do front (`src/hooks/useWebhooks.ts`,
`src/hooks/win-loss/useWebhookSubscriptions.ts`) sem chamar `log_audit_event`. Hoje
ninguém consegue provar quem criou, alterou, desligou ou apagou um webhook — o endereço
externo para onde o sistema despeja os dados de negócios ganhos e perdidos. Há 1
assinatura ativa. **→ PR #551**, que anexa o trigger canônico nas duas tabelas,
com `INSERT` incluído.

**Aplicar a arquivada seria destrutivo**, em três níveis: (a) nem aplica —
`create_audit_trigger_for_table` consulta `pg_triggers`, que não existe
(`to_regclass` → NULL), e a primeira chamada aborta a transação; (b) se o nome fosse
corrigido, os triggers gerados inserem em `resource_type`/`resource_id`, colunas que não
existem em produção — **todo** insert/update/delete em `quotes`, `orders`, `sales` e
`activities` passaria a falhar, travando o CRM; (c) a fase 2 move `public.audit_logs`
para o schema `deprecated`, que é justamente a tabela onde a auditoria atual grava e que
a tela de admin lê (`src/hooks/admin/useAuditLogs.ts:35`).

### `20260727000003_audit_schema_unification.sql` e `20260727000004_uuid_consistency_cleanup.sql` — SUPERADAS

`archive/audit/rlx-security-fix` — 4 de 19 e 2 de 14 objetos.

As duas queriam unificar o histórico de auditoria espalhado em tabelas incompatíveis.
`20261001193100_audit_log_canonical.sql` fez isso, e **no sentido contrário** ao das
arquivadas: a canônica é `public.audit_logs` (plural); `public.audit_log` (singular),
para onde elas convergiriam, é a marcada como superada.

**Aplicar hoje moveria o histórico na direção errada**, para a tabela aposentada.

### `20260727000007_twilio_webhook_security.sql` — SUPERADA

`archive/audit/rlx-security-fix` — 0 de 19 objetos.

Queria proteger no banco o endpoint público que a Twilio usa. **A proteção existe, na
camada certa**: validação HMAC da assinatura `X-Twilio-Signature` feita na própria edge
function, antes de qualquer escrita — `supabase/functions/_shared/webhook-auth.ts:177`
(`verifyTwilioSignature`, HMAC-SHA1 com comparação timing-safe) e `:200`
(`verifyTwilioSignatureAny`). O documento anterior dizia que o endpoint "aceita qualquer
um que descubra a URL": **isso estava errado**.

### `20260725000002_audit_2fa_auth_fixes.sql` — SUPERADA

`archive/audit/rlx-security-fix` — 0 de 15 objetos.

Dos 4 problemas que ela listava: a limpeza do histórico de acesso existe
(`20261001151000_log_retention_indexes_and_purge.sql:102` e `:111` criam
`data_retention_policies` + `fn_apply_data_retention()`, com job diário
`data-retention-purge-daily` ativo); a policy de admin sobre `login_attempts` já existe
em produção (nome com underscore, por isso o casamento por nome falhou); `has_role`
existe e é a usada em `main`; e a policy de `session_activity` foi avaliada e descartada
de propósito em `20261117040000_integridade_resgatada_rlx.sql:34-37`, por ser tabela
dormente (0 linhas).

**Não aplica**: faz JOIN com uma tabela `public.roles` que não existe
(`to_regclass` → NULL) e usa `user_roles.role_id`, coluna que não existe — a real é
`role`, do enum `app_role`.

## Observação sobre os 10 PARCIAL

Quase todos vêm do mesmo lote (`archive/audit/rlx-security-fix`, julho/2026) e repetem
um padrão: **o objetivo de segurança já vale em produção, montado de outro jeito e com
outros nomes.** Exemplo medido em `20260725000001_audit_rls_critical_fixes.sql`: as 18
policies que ela cria não existem por nome, mas as 5 tabelas-alvo têm RLS ligada e 29
policies que cobrem os mesmos casos — admin e gerente veem tudo, vendedor vê o próprio,
delete só admin.

Duas dessas migrations **dariam erro se aplicadas hoje**: usam os rótulos `'seller'` e
`'viewer'` do enum `app_role`, que não existem em produção (os reais são `admin`,
`manager`, `salesperson`), e chamam uma `has_role` que faz JOIN com uma tabela `roles`
inexistente. São registro histórico de um problema resolvido por outro caminho.

## Nada foi perdido

Todas as 22 seguem alcançáveis pela tag indicada na coluna. Recuperar é um comando:

```bash
git show archive/fix/hermes-420605-integracoes-r2:supabase/migrations/20261019120000_bitrix24_sync_run_lock.sql
```

Nenhuma foi trazida para `main` — e agora por um motivo mais forte do que a regra:
**as 6 têm `aplicar hoje = inseguro`**, e duas delas quebrariam o CRM ou a auditoria que
funciona. A única lacuna real foi resolvida com uma migration nova e pequena (PR #551),
não com o arquivo arquivado.

## O erro que este documento corrige

A primeira versão dizia **6 PENDENTE** e chamava a trava do Bitrix de "a mais acionável
das 6". As duas afirmações estavam erradas, e seguir a segunda teria criado uma trava
concorrente em produção. A causa não foi o banco nem os agentes: foi **a pergunta que eu
fiz a eles**. "Os objetos existem?" mede nomes; "o problema continua aberto?" mede o
sistema. Trabalho refeito melhor em outro lugar passa no primeiro teste como se fosse
perda.
