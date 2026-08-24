CREATE TABLE public.ranking_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  total_sales NUMERIC NOT NULL DEFAULT 0,
  gap_to_first NUMERIC NOT NULL DEFAULT 0,
  gap_to_next NUMERIC NOT NULL DEFAULT 0,
  next_competitor_name TEXT,
  period_start DATE NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (salesperson_id, period_start)
);

CREATE INDEX idx_ranking_notif_salesperson ON public.ranking_notifications(salesperson_id, created_at DESC);
CREATE INDEX idx_ranking_notif_unread ON public.ranking_notifications(salesperson_id) WHERE read_at IS NULL;

ALTER TABLE public.ranking_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salesperson reads own ranking notifications"
ON public.ranking_notifications FOR SELECT
TO authenticated
USING (
  salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Salesperson updates own ranking notifications"
ON public.ranking_notifications FOR UPDATE
TO authenticated
USING (
  salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Admin manager insert ranking notifications"
ON public.ranking_notifications FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Admin manager delete ranking notifications"
ON public.ranking_notifications FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'manager'::app_role)
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.ranking_notifications;
ALTER TABLE public.ranking_notifications REPLICA IDENTITY FULL;