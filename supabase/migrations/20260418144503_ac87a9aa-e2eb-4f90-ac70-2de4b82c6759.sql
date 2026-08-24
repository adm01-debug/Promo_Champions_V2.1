CREATE TABLE public.conversation_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES public.sales(id) ON DELETE CASCADE,
  client_id uuid,
  source text NOT NULL CHECK (source IN ('call','email','meeting','whatsapp')),
  transcript text NOT NULL,
  summary text,
  sentiment text NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive','neutral','negative','mixed')),
  objections jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  buying_signals text[] NOT NULL DEFAULT '{}',
  risk_signals text[] NOT NULL DEFAULT '{}',
  decision_makers text[] NOT NULL DEFAULT '{}',
  ai_model text,
  analyzed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conv_analyses_sale ON public.conversation_analyses(sale_id);
CREATE INDEX idx_conv_analyses_sentiment ON public.conversation_analyses(sentiment);
CREATE INDEX idx_conv_analyses_created ON public.conversation_analyses(created_at DESC);
CREATE INDEX idx_conv_analyses_analyzed_by ON public.conversation_analyses(analyzed_by);

ALTER TABLE public.conversation_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salesperson sees own deal conversations"
  ON public.conversation_analyses FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR analyzed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.sales s
      JOIN public.salespeople sp ON sp.id = s.salesperson_id
      WHERE s.id = conversation_analyses.sale_id
        AND sp.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated can insert conversations"
  ON public.conversation_analyses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND analyzed_by = auth.uid());

CREATE POLICY "Owner or manager can update"
  ON public.conversation_analyses FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR analyzed_by = auth.uid()
  );

CREATE POLICY "Owner or manager can delete"
  ON public.conversation_analyses FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR analyzed_by = auth.uid()
  );

CREATE OR REPLACE VIEW public.conversation_insights_summary
WITH (security_invoker = true) AS
SELECT
  ca.analyzed_by AS user_id,
  COUNT(*)::int AS total_analyses,
  COUNT(*) FILTER (WHERE ca.sentiment = 'positive')::int AS positive_count,
  COUNT(*) FILTER (WHERE ca.sentiment = 'negative')::int AS negative_count,
  COUNT(*) FILTER (WHERE ca.sentiment = 'neutral')::int AS neutral_count,
  COUNT(*) FILTER (WHERE ca.sentiment = 'mixed')::int AS mixed_count,
  COALESCE(AVG(COALESCE(array_length(ca.buying_signals, 1), 0)), 0)::numeric(10,2) AS avg_buying_signals,
  COALESCE(AVG(COALESCE(array_length(ca.risk_signals, 1), 0)), 0)::numeric(10,2) AS avg_risk_signals,
  COALESCE(AVG(jsonb_array_length(ca.objections)), 0)::numeric(10,2) AS avg_objections,
  MAX(ca.created_at) AS last_analysis_at
FROM public.conversation_analyses ca
GROUP BY ca.analyzed_by;

GRANT SELECT ON public.conversation_insights_summary TO authenticated;