-- 1. Previsões de Atingimento de Quota
CREATE TABLE IF NOT EXISTS public.quota_attainment_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salesperson_id UUID NOT NULL,
    period_date DATE NOT NULL DEFAULT CURRENT_DATE,
    current_attainment_pct DECIMAL(5,2),
    predicted_attainment_pct DECIMAL(5,2),
    pace_status TEXT, -- 'ahead', 'on_track', 'behind'
    confidence_score DECIMAL(5,2),
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Fatores de Impacto na Performance
CREATE TABLE IF NOT EXISTS public.performance_impact_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salesperson_id UUID NOT NULL,
    factor_name TEXT, -- 'activity_volume', 'lead_quality', 'deal_velocity'
    impact_score DECIMAL(5,2), -- -100 a +100
    description TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Telemetria de Performance Granular
CREATE TABLE IF NOT EXISTS public.salesperson_performance_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salesperson_id UUID NOT NULL,
    metric_type TEXT, -- 'calls', 'emails', 'meetings', 'deals_created'
    metric_value INTEGER,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Função para calcular o Pace (Ritmo) de Atingimento
CREATE OR REPLACE FUNCTION public.calculate_performance_pace(_salesperson_id UUID)
RETURNS TABLE (
    current_pct DECIMAL,
    predicted_pct DECIMAL,
    status TEXT
) LANGUAGE plpgsql AS $$
DECLARE
    v_goal DECIMAL;
    v_actual DECIMAL;
    v_days_elapsed INTEGER;
    v_total_days INTEGER;
BEGIN
    -- Obter meta e realizado do mês atual
    SELECT goal_amount INTO v_goal FROM sales_goals WHERE salesperson_id = _salesperson_id LIMIT 1;
    SELECT SUM(amount) INTO v_actual FROM sales WHERE salesperson_id = _salesperson_id AND status = 'completed' AND created_at >= start_of_month(now());
    
    v_days_elapsed := EXTRACT(DAY FROM now());
    v_total_days := EXTRACT(DAY FROM (end_of_month(now())));
    
    IF v_goal > 0 THEN
        current_pct := (v_actual / v_goal) * 100;
        predicted_pct := (v_actual / v_days_elapsed) * v_total_days / v_goal * 100;
        
        IF predicted_pct >= 100 THEN status := 'ahead';
        ELSIF predicted_pct >= 90 THEN status := 'on_track';
        ELSE status := 'behind';
        END IF;
    ELSE
        current_pct := 0; predicted_pct := 0; status := 'no_goal';
    END IF;
    
    RETURN NEXT;
END;
$$;

-- Enable RLS
ALTER TABLE public.quota_attainment_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_impact_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salesperson_performance_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for all authenticated users" ON public.quota_attainment_predictions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read for all authenticated users" ON public.performance_impact_factors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read for all authenticated users" ON public.salesperson_performance_telemetry FOR SELECT USING (auth.role() = 'authenticated');
