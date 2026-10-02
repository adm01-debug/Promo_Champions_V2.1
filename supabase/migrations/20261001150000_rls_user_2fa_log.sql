-- Auditoria técnica 2026-10-01 — user_2fa_log sem RLS/REVOKE.
--
-- A tabela registra tentativas de verificação 2FA (user_id, sucesso, IP,
-- user-agent). Varredura em src/ e supabase/functions/: ZERO acesso via
-- PostgREST; a única leitura é a RPC SECURITY DEFINER
-- check_2fa_failed_attempts e a limpeza de 90 dias (stored_procedures),
-- que executam como owner e não dependem de grant/RLS do invocador.
--
-- Padrão idêntico ao de 20260902221500 (deny-all por ausência de policy,
-- sem GRANT SELECT para ninguém): ENABLE RLS (sem FORCE, preserva
-- owner/DEFINER) + REVOKE de PUBLIC/anon/authenticated. A tabela usa PK
-- UUID (uuid_generate_v4), então não há sequence associada para revogar.
--
-- Idempotente; a asserção final impede "verde vazio".

SET lock_timeout = '3s';
SET statement_timeout = '30s';

DO $$
BEGIN
  IF to_regclass('public.user_2fa_log') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.user_2fa_log ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON TABLE public.user_2fa_log FROM PUBLIC, anon, authenticated';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.user_2fa_log') IS NOT NULL
     AND NOT (SELECT relrowsecurity FROM pg_class WHERE oid = to_regclass('public.user_2fa_log')) THEN
    RAISE EXCEPTION 'RLS não habilitada em public.user_2fa_log';
  END IF;
END $$;
