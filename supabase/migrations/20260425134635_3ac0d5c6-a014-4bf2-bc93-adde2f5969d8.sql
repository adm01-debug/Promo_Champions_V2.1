
-- Enums
CREATE TYPE public.integration_kind AS ENUM ('database','bitrix24','n8n','mcp','webhook','other');
CREATE TYPE public.integration_source AS ENUM ('db','env','secret');
CREATE TYPE public.integration_health_status AS ENUM ('success','failure','degraded','pending');
CREATE TYPE public.integration_trigger AS ENUM ('manual','auto');

-- Connections
CREATE TABLE public.integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.integration_kind NOT NULL,
  label TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  secret_refs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  source public.integration_source NOT NULL DEFAULT 'db',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_integration_connections_kind ON public.integration_connections(kind);
CREATE INDEX idx_integration_connections_enabled ON public.integration_connections(enabled);

-- Health checks
CREATE TABLE public.integration_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.integration_connections(id) ON DELETE CASCADE,
  status public.integration_health_status NOT NULL,
  latency_ms INTEGER,
  error TEXT,
  details JSONB,
  triggered_by public.integration_trigger NOT NULL DEFAULT 'manual',
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_health_conn_time ON public.integration_health_checks(connection_id, checked_at DESC);

-- Settings (singleton)
CREATE TABLE public.integration_autotest_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE,
  interval_minutes INTEGER NOT NULL DEFAULT 60 CHECK (interval_minutes BETWEEN 5 AND 1440),
  failure_window_minutes INTEGER NOT NULL DEFAULT 15 CHECK (failure_window_minutes BETWEEN 1 AND 240),
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.integration_autotest_settings (singleton) VALUES (true);

-- Jobs history
CREATE TABLE public.integration_autotest_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  total INTEGER DEFAULT 0,
  succeeded INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  results JSONB
);
CREATE INDEX idx_autotest_jobs_started ON public.integration_autotest_jobs(started_at DESC);

-- updated_at triggers
CREATE TRIGGER trg_integration_connections_updated
BEFORE UPDATE ON public.integration_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_integration_autotest_settings_updated
BEFORE UPDATE ON public.integration_autotest_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_autotest_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_autotest_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage connections" ON public.integration_connections
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "admins read health" ON public.integration_health_checks
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins write health" ON public.integration_health_checks
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "admins manage autotest settings" ON public.integration_autotest_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "admins manage autotest jobs" ON public.integration_autotest_jobs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
