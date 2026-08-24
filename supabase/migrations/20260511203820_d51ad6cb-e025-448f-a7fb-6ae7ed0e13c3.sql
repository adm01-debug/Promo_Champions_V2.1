-- Lead Intelligence Analytics and Risk Metrics

-- Table for aggregate distribution metrics
CREATE TABLE IF NOT EXISTS public.lead_intelligence_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  avg_score NUMERIC,
  hot_count INTEGER,
  warm_count INTEGER,
  cold_count INTEGER,
  distribution JSONB -- Histogram data: { "0-20": 5, "21-40": 12, ... }
);

-- Table for Churn Risk indicators
CREATE TABLE IF NOT EXISTS public.lead_churn_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  risk_level TEXT CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  risk_score NUMERIC, -- 0 to 100 where 100 is certain churn
  factors JSONB, -- List of factors like ['No activity for 15 days', 'Stage stagnation']
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored')),
  UNIQUE(sale_id)
);

-- Enable RLS
ALTER TABLE public.lead_intelligence_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_churn_risk ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read lead_intelligence_metrics" ON public.lead_intelligence_metrics FOR SELECT USING (true);
CREATE POLICY "Public read lead_churn_risk" ON public.lead_churn_risk FOR SELECT USING (true);

-- Function to calculate distribution for a batch
CREATE OR REPLACE FUNCTION public.calculate_lead_distribution()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_object_agg(range, count) INTO result
  FROM (
    SELECT 
      CASE 
        WHEN score < 20 THEN '0-20'
        WHEN score < 40 THEN '21-40'
        WHEN score < 60 THEN '41-60'
        WHEN score < 80 THEN '61-80'
        ELSE '81-100'
      END as range,
      count(*) as count
    FROM public.lead_scores
    GROUP BY range
  ) sub;
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;
