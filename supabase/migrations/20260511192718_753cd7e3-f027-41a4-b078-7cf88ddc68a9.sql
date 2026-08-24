-- 1. Melhoria de Playbook Items
ALTER TABLE public.playbook_items 
ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES sales_enablement_assets(id),
ADD COLUMN IF NOT EXISTS target_outcome TEXT;

-- 2. Função para calcular ROI de Conteúdo
CREATE OR REPLACE FUNCTION public.calculate_asset_efficiency(_asset_id UUID)
RETURNS TABLE (
    total_views BIGINT,
    deals_influenced BIGINT,
    win_rate_influenced DECIMAL(5,2),
    total_revenue_influenced DECIMAL(12,2)
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT l.id)::BIGINT as total_views,
        COUNT(DISTINCT s.id)::BIGINT as deals_influenced,
        CASE 
            WHEN COUNT(DISTINCT l.deal_id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END)::DECIMAL / COUNT(DISTINCT l.deal_id) * 100)
            ELSE 0 
        END as win_rate_influenced,
        COALESCE(SUM(CASE WHEN s.status = 'completed' THEN s.amount END), 0) as total_revenue_influenced
    FROM asset_usage_logs l
    LEFT JOIN sales s ON l.deal_id = s.id
    WHERE l.asset_id = _asset_id;
END;
$$;

-- 3. Políticas para Playbook Progress (usando completed_by)
ALTER TABLE public.playbook_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all read access for authenticated users" ON public.playbook_progress;
DROP POLICY IF EXISTS "Allow insert/update for own progress" ON public.playbook_progress;

CREATE POLICY "Allow read for all authenticated" ON public.playbook_progress FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for own completion" ON public.playbook_progress FOR ALL USING (auth.uid() = completed_by);
