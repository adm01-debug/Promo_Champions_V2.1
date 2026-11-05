CREATE OR REPLACE FUNCTION public.fn_backfill_orders_conversion_seq()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION '[NOT_AUTHENTICATED] Sessão ausente' USING ERRCODE = '42501';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION '[FORBIDDEN] Apenas administradores podem reexecutar o backfill' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_result FROM public.backfill_orders_conversion_seq();

  RETURN jsonb_build_object(
    'previous_value', v_result.previous_value,
    'new_value', v_result.new_value,
    'legacy_max', v_result.legacy_max
  );
END;
$function$
