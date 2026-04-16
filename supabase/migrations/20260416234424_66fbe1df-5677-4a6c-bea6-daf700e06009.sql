-- =========================================
-- Custom Reports
-- =========================================
CREATE TABLE public.custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  entity TEXT NOT NULL CHECK (entity IN ('sales','accounts','activities','leads','salespeople','clients','cross')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_custom_reports_owner ON public.custom_reports(owner_id);
CREATE INDEX idx_custom_reports_shared ON public.custom_reports(is_shared) WHERE is_shared = true;

ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_full_access" ON public.custom_reports
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  WITH CHECK (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "shared_select" ON public.custom_reports
  FOR SELECT TO authenticated
  USING (is_shared = true);

CREATE TRIGGER update_custom_reports_updated_at
  BEFORE UPDATE ON public.custom_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Report Schedules
-- =========================================
CREATE TABLE public.report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.custom_reports(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily','weekly','monthly')),
  day_of_week SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),
  day_of_month SMALLINT CHECK (day_of_month BETWEEN 1 AND 31),
  time_of_day TIME NOT NULL DEFAULT '08:00',
  recipients TEXT[] NOT NULL DEFAULT '{}',
  format TEXT NOT NULL DEFAULT 'csv' CHECK (format IN ('csv','xlsx','pdf')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_report_schedules_report ON public.report_schedules(report_id);
CREATE INDEX idx_report_schedules_next_run ON public.report_schedules(next_run_at) WHERE is_active = true;

ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_full_access" ON public.report_schedules
  FOR ALL TO authenticated
  USING (created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  WITH CHECK (created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE TRIGGER update_report_schedules_updated_at
  BEFORE UPDATE ON public.report_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Report Executions
-- =========================================
CREATE TABLE public.report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.report_schedules(id) ON DELETE SET NULL,
  report_id UUID NOT NULL REFERENCES public.custom_reports(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','success','failed')),
  file_url TEXT,
  recipients_sent TEXT[] DEFAULT '{}',
  error_message TEXT,
  rows_count INTEGER,
  duration_ms INTEGER
);

CREATE INDEX idx_report_executions_report ON public.report_executions(report_id, executed_at DESC);
CREATE INDEX idx_report_executions_schedule ON public.report_executions(schedule_id, executed_at DESC);

ALTER TABLE public.report_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "report_owner_view" ON public.report_executions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_reports r
      WHERE r.id = report_executions.report_id
        AND (r.owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()))
    )
  );

-- =========================================
-- Embedded Report Tokens
-- =========================================
CREATE TABLE public.embedded_report_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.custom_reports(id) ON DELETE CASCADE,
  public_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ,
  allowed_domains TEXT[] DEFAULT '{}',
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_embedded_tokens_report ON public.embedded_report_tokens(report_id);
CREATE INDEX idx_embedded_tokens_token ON public.embedded_report_tokens(public_token);

ALTER TABLE public.embedded_report_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_full_access_tokens" ON public.embedded_report_tokens
  FOR ALL TO authenticated
  USING (created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  WITH CHECK (created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()));

-- =========================================
-- Cohort Analyses
-- =========================================
CREATE TABLE public.cohort_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cohort_field TEXT NOT NULL DEFAULT 'created_at',
  metric_field TEXT NOT NULL DEFAULT 'amount',
  period_type TEXT NOT NULL DEFAULT 'month' CHECK (period_type IN ('week','month','quarter')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cohort_analyses_owner ON public.cohort_analyses(owner_id);

ALTER TABLE public.cohort_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_full_access_cohorts" ON public.cohort_analyses
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  WITH CHECK (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE TRIGGER update_cohort_analyses_updated_at
  BEFORE UPDATE ON public.cohort_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Storage bucket for report exports
-- =========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-exports', 'report-exports', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "report_owners_can_read_exports"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'report-exports' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin_or_manager(auth.uid())));

CREATE POLICY "service_role_can_write_exports"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'report-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =========================================
-- RPC: get_embedded_report_by_token
-- Public access (called from edge function with anon)
-- =========================================
CREATE OR REPLACE FUNCTION public.get_embedded_report_by_token(_token UUID)
RETURNS TABLE(
  report_id UUID,
  report_name TEXT,
  report_entity TEXT,
  report_config JSONB,
  is_valid BOOLEAN,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _t RECORD;
  _r RECORD;
BEGIN
  SELECT * INTO _t FROM public.embedded_report_tokens WHERE public_token = _token AND is_active = true;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::JSONB, false, 'Token inválido';
    RETURN;
  END IF;
  IF _t.expires_at IS NOT NULL AND _t.expires_at < now() THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::JSONB, false, 'Token expirado';
    RETURN;
  END IF;
  SELECT * INTO _r FROM public.custom_reports WHERE id = _t.report_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::JSONB, false, 'Relatório removido';
    RETURN;
  END IF;
  -- Track view
  UPDATE public.embedded_report_tokens
    SET view_count = view_count + 1, last_viewed_at = now()
    WHERE id = _t.id;
  RETURN QUERY SELECT _r.id, _r.name, _r.entity, _r.config, true, NULL::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_embedded_report_by_token(UUID) TO anon, authenticated;

-- =========================================
-- RPC: compute_cohort_retention
-- =========================================
CREATE OR REPLACE FUNCTION public.compute_cohort_retention(_cohort_id UUID, _periods INT DEFAULT 12)
RETURNS TABLE(cohort_period TEXT, period_offset INT, customers INT, retention_pct NUMERIC)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _c RECORD;
  _trunc TEXT;
BEGIN
  SELECT * INTO _c FROM public.cohort_analyses
    WHERE id = _cohort_id AND (owner_id = auth.uid() OR is_admin_or_manager(auth.uid()));
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cohort não encontrado ou sem permissão';
  END IF;

  _trunc := CASE _c.period_type
    WHEN 'week' THEN 'week'
    WHEN 'quarter' THEN 'quarter'
    ELSE 'month'
  END;

  RETURN QUERY EXECUTE format($f$
    WITH cohorts AS (
      SELECT
        client_name,
        date_trunc(%L, MIN(created_at)) AS first_period
      FROM public.sales
      WHERE status = 'completed'
      GROUP BY client_name
    ),
    activity AS (
      SELECT
        c.first_period,
        date_trunc(%L, s.created_at) AS active_period,
        s.client_name
      FROM cohorts c
      JOIN public.sales s ON s.client_name = c.client_name
      WHERE s.status = 'completed'
    ),
    cohort_size AS (
      SELECT first_period, COUNT(DISTINCT client_name)::INT AS total
      FROM cohorts GROUP BY first_period
    )
    SELECT
      to_char(a.first_period, 'YYYY-MM-DD') AS cohort_period,
      EXTRACT(epoch FROM (a.active_period - a.first_period))::INT / CASE %L WHEN 'week' THEN 604800 WHEN 'quarter' THEN 7776000 ELSE 2592000 END AS period_offset,
      COUNT(DISTINCT a.client_name)::INT AS customers,
      ROUND(100.0 * COUNT(DISTINCT a.client_name)::NUMERIC / NULLIF(cs.total,0), 1) AS retention_pct
    FROM activity a
    JOIN cohort_size cs ON cs.first_period = a.first_period
    WHERE a.first_period >= now() - ($1 * INTERVAL '1 month')
    GROUP BY a.first_period, a.active_period, cs.total
    ORDER BY a.first_period DESC, period_offset ASC
  $f$, _trunc, _trunc, _trunc) USING _periods;
END;
$$;

GRANT EXECUTE ON FUNCTION public.compute_cohort_retention(UUID, INT) TO authenticated;