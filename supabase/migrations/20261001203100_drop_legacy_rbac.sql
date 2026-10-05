-- Pacote auditoria auth/authz (2026-10-01) — RBAC-LEGADO
-- Remove o modelo RBAC paralelo criado por 20251228_advanced_permissions.sql
-- e 20251231125636 (permissions/role_permissions):
--   * public.roles e public.user_permissions_cache (tabelas)
--   * has_permission(uuid, text, text) — le user_roles.role_id, coluna que
--     NAO existe no modelo canonico => 42703 em runtime (causa do /clientes
--     vazio para todos os usuarios, via policies quebradas em clients).
--   * has_permission(text, text) — overload de permissions/role_permissions,
--     tambem sem consumidores no repo.
--
-- Evidencia (grep 2026-10-01): zero chamadas reais em src/ e
-- supabase/functions/ — apenas entradas geradas em
-- src/integrations/supabase/types.ts (regenerar types apos aplicar).
-- Modelo canonico mantido: app_role + user_roles + has_role +
-- is_admin_or_manager. As tabelas permissions/role_permissions e a funcao
-- get_user_permissions ficam para pacote futuro (fora do escopo aprovado).
--
-- As policies quebradas criadas por 20251228 sao removidas ANTES dos drops
-- de funcao. Se prod tiver dependentes adicionais criados fora do repo
-- (ex.: policy via dashboard), o DROP FUNCTION falha alto e aponta o objeto
-- — rodar a query de pre-voo em docs/RLS_AUDIT_QUERIES.md (secao 7) antes.

-- Policies legadas em clients que dependem de has_permission(uuid,text,text)
DROP POLICY IF EXISTS "Users can read clients if has permission" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients if has permission" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients if has permission" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients if has permission" ON public.clients;

-- deals nao existe no schema canonico (pipeline usa public.sales) — guardar.
DO $$
BEGIN
  IF to_regclass('public.deals') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can read deals if has permission" ON public.deals';
    EXECUTE 'DROP POLICY IF EXISTS "Users can create deals if has permission" ON public.deals';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update deals if has permission" ON public.deals';
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.has_permission(uuid, text, text);
DROP FUNCTION IF EXISTS public.has_permission(text, text);

DROP TABLE IF EXISTS public.user_permissions_cache;
DROP TABLE IF EXISTS public.roles;
