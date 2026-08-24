
CREATE TABLE public.dialer_queues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  filter jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority_strategy text NOT NULL DEFAULT 'hybrid' CHECK (priority_strategy IN ('score','recency','send_time','hybrid')),
  is_active boolean NOT NULL DEFAULT true,
  last_built_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dialer_queues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own queues" ON public.dialer_queues FOR SELECT
  USING (owner_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
CREATE POLICY "Owners manage own queues" ON public.dialer_queues FOR ALL
  USING (owner_id = auth.uid() OR has_role(auth.uid(),'admin'))
  WITH CHECK (owner_id = auth.uid() OR has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_dialer_queues_updated BEFORE UPDATE ON public.dialer_queues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.dialer_queue_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid NOT NULL REFERENCES public.dialer_queues(id) ON DELETE CASCADE,
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  score numeric NOT NULL DEFAULT 0,
  queue_position integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','calling','done','skipped','snoozed')),
  snooze_until timestamptz,
  added_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (queue_id, sale_id)
);

CREATE INDEX idx_dialer_queue_items_queue_status_pos
  ON public.dialer_queue_items(queue_id, status, queue_position);

ALTER TABLE public.dialer_queue_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View items via queue ownership" ON public.dialer_queue_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.dialer_queues q WHERE q.id = queue_id
    AND (q.owner_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'))));
CREATE POLICY "Manage items via queue ownership" ON public.dialer_queue_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.dialer_queues q WHERE q.id = queue_id
    AND (q.owner_id = auth.uid() OR has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.dialer_queues q WHERE q.id = queue_id
    AND (q.owner_id = auth.uid() OR has_role(auth.uid(),'admin'))));

CREATE TABLE public.call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
  queue_item_id uuid REFERENCES public.dialer_queue_items(id) ON DELETE SET NULL,
  disposition text NOT NULL CHECK (disposition IN ('connected','voicemail','no_answer','busy','wrong_number','do_not_call')),
  outcome text CHECK (outcome IN ('meeting_set','interested','not_interested','callback','nurture')),
  duration_seconds integer DEFAULT 0,
  notes text,
  next_action_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_call_logs_owner_created ON public.call_logs(owner_id, created_at DESC);
CREATE INDEX idx_call_logs_sale ON public.call_logs(sale_id, created_at DESC);

ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View call logs" ON public.call_logs FOR SELECT
  USING (owner_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
CREATE POLICY "Insert own call logs" ON public.call_logs FOR INSERT
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Update own call logs" ON public.call_logs FOR UPDATE
  USING (owner_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "Delete own call logs" ON public.call_logs FOR DELETE
  USING (owner_id = auth.uid() OR has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.next_dialer_item(_queue_id uuid)
RETURNS TABLE(item_id uuid, sale_id uuid, score numeric, queue_position integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_item_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.dialer_queues q WHERE q.id = _queue_id
    AND (q.owner_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'))) THEN
    RAISE EXCEPTION 'Not authorized for queue %', _queue_id;
  END IF;

  SELECT i.id INTO v_item_id FROM public.dialer_queue_items i
  WHERE i.queue_id = _queue_id AND i.status = 'pending'
    AND (i.snooze_until IS NULL OR i.snooze_until <= now())
  ORDER BY i.queue_position ASC, i.score DESC
  LIMIT 1 FOR UPDATE SKIP LOCKED;

  IF v_item_id IS NULL THEN RETURN; END IF;

  UPDATE public.dialer_queue_items SET status = 'calling' WHERE id = v_item_id;

  RETURN QUERY SELECT i.id, i.sale_id, i.score, i.queue_position
    FROM public.dialer_queue_items i WHERE i.id = v_item_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_dialer_queue_stats(_queue_id uuid)
RETURNS TABLE(pending_count integer, calling_count integer, done_count integer, skipped_count integer, snoozed_count integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*) FILTER (WHERE status='pending')::int,
    COUNT(*) FILTER (WHERE status='calling')::int,
    COUNT(*) FILTER (WHERE status='done')::int,
    COUNT(*) FILTER (WHERE status='skipped')::int,
    COUNT(*) FILTER (WHERE status='snoozed')::int
  FROM public.dialer_queue_items WHERE queue_id = _queue_id;
$$;
