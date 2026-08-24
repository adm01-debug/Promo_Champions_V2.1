
-- Onda D — Security & RLS Hardening

-- 1) _internal_secrets: RLS enabled but no policy. Add explicit deny-all for anon/authenticated.
--    Service role bypasses RLS, so edge functions retain access.
CREATE POLICY "Deny all access to _internal_secrets"
  ON public._internal_secrets
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- 2) Set immutable search_path on the two cron helper functions
CREATE OR REPLACE FUNCTION public.fn_cron_expected_interval(_schedule text)
  RETURNS interval
  LANGUAGE sql
  IMMUTABLE
  SET search_path = public
AS $$
  SELECT CASE
    WHEN _schedule LIKE '*/5 * * * *'  THEN interval '5 minutes'
    WHEN _schedule LIKE '*/10 * * * *' THEN interval '10 minutes'
    WHEN _schedule LIKE '*/15 * * * *' THEN interval '15 minutes'
    WHEN _schedule LIKE '*/30 * * * *' THEN interval '30 minutes'
    WHEN _schedule ~ '^[0-9]+ \* \* \* \*$'         THEN interval '1 hour'
    WHEN _schedule ~ '^[0-9]+ [0-9]+ \* \* \*$'     THEN interval '1 day'
    WHEN _schedule ~ '^[0-9]+ [0-9]+ \* \* [0-9]$'  THEN interval '7 days'
    ELSE interval '1 day'
  END;
$$;

CREATE OR REPLACE FUNCTION public.fn_cron_stalled_threshold(_schedule text)
  RETURNS interval
  LANGUAGE sql
  IMMUTABLE
  SET search_path = public
AS $$
  SELECT GREATEST(
    interval '30 minutes',
    LEAST(interval '25 hours', public.fn_cron_expected_interval(_schedule) * 2)
  );
$$;

-- 3) Materialized view exposed in Data API: revoke from anon/authenticated.
--    Access should go through a security_invoker view or RPC if needed by the app.
REVOKE ALL ON public.mv_competitive_ranking FROM anon, authenticated;
