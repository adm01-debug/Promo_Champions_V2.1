-- Robust notifications module
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  message text,
  icon text,
  action_url text,
  action_label text,
  metadata jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  archived_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notifications_priority_check CHECK (priority IN ('low','medium','high','critical')),
  CONSTRAINT notifications_category_check CHECK (category IN ('general','sales','goals','gamification','security','system','team','ai','approval'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications (user_id, category, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_delete_own"
ON public.notifications FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_own_or_admin"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Helper RPC: mark all as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_count integer;
BEGIN
  UPDATE public.notifications
  SET read_at = now()
  WHERE user_id = auth.uid() AND read_at IS NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Helper RPC: send notification (admin/manager or self)
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text DEFAULT NULL,
  p_category text DEFAULT 'general',
  p_priority text DEFAULT 'medium',
  p_action_url text DEFAULT NULL,
  p_action_label text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() != p_user_id AND NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to send notification to other users';
  END IF;
  INSERT INTO public.notifications (user_id, type, title, message, category, priority, action_url, action_label, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_category, p_priority, p_action_url, p_action_label, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;