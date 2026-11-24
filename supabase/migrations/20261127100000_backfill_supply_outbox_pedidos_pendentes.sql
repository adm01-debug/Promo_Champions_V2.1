-- Enfileira no Supply os itens de pedido que nasceram ANTES do gatilho
-- trg_supply_enqueue_from_order_item existir.
--
-- Escopo: orders.status = 'pending'. Os 'confirmed' ja foram entregues no
-- backfill manual de 24/11 14:09Z; o ON CONFLICT garante idempotencia, entao
-- reaplicar nao duplica nada.
--
-- Coerencia com o gatilho: ele enfileira TODO item de pedido novo,
-- independente de status. Logo, mandar os 'pending' antigos apenas alinha o
-- historico ao comportamento que ja vale para pedido novo.
--
-- Desfazer (se algum pedido nao deveria ter ido): apagar as linhas ainda nao
-- entregues e cancelar no Supply as ja entregues.
--   delete from public.supply_outbox
--    where event = 'pedido.criado' and delivered_at is null
--      and order_id in (select id from public.orders where status = 'pending');

INSERT INTO public.supply_outbox (order_id, order_item_id, event, payload)
SELECT
  o.id,
  i.id,
  'pedido.criado',
  jsonb_build_object(
    'os_id', i.id,
    'os_number', o.order_number,
    'produto', i.product_name,
    'quantidade', GREATEST(COALESCE(i.quantity, 1), 1),
    'empresa', NULLIF(btrim(COALESCE(o.metadata ->> 'client_name', '')), ''),
    'observacoes', 'Pedido ' || o.order_number || ' aprovado no Promo Champions.',
    'source', 'promo_champions',
    'solicitante_email', s.email
  )
FROM public.orders o
JOIN public.order_items i ON i.order_id = o.id
LEFT JOIN public.salespeople s ON s.id = o.salesperson_id
WHERE o.status = 'pending'
ON CONFLICT (order_item_id, event) DO NOTHING;