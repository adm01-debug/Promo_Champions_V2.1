-- RLS: policy explícita de negação para 2 tabelas com RLS ligada e zero policies.
--
-- Achado: lint `rls_no_policies` (snapshot do banco oficial, docs/contexto/supabase/lints.md,
-- gerado 2026-11-12T13:05Z) em public.daily_challenge_rotations e public.geocode_cache.
-- Ambas só são usadas por edge functions com service_role (que ignora RLS):
--   - rotate-daily-challenges/index.ts:61,115 → daily_challenge_rotations
--   - geocode-proxy/index.ts:124,156          → geocode_cache
-- Sem efeito em comportamento: RLS sem policy já nega tudo a anon/authenticated; a policy só
-- torna a intenção explícita. Mesmo padrão de _internal_secrets
-- (20260715184427_8e4ec70a-caf2-4a8d-9042-e26e29fa3a54.sql).

CREATE POLICY "Deny all access to daily_challenge_rotations"
  ON public.daily_challenge_rotations
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny all access to geocode_cache"
  ON public.geocode_cache
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
