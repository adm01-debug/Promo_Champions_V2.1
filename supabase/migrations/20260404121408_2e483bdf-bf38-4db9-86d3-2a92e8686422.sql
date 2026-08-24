
CREATE TABLE public.page_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE,
  route TEXT NOT NULL,
  page_title TEXT,
  duration_seconds INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 0,
  session_id TEXT,
  device_type TEXT DEFAULT 'desktop',
  referrer_route TEXT,
  entered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  exited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own analytics"
ON public.page_analytics FOR INSERT TO authenticated
WITH CHECK (
  salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Users can view own analytics"
ON public.page_analytics FOR SELECT TO authenticated
USING (
  salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Users can update own analytics"
ON public.page_analytics FOR UPDATE TO authenticated
USING (
  salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid())
);

CREATE INDEX idx_page_analytics_salesperson ON public.page_analytics(salesperson_id);
CREATE INDEX idx_page_analytics_route ON public.page_analytics(route);
CREATE INDEX idx_page_analytics_entered ON public.page_analytics(entered_at DESC);
CREATE INDEX idx_page_analytics_salesperson_route ON public.page_analytics(salesperson_id, route, entered_at DESC);
