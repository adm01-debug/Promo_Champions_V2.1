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

