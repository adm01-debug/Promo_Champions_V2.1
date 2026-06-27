-- Refactor get_dashboard_kpis to SECURITY INVOKER so RLS is enforced per user.
-- Rationale: previously SECURITY DEFINER exposed global revenue to any authenticated
-- caller (privilege escalation). With INVOKER, RLS on `sales` and `daily_metrics`
-- naturally scopes results per role (admins/managers => global, salespeople => own).

CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(start_date date, end_date date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
DECLARE
    result jsonb;
BEGIN
    -- Require an authenticated caller; RLS handles row visibility.
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
    END IF;

    WITH period_sales AS (
        SELECT amount, is_first_sale
        FROM public.sales
        WHERE created_at >= start_date::timestamp AT TIME ZONE 'UTC'
          AND created_at < (end_date + interval '1 day')::timestamp AT TIME ZONE 'UTC'
          AND status = 'completed'
    ),
    period_metrics AS (
        SELECT new_clients, conversion_rate
        FROM public.daily_metrics
        WHERE date >= start_date
          AND date <= end_date
    )
    SELECT jsonb_build_object(
        'totalRevenue', COALESCE(SUM(amount), 0),
        'totalSales', COUNT(*),
        'firstSaleRevenue', COALESCE(SUM(CASE WHEN is_first_sale THEN amount ELSE 0 END), 0),
        'recurringRevenue', COALESCE(SUM(CASE WHEN NOT is_first_sale THEN amount ELSE 0 END), 0),
        'newClients', (SELECT COALESCE(SUM(new_clients), 0) FROM period_metrics),
        'conversionRate', (SELECT COALESCE(AVG(conversion_rate), 0) FROM period_metrics),
        'avgTicket', CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(amount), 0) / COUNT(*) ELSE 0 END
    ) INTO result
    FROM period_sales;

    RETURN result;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_dashboard_kpis(date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_kpis(date, date) TO authenticated, service_role;

COMMENT ON FUNCTION public.get_dashboard_kpis(date, date) IS
'KPIs do dashboard. SECURITY INVOKER: respeita RLS de sales/daily_metrics. '
'Admins/managers veem o agregado global; vendedores veem apenas seus próprios dados. '
'newClients/conversionRate ficam 0 para roles sem acesso a daily_metrics (esperado).';