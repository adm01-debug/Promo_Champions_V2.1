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

-- Allowlist do dispatcher interno: acrescenta o novo job sem abrir proxy
-- arbitrario e sem regredir o dispatcher vigente. A versao anterior desta
-- migration recriava a funcao com uma allowlist de 6 nomes e SEM o retry /
-- reconciliacao introduzidos em 20261124130000; aplicar por ultimo (timestamp
-- maior) derrubaria 19 jobs autorizados (inclusive semantic-reindex-batch).
CREATE OR REPLACE FUNCTION public.trigger_internal_edge_job(p_function_name text)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'net'
AS $function$
BEGIN
  IF p_function_name IS NULL OR NOT (
    p_function_name = ANY (ARRAY[
      'notify-v4-quote-status',
      'check-v4-callback-alerts',
      'cron-failure-alerter',
      'process-call-recording-ingest',
      'edge-retry-threshold-alert',
      'deal-risk-digest',
      'email-bulk-retry',
      'wal-health-alert',
      'winloss-webhook-health-monitor',
      'webvitals-regression-alert',
      'sequence-runner',
      'process-cadence-tasks',
      'process-scheduled-sends',
      'check-quote-expiration',
      'check-lead-sla',
      'sdr-consecutive-alerts',
      'activity-goal-alerts',
      'challenge-expiration-alerts',
      'send-alert-notifications',
      'auto-reassign-inactive',
      'access-denied-alerts',
      'scheduled-reports-runner',
      'rotate-daily-challenges',
      'bitrix24-sync',
      'semantic-reindex-batch',
      'supply-dispatch'
    ]::text[])
  ) THEN
    RAISE EXCEPTION 'internal_edge_job_not_allowed';
  END IF;

  RETURN public.post_internal_edge_job(p_function_name, 1, 3);
END;
$function$;

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