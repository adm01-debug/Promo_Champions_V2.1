CREATE OR REPLACE FUNCTION private.refresh_monthly_sales_summary(p_month text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Bug pré-existente: o INSERT...SELECT abaixo retorna zero linhas quando
    -- o mês ficou sem vendas (DELETE da última venda ou UPDATE cross-month),
    -- então o resumo velho nunca era limpo — linha fantasma permanente.
    IF NOT EXISTS (
        SELECT 1 FROM public.sales
        WHERE to_char(created_at, 'YYYY-MM') = p_month
    ) THEN
        DELETE FROM public.monthly_sales_summary WHERE month = p_month;
        RETURN;
    END IF;

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
$function$
