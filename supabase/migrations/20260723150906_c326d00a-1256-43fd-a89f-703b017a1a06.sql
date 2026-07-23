ALTER TABLE public.client_churn_alerts_state
  ADD COLUMN IF NOT EXISTS last_expected_interval_days integer,
  ADD COLUMN IF NOT EXISTS last_threshold_days integer;