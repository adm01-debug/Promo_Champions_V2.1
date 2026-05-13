-- Dropar a view para recriar com a nova estrutura de colunas (necessário devido à mudança de tipos/nomes)
DROP VIEW IF EXISTS public.revenue_forecast_view;

CREATE OR REPLACE VIEW public.revenue_forecast_view AS
WITH open_deals AS (
  SELECT 
    s.id,
    s.salesperson_id,
    s.amount,
    s.status,
    s.forecast_category,
    s.created_at,
    s.updated_at,
    CASE s.status
      WHEN 'lead' THEN 0.10
      WHEN 'qualified' THEN 0.30
      WHEN 'proposal' THEN 0.55
      WHEN 'negotiation' THEN 0.75
      WHEN 'pending' THEN 0.85
      ELSE 0.20
    END AS stage_probability
  FROM sales s
  WHERE s.status NOT IN ('completed', 'lost', 'abandoned')
),
category_agg AS (
  SELECT
    salesperson_id,
    SUM(amount) FILTER (WHERE forecast_category = 'commit') as commit_amount,
    SUM(amount) FILTER (WHERE forecast_category = 'best_case') as best_case_amount,
    SUM(amount) FILTER (WHERE forecast_category = 'pipeline') as pipeline_amount,
    SUM(amount) FILTER (WHERE forecast_category = 'closed') as closed_amount
  FROM open_deals
  GROUP BY salesperson_id
),
closed_recent AS (
  SELECT 
    salesperson_id,
    count(*) AS won_count,
    avg(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400.0) AS avg_cycle_days,
    sum(amount) AS won_amount_90d
  FROM sales
  WHERE status = 'completed' AND updated_at >= (now() - interval '90 days')
  GROUP BY salesperson_id
),
goals_current AS (
  SELECT 
    salesperson_id,
    goal_amount
  FROM sales_goals
  WHERE month = date_trunc('month', now())::date
)
SELECT 
  COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id) AS salesperson_id,
  COALESCE(SUM(od.amount), 0) AS total_open_pipeline,
  COALESCE(SUM(od.amount * od.stage_probability), 0) AS weighted_forecast,
  count(od.id) FILTER (WHERE od.id IS NOT NULL) AS open_deals_count,
  COALESCE(MAX(cr.avg_cycle_days), 45) AS avg_cycle_days,
  COALESCE(MAX(cr.won_amount_90d), 0) AS won_amount_90d,
  COALESCE(MAX(cr.won_count), 0) AS won_count_90d,
  COALESCE(MAX(gc.goal_amount), 0) AS monthly_goal,
  -- Categorias de Forecast
  COALESCE(MAX(ca.commit_amount), 0) as commit_amount,
  COALESCE(MAX(ca.best_case_amount), 0) as best_case_amount,
  COALESCE(MAX(ca.pipeline_amount), 0) as pipeline_amount,
  -- Cenários dinâmicos (mantendo nomes antigos para compatibilidade mas com lógica nova)
  COALESCE(MAX(ca.commit_amount), 0) AS pessimistic_30d,
  COALESCE(MAX(ca.commit_amount + (ca.best_case_amount * 0.5)), 0) AS realistic_30d,
  COALESCE(MAX(ca.commit_amount + ca.best_case_amount + (ca.pipeline_amount * 0.3)), 0) AS optimistic_30d
FROM open_deals od
FULL JOIN closed_recent cr ON cr.salesperson_id = od.salesperson_id
FULL JOIN goals_current gc ON gc.salesperson_id = COALESCE(od.salesperson_id, cr.salesperson_id)
LEFT JOIN category_agg ca ON ca.salesperson_id = COALESCE(od.salesperson_id, cr.salesperson_id)
GROUP BY COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id);

-- Tabela para Buying Committee (Comitê de Compra)
CREATE TABLE IF NOT EXISTS public.buying_committee (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  role TEXT NOT NULL, -- Champion, Decision Maker, Economic Buyer, Blocker, Technical Buyer, Influencer
  sentiment TEXT DEFAULT 'neutral', -- positive, neutral, negative
  influence_level INTEGER DEFAULT 3, -- 1-5
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buying_committee ENABLE ROW LEVEL SECURITY;

-- Policies para Buying Committee
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buying_committee' AND policyname = 'Users can view committee for their sales') THEN
    CREATE POLICY "Users can view committee for their sales"
    ON public.buying_committee FOR SELECT
    USING (EXISTS (SELECT 1 FROM sales WHERE id = sale_id AND (salesperson_id = auth.uid() OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'manager')))));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buying_committee' AND policyname = 'Users can manage committee for their sales') THEN
    CREATE POLICY "Users can manage committee for their sales"
    ON public.buying_committee FOR ALL
    USING (EXISTS (SELECT 1 FROM sales WHERE id = sale_id AND (salesperson_id = auth.uid() OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'manager')))));
  END IF;
END $$;

-- Tabela para Pipeline Inspection Audit (Inspeção Auditável)
CREATE TABLE IF NOT EXISTS public.pipeline_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES auth.users(id),
  status_at_inspection TEXT,
  amount_at_inspection NUMERIC,
  forecast_category_at_inspection public.forecast_category,
  notes TEXT,
  risk_signals JSONB, -- list of risk factors identified
  next_steps_agreed TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pipeline_inspections ENABLE ROW LEVEL SECURITY;

-- Policies para Pipeline Inspection
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_inspections' AND policyname = 'Users can view inspections for their sales') THEN
    CREATE POLICY "Users can view inspections for their sales"
    ON public.pipeline_inspections FOR SELECT
    USING (EXISTS (SELECT 1 FROM sales WHERE id = sale_id AND (salesperson_id = auth.uid() OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'manager')))));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_inspections' AND policyname = 'Managers can create inspections') THEN
    CREATE POLICY "Managers can create inspections"
    ON public.pipeline_inspections FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')));
  END IF;
END $$;

-- Função para calcular Deal Risk Score explicável
CREATE OR REPLACE FUNCTION public.calculate_deal_risk_score(p_sale_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_sale RECORD;
  v_risk_score INTEGER := 0;
  v_signals JSONB := '[]'::jsonb;
  v_committee_count INTEGER;
  v_has_decision_maker BOOLEAN;
  v_last_activity_days INTEGER;
BEGIN
  SELECT * INTO v_sale FROM public.sales WHERE id = p_sale_id;
  
  -- 1. Single-threaded risk
  SELECT count(*) INTO v_committee_count FROM public.buying_committee WHERE sale_id = p_sale_id;
  IF v_committee_count <= 1 THEN
    v_risk_score := v_risk_score + 30;
    v_signals := v_signals || jsonb_build_object('type', 'risk', 'message', 'Single-threaded: Apenas um contato mapeado no comitê.', 'impact', 30);
  END IF;

  -- 2. No Decision Maker risk
  SELECT EXISTS(SELECT 1 FROM public.buying_committee WHERE sale_id = p_sale_id AND role = 'Decision Maker') INTO v_has_decision_maker;
  IF NOT v_has_decision_maker THEN
    v_risk_score := v_risk_score + 25;
    v_signals := v_signals || jsonb_build_object('type', 'risk', 'message', 'Falta Decisor: Nenhum tomador de decisão identificado no comitê.', 'impact', 25);
  END IF;

  -- 3. Stagnation risk
  v_last_activity_days := EXTRACT(DAY FROM (now() - v_sale.updated_at))::INTEGER;
  IF v_last_activity_days > 10 THEN
    v_risk_score := v_risk_score + 20;
    v_signals := v_signals || jsonb_build_object('type', 'risk', 'message', 'Estagnação: Sem atualizações há ' || v_last_activity_days || ' dias.', 'impact', 20);
  END IF;

  RETURN jsonb_build_object(
    'score', LEAST(100, v_risk_score),
    'signals', v_signals,
    'level', CASE 
      WHEN v_risk_score < 30 THEN 'low'
      WHEN v_risk_score < 60 THEN 'medium'
      ELSE 'high'
    END,
    'updated_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
