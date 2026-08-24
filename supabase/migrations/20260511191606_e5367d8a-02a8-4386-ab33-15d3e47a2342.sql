-- 1. Snapshot de Forecast
CREATE TABLE IF NOT EXISTS public.forecast_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    horizon_days INTEGER NOT NULL,
    pessimistic_value DECIMAL(12,2),
    realistic_value DECIMAL(12,2),
    optimistic_value DECIMAL(12,2),
    actual_realized_value DECIMAL(12,2) DEFAULT 0,
    confidence_at_time INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Métricas de Precisão
CREATE TABLE IF NOT EXISTS public.forecast_accuracy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    forecasted_value DECIMAL(12,2),
    actual_value DECIMAL(12,2),
    deviation_pct DECIMAL(5,2),
    mape DECIMAL(5,2), -- Mean Absolute Percentage Error
    bias_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Função para fechar ciclos de forecast e calcular precisão
CREATE OR REPLACE FUNCTION public.reconcile_forecast_accuracy(_days INTEGER DEFAULT 30)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_target_date DATE := CURRENT_DATE - (_days || ' days')::interval;
BEGIN
    -- Atualiza os snapshots antigos com o valor real realizado no período
    UPDATE public.forecast_snapshots fs
    SET actual_realized_value = (
        SELECT COALESCE(SUM(amount), 0)
        FROM sales
        WHERE status = 'completed'
        AND created_at BETWEEN fs.snapshot_date AND (fs.snapshot_date + (fs.horizon_days || ' days')::interval)
    )
    WHERE fs.snapshot_date = v_target_date;

    -- Insere na tabela de precisão
    INSERT INTO public.forecast_accuracy (period_start, period_end, forecasted_value, actual_value, deviation_pct)
    SELECT 
        snapshot_date, 
        (snapshot_date + (horizon_days || ' days')::interval),
        realistic_value,
        actual_realized_value,
        CASE WHEN realistic_value > 0 THEN ABS(actual_realized_value - realistic_value) / realistic_value * 100 ELSE 0 END
    FROM forecast_snapshots
    WHERE snapshot_date = v_target_date;
END;
$$;

-- Enable RLS
ALTER TABLE public.forecast_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_accuracy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for all authenticated users" ON public.forecast_snapshots FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read for all authenticated users" ON public.forecast_accuracy FOR SELECT USING (auth.role() = 'authenticated');
