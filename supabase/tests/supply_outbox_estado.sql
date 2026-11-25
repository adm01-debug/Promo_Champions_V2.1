-- Sonda read-only do ESTADO da fila Champions -> Supply (complementa
-- supply_outbox_diagnostics.sql, que olha a outbox e o cron mas nao responde
-- por que nada chega ao Supply).
--
-- Responde duas coisas que so o banco de producao sabe:
--   A. _internal_secrets tem as chaves que trigger_internal_edge_job exige?
--      Sem 'functions_base_url', 'anon_key' e 'coaching_cron_secret' o cron
--      supply-dispatch-1min aborta em internal_edge_job_secrets_missing e a
--      outbox nunca drena, por mais que o trigger enfileire.
--   B. quantos itens de pedido nasceram ANTES do trigger de enfileiramento e
--      portanto nunca entraram na outbox (backfill pendente)?
--
-- Somente leitura: nenhum INSERT/UPDATE/DDL. Imprime a CHAVE e o tamanho do
-- segredo, nunca o valor.

\echo '## A. chaves presentes em _internal_secrets (sem valores)'
SELECT key, length(value) AS chars
FROM public._internal_secrets
ORDER BY key;

\echo '## B. triggers de enfileiramento instalados em order_items'
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgrelid = 'public.order_items'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

\echo '## C. itens de pedido sem linha na outbox (backfill pendente)'
SELECT count(*)                        AS itens_sem_outbox,
       count(DISTINCT i.order_id)      AS pedidos_afetados,
       min(i.created_at)               AS item_mais_antigo,
       max(i.created_at)               AS item_mais_recente
FROM public.order_items i
WHERE NOT EXISTS (
  SELECT 1 FROM public.supply_outbox o WHERE o.order_item_id = i.id
);

\echo '## D. status dos pedidos que tem item sem outbox'
SELECT o.status, count(DISTINCT o.id) AS pedidos
FROM public.orders o
WHERE EXISTS (
  SELECT 1
    FROM public.order_items i
   WHERE i.order_id = o.id
     AND NOT EXISTS (SELECT 1 FROM public.supply_outbox b WHERE b.order_item_id = i.id)
)
GROUP BY o.status
ORDER BY pedidos DESC;


-- E. Os itens sem outbox sao demanda real (pedido recente, com valor) ou
--    sobra antiga de importacao? Decide se vale backfill.
\echo '## E. itens sem outbox por mes do pedido'
SELECT to_char(date_trunc('month', o.created_at), 'YYYY-MM') AS mes,
       count(*)                                            AS itens,
       count(DISTINCT o.id)                                AS pedidos,
       sum(COALESCE(i.quantity, 1) * COALESCE(i.unit_price, 0)) AS valor
  FROM public.order_items i
  JOIN public.orders o ON o.id = i.order_id
 WHERE NOT EXISTS (SELECT 1 FROM public.supply_outbox b WHERE b.order_item_id = i.id)
 GROUP BY 1
 ORDER BY 1;

\echo '## F. amostra dos itens sem outbox (15)'
SELECT o.order_number,
       o.status,
       to_char(o.created_at, 'YYYY-MM-DD HH24:MI') AS criado,
       left(i.product_name, 40)                      AS produto,
       i.quantity,
       i.unit_price,
       left(COALESCE(o.metadata ->> 'client_name', '-'), 28) AS cliente
  FROM public.order_items i
  JOIN public.orders o ON o.id = i.order_id
 WHERE NOT EXISTS (SELECT 1 FROM public.supply_outbox b WHERE b.order_item_id = i.id)
 ORDER BY o.created_at
 LIMIT 15;

\echo '## G. base viva: pedidos por status e mes (ultimos 6 meses)'
SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS mes, status, count(*)
  FROM public.orders
 WHERE created_at >= now() - interval '6 months'
 GROUP BY 1, 2
 ORDER BY 1 DESC, 2;

\echo '## H. pedidos pending hoje (o backfill da 20261127100000 cobriu todos?)'
SELECT count(*) AS pedidos_pending,
       count(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM public.order_items i WHERE i.order_id = o.id
       )) AS com_item,
       count(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM public.order_items i
          WHERE i.order_id = o.id
            AND NOT EXISTS (SELECT 1 FROM public.supply_outbox b WHERE b.order_item_id = i.id)
       )) AS ainda_sem_outbox
  FROM public.orders o
 WHERE o.status = 'pending';

\echo '## I. pedidos pending por idade'
SELECT CASE WHEN created_at >= now() - interval '1 day' THEN '0-1d'
            WHEN created_at >= now() - interval '7 days' THEN '1-7d'
            WHEN created_at >= now() - interval '30 days' THEN '7-30d'
            ELSE '>30d' END AS idade,
       status, count(*)
  FROM public.orders
 WHERE status IN ('pending','confirmed')
 GROUP BY 1, 2
 ORDER BY 1, 2;
