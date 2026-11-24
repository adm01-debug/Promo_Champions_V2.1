-- Liga o Promo Champions ao Promo Supply.
--
-- Regra de negocio: o Design para na fase 1 (mockup/orcamento). Quando o
-- orcamento vira pedido no Champions, e o Champions que aciona o Supply para
-- comprar o material. Um evento por item do pedido, com idempotencia por item.

CREATE TABLE IF NOT EXISTS public.supply_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL,
  event text NOT NULL DEFAULT 'pedido.criado',
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT supply_outbox_status_check
    CHECK (status = ANY (ARRAY['pending', 'processing', 'delivered', 'dead']::text[])),
  CONSTRAINT supply_outbox_item_event_key UNIQUE (order_item_id, event)
);

CREATE INDEX IF NOT EXISTS idx_supply_outbox_due
  ON public.supply_outbox (next_attempt_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_supply_outbox_order
  ON public.supply_outbox (order_id);

ALTER TABLE public.supply_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.supply_outbox FROM anon, authenticated;
GRANT SELECT ON public.supply_outbox TO authenticated;

DROP POLICY IF EXISTS supply_outbox_admin_read ON public.supply_outbox;
CREATE POLICY supply_outbox_admin_read ON public.supply_outbox
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- Enfileira a compra quando o item do pedido nasce. O trigger fica no item
-- porque os itens sao inseridos depois da linha de `orders`.
CREATE OR REPLACE FUNCTION public.tg_supply_enqueue_from_order_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_email text;
  v_cliente text;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = NEW.order_id;
  IF v_order.id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT s.email INTO v_email
    FROM public.salespeople s
   WHERE s.id = v_order.salesperson_id;

  v_cliente := NULLIF(btrim(COALESCE(v_order.metadata ->> 'client_name', '')), '');

  INSERT INTO public.supply_outbox (order_id, order_item_id, event, payload)
  VALUES (
    v_order.id,
    NEW.id,
    'pedido.criado',
    jsonb_build_object(
      'os_id', NEW.id,
      'os_number', v_order.order_number,
      'produto', NEW.product_name,
      'quantidade', GREATEST(COALESCE(NEW.quantity, 1), 1),
      'empresa', v_cliente,
      'observacoes', 'Pedido ' || v_order.order_number || ' aprovado no Promo Champions.',
      'source', 'promo_champions',
      'solicitante_email', v_email
    )
  )
  ON CONFLICT (order_item_id, event) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_supply_enqueue_from_order_item ON public.order_items;
CREATE TRIGGER trg_supply_enqueue_from_order_item
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_supply_enqueue_from_order_item();

-- Reserva um lote para a edge function. Recupera tambem linhas presas em
-- 'processing' (worker morto) apos 5 minutos.
CREATE OR REPLACE FUNCTION public.claim_supply_outbox(p_limit integer DEFAULT 25)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows jsonb;
BEGIN
  WITH due AS (
    SELECT o.id
      FROM public.supply_outbox o
     WHERE (
             o.status = 'pending'
             AND o.next_attempt_at <= now()
           )
        OR (
             o.status = 'processing'
             AND o.updated_at < now() - interval '5 minutes'
           )
     ORDER BY o.next_attempt_at
     LIMIT GREATEST(COALESCE(p_limit, 25), 1)
       FOR UPDATE SKIP LOCKED
  ), claimed AS (
    UPDATE public.supply_outbox o
       SET status = 'processing',
           attempts = o.attempts + 1,
           updated_at = now()
      FROM due
     WHERE o.id = due.id
    RETURNING o.id, o.event, o.payload, o.attempts
  )
  SELECT COALESCE(
           jsonb_agg(
             jsonb_build_object(
               'id', c.id,
               'event', c.event,
               'payload', c.payload,
               'attempts', c.attempts
             )
           ),
           '[]'::jsonb
         )
    INTO v_rows
    FROM claimed c;

  RETURN v_rows;
END;
$$;

-- Fecha o lote: entregue, reagendado com backoff exponencial ou dead-letter
-- apos 5 tentativas.
CREATE OR REPLACE FUNCTION public.finish_supply_outbox(
  p_ids uuid[],
  p_ok boolean,
  p_error text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF p_ids IS NULL OR array_length(p_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.supply_outbox o
     SET status = CASE
                    WHEN p_ok THEN 'delivered'
                    WHEN o.attempts >= 5 THEN 'dead'
                    ELSE 'pending'
                  END,
         delivered_at = CASE WHEN p_ok THEN now() ELSE o.delivered_at END,
         last_error = CASE WHEN p_ok THEN NULL ELSE left(COALESCE(p_error, 'unknown'), 1000) END,
         next_attempt_at = CASE
                             WHEN p_ok OR o.attempts >= 5 THEN o.next_attempt_at
                             ELSE now()
                               + (least(power(2, greatest(o.attempts, 1))::int, 64) * interval '1 minute')
                           END,
         updated_at = now()
   WHERE o.id = ANY (p_ids);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_supply_outbox(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_supply_outbox(integer) TO service_role;
REVOKE ALL ON FUNCTION public.finish_supply_outbox(uuid[], boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_supply_outbox(uuid[], boolean, text) TO service_role;

-- Allowlist do dispatcher interno: inclui o novo job sem abrir proxy arbitrario.
CREATE OR REPLACE FUNCTION public.trigger_internal_edge_job(p_function_name text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_base_url text;
  v_anon_key text;
  v_cron_secret text;
  v_request_id bigint;
BEGIN
  IF p_function_name IS NULL OR NOT (
    p_function_name = ANY (ARRAY[
      'notify-v4-quote-status',
      'check-v4-callback-alerts',
      'cron-failure-alerter',
      'process-call-recording-ingest',
      'edge-retry-threshold-alert',
      'supply-dispatch'
    ]::text[])
  ) THEN
    RAISE EXCEPTION 'internal_edge_job_not_allowed';
  END IF;

  SELECT
    max(s.value) FILTER (WHERE s.key = 'functions_base_url'),
    max(s.value) FILTER (WHERE s.key = 'anon_key'),
    max(s.value) FILTER (WHERE s.key = 'coaching_cron_secret')
  INTO v_base_url, v_anon_key, v_cron_secret
  FROM public._internal_secrets AS s;

  IF v_base_url IS NULL OR v_anon_key IS NULL OR v_cron_secret IS NULL THEN
    RAISE EXCEPTION 'internal_edge_job_secrets_missing';
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'internal_edge_job_base_url_must_be_https';
  END IF;

  SELECT net.http_post(
    url := rtrim(v_base_url, '/') || '/' || p_function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key,
      'X-Cron-Secret', v_cron_secret
    ),
    body := jsonb_build_object('scheduled_at', now())
  )
  INTO v_request_id;

  RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_internal_edge_job(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_internal_edge_job(text)
  TO service_role;

DO $$
BEGIN
  PERFORM cron.unschedule('supply-dispatch-1min')
  WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'supply-dispatch-1min'
  );
  PERFORM cron.schedule(
    'supply-dispatch-1min',
    '* * * * *',
    'SELECT public.trigger_internal_edge_job(''supply-dispatch'');'
  );
END;
$$;