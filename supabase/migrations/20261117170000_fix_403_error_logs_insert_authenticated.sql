-- 403 ao gravar error_logs: usuario logado nao tem policy de INSERT.
--
-- CAUSA RAIZ (lida em producao, 2026-11-17, somente leitura):
--   public.error_logs tem RLS ligada e 3 policies:
--     "Admins can view error logs"      r  authenticated  USING is_admin_or_manager(auth.uid())
--     "Only admins can view error logs" r  authenticated  USING has_role(auth.uid(),'admin')
--     "anon can insert error logs"      a  anon           WITH CHECK (user_id IS NULL OR user_id = auth.uid())
--   Nenhuma policy de INSERT para `authenticated`. Como o grant de tabela existe
--   (relacl: authenticated=arwdxtm) mas nenhuma policy casa, a RLS nega e o
--   PostgREST responde 403 -- exatamente o que o console mostra:
--     POST /rest/v1/error_logs?columns="message","stack_trace",... 403 (Forbidden)
--
--   Efeito no negocio: o logger de erro do app funciona para visitante anonimo e
--   falha justamente para quem esta logado -- ou seja, nenhum erro de usuario real
--   chega na tabela que existe para registrar erro de usuario real. Confirmado que
--   error_logs e a UNICA tabela de public cujas policies de INSERT sao so de anon.
--
-- CONSERTO: espelhar a policy do anon para authenticated. Mesma condicao, sem
--   afrouxar nada: so aceita linha sem user_id ou com o user_id do proprio autor.
--   O payload do app nao manda user_id (columns= message, stack_trace, severity,
--   category, component, metadata, url, user_agent), entao cai no ramo IS NULL.
--   A leitura segue restrita a admin/gestor pelas duas policies de SELECT.

DROP POLICY IF EXISTS "authenticated can insert error logs" ON public.error_logs;
CREATE POLICY "authenticated can insert error logs"
  ON public.error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((user_id IS NULL) OR (user_id = auth.uid()));

-- Verificacao: falha a migration se a policy nao ficar no catalogo com o papel certo.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_policy p
      JOIN pg_class c ON c.oid = p.polrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = 'error_logs'
       AND p.polname = 'authenticated can insert error logs'
       AND p.polcmd = 'a'
       AND 'authenticated' = ANY (SELECT pg_get_userbyid(r) FROM unnest(p.polroles) r)
  ) THEN
    RAISE EXCEPTION 'policy de INSERT para authenticated nao foi criada em public.error_logs';
  END IF;
  RAISE NOTICE 'public.error_logs: usuario logado volta a conseguir registrar erro';
END
$$;
