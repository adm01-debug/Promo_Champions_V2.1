-- Restaura EXECUTE de anon nos helpers de RLS usados dentro de policies.
--
-- As migrations de hardening 202610* revogaram EXECUTE dessas functions para
-- authenticated+service_role apenas. Como são avaliadas DENTRO de policies
-- (ex.: sales/clients/leads para request sem JWT = role anon), qualquer query
-- PostgREST anônima passou a falhar com 42501 permission denied em vez de
-- retornar a lista vazia esperada pelo RLS. Confirmado em produção:
-- apikey → GET /rest/v1/sales retornava 42501; após o GRANT retorna 200 [].
--
-- has_role já mantinha EXECUTE para anon — este arquivo alinha os demais.
-- Idempotente: GRANT duplicado é no-op.

GRANT EXECUTE ON FUNCTION public.get_current_salesperson_id() TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager() TO anon;

-- Blindagem contra enumeração anônima de cargos (Devin Review SEC):
-- get_user_role(uuid)/is_admin_or_manager(uuid) são SECURITY DEFINER e
-- contornam a RLS de user_roles — com EXECUTE para anon, qualquer visitante
-- podia consultar o cargo de um UUID conhecido via rpc(). As policies sempre
-- chamam com auth.uid() (NULL sob anon → mesmo resultado), então negar a
-- role 'anon' preserva a semântica do RLS e elimina o vazamento.
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE WHEN auth.role() = 'anon' THEN NULL ELSE (
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    ORDER BY
      CASE role
        WHEN 'admin' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'salesperson' THEN 3
      END
    LIMIT 1
  ) END
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(auth.role(), 'anon') <> 'anon' AND EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'manager')
  )
$function$;
