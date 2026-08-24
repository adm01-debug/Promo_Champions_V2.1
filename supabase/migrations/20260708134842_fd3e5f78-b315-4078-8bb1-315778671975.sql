-- Leitura segura do último valor da sequence de conversão
CREATE OR REPLACE FUNCTION public.fn_get_orders_conversion_seq_last()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT last_value FROM public.orders_conversion_seq;
$$;

REVOKE EXECUTE ON FUNCTION public.fn_get_orders_conversion_seq_last() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_get_orders_conversion_seq_last() TO authenticated, service_role;

-- Wrapper administrativo para reexecutar o backfill via cliente autenticado
CREATE OR REPLACE FUNCTION public.fn_backfill_orders_conversion_seq()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

REVOKE EXECUTE ON FUNCTION public.fn_backfill_orders_conversion_seq() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_backfill_orders_conversion_seq() TO authenticated, service_role;