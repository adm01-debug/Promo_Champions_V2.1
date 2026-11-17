-- Corrige o 403 na tela de Webhooks.
--
-- SINTOMA (produção, console do navegador):
--   GET /rest/v1/webhooks?select=*&order=created_at.desc -> 403 Forbidden
--   (src/hooks/useWebhooks.ts, useWebhooks())
--
-- CAUSA RAIZ:
--   A policy "Admins can manage webhooks" é PERMISSIVE, vale para PUBLIC (portanto também
--   para o papel `authenticated`) e sua expressão lê auth.users direto:
--     EXISTS (SELECT 1 FROM auth.users
--              WHERE users.id = auth.uid()
--                AND users.raw_user_meta_data ->> 'role' = 'admin')
--   O papel `authenticated` NÃO tem SELECT em auth.users
--   (has_table_privilege('authenticated','auth.users','SELECT') = false).
--   O Postgres avalia todas as policies permissivas, essa estoura na avaliação, e o erro
--   sobe antes de qualquer filtro de linha. Medido em produção como `authenticated` com o
--   JWT de um admin real:
--     ERROR: 42501: permission denied for table users
--     HINT:  Grant the required privileges to the current role with:
--            GRANT SELECT ON auth.users TO authenticated;
--   O PostgREST traduz 42501 em HTTP 403. Não é RLS negando linha: RLS negando devolveria
--   200 com lista vazia.
--
-- POR QUE REMOVER, E NÃO REESCREVER:
--   A policy é lógica morta. Ela exige a chave `role` em raw_user_meta_data, e essa chave
--   não existe em NENHUM usuário: `count(*) FILTER (WHERE raw_user_meta_data ? 'role')` = 0
--   de 7. Ou seja, ela nunca liberou ninguém — só derrubava a query inteira. Remover tira
--   zero acesso de zero usuário.
--
-- QUEM CONTINUA VENDO A TELA:
--   As outras duas policies da tabela, que usam a função correta:
--     "Admins and managers can manage webhooks"  FOR ALL    TO authenticated  is_admin_or_manager(auth.uid())
--     "Admins and managers can view webhooks"    FOR SELECT TO authenticated  is_admin_or_manager(auth.uid())
--   is_admin_or_manager é SECURITY DEFINER e lê public.user_roles, não auth.users, então
--   avalia sem precisar de privilégio em auth. Medido em produção com o JWT do mesmo
--   admin: is_admin_or_manager(auth.uid()) = true, auth.role() = 'authenticated'.
--   (Numa sessão sem JWT ela devolve false de propósito, por causa do
--    COALESCE(auth.role(),'anon') <> 'anon' na primeira linha.)
--
-- NÃO concede SELECT em auth.users a authenticated, que é o que o HINT do Postgres sugere:
--   isso exporia e-mail, metadados e carimbos de login de todos os usuários a qualquer
--   pessoa logada. A correção certa é não ler auth.users de dentro de uma policy.
--
-- VERIFICADO: dry-run contra produção com BEGIN / DROP POLICY / SELECT como authenticated /
--   ROLLBACK — o SELECT passou e a policy seguiu existindo depois do rollback.
--
-- ESCOPO: uma policy, uma tabela. Outras 3 tabelas têm o mesmo defeito
--   (public.webhook_logs, public.audit_log, public.lead_detailed_logs) e NÃO são tocadas
--   aqui: em duas delas a policy quebrada é a única que concede acesso, então removê-la
--   fecharia a tabela. Cada uma precisa de decisão própria.

DROP POLICY IF EXISTS "Admins can manage webhooks" ON public.webhooks;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy p
      JOIN pg_class c ON c.oid = p.polrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relname = 'webhooks'
       AND p.polname = 'Admins can manage webhooks'
  ) THEN
    RAISE EXCEPTION 'policy morta ainda presente em public.webhooks';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
      JOIN pg_class c ON c.oid = p.polrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relname = 'webhooks'
       AND p.polname = 'Admins and managers can view webhooks'
  ) THEN
    RAISE EXCEPTION 'a policy de leitura de admin/gestor nao existe: nao remova a outra sem ela';
  END IF;

  RAISE NOTICE 'public.webhooks: policy morta removida; leitura segue por is_admin_or_manager';
END
$$;
