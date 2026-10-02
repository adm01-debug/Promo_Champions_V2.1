# Queries de auditoria RLS / grants — executar no banco real

> Pacote de auditoria auth/authz (2026-10-01). Rodar no projeto
> `usyxfpqlsspldubptrdl` pelo SQL Editor do Supabase (como `postgres`) ou
> via gateway MCP com `db_query`. Cada seção é independente — cole e execute.
> Resultado esperado anotado em cada consulta; qualquer linha retornada é um
> achado a tratar.

## 1. Policies permissivas `USING (true)` / `WITH CHECK (true)`

Policies com qual/with_check literal `true` liberam a ação para qualquer
usuário do role-alvo — cada linha precisa de justificativa explícita.

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    lower(btrim(coalesce(qual, '')))     IN ('true', '(true)', '((true))')
    OR lower(btrim(coalesce(with_check, ''))) IN ('true', '(true)', '((true))')
  )
ORDER BY tablename, policyname;
```

Variação mais ampla (pega `true` embutido em expressões, ex.: `x OR true`):

```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (coalesce(qual, '') ~* '(^|[^a-z_])true([^a-z_]|$)'
    OR coalesce(with_check, '') ~* '(^|[^a-z_])true([^a-z_]|$)')
ORDER BY tablename, policyname;
```

## 2. Grants de tabela/view para `anon` e `PUBLIC`

Listas o que roles não autenticados podem acessar via PostgREST. Todo
`anon`/`PUBLIC` com SELECT em tabela de negócio é achado.

```sql
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'PUBLIC')
ORDER BY table_name, grantee, privilege_type;
```

## 3. Grants de EXECUTE de funções para `anon` / `PUBLIC`

`proacl IS NULL` = ACL default, que concede EXECUTE a PUBLIC — funções
SECURITY DEFINER nesse estado são críticas (executam como owner).

```sql
SELECT p.proname,
       pg_get_function_arguments(p.oid) AS args,
       p.prosecdef AS security_definer,
       CASE WHEN p.proacl IS NULL THEN 'DEFAULT (EXECUTE p/ PUBLIC)' ELSE p.proacl::text END AS acl
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (
    p.proacl IS NULL
    OR p.proacl::text LIKE '%anon%'
    OR p.proacl::text ~ '(^|,)\s*=?[XAa-z]+/'  -- grants a PUBLIC aparecem como '=X/...'
  )
ORDER BY p.prosecdef DESC, p.proname;
```

Checagem pontual do caso conhecido (revogado na migration
`20261001203300_deny_dead_tables_revoke_anon_grants.sql`):

```sql
SELECT p.proname, p.proacl
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN (
  'fn_test_cleanup_dedupe_privileges',
  'fn_cron_expected_interval',
  'fn_cron_stalled_threshold',
  'fn_test_simulate_stalled_check',
  'fn_test_cleanup_cron_alerts',
  'fn_test_backdate_cron_alert'
);
-- Esperado pós-migration: proacl sem 'anon'.
```

## 4. SECURITY DEFINER sem `search_path` fixado (CWE-426)

```sql
SELECT n.nspname, p.proname, pg_get_function_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.prosecdef
  AND n.nspname IN ('public', 'private')
  AND NOT EXISTS (
    SELECT 1 FROM unnest(coalesce(p.proconfig, '{}')) c
    WHERE c LIKE 'search\_path=%'
  )
ORDER BY 1, 2;
```

## 5. RLS habilitado sem nenhuma policy (deny-all efetivo)

Confirma se o deny-all é intencional — comparar com a lista do pacote
(`webhook_events` é intencional; o resto precisa de revisão).

```sql
SELECT c.relname
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies pol
    WHERE pol.schemaname = 'public' AND pol.tablename = c.relname
  )
ORDER BY c.relname;
```

## 6. Tabelas `public` SEM RLS

```sql
SELECT c.relname
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND NOT c.relrowsecurity
ORDER BY c.relname;
```

## 7. Pré-voo do DROP de `has_permission` / `roles` / `user_permissions_cache`

Rodar ANTES de aplicar `20261001203100_drop_legacy_rbac.sql`. Qualquer
linha em pg_policies é um dependente fora do repo que faria o
`DROP FUNCTION` falhar — dropar a policy manualmente primeiro.

```sql
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (coalesce(qual, '') ILIKE '%has_permission%'
    OR coalesce(with_check, '') ILIKE '%has_permission%');
```

## 8. Estado atual das policies de `user_roles`

```sql
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'user_roles'
ORDER BY cmd, policyname;
```

Esperado pós-migrations: `FOR ALL` admin-only, `INSERT/UPDATE/DELETE`
admin-only e `SELECT` ("Users can view own role") com
`user_id = auth.uid() OR has_role(...) OR is_admin_or_manager(...)`.

## 9. Trigger de auditoria de `user_roles`

```sql
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgrelid = 'public.user_roles'::regclass AND NOT tgisinternal;
-- Esperado: trg_audit_user_roles habilitado.

SELECT count(*) AS audit_rows_24h
FROM public.audit_logs
WHERE entity_type = 'user_roles' AND created_at > now() - interval '24 hours';
```

## 10. Grants residuais em tabelas do pacote

```sql
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('webhook_events', 'user_roles',
                     'winloss_webhook_replay_audit',
                     'winloss_webhook_replay_invocations')
  AND grantee IN ('anon', 'PUBLIC', 'authenticated')
ORDER BY table_name, grantee;
-- Esperado: webhook_events sem nenhuma linha; as demais só o necessário
-- (SELECT authenticated em user_roles e nas duas de replay).
```
