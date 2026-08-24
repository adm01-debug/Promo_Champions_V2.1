-- 1) Tabela principal
CREATE TABLE public.call_critical_moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  salesperson_id uuid NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  moment_type text NOT NULL CHECK (moment_type IN ('objection','buying_signal','price_mention','discount_request','churn_signal','competitor','commitment','next_step')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  timestamp_sec integer NOT NULL DEFAULT 0,
  quote text,
  context text,
  suggested_action text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','acknowledged','actioned','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ccm_owner_status_sev ON public.call_critical_moments (owner_id, status, severity, created_at DESC);
CREATE INDEX idx_ccm_recording ON public.call_critical_moments (recording_id, timestamp_sec);

ALTER TABLE public.call_critical_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ccm_owner_read" ON public.call_critical_moments
  FOR SELECT USING (owner_id = auth.uid() OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ccm_owner_update" ON public.call_critical_moments
  FOR UPDATE USING (owner_id = auth.uid() OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ccm_system_insert" ON public.call_critical_moments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "ccm_admin_delete" ON public.call_critical_moments
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role) OR owner_id = auth.uid());

CREATE TRIGGER trg_ccm_updated_at
  BEFORE UPDATE ON public.call_critical_moments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Notificações
CREATE TABLE public.critical_moment_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.call_critical_moments(id) ON DELETE CASCADE,
  recipient_user_id uuid NOT NULL,
  delivered boolean NOT NULL DEFAULT true,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cmn_recipient ON public.critical_moment_notifications (recipient_user_id, read_at, created_at DESC);

ALTER TABLE public.critical_moment_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cmn_recipient_read" ON public.critical_moment_notifications
  FOR SELECT USING (recipient_user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "cmn_recipient_update" ON public.critical_moment_notifications
  FOR UPDATE USING (recipient_user_id = auth.uid());

CREATE POLICY "cmn_system_insert" ON public.critical_moment_notifications
  FOR INSERT WITH CHECK (true);

-- 3) Trigger de notificação automática
CREATE OR REPLACE FUNCTION public.notify_critical_moment_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  manager_record RECORD;
BEGIN
  IF NEW.severity NOT IN ('high','critical') THEN
    RETURN NEW;
  END IF;

  -- Notifica o próprio vendedor (owner)
  INSERT INTO public.critical_moment_notifications (moment_id, recipient_user_id)
  VALUES (NEW.id, NEW.owner_id);

  -- Notifica todos os managers e admins ativos
  FOR manager_record IN
    SELECT DISTINCT ur.user_id
    FROM public.user_roles ur
    WHERE ur.role IN ('manager'::app_role, 'admin'::app_role)
      AND ur.user_id <> NEW.owner_id
  LOOP
    INSERT INTO public.critical_moment_notifications (moment_id, recipient_user_id)
    VALUES (NEW.id, manager_record.user_id);
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_critical_moment
  AFTER INSERT ON public.call_critical_moments
  FOR EACH ROW EXECUTE FUNCTION public.notify_critical_moment_created();

-- 4) Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_critical_moments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.critical_moment_notifications;
ALTER TABLE public.call_critical_moments REPLICA IDENTITY FULL;
ALTER TABLE public.critical_moment_notifications REPLICA IDENTITY FULL;