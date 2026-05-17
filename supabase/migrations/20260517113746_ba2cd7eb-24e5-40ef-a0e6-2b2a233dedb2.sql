-- Create Materialized View for Competitive Ranking
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_competitive_ranking AS
WITH monthly_sales AS (
    SELECT 
        salesperson_id,
        SUM(amount) as total_sales,
        COUNT(*) as deals_count
    FROM public.sales
    WHERE status = 'completed'
      AND created_at >= date_trunc('month', now())
      AND created_at < date_trunc('month', now()) + interval '1 month'
    GROUP BY salesperson_id
),
monthly_leads AS (
    SELECT 
        salesperson_id,
        COUNT(*) as leads_count
    FROM public.sales
    WHERE status != 'completed'
      AND status != 'lost'
    GROUP BY salesperson_id
)
SELECT 
    s.id,
    s.name,
    s.avatar_url,
    s.role,
    COALESCE(ms.total_sales, 0) as total_sales,
    COALESCE(ms.deals_count, 0) as deals_count,
    COALESCE(ml.leads_count, 0) as leads_count,
    RANK() OVER (ORDER BY COALESCE(ms.total_sales, 0) DESC, COALESCE(ms.deals_count, 0) DESC) as rank
FROM public.salespeople s
LEFT JOIN monthly_sales ms ON s.id = ms.salesperson_id
LEFT JOIN monthly_leads ml ON s.id = ml.salesperson_id
WHERE s.is_active = true;

-- Create index for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS mv_competitive_ranking_id_idx ON public.mv_competitive_ranking (id);

-- Function to refresh the view
CREATE OR REPLACE FUNCTION public.refresh_competitive_ranking()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_competitive_ranking;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to refresh on sale change
CREATE OR REPLACE FUNCTION public.trg_refresh_ranking_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- We use a background worker or simple call here. 
    -- Since Supabase/Postgres doesn't have background workers easily without pg_cron, 
    -- we'll just refresh it. Note: REFRESH CONCURRENTLY needs a unique index.
    PERFORM public.refresh_competitive_ranking();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_refresh_ranking_on_sale_change ON public.sales;
CREATE TRIGGER trg_refresh_ranking_on_sale_change
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH STATEMENT
EXECUTE FUNCTION public.trg_refresh_ranking_on_sale();

-- Grant access to authenticated users
GRANT SELECT ON public.mv_competitive_ranking TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_competitive_ranking() TO authenticated;
