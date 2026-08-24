
-- Rank change notifications for overtake alerts
CREATE TABLE public.rank_change_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE NOT NULL,
  overtaken_by_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE NOT NULL,
  old_rank INTEGER NOT NULL,
  new_rank INTEGER NOT NULL,
  context TEXT DEFAULT 'monthly',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rank_change_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can read rank notifications"
  ON public.rank_change_notifications FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "System can insert rank notifications"
  ON public.rank_change_notifications FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.rank_change_notifications FOR UPDATE
  TO authenticated USING (
    salesperson_id = public.get_current_salesperson_id()
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rank_change_notifications;
