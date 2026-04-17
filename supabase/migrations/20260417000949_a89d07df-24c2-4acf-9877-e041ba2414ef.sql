
-- ============ scheduled_reports ============
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL DEFAULT auth.uid(),
  report_id UUID NOT NULL REFERENCES public.custom_reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily','weekly','monthly')),
  hour_of_day INTEGER NOT NULL DEFAULT 8 CHECK (hour_of_day BETWEEN 0 AND 23),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 28),
  recipients TEXT[] NOT NULL DEFAULT '{}',
  format TEXT NOT NULL DEFAULT 'csv' CHECK (format IN ('csv','json')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sched_reports_next_run ON public.scheduled_reports(next_run_at) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_sched_reports_created_by ON public.scheduled_reports(created_by);

ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner or manager can view scheduled_reports"
  ON public.scheduled_reports FOR SELECT
  USING (created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "owner can insert scheduled_reports"
  ON public.scheduled_reports FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "owner or manager can update scheduled_reports"
  ON public.scheduled_reports FOR UPDATE
  USING (created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "owner or manager can delete scheduled_reports"
  ON public.scheduled_reports FOR DELETE
  USING (created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()));

-- ============ next_run computation ============
CREATE OR REPLACE FUNCTION public.compute_scheduled_report_next_run()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base TIMESTAMPTZ;
  candidate TIMESTAMPTZ;
BEGIN
  base := COALESCE(NEW.last_run_at, now());
  IF NEW.frequency = 'daily' THEN
    candidate := date_trunc('day', now()) + (NEW.hour_of_day || ' hours')::interval;
    IF candidate <= now() THEN
      candidate := candidate + interval '1 day';
    END IF;
  ELSIF NEW.frequency = 'weekly' THEN
    candidate := date_trunc('day', now()) + (NEW.hour_of_day || ' hours')::interval;
    -- avança até bater no day_of_week (default 1 = segunda)
    WHILE EXTRACT(DOW FROM candidate)::INT <> COALESCE(NEW.day_of_week, 1) OR candidate <= now() LOOP
      candidate := candidate + interval '1 day';
    END LOOP;
  ELSE -- monthly
    candidate := date_trunc('month', now())
                 + ((COALESCE(NEW.day_of_month, 1) - 1) || ' days')::interval
                 + (NEW.hour_of_day || ' hours')::interval;
    IF candidate <= now() THEN
      candidate := candidate + interval '1 month';
    END IF;
  END IF;
  NEW.next_run_at := candidate;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_compute_next_run
  BEFORE INSERT OR UPDATE OF frequency, hour_of_day, day_of_week, day_of_month, last_run_at, enabled
  ON public.scheduled_reports
  FOR EACH ROW EXECUTE FUNCTION public.compute_scheduled_report_next_run();

-- ============ scheduled_report_runs ============
CREATE TABLE IF NOT EXISTS public.scheduled_report_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.scheduled_reports(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running','success','failed')),
  rows_count INTEGER,
  file_path TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_sched_runs_schedule ON public.scheduled_report_runs(schedule_id, started_at DESC);

ALTER TABLE public.scheduled_report_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner or manager can view scheduled_report_runs"
  ON public.scheduled_report_runs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.scheduled_reports sr
            WHERE sr.id = scheduled_report_runs.schedule_id
              AND (sr.created_by = auth.uid() OR public.is_admin_or_manager(auth.uid())))
  );

-- inserts/updates only via service role (edge function bypasses RLS)

-- ============ storage bucket ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-snapshots', 'report-snapshots', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "owner can read own report snapshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'report-snapshots'
    AND (
      public.is_admin_or_manager(auth.uid())
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- ============ pg_cron + pg_net for runner ============
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
