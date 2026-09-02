-- Follow-up to 20260902120000_revoke_anon_truncate_and_fix_battle_score.sql.
-- Adversarial DB validation (5-agent review, 2026-09-02) found two real gaps:
-- 1. REVOKE TRUNCATE only touched existing tables; ALTER DEFAULT PRIVILEGES for
--    role `postgres` in schema public still granted TRUNCATE to anon/authenticated,
--    so any future table silently reintroduced the excess privilege.
-- 2. sync_battle_score() is SECURITY DEFINER without a pinned search_path,
--    diverging from this project's own hardening convention (see
--    20260831130000_harden_public_access_and_privileged_rpcs.sql).

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE TRUNCATE ON TABLES FROM anon, authenticated;

ALTER FUNCTION public.sync_battle_score() SET search_path = public, pg_temp;
