-- Backfill seguro do orders_conversion_seq
-- Objetivo: alinhar o sequence com o maior contador NNNNNNNN já presente
-- em order_number no formato ORC-YYYYMMDD-NNNNNNNN, evitando colisões
-- caso a sequence tenha sido recriada/resetada abaixo de valores legados.
-- Estratégia: advisory lock global + setval(GREATEST(current, max_legacy)).

CREATE OR REPLACE FUNCTION public.backfill_orders_conversion_seq()
RETURNS TABLE(previous_value bigint, new_value bigint, legacy_max bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

REVOKE EXECUTE ON FUNCTION public.backfill_orders_conversion_seq() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.backfill_orders_conversion_seq() TO service_role;

-- Execução imediata do backfill (idempotente e seguro mesmo sem legados)
SELECT * FROM public.backfill_orders_conversion_seq();