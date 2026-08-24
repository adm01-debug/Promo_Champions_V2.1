
-- 1. Kudos (Wall of Fame)
CREATE TABLE public.kudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  to_salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  kudos_type TEXT NOT NULL DEFAULT 'recognition',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view kudos" ON public.kudos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can send kudos" ON public.kudos FOR INSERT TO authenticated WITH CHECK (from_salesperson_id = public.get_current_salesperson_id());
CREATE POLICY "Admins can update kudos" ON public.kudos FOR UPDATE TO authenticated USING (public.is_admin_or_manager(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.kudos;
