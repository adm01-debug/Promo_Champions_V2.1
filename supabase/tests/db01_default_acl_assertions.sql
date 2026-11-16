-- Pós-condições somente leitura do lote DB-01.
-- Execute após aplicar 20260910130000 no staging ou no projeto canônico.
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
      'db01_default_acl_truncate_still_present';
  END IF;

END;
$$;
