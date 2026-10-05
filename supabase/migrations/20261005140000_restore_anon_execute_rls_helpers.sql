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
