-- View de observabilidade das 4 invariantes críticas do fluxo quote → sale.
-- Consumida por dashboards/alertas externos. Admin-only via RLS na função wrapper.

CREATE OR REPLACE VIEW public.v_quote_to_sale_invariants
WITH (security_invoker = true) AS
WITH
  dup AS (
    SELECT COUNT(*)::BIGINT AS n FROM (
      SELECT order_number FROM public.orders
      WHERE order_number IS NOT NULL
      GROUP BY order_number HAVING COUNT(*) > 1
    ) d
  ),
  orphans AS (
    SELECT COUNT(*)::BIGINT AS n
    FROM public.sales s
    LEFT JOIN public.quotes q ON q.sale_id = s.id
    WHERE q.id IS NULL
  ),
  multi AS (
    SELECT COUNT(*)::BIGINT AS n FROM (
      SELECT quote_id FROM public.orders
      WHERE quote_id IS NOT NULL
      GROUP BY quote_id HAVING COUNT(*) > 1
    ) m
  ),
  seq AS (
    SELECT last_value AS seq_last FROM public.orders_conversion_seq
  ),
  maxorc AS (
    SELECT COALESCE(MAX(NULLIF(SPLIT_PART(order_number,'-',3), '')::BIGINT), 0) AS max_suffix
    FROM public.orders WHERE order_number LIKE 'ORC-%'
  )
SELECT
  dup.n            AS duplicate_order_numbers,
  orphans.n        AS orphan_sales,
  multi.n          AS quotes_with_multiple_orders,
  seq.seq_last     AS orders_conversion_seq_last,
  maxorc.max_suffix AS max_orc_suffix,
  GREATEST(maxorc.max_suffix - seq.seq_last, 0) AS sequence_gap,
  (dup.n = 0 AND orphans.n = 0 AND multi.n = 0 AND maxorc.max_suffix <= seq.seq_last) AS all_ok,
  now() AS checked_at
FROM dup, orphans, multi, seq, maxorc;

-- Restringe leitura a admins. View respeita RLS das tabelas base via security_invoker.
REVOKE ALL ON public.v_quote_to_sale_invariants FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.v_quote_to_sale_invariants TO service_role;

-- Grant condicional para admins via role check (usuários authenticated leem apenas se
-- has_role(auth.uid(),'admin') retornar true na policy das tabelas base).
GRANT SELECT ON public.v_quote_to_sale_invariants TO authenticated;

COMMENT ON VIEW public.v_quote_to_sale_invariants IS
  'Invariantes do fluxo quote→sale: duplicatas, órfãos, quotes multi-order, gap de sequence. Admin-only via RLS das tabelas base.';