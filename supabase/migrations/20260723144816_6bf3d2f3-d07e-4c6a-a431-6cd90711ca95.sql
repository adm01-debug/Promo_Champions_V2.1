
CREATE TABLE public.auto_task_queue_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  cutoff_time TIME NOT NULL DEFAULT '09:00',
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  min_urgency TEXT NOT NULL DEFAULT 'high' CHECK (min_urgency IN ('critical','high','medium')),
  max_tasks_per_salesperson INTEGER NOT NULL DEFAULT 5 CHECK (max_tasks_per_salesperson BETWEEN 1 AND 50),
  last_run_date DATE,
  last_run_created_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.auto_task_queue_settings TO authenticated;
GRANT ALL ON public.auto_task_queue_settings TO service_role;

ALTER TABLE public.auto_task_queue_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auto_task_queue_settings_read_auth"
ON public.auto_task_queue_settings FOR SELECT
TO authenticated USING (true);

CREATE POLICY "auto_task_queue_settings_admin_write"
ON public.auto_task_queue_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_auto_task_queue_settings_updated_at
BEFORE UPDATE ON public.auto_task_queue_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.auto_task_queue_settings (singleton) VALUES (true);
