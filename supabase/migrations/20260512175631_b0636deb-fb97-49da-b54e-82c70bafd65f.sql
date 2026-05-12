-- Create summary table
CREATE TABLE IF NOT EXISTS public.monthly_sales_summary (
    month TEXT PRIMARY KEY,
    revenue NUMERIC DEFAULT 0,
    deals INTEGER DEFAULT 0,
    won_deals INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monthly_sales_summary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Summary viewable by everyone" ON public.monthly_sales_summary;
CREATE POLICY "Summary viewable by everyone" ON public.monthly_sales_summary FOR SELECT USING (true);

-- Function to refresh a specific month
CREATE OR REPLACE FUNCTION public.refresh_monthly_sales_summary(p_month TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.monthly_sales_summary (month, revenue, deals, won_deals, updated_at)
    SELECT 
        to_char(created_at, 'YYYY-MM') as month,
        SUM(CASE WHEN deal_status::text IN ('won', 'completed') OR status IN ('won', 'completed') THEN amount ELSE 0 END)::NUMERIC as revenue,
        COUNT(*)::INT as deals,
        COUNT(CASE WHEN deal_status::text IN ('won', 'completed') OR status IN ('won', 'completed') THEN 1 END)::INT as won_deals,
        now()
    FROM public.sales
    WHERE to_char(created_at, 'YYYY-MM') = p_month
    GROUP BY 1
    ON CONFLICT (month) DO UPDATE 
    SET revenue = EXCLUDED.revenue,
        deals = EXCLUDED.deals,
        won_deals = EXCLUDED.won_deals,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function
CREATE OR REPLACE FUNCTION public.trigger_refresh_monthly_summary()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM public.refresh_monthly_sales_summary(to_char(OLD.created_at, 'YYYY-MM'));
        RETURN OLD;
    ELSE
        PERFORM public.refresh_monthly_sales_summary(to_char(NEW.created_at, 'YYYY-MM'));
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS refresh_monthly_summary_on_sale ON public.sales;
CREATE TRIGGER refresh_monthly_summary_on_sale
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.trigger_refresh_monthly_summary();

-- Initial population
INSERT INTO public.monthly_sales_summary (month, revenue, deals, won_deals)
SELECT 
    to_char(created_at, 'YYYY-MM') as month,
    SUM(CASE WHEN deal_status::text IN ('won', 'completed') OR status IN ('won', 'completed') THEN amount ELSE 0 END)::NUMERIC as revenue,
    COUNT(*)::INT as deals,
    COUNT(CASE WHEN deal_status::text IN ('won', 'completed') OR status IN ('won', 'completed') THEN 1 END)::INT as won_deals
FROM public.sales
GROUP BY 1
ON CONFLICT (month) DO UPDATE 
SET revenue = EXCLUDED.revenue,
    deals = EXCLUDED.deals,
    won_deals = EXCLUDED.won_deals;

-- Update RPC
CREATE OR REPLACE FUNCTION public.get_monthly_sales_benchmark(months_back integer DEFAULT 13)
 RETURNS TABLE(month text, revenue numeric, deals integer, won_deals integer)
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
        s.won_deals
    FROM public.monthly_sales_summary s
    WHERE s.month >= to_char(CURRENT_DATE - (months_back || ' month')::INTERVAL, 'YYYY-MM')
    ORDER BY s.month;
END;
$function$;
