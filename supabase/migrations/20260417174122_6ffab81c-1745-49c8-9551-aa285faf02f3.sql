CREATE TABLE public.email_engagement_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL UNIQUE REFERENCES public.sales(id) ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  tier TEXT NOT NULL DEFAULT 'cold' CHECK (tier IN ('cold','warm','hot','champion')),
  open_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  click_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  reply_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_response_minutes INT,
  recency_days INT,
  total_sent INT NOT NULL DEFAULT 0,
  total_opens INT NOT NULL DEFAULT 0,
  total_clicks INT NOT NULL DEFAULT 0,
  total_replies INT NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ees_score ON public.email_engagement_scores(score DESC);
CREATE INDEX idx_ees_tier ON public.email_engagement_scores(tier);

ALTER TABLE public.email_engagement_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own engagement scores"
ON public.email_engagement_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sales s
    JOIN public.salespeople sp ON sp.id = s.salesperson_id
    WHERE s.id = email_engagement_scores.sale_id
      AND sp.auth_user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins manage engagement scores"
ON public.email_engagement_scores FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.email_engagement_score_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  score INT NOT NULL,
  tier TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_eesh_sale_date ON public.email_engagement_score_history(sale_id, captured_at DESC);

ALTER TABLE public.email_engagement_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own engagement history"
ON public.email_engagement_score_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sales s
    JOIN public.salespeople sp ON sp.id = s.salesperson_id
    WHERE s.id = email_engagement_score_history.sale_id
      AND sp.auth_user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE OR REPLACE FUNCTION public.snapshot_engagement_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (OLD.score IS DISTINCT FROM NEW.score) OR (OLD.tier IS DISTINCT FROM NEW.tier) THEN
    INSERT INTO public.email_engagement_score_history(sale_id, score, tier)
    VALUES (NEW.sale_id, NEW.score, NEW.tier);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_snapshot_engagement_score
AFTER INSERT OR UPDATE ON public.email_engagement_scores
FOR EACH ROW EXECUTE FUNCTION public.snapshot_engagement_score();

CREATE OR REPLACE FUNCTION public.get_engagement_leaderboard(_limit INT DEFAULT 20)
RETURNS TABLE (
  sale_id UUID,
  client_name TEXT,
  score INT,
  tier TEXT,
  open_rate NUMERIC,
  click_rate NUMERIC,
  reply_rate NUMERIC,
  total_sent INT,
  recency_days INT,
  salesperson_id UUID
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    e.sale_id,
    s.client_name,
    e.score,
    e.tier,
    e.open_rate,
    e.click_rate,
    e.reply_rate,
    e.total_sent,
    e.recency_days,
    s.salesperson_id
  FROM public.email_engagement_scores e
  JOIN public.sales s ON s.id = e.sale_id
  LEFT JOIN public.salespeople sp ON sp.id = s.salesperson_id
  WHERE 
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR sp.auth_user_id = auth.uid()
  ORDER BY e.score DESC, e.last_calculated_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 100));
$$;