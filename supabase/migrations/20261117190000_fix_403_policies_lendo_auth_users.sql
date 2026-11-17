-- Tira as três últimas policies que leem auth.users — o mesmo defeito que
-- 20261117150000 corrigiu em public.webhooks.
--
-- Causa: `EXISTS (SELECT 1 FROM auth.users WHERE ...)` dentro do USING. O papel
-- `authenticated` não tem SELECT em auth.users, então a expressão da policy
-- levanta 42501 `permission denied for table users` e o PostgREST devolve 403.
-- Não é filtro de linha: é erro. Medido em produção como um admin real
-- (e9c02e64, um dos 5 de user_roles), dentro de BEGIN ... ROLLBACK:
--
--   SELECT count(*) FROM public.lead_detailed_logs -> 42501 permission denied for table users
--   SELECT count(*) FROM public.webhook_logs       -> 42501 permission denied for table users
--   SELECT count(*) FROM public.audit_log          -> 42501 permission denied for table users
--
-- Impacto de tela: src/hooks/cadences/useLeadLogs.ts lê lead_detailed_logs, ou
-- seja, o histórico de interações do lead está em 403 para todo mundo hoje.
-- webhook_logs e audit_log ainda não têm leitor no front — latentes.
--
-- Risco de regressão: nenhum. Além de sempre levantarem, as duas policies de
-- admin usavam auth.users.raw_user_meta_data->>'role' = 'admin' como critério,
-- e essa fonte tem ZERO usuários em produção:
--   SELECT count(*) FROM auth.users WHERE raw_user_meta_data->>'role'='admin' -> 0
--   SELECT count(*) FROM public.user_roles WHERE role='admin'                 -> 5
-- O RBAC de verdade é public.user_roles, exposto por public.has_role(uuid, app_role)
-- (SECURITY DEFINER, já usada pelo resto do schema). Ninguém perde acesso que
-- tivesse: hoje a leitura não funciona para ninguém.
--
-- As policies ganham TO authenticated explícito: `{}` (PUBLIC) incluía anon.

-- 1. webhook_logs: leitura só de admin.
DROP POLICY IF EXISTS "Admins can view webhook logs" ON public.webhook_logs;
CREATE POLICY "Admins can view webhook logs"
  ON public.webhook_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. audit_log: leitura total só de admin (a policy "Users can view own audit
--    logs" continua intacta e cobre o caso do próprio usuário).
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_log;
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. lead_detailed_logs: preserva a regra de negócio — vê o log quem é dono do
--    cliente; admin vê tudo. Só a sub-consulta em auth.users sai de cena.
DROP POLICY IF EXISTS "Users can view logs of their clients" ON public.lead_detailed_logs;
CREATE POLICY "Users can view logs of their clients"
  ON public.lead_detailed_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.clients c
       WHERE c.id = lead_detailed_logs.client_id
         AND (c.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
    )
  );

DO $$
DECLARE
  v_restantes int;
  v_faltando  text;
BEGIN
  SELECT count(*) INTO v_restantes
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relname IN ('webhook_logs', 'audit_log', 'lead_detailed_logs')
     AND (pg_get_expr(p.polqual, p.polrelid) ILIKE '%auth.users%'
       OR pg_get_expr(p.polwithcheck, p.polrelid) ILIKE '%auth.users%');
  IF v_restantes > 0 THEN
    RAISE EXCEPTION 'ainda há % policy(ies) lendo auth.users nas três tabelas', v_restantes;
  END IF;

  SELECT string_agg(t.nome, ', ') INTO v_faltando
    FROM (VALUES
      ('webhook_logs', 'Admins can view webhook logs'),
      ('audit_log', 'Admins can view all audit logs'),
      ('lead_detailed_logs', 'Users can view logs of their clients')
    ) AS t(nome, pol)
   WHERE NOT EXISTS (
     SELECT 1 FROM pg_policy p
       JOIN pg_class c ON c.oid = p.polrelid
      WHERE c.relname = t.nome AND p.polname = t.pol AND p.polcmd = 'r'
        AND 'authenticated' = ANY(ARRAY(SELECT rolname FROM pg_roles WHERE oid = ANY(p.polroles)))
   );
  IF v_faltando IS NOT NULL THEN
    RAISE EXCEPTION 'policy de SELECT ausente ou sem TO authenticated em: %', v_faltando;
  END IF;

  RAISE NOTICE 'ok: 3 policies de SELECT recriadas sem auth.users';
END $$;
