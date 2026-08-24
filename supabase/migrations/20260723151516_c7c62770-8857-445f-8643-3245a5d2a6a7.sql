ALTER TABLE public.churn_alert_settings
  ADD COLUMN IF NOT EXISTS auto_task_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_task_min_level TEXT NOT NULL DEFAULT 'high' CHECK (auto_task_min_level IN ('medium','high','critical')),
  ADD COLUMN IF NOT EXISTS auto_task_cooldown_hours INTEGER NOT NULL DEFAULT 48 CHECK (auto_task_cooldown_hours BETWEEN 1 AND 720),
  ADD COLUMN IF NOT EXISTS auto_task_priority TEXT NOT NULL DEFAULT 'high' CHECK (auto_task_priority IN ('low','medium','high','urgent')),
  ADD COLUMN IF NOT EXISTS auto_task_due_in_days INTEGER NOT NULL DEFAULT 1 CHECK (auto_task_due_in_days BETWEEN 0 AND 30);

ALTER TABLE public.client_churn_alerts_state
  ADD COLUMN IF NOT EXISTS last_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_task_created_at TIMESTAMPTZ;