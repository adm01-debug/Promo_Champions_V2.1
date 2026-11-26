-- Analise de credito da 1a venda (regra resgatada do Bitrix24, SPA 2006).
--
-- Regra de negocio: a primeira venda de um cliente nao segue para compras
-- antes do Financeiro analisar o credito (CNPJ.ja + Escavador + consulta
-- financeira). O Champions marca o pedido como 'aguardando_credito', manda a
-- solicitacao ao Promo Finance (fila credit_outbox -> credit-dispatch) e so
-- enfileira a compra no Supply quando o Finance devolve 'aprovado'
-- (receive-credit-decision). Reprovado: o pedido fica marcado e o vendedor
-- decide (nao cancela sozinho).
--
-- Estende sem regredir:
--   * trigger_internal_edge_job: lista de 20261126090000 + 'credit-dispatch';
--   * internal_edge_job_timeout_ms: lista de 20261127001000 + 'credit-dispatch'.

-- 1) CNPJ do cliente: hoje clients nao guarda documento, e a analise precisa dele.
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS cnpj text;

CREATE INDEX IF NOT EXISTS idx_clients_cnpj
  ON public.clients (cnpj)
  WHERE cnpj IS NOT NULL;

-- 2) Estado de credito do pedido (separado de orders.status para nao mexer na
--    maquina de estados operacional).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS credit_status text NOT NULL DEFAULT 'nao_aplicavel',
  ADD COLUMN IF NOT EXISTS credit_limit_approved numeric(12,2),
  ADD COLUMN IF NOT EXISTS credit_max_installments integer,
  ADD COLUMN IF NOT EXISTS credit_notes text,
  ADD COLUMN IF NOT EXISTS credit_decided_at timestamptz;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_credit_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_credit_status_check
  CHECK (credit_status = ANY (ARRAY['nao_aplicavel', 'aguardando_credito', 'aprovado', 'reprovado']::text[]));

CREATE INDEX IF NOT EXISTS idx_orders_credit_status
  ON public.orders (credit_status)
  WHERE credit_status = 'aguardando_credito';

-- 3) Fila de saida Champions -> Finance (mesmo desenho da supply_outbox).
CREATE TABLE IF NOT EXISTS public.credit_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event text NOT NULL DEFAULT 'credito.solicitado',
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT credit_outbox_status_check
    CHECK (status = ANY (ARRAY['pending', 'processing', 'delivered', 'dead']::text[])),
  CONSTRAINT credit_outbox_order_event_key UNIQUE (order_id, event)
);

CREATE INDEX IF NOT EXISTS idx_credit_outbox_due
  ON public.credit_outbox (next_attempt_at)
  WHERE status = 'pending';

ALTER TABLE public.credit_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.credit_outbox FROM anon, authenticated;
GRANT SELECT ON public.credit_outbox TO authenticated;

DROP POLICY IF EXISTS credit_outbox_admin_read ON public.credit_outbox;
CREATE POLICY credit_outbox_admin_read ON public.credit_outbox
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 4) Primeira venda do cliente nasce aguardando credito.
CREATE OR REPLACE FUNCTION public.tg_order_marca_primeira_venda()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.client_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.credit_status IS DISTINCT FROM 'nao_aplicavel' THEN
    RETURN NEW;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.orders o
     WHERE o.client_id = NEW.client_id
       AND o.status <> 'cancelled'
  ) THEN
    NEW.credit_status := 'aguardando_credito';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_marca_primeira_venda ON public.orders;
CREATE TRIGGER trg_order_marca_primeira_venda
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_order_marca_primeira_venda();

-- 5) Enfileira a solicitacao ao Finance quando o pedido nasce aguardando credito.
CREATE OR REPLACE FUNCTION public.tg_credit_enqueue_from_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client public.clients%ROWTYPE;
  v_email text;
BEGIN
  IF NEW.credit_status <> 'aguardando_credito' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_client FROM public.clients WHERE id = NEW.client_id;
  SELECT s.email INTO v_email FROM public.salespeople s WHERE s.id = NEW.salesperson_id;

  INSERT INTO public.credit_outbox (order_id, event, payload)
  VALUES (
    NEW.id,
    'credito.solicitado',
    jsonb_build_object(
      'pedido_id', NEW.id,
      'pedido_numero', NEW.order_number,
      'valor_total', NEW.total,
      'cliente', jsonb_build_object(
        'id', v_client.id,
        'nome', v_client.name,
        'empresa', COALESCE(v_client.company, NEW.metadata ->> 'client_name'),
        'email', COALESCE(v_client.email, NEW.metadata ->> 'client_email'),
        'telefone', COALESCE(v_client.phone, NEW.metadata ->> 'client_phone'),
        'cnpj', v_client.cnpj
      ),
      'vendedor_email', v_email,
      'origem', 'promo_champions',
      'solicitado_em', now()
    )
  )
  ON CONFLICT (order_id, event) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_credit_enqueue_from_order ON public.orders;
CREATE TRIGGER trg_credit_enqueue_from_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_credit_enqueue_from_order();

-- 6) A compra no Supply espera o credito: o gatilho do item nao enfileira
--    enquanto o pedido estiver 'aguardando_credito' (liberado em 8).
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

  IF v_order.credit_status = 'aguardando_credito' THEN
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

-- 7) Reserva/fechamento de lote para o credit-dispatch (copia do padrao supply).
CREATE OR REPLACE FUNCTION public.claim_credit_outbox(p_limit integer DEFAULT 25)
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
      FROM public.credit_outbox o
     WHERE (o.status = 'pending' AND o.next_attempt_at <= now())
        OR (o.status = 'processing' AND o.updated_at < now() - interval '5 minutes')
     ORDER BY o.next_attempt_at
     LIMIT GREATEST(COALESCE(p_limit, 25), 1)
       FOR UPDATE SKIP LOCKED
  ), claimed AS (
    UPDATE public.credit_outbox o
       SET status = 'processing',
           attempts = o.attempts + 1,
           updated_at = now()
      FROM due
     WHERE o.id = due.id
    RETURNING o.id, o.event, o.payload, o.attempts
  )
  SELECT COALESCE(
           jsonb_agg(jsonb_build_object(
             'id', c.id, 'event', c.event, 'payload', c.payload, 'attempts', c.attempts
           )),
           '[]'::jsonb
         )
    INTO v_rows
    FROM claimed c;

  RETURN v_rows;
END;
$$;

CREATE OR REPLACE FUNCTION public.finish_credit_outbox(
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

  UPDATE public.credit_outbox o
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

REVOKE ALL ON FUNCTION public.claim_credit_outbox(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_credit_outbox(integer) TO service_role;
REVOKE ALL ON FUNCTION public.finish_credit_outbox(uuid[], boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_credit_outbox(uuid[], boolean, text) TO service_role;

-- 8) Aplica a decisao do Finance. Aprovado: grava limite/parcelas e enfileira
--    no Supply os itens que ficaram represados. Reprovado: so marca.
CREATE OR REPLACE FUNCTION public.aplicar_decisao_credito(
  p_order_id uuid,
  p_decisao text,
  p_limite numeric DEFAULT NULL,
  p_parcelas integer DEFAULT NULL,
  p_parecer text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_email text;
  v_cliente text;
  v_itens integer := 0;
BEGIN
  IF p_decisao NOT IN ('aprovado', 'reprovado') THEN
    RAISE EXCEPTION 'decisao_invalida';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF v_order.id IS NULL THEN
    RETURN jsonb_build_object('status', 'pedido_nao_encontrado');
  END IF;

  IF v_order.credit_status <> 'aguardando_credito' THEN
    RETURN jsonb_build_object('status', 'ja_decidido', 'credit_status', v_order.credit_status);
  END IF;

  UPDATE public.orders
     SET credit_status = p_decisao,
         credit_limit_approved = p_limite,
         credit_max_installments = p_parcelas,
         credit_notes = left(p_parecer, 2000),
         credit_decided_at = now(),
         updated_at = now()
   WHERE id = p_order_id;

  INSERT INTO public.order_status_events (order_id, status, description)
  VALUES (
    p_order_id,
    'credito_' || p_decisao,
    CASE
      WHEN p_decisao = 'aprovado' THEN
        'Credito aprovado pelo Financeiro'
        || COALESCE(' - limite R$ ' || to_char(p_limite, 'FM999G999G990D00'), '')
        || COALESCE(' - ate ' || p_parcelas || 'x', '')
      ELSE 'Credito reprovado pelo Financeiro' || COALESCE(': ' || left(p_parecer, 300), '')
    END
  );

  IF p_decisao = 'aprovado' THEN
    SELECT s.email INTO v_email FROM public.salespeople s WHERE s.id = v_order.salesperson_id;
    v_cliente := NULLIF(btrim(COALESCE(v_order.metadata ->> 'client_name', '')), '');

    INSERT INTO public.supply_outbox (order_id, order_item_id, event, payload)
    SELECT
      v_order.id,
      i.id,
      'pedido.criado',
      jsonb_build_object(
        'os_id', i.id,
        'os_number', v_order.order_number,
        'produto', i.product_name,
        'quantidade', GREATEST(COALESCE(i.quantity, 1), 1),
        'empresa', v_cliente,
        'observacoes', 'Pedido ' || v_order.order_number || ' aprovado no Promo Champions.',
        'source', 'promo_champions',
        'solicitante_email', v_email
      )
    FROM public.order_items i
    WHERE i.order_id = v_order.id
    ON CONFLICT (order_item_id, event) DO NOTHING;

    GET DIAGNOSTICS v_itens = ROW_COUNT;
  END IF;

  RETURN jsonb_build_object('status', 'aplicado', 'credit_status', p_decisao, 'itens_supply', v_itens);
END;
$$;

REVOKE ALL ON FUNCTION public.aplicar_decisao_credito(uuid, text, numeric, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.aplicar_decisao_credito(uuid, text, numeric, integer, text) TO service_role;

-- 9) Allowlist do dispatcher interno: lista vigente (20261126090000) + credit-dispatch.
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
      'supply-dispatch',
      'credit-dispatch'
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

-- 10) Timeout do pg_net: lista vigente (20261127001000) + credit-dispatch (chamada HTTP externa por lote).
CREATE OR REPLACE FUNCTION public.internal_edge_job_timeout_ms(p_function_name text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE p_function_name
    WHEN 'semantic-reindex-batch' THEN 120000
    WHEN 'process-call-recording-ingest' THEN 60000
    WHEN 'cron-failure-alerter' THEN 60000
    WHEN 'wal-health-alert' THEN 60000
    WHEN 'send-alert-notifications' THEN 60000
    WHEN 'access-denied-alerts' THEN 60000
    WHEN 'supply-dispatch' THEN 60000
    WHEN 'credit-dispatch' THEN 60000
    ELSE 5000
  END;
$function$;

REVOKE ALL ON FUNCTION public.internal_edge_job_timeout_ms(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.internal_edge_job_timeout_ms(text)
  TO service_role;

DO $$
BEGIN
  PERFORM cron.unschedule('credit-dispatch-1min')
  WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'credit-dispatch-1min'
  );
  PERFORM cron.schedule(
    'credit-dispatch-1min',
    '* * * * *',
    'SELECT public.trigger_internal_edge_job(''credit-dispatch'');'
  );
END;
$$;
