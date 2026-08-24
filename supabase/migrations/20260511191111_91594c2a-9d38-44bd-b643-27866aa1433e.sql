-- 1. Canais e Fontes de Leads
CREATE TABLE IF NOT EXISTS public.lead_source_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL UNIQUE,
    monthly_budget DECIMAL(12,2) DEFAULT 0,
    target_cpl DECIMAL(12,2) DEFAULT 0, -- Target Cost Per Lead
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Histórico de Pontuação para Análise de Tendência
CREATE TABLE IF NOT EXISTS public.lead_score_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL,
    score INTEGER NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Regras de Atribuição por Lead Cargo/Produto (Extensão do Routing)
ALTER TABLE public.lead_routing_rules 
ADD COLUMN IF NOT EXISTS filter_job_titles TEXT[],
ADD COLUMN IF NOT EXISTS filter_products TEXT[];

-- 4. Função para calcular ROI por Fonte
CREATE OR REPLACE FUNCTION public.calculate_source_roi(_source TEXT, _days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_leads BIGINT,
    total_revenue DECIMAL(12,2),
    roi_index DECIMAL(10,2)
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(s.id)::BIGINT as total_leads,
        COALESCE(SUM(s.amount), 0) as total_revenue,
        CASE 
            WHEN (SELECT monthly_budget FROM lead_source_configs WHERE source_name = _source) > 0 
            THEN (COALESCE(SUM(s.amount), 0) / (SELECT monthly_budget FROM lead_source_configs WHERE source_name = _source))
            ELSE 0 
        END as roi_index
    FROM sales s
    WHERE s.source = _source
    AND s.created_at >= (now() - (_days || ' days')::interval);
END;
$$;

-- Enable RLS
ALTER TABLE public.lead_source_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_score_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for all authenticated users" ON public.lead_source_configs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read for all authenticated users" ON public.lead_score_trends FOR SELECT USING (auth.role() = 'authenticated');
