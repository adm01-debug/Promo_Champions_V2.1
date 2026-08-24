
-- Performance indexes for query_telemetry dashboard
CREATE INDEX IF NOT EXISTS idx_query_telemetry_created_at ON public.query_telemetry (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_telemetry_severity ON public.query_telemetry (severity);
CREATE INDEX IF NOT EXISTS idx_query_telemetry_table ON public.query_telemetry (table_name);
