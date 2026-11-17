-- Fecha o privilegio padrao de TRUNCATE para anon/authenticated nas tabelas
-- FUTURAS do schema public.
--
-- RECUPERADO da PR #132 (fechada sem merge). O conteudo abaixo e o da PR,
-- revalidado contra producao em 2026-11-17 antes de reentrar.
--
-- POR QUE A CORRECAO ANTERIOR NAO BASTOU: a migration 20260902121000 rodou
--   ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE TRUNCATE ON TABLES
--     FROM anon, authenticated;
-- sem clausula FOR ROLE. Sem FOR ROLE o Postgres altera apenas o default ACL
-- do papel que executa a migration (postgres) -- nao o de supabase_admin, que
-- e o dono das tabelas criadas pelo painel e pela API do Supabase, ou seja o
-- caminho normal de criacao neste projeto.
--
-- ESTADO MEDIDO EM PRODUCAO (pg_default_acl, 2026-11-17):
--   papel_que_cria=postgres        public/r  anon=arwdxtm    <- sem D, ja corrigido
--   papel_que_cria=supabase_admin  public/r  anon=arwdDxtm   <- D = TRUNCATE, ABERTO
--   (mesmo D para authenticated)
-- Letras do aclitem: a=INSERT r=SELECT w=UPDATE d=DELETE D=TRUNCATE
--                    x=REFERENCES t=TRIGGER m=MAINTAIN
--
-- POR QUE IMPORTA: RLS nao filtra TRUNCATE. Policy de linha protege SELECT,
-- INSERT, UPDATE e DELETE; quem tem o privilegio TRUNCATE esvazia a tabela
-- inteira de uma vez, com RLS ligada ou nao. Como anon e o papel da chave
-- publica do front, uma tabela nova criada pelo painel nasce esvaziavel.
--
-- ESCOPO: nao altera grant de tabela existente (ALTER DEFAULT PRIVILEGES vale
-- so para objetos futuros) e e idempotente.

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
