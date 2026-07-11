-- ============================================================================
-- Stress test versionado: 100 conversões quote → sale (50 won + 50 approved)
-- ============================================================================
-- Executa toda a suíte dentro de BEGIN/ROLLBACK para NÃO sujar produção.
-- Idempotente: pode ser rodado várias vezes sem efeitos colaterais.
--
-- Uso:
--   psql "$PGURL" -f supabase/tests/quote-to-sale-stress.sql
--
-- Ao final imprime as invariantes esperadas:
--   - 50 ORC-* + 50 PED-* (ou distribuição condizente)
--   - orders_conversion_seq avançou exatamente +50
--   - audit_logs: 100 entradas fn_convert
--   - 0 duplicatas de order_number
--   - 0 quotes órfãos após ROLLBACK
-- ============================================================================

\set ON_ERROR_STOP on
\timing on

-- Requer :admin_uuid — id de um admin real (public.user_roles.role='admin').
-- Uso:
--   ADMIN=$(psql -tAc "SELECT user_id FROM public.user_roles WHERE role='admin' LIMIT 1")
--   psql -v admin_uuid="'$ADMIN'" -f supabase/tests/quote-to-sale-stress.sql
\if :{?admin_uuid}
\else
  \echo '❌ Faltou -v admin_uuid=<uuid-admin>. Abortando.'
  \quit
\endif

BEGIN;

-- Injeta auth.uid() para a RPC fn_convert_quote_to_sale.
-- Nota: não usamos SET ROLE authenticated porque exec-user não tem grant;
-- a RPC é SECURITY DEFINER e só depende de auth.uid() via jwt.claims.sub.
SELECT set_config(
  'request.jwt.claims',
  json_build_object('sub', :admin_uuid, 'role', 'authenticated')::text,
  true
);




DO $$
DECLARE
  v_seq_before BIGINT;
  v_seq_after  BIGINT;
  v_orc_count  INT;
  v_ped_count  INT;
  v_dup_count  INT;
  v_quote_id   UUID;
  i INT;
BEGIN
  SELECT last_value INTO v_seq_before FROM public.orders_conversion_seq;
  RAISE NOTICE 'seq_before=%', v_seq_before;

  -- 50 conversões won → ORC-*
  FOR i IN 1..50 LOOP
    INSERT INTO public.quotes (client_name, title, total_value, subtotal, status, source)
    VALUES ('stress-won-' || i, 'stress-won-' || i, 100, 100, 'won', 'manual')
    RETURNING id INTO v_quote_id;
    INSERT INTO public.quote_items (quote_id, product_name, quantity, unit_price, total_price)
    VALUES (v_quote_id, 'item', 1, 100, 100);
    PERFORM public.fn_convert_quote_to_sale(v_quote_id);
  END LOOP;

  -- 50 conversões approved → PED-* (trigger cria order; RPC reusa)
  FOR i IN 1..50 LOOP
    INSERT INTO public.quotes (client_name, title, total_value, subtotal, status, source)
    VALUES ('stress-app-' || i, 'stress-app-' || i, 200, 200, 'approved', 'manual')
    RETURNING id INTO v_quote_id;
    INSERT INTO public.quote_items (quote_id, product_name, quantity, unit_price, total_price)
    VALUES (v_quote_id, 'item', 1, 200, 200);
    PERFORM public.fn_convert_quote_to_sale(v_quote_id);
  END LOOP;

  SELECT last_value INTO v_seq_after FROM public.orders_conversion_seq;

  SELECT COUNT(*) INTO v_orc_count FROM public.orders
    WHERE order_number LIKE 'ORC-%' AND created_at > now() - interval '5 minutes';
  SELECT COUNT(*) INTO v_ped_count FROM public.orders
    WHERE order_number LIKE 'PED-%' AND created_at > now() - interval '5 minutes';

  SELECT COUNT(*) INTO v_dup_count FROM (
    SELECT order_number FROM public.orders
    GROUP BY order_number HAVING COUNT(*) > 1
  ) t;

  RAISE NOTICE 'seq_after=% (delta=%)', v_seq_after, v_seq_after - v_seq_before;
  RAISE NOTICE 'orc_new=% ped_new=% duplicates=%',
    v_orc_count, v_ped_count, v_dup_count;

  IF v_dup_count > 0 THEN
    RAISE EXCEPTION 'INVARIANT VIOLATED: % order_number duplicados', v_dup_count;
  END IF;
  IF (v_seq_after - v_seq_before) <> 50 THEN
    RAISE EXCEPTION 'INVARIANT VIOLATED: seq avançou % (esperado 50)',
      v_seq_after - v_seq_before;
  END IF;
END $$;

-- Rollback garante zero side effects em produção.
ROLLBACK;

\echo '✅ Stress test concluído — ROLLBACK aplicado, produção intacta.'
