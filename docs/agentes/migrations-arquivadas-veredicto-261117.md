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
- **PENDENTE** — faltam objetos e a tabela-alvo **existe**. Trabalho real não aplicado.

## Resultado

| veredicto | n |
|---|---:|
| PARCIAL | 10 |
| **PENDENTE** | **6** |
| INCORPORADA | 5 |
| OBSOLETA | 1 |

| veredicto | objetos | presentes | arquivo | tag |
|---|---:|---:|---|---|
| **PENDENTE** | 15 | 0 | `20260725000002_audit_2fa_auth_fixes.sql` | `audit/rlx-security-fix` |
| **PENDENTE** | 28 | 7 | `20260725000008_audit_log_fixes.sql` | `audit/rlx-security-fix` |
| **PENDENTE** | 19 | 4 | `20260727000003_audit_schema_unification.sql` | `audit/rlx-security-fix` |
| **PENDENTE** | 14 | 2 | `20260727000004_uuid_consistency_cleanup.sql` | `audit/rlx-security-fix` |
| **PENDENTE** | 19 | 0 | `20260727000007_twilio_webhook_security.sql` | `audit/rlx-security-fix` |
| **PENDENTE** | 16 | 0 | `20261019120000_bitrix24_sync_run_lock.sql` | `fix/hermes-420605-integracoes-r2` |
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

## Os 6 PENDENTE, em efeito de negócio


### `20260725000002_audit_2fa_auth_fixes.sql`

`archive/audit/rlx-security-fix` — **0 de 15** objetos presentes em produção.

Perde-se o registro de que o sistema hoje nao consegue gravar o historico de atividade de sessao nem limpar o historico de acesso a dados dos usuarios — um buraco de auditoria que ainda existe no banco; a correcao em si nao se perde porque teria mesmo de ser refeita, ja que foi escrita para um desenho de permissoes que nao e o do banco atual.


### `20260725000008_audit_log_fixes.sql`

`archive/audit/rlx-security-fix` — **7 de 28** objetos presentes em produção.

Perde-se o unico registro de que mudancas em webhooks e nas assinaturas de webhook de ganho/perda nao ficam gravadas em lugar nenhum hoje: se alguem alterar ou apagar uma dessas integracoes, nao ha como descobrir depois quem fez nem o que mudou. Orcamentos, pedidos, vendas e atividades ja tem esse registro funcionando por outro caminho, entao o restante do arquivo e plano antigo e superado, nao trabalho perdido.


### `20260727000003_audit_schema_unification.sql`

`archive/audit/rlx-security-fix` — **4 de 19** objetos presentes em produção.

Perde-se o unico trabalho pronto para arrumar o registro de quem mexeu em que no sistema: hoje esse historico esta espalhado em quatro tabelas diferentes e com formatos incompativeis, entao parte das alteracoes feitas pelos usuarios pode nao estar sendo registrada — sem esse arquivo, consertar isso vira trabalho do zero.


### `20260727000004_uuid_consistency_cleanup.sql`

`archive/audit/rlx-security-fix` — **2 de 14** objetos presentes em produção.

Perde-se o plano ja escrito de arrumar a bagunca do historico de auditoria: hoje o sistema guarda o "quem mexeu em que" em quatro tabelas separadas, com 33.651 registros numa delas e so 345 na tabela oficial, e sem os indices de busca. Sem esse arquivo, alguem teria que redescobrir e reescrever do zero como unificar esse historico e deixar as consultas de auditoria rapidas — nada deixa de funcionar hoje, mas a consulta de auditoria continua espalhada, lenta e nao confiavel.


### `20260727000007_twilio_webhook_security.sql`

`archive/audit/rlx-security-fix` — **0 de 19** objetos presentes em produção.

Perde-se o unico rascunho de uma protecao que nunca foi ligada: hoje o endereco publico que a Twilio usa para avisar o sistema sobre ligacoes aceita qualquer pessoa que descubra a URL, o que permite a um estranho inventar registros de ligacoes que nunca aconteceram no historico comercial; jogar o arquivo fora nao piora nada agora, mas apaga o ponto de partida ja escrito para resolver isso — e vale saber que, do jeito que esta, ele tambem nao resolveria sozinho, porque a parte que de fato confere a autenticidade do aviso ficou sem ser escrita.


### `20261019120000_bitrix24_sync_run_lock.sql`

`archive/fix/hermes-420605-integracoes-r2` — **0 de 16** objetos presentes em produção.

Perde-se a trava que impede duas sincronizacoes com o Bitrix24 rodarem ao mesmo tempo — sem ela, a mesma venda ou o mesmo cliente pode ser cadastrado em duplicata no Bitrix, e a sincronizacao inteira pode abortar no meio, deixando dados desatualizados ate alguem perceber.

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

Nenhuma foi trazida para `main`: aplicar DDL em produção é decisão do dono
(AGENTS.md §5.8), e várias delas não aplicam mais como estão.
