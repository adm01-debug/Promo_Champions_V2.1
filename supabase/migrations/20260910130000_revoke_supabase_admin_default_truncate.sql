-- Fecha o default ACL efetivo de tabelas futuras no schema public.
--
-- A migration 20260902121000 executou ALTER DEFAULT PRIVILEGES para o papel
-- executor, mas os grants remanescentes pertencem a supabase_admin. Este
-- comando não altera grants de tabelas existentes e é idempotente.

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  REVOKE TRUNCATE ON TABLES FROM anon, authenticated;

-- Falhar explicitamente é mais seguro que registrar uma migration sem efeito.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_default_acl AS d
    CROSS JOIN LATERAL aclexplode(d.defaclacl) AS a
    JOIN pg_roles AS grantee ON grantee.oid = a.grantee
    WHERE d.defaclrole = 'supabase_admin'::regrole
      AND d.defaclnamespace = 'public'::regnamespace
      AND grantee.rolname IN ('anon', 'authenticated')
      AND a.privilege_type = 'TRUNCATE'
  ) THEN
    RAISE EXCEPTION
      'default ACL TRUNCATE para anon/authenticated ainda existe em public';
  END IF;
END;
$$;
