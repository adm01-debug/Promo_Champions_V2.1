-- Revenue Forecasts table
CREATE TABLE public.revenue_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('week','month','quarter')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  commit_amount NUMERIC NOT NULL DEFAULT 0,
  best_case_amount NUMERIC NOT NULL DEFAULT 0,
  upside_amount NUMERIC NOT NULL DEFAULT 0,
  confidence_score INT NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  goal_amount NUMERIC NOT NULL DEFAULT 0,
  gap_to_goal NUMERIC NOT NULL DEFAULT 0,
  deals_count INT NOT NULL DEFAULT 0,
  weighted_pipeline NUMERIC NOT NULL DEFAULT 0,
  factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_summary TEXT,
  model_version TEXT DEFAULT 'gemini-2.5-flash',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX revenue_forecasts_unique
  ON public.revenue_forecasts (COALESCE(owner_id, '00000000-0000-0000-0000-000000000000'::uuid), period_type, period_start);

CREATE INDEX idx_revenue_forecasts_period ON public.revenue_forecasts(period_type, period_start DESC);
CREATE INDEX idx_revenue_forecasts_owner ON public.revenue_forecasts(owner_id);

ALTER TABLE public.revenue_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers and admins view all forecasts"
  ON public.revenue_forecasts FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager') OR
    owner_id = public.get_current_salesperson_id()
  );

CREATE POLICY "System can manage forecasts"
  ON public.revenue_forecasts FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  );

CREATE TRIGGER update_revenue_forecasts_updated_at
  BEFORE UPDATE ON public.revenue_forecasts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Forecast Deal Contributions
CREATE TABLE public.forecast_deal_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_id UUID NOT NULL REFERENCES public.revenue_forecasts(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('commit','best','upside','omitted')),
  weighted_amount NUMERIC NOT NULL DEFAULT 0,
  probability NUMERIC NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 1),
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_forecast_contrib_forecast ON public.forecast_deal_contributions(forecast_id, category);
CREATE INDEX idx_forecast_contrib_sale ON public.forecast_deal_contributions(sale_id);

ALTER TABLE public.forecast_deal_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View forecast contributions via forecast access"
  ON public.forecast_deal_contributions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.revenue_forecasts rf
      WHERE rf.id = forecast_id AND (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'manager') OR
        rf.owner_id = public.get_current_salesperson_id()
      )
    )
  );

CREATE POLICY "Managers manage contributions"
  ON public.forecast_deal_contributions FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.revenue_forecasts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forecast_deal_contributions;