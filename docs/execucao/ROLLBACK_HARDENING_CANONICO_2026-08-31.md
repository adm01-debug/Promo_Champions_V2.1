# Rollback — hardening canônico de 2026-08-31

## Regra de decisão

Priorizar forward-fix. Não reabrir acesso anônimo a dados sensíveis como forma
de corrigir uma incompatibilidade de interface. Nenhum rollback deve apagar
colunas, índices, buckets ou registros criados por este lote.

## Antes do deploy

1. Exportar `pg_get_functiondef`, `pg_policies`, ACLs, `reloptions`, buckets e
   jobs afetados.
2. Registrar o SHA do merge e os hashes SHA-256 das migrations.
3. Confirmar backup/PITR saudável.
4. Aplicar cada wave em uma transação separada.

## Ordem de contenção

### Falha no frontend de login

Reverter apenas o commit do frontend e manter o bloqueio de SELECT cru.
Disponibilizar temporariamente `get_login_lockout_status` para a versão anterior
por um adaptador, sem restaurar a policy anônima de leitura.

### MIME ou tamanho incompatível no Storage

Ampliar a allowlist ou o limite do bucket afetado. Não remover objetos e não
tornar bucket privado em público. O valor anterior dos cinco buckets era
`file_size_limit=NULL` e `allowed_mime_types=NULL`, mas restaurar `NULL` deve ser
último recurso e apenas no bucket nominalmente afetado.

### Regressão em job SQL

Desativar somente o job nominal via `cron.unschedule`, preservar seus dados e
restaurar a definição capturada por `pg_get_functiondef`. Não executar
`DROP FUNCTION`, pois há jobs e RPCs dependentes.

### Regressão de autorização

Conceder o privilégio mínimo à role autenticada necessária e manter `anon`
revogado. Para soft delete, nunca restaurar a confiança em `p_admin_user_id` ou
`p_user_id`; criar uma RPC específica para o caso de uso legítimo.

### Campaign health

Se a Edge Function ainda não tiver sido publicada, não aplicar
`20260831130003_fix_campaign_health_cron.sql`. Se já aplicada e o smoke falhar,
desagendar apenas `campaign-health-alert-30min` até corrigir a autenticação. Não
restaurar a URL do projeto de origem nem um JWT literal.

## Objetos aditivos

Os onze índices, as colunas `dedupe_bucket`/`request_id`, o bucket
`winloss-reports` e as novas RPCs devem permanecer durante a contenção. Eles não
removem compatibilidade nem dados. A retirada futura exige auditoria nominal,
janela aprovada e autorização explícita.

