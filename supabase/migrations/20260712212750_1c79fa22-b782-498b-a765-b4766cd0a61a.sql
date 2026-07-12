
CREATE OR REPLACE FUNCTION public.reset_pg_stat_statements_weekly()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  PERFORM pg_stat_statements_reset();
END;
$$;

REVOKE ALL ON FUNCTION public.reset_pg_stat_statements_weekly() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_pg_stat_statements_weekly() TO service_role;

DO $$
BEGIN
  PERFORM cron.unschedule('reset-pg-stat-statements-weekly')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'reset-pg-stat-statements-weekly');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'reset-pg-stat-statements-weekly',
  '0 4 * * 1',
  $$SELECT public.reset_pg_stat_statements_weekly();$$
);
