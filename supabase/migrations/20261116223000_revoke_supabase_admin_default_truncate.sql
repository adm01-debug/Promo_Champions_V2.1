-- RESGATE: conteudo originalmente escrito na branch
-- fix/hermes-graphify-p0-correcoes-20260911 como
-- 20260910130000_revoke_supabase_admin_default_truncate.sql. Aquela branch tem
-- historia desconexa da main (recriada como orphan em 2026-11-13); o arquivo foi
-- reaproveitado aqui com a versao renumerada para ficar acima de max(version) do
-- repo. Conteudo SQL preservado byte a byte; apenas este cabecalho foi somado.
--
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
