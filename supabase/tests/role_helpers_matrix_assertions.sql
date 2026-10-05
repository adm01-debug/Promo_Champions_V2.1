-- Teste de regressão da matriz de permissões de
-- public.is_admin_or_manager(uuid) / public.get_user_role(uuid)
-- (migration 20261005160000_restrict_role_helpers_to_self).
--
-- Contrato: a função NUNCA lança erro — retorna FALSE quando o
-- chamador não pode consultar o UUID alvo (não vaza informação).
--   self            → usuário consulta o próprio UUID        → valor real
--   terceiros       → não-admin consulta UUID de outro        → FALSE
--   admin/manager   → admin consulta UUID de terceiro         → valor real
--   anon            → sem JWT                                 → FALSE
--
-- O caso discriminatório é consultar um ALVO admin real:
-- admin chamador → TRUE; não-admin chamador → FALSE; anon → FALSE.
--
-- Como rodar: via Management API / SQL Editor (role postgres).
-- Cada DO $$ aborta com EXCEPTION em caso de falha.

DO $$
DECLARE
  v_admin uuid;
  v_alice uuid := 'aaaaaaaa-0000-0000-0000-000000000001'; -- não existe em user_roles
BEGIN
  SELECT ur.user_id INTO v_admin
  FROM public.user_roles ur
  WHERE ur.role IN ('admin','manager')
  LIMIT 1;

  IF v_admin IS NULL THEN
    RAISE NOTICE 'SKIP: nenhum admin em user_roles para a matriz';
    RETURN;
  END IF;

  -- (1)+(2) chamador não-admin (alice)
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_alice, 'role', 'authenticated')::text, true);

  -- self: avalia sem erro; alice não é admin → false
  IF public.is_admin_or_manager(v_alice) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'FAIL(1): self de não-admin deveria retornar false';
  END IF;

  -- terceiros: alice consultando admin real → false (sem vazar)
  IF public.is_admin_or_manager(v_admin) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'FAIL(2): não-admin obteve papel de terceiro';
  END IF;

  -- (3) chamador admin
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);

  IF public.is_admin_or_manager(v_admin) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'FAIL(3a): admin consultando admin deveria retornar true';
  END IF;
  IF public.is_admin_or_manager(v_alice) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'FAIL(3b): admin consultando não-admin deveria retornar false';
  END IF;

  -- (4) anon
  PERFORM set_config('request.jwt.claims', '{}'::text, true);
  IF public.is_admin_or_manager(v_admin) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'FAIL(4): anon deveria retornar false';
  END IF;

  RAISE NOTICE 'OK: matriz de permissões de is_admin_or_manager validada';
END $$;
