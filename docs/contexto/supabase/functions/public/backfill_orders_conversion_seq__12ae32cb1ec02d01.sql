CREATE OR REPLACE FUNCTION public.backfill_orders_conversion_seq()
 RETURNS TABLE(previous_value bigint, new_value bigint, legacy_max bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_prev    bigint;
  v_legacy  bigint;
  v_target  bigint;
BEGIN
  -- Serializa qualquer backfill/conversão concorrente
  PERFORM pg_advisory_xact_lock(hashtext('orders_conversion_seq_backfill'));

  SELECT last_value INTO v_prev FROM public.orders_conversion_seq;

  -- Extrai maior NNNNNNNN de qualquer order_number ORC-YYYYMMDD-NNNNNNNN
  SELECT COALESCE(MAX((regexp_match(order_number, '^ORC-\d{8}-(\d+)$'))[1]::bigint), 0)
    INTO v_legacy
    FROM public.orders
   WHERE order_number ~ '^ORC-\d{8}-\d+$';

  v_target := GREATEST(v_prev, v_legacy);

  -- setval com is_called=true => próximo nextval() = v_target + 1
  PERFORM setval('public.orders_conversion_seq', v_target, true);

  RETURN QUERY SELECT v_prev, v_target, v_legacy;
END;
$function$
