-- Alinha a view v_quote_to_sale_invariants ao critério correto de "venda órfã".
--
-- Antes: contava TODA venda sem quote apontando para ela como órfã →
-- all_ok=false permanente, porque vendas diretas (referral, organic, inbound,
-- event, outbound, partner) nunca tiveram quote por design (654 em prod).
--
-- Agora: só vendas nascidas de cotação precisam do vínculo —
--   source='quote_conversion' (fn_convert_quote_to_sale) e
--   source='gift_store'      (sync_quote_from_webhook, cotação externa).
-- Verificado em prod 2026-10-05: 0 órfãs reais nesse conjunto.

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
    WHERE s.source IN ('quote_conversion', 'gift_store')
      AND NOT EXISTS (SELECT 1 FROM public.quotes q WHERE q.sale_id = s.id)
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

REVOKE ALL ON public.v_quote_to_sale_invariants FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.v_quote_to_sale_invariants TO service_role;
GRANT SELECT ON public.v_quote_to_sale_invariants TO authenticated;

COMMENT ON VIEW public.v_quote_to_sale_invariants IS
  'Invariantes do fluxo quote→sale: duplicatas, órfãos (só vendas de origem quote_conversion/gift_store), quotes multi-order, gap de sequence. Admin-only via RLS das tabelas base.';
