
CREATE TABLE public.lead_score_explanations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  score integer NOT NULL,
  baseline_score numeric NOT NULL DEFAULT 0,
  top_drivers jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  narrative text,
  model_version text NOT NULL DEFAULT 'v1',
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sale_id)
);

CREATE INDEX idx_lead_score_explanations_sale ON public.lead_score_explanations(sale_id);
CREATE INDEX idx_lead_score_explanations_calculated ON public.lead_score_explanations(calculated_at DESC);

ALTER TABLE public.lead_score_explanations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salespeople view own deal explanations"
ON public.lead_score_explanations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sales s
    JOIN public.salespeople sp ON sp.id = s.salesperson_id
    WHERE s.id = lead_score_explanations.sale_id
      AND sp.auth_user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Service role manages explanations"
ON public.lead_score_explanations FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins manage explanations"
ON public.lead_score_explanations FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.lead_score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  score integer NOT NULL,
  factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_score_history_sale_time ON public.lead_score_history(sale_id, recorded_at DESC);

ALTER TABLE public.lead_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salespeople view own deal history"
ON public.lead_score_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sales s
    JOIN public.salespeople sp ON sp.id = s.salesperson_id
    WHERE s.id = lead_score_history.sale_id
      AND sp.auth_user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Service role inserts history"
ON public.lead_score_history FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.record_lead_score_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (NEW.score IS DISTINCT FROM OLD.score) THEN
    INSERT INTO public.lead_score_history(sale_id, score, factors, recorded_at)
    VALUES (NEW.sale_id, NEW.score, COALESCE(NEW.factors, '{}'::jsonb), now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_scores_history ON public.lead_scores;
CREATE TRIGGER trg_lead_scores_history
AFTER INSERT OR UPDATE OF score ON public.lead_scores
FOR EACH ROW EXECUTE FUNCTION public.record_lead_score_history();

CREATE OR REPLACE FUNCTION public.get_score_trend(_sale_id uuid, _days integer DEFAULT 30)
RETURNS TABLE(recorded_at timestamptz, score integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT h.recorded_at, h.score
  FROM public.lead_score_history h
  WHERE h.sale_id = _sale_id
    AND h.recorded_at >= now() - (_days || ' days')::interval
    AND (
      EXISTS (
        SELECT 1 FROM public.sales s
        JOIN public.salespeople sp ON sp.id = s.salesperson_id
        WHERE s.id = _sale_id AND sp.auth_user_id = auth.uid()
      )
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'manager')
    )
  ORDER BY h.recorded_at ASC;
$$;

CREATE TRIGGER trg_lead_score_explanations_updated
BEFORE UPDATE ON public.lead_score_explanations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
