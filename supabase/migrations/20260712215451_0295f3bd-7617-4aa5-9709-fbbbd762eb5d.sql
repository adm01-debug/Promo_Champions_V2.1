
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'access_denied_logs','bitrix24_sync_logs','duplicate_block_logs','email_tracking_events',
    'error_logs','geo_access_logs','integration_logs','login_attempts',
    'mfa_verification_attempts','page_analytics','query_telemetry','quote_sync_inbound_log',
    'rate_limit_logs','web_vitals_samples','webhook_inbound_dedupe','webhook_inbound_log'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'ALTER TABLE public.%I SET (
         autovacuum_vacuum_scale_factor = 0.02,
         autovacuum_analyze_scale_factor = 0.02,
         autovacuum_vacuum_threshold = 500,
         autovacuum_analyze_threshold = 500,
         autovacuum_vacuum_cost_delay = 2
       )', tbl
    );
  END LOOP;
END $$;

INSERT INTO public.maintenance_log (job_name, started_at, completed_at, status, rows_affected, metadata)
VALUES (
  'autovacuum_tuning_g4',
  now(), now(), 'completed', 16,
  jsonb_build_object(
    'reason', 'Ajuste agressivo do autovacuum em 16 tabelas de log/telemetria',
    'scale_factor', 0.02,
    'threshold', 500,
    'cost_delay_ms', 2,
    'tables', ARRAY[
      'access_denied_logs','bitrix24_sync_logs','duplicate_block_logs','email_tracking_events',
      'error_logs','geo_access_logs','integration_logs','login_attempts',
      'mfa_verification_attempts','page_analytics','query_telemetry','quote_sync_inbound_log',
      'rate_limit_logs','web_vitals_samples','webhook_inbound_dedupe','webhook_inbound_log'
    ]
  )
);
