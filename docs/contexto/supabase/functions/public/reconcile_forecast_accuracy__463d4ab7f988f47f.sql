CREATE OR REPLACE FUNCTION public.reconcile_forecast_accuracy(_days integer DEFAULT 30)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    v_target_date DATE := CURRENT_DATE - (_days || ' days')::interval;
BEGIN
    -- Atualiza os snapshots antigos com o valor real realizado no período
    UPDATE public.forecast_snapshots fs
    SET actual_realized_value = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.sales
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
    FROM public.forecast_snapshots
    WHERE snapshot_date = v_target_date;
END;
$function$
