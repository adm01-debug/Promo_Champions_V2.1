-- lost_deals_benchmark
-- Rollback: DROP FUNCTION public.get_monthly_sales_benchmark(int);
--           ALTER TABLE public.monthly_sales_summary DROP COLUMN lost_deals;
--           e recriar refresh_monthly_sales_summary/get_monthly_sales_benchmark
--           conforme 20260512175631_b0636deb-fb97-49da-b54e-82c70bafd65f.sql
--
-- Motivo: HistoricalBenchmark exibia won_deals/deals como "Win Rate", mas
-- deals = COUNT(*) inclui vendas ABERTAS. Win rate decidido é
-- wins/(wins+losses) — para isso a RPC precisa expor lost_deals.
-- Também alinha 'closed' como status ganho canônico (won|completed|closed)
-- e 'cancelled' como perda (lost|cancelled), conforme src/constants/index.ts.

ALTER TABLE public.monthly_sales_summary
    ADD COLUMN IF NOT EXISTS lost_deals INTEGER DEFAULT 0;

-- Refresh passa a contar lost_deals e a tratar 'closed' como ganho.
CREATE OR REPLACE FUNCTION public.refresh_monthly_sales_summary(p_month TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.monthly_sales_summary (month, revenue, deals, won_deals, lost_deals, updated_at)
    SELECT
        to_char(created_at, 'YYYY-MM') as month,
        SUM(CASE WHEN deal_status::text IN ('won', 'completed', 'closed') OR status IN ('won', 'completed', 'closed') THEN amount ELSE 0 END)::NUMERIC as revenue,
        COUNT(*)::INT as deals,
        COUNT(CASE WHEN deal_status::text IN ('won', 'completed', 'closed') OR status IN ('won', 'completed', 'closed') THEN 1 END)::INT as won_deals,
        COUNT(CASE WHEN deal_status::text IN ('lost', 'cancelled') OR status IN ('lost', 'cancelled') THEN 1 END)::INT as lost_deals,
        now()
    FROM public.sales
    WHERE to_char(created_at, 'YYYY-MM') = p_month
    GROUP BY 1
    ON CONFLICT (month) DO UPDATE
    SET revenue = EXCLUDED.revenue,
        deals = EXCLUDED.deals,
        won_deals = EXCLUDED.won_deals,
        lost_deals = EXCLUDED.lost_deals,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC expõe lost_deals — o front calcula wins/(wins+losses) de verdade.
CREATE OR REPLACE FUNCTION public.get_monthly_sales_benchmark(months_back integer DEFAULT 13)
 RETURNS TABLE(month text, revenue numeric, deals integer, won_deals integer, lost_deals integer)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        s.month,
        s.revenue,
        s.deals,
        s.won_deals,
        s.lost_deals
    FROM public.monthly_sales_summary s
    WHERE s.month >= to_char(CURRENT_DATE - (months_back || ' month')::INTERVAL, 'YYYY-MM')
    ORDER BY s.month;
END;
$function$;

-- Backfill: recalcula todos os meses presentes em sales (inclui lost_deals
-- e o novo conjunto de ganhos com 'closed').
DO $$
DECLARE m TEXT;
BEGIN
    FOR m IN SELECT DISTINCT to_char(created_at, 'YYYY-MM') FROM public.sales
    LOOP
        PERFORM public.refresh_monthly_sales_summary(m);
    END LOOP;
END;
$$;
