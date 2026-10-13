-- ON CONFLICT (provider, message_id) não infere índice único PARCIAL
-- (WHERE message_id IS NOT NULL): o Postgres exige índice sem predicado no
-- target do conflito e o upsert falhava com 42P10 — bug latente também do
-- inbound-email-webhook, que usa o mesmo padrão. UNIQUE simples mantém a
-- deduplicação de eventos com message_id e continua aceitando múltiplas
-- linhas com message_id NULL (NULLs nunca conflitam em índice único).
DROP INDEX IF EXISTS public.uq_inbound_reply_events_provider_message_id;

CREATE UNIQUE INDEX uq_inbound_reply_events_provider_message_id
  ON public.inbound_reply_events (provider, message_id);
