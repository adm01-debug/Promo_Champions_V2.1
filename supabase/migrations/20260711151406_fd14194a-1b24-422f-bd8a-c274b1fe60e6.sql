
-- =========================================================================
-- 1) Tabela de auditoria por tentativa de conversão
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.quote_conversion_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL,
  sale_id UUID,
  order_id UUID,
  order_number TEXT,
  previous_status TEXT,
  new_status TEXT,
  reused_order BOOLEAN NOT NULL DEFAULT false,
  idempotent BOOLEAN NOT NULL DEFAULT false,
  success BOOLEAN NOT NULL,
  error_code TEXT,
  error_message TEXT,
  latency_ms INTEGER,
  request_id TEXT,
  actor_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.quote_conversion_audit TO authenticated;
GRANT ALL ON public.quote_conversion_audit TO service_role;

ALTER TABLE public.quote_conversion_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins can read conversion audit"
ON public.quote_conversion_audit
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_quote_conversion_audit_quote ON public.quote_conversion_audit(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_conversion_audit_sale  ON public.quote_conversion_audit(sale_id);
CREATE INDEX IF NOT EXISTS idx_quote_conversion_audit_created ON public.quote_conversion_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_conversion_audit_request ON public.quote_conversion_audit(request_id);

-- =========================================================================
-- 2) RPC para registrar tentativa (chamada por edge function / wrapper)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.fn_record_conversion_attempt(
  _quote_id UUID,
  _sale_id UUID,
  _order_id UUID,
  _order_number TEXT,
  _previous_status TEXT,
  _new_status TEXT,
  _reused_order BOOLEAN,
  _idempotent BOOLEAN,
  _success BOOLEAN,
  _error_code TEXT,
  _error_message TEXT,
  _latency_ms INTEGER,
  _request_id TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION '[NOT_AUTHENTICATED] auth.uid() ausente';
  END IF;

  INSERT INTO public.quote_conversion_audit (
    quote_id, sale_id, order_id, order_number,
    previous_status, new_status, reused_order, idempotent,
    success, error_code, error_message, latency_ms, request_id, actor_user_id
  ) VALUES (
    _quote_id, _sale_id, _order_id, _order_number,
    _previous_status, _new_status, COALESCE(_reused_order, false), COALESCE(_idempotent, false),
    _success, _error_code, _error_message, _latency_ms, _request_id, auth.uid()
  ) RETURNING id INTO v_id;

  RETURN v_id;
END $$;

REVOKE ALL ON FUNCTION public.fn_record_conversion_attempt(
  UUID, UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, TEXT, TEXT, INTEGER, TEXT
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_record_conversion_attempt(
  UUID, UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, TEXT, TEXT, INTEGER, TEXT
) TO authenticated, service_role;

-- =========================================================================
-- 3) View admin-only: histórico de conversões enriquecido
-- =========================================================================
CREATE OR REPLACE VIEW public.v_quote_conversion_history AS
SELECT
  a.id                    AS audit_id,
  a.created_at            AS occurred_at,
  a.quote_id,
  q.title                 AS quote_title,
  q.client_name           AS quote_client,
  a.sale_id,
  a.order_id,
  a.order_number,
  a.previous_status,
  a.new_status,
  a.reused_order,
  a.idempotent,
  a.success,
  a.error_code,
  a.error_message,
  a.latency_ms,
  a.request_id,
  a.actor_user_id
FROM public.quote_conversion_audit a
LEFT JOIN public.quotes q ON q.id = a.quote_id;

REVOKE ALL ON public.v_quote_conversion_history FROM PUBLIC, anon;
GRANT SELECT ON public.v_quote_conversion_history TO authenticated, service_role;

-- =========================================================================
-- 4) View admin-only: métricas diárias (sucesso/erro/latência)
-- =========================================================================
CREATE OR REPLACE VIEW public.v_quote_conversion_metrics_daily AS
SELECT
  date_trunc('day', created_at)::date            AS day,
  COUNT(*)                                       AS attempts,
  COUNT(*) FILTER (WHERE success)                AS successes,
  COUNT(*) FILTER (WHERE NOT success)            AS failures,
  COUNT(*) FILTER (WHERE idempotent)             AS idempotent_hits,
  COUNT(*) FILTER (WHERE reused_order)           AS reused_orders,
  ROUND(
    COUNT(*) FILTER (WHERE success)::numeric
    / NULLIF(COUNT(*), 0) * 100, 2
  )                                              AS success_rate_pct,
  percentile_cont(0.50) WITHIN GROUP (ORDER BY latency_ms) FILTER (WHERE latency_ms IS NOT NULL) AS latency_p50_ms,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms) FILTER (WHERE latency_ms IS NOT NULL) AS latency_p95_ms,
  MAX(latency_ms)                                AS latency_max_ms
FROM public.quote_conversion_audit
GROUP BY 1
ORDER BY 1 DESC;

REVOKE ALL ON public.v_quote_conversion_metrics_daily FROM PUBLIC, anon;
GRANT SELECT ON public.v_quote_conversion_metrics_daily TO authenticated, service_role;

-- =========================================================================
-- 5) RPC admin-only para trilha completa por quote_id OU sale_id
-- =========================================================================
CREATE OR REPLACE FUNCTION public.fn_admin_conversion_trail(
  _quote_id UUID DEFAULT NULL,
  _sale_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_quote UUID := _quote_id;
  v_sale  UUID := _sale_id;
  v_result JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION '[NOT_AUTHENTICATED] auth.uid() ausente';
  END IF;
  IF NOT public.has_role(v_uid, 'admin') THEN
    RAISE EXCEPTION '[FORBIDDEN] admin role requerido';
  END IF;
  IF v_quote IS NULL AND v_sale IS NULL THEN
    RAISE EXCEPTION '[INVALID_INPUT] informe quote_id ou sale_id';
  END IF;

  -- Resolve o par (quote_id, sale_id) a partir do que veio
  IF v_quote IS NULL THEN
    SELECT id INTO v_quote FROM public.quotes WHERE sale_id = v_sale LIMIT 1;
  END IF;
  IF v_sale IS NULL THEN
    SELECT sale_id INTO v_sale FROM public.quotes WHERE id = v_quote LIMIT 1;
  END IF;

  SELECT jsonb_build_object(
    'quote_id', v_quote,
    'sale_id',  v_sale,
    'quote',    (SELECT to_jsonb(q) FROM public.quotes q WHERE q.id = v_quote),
    'sale',     (SELECT to_jsonb(s) FROM public.sales s WHERE s.id = v_sale),
    'orders',   COALESCE((SELECT jsonb_agg(to_jsonb(o) ORDER BY o.created_at)
                         FROM public.orders o WHERE o.quote_id = v_quote), '[]'::jsonb),
    'order_items', COALESCE((SELECT jsonb_agg(to_jsonb(oi))
                             FROM public.order_items oi
                             JOIN public.orders o ON o.id = oi.order_id
                             WHERE o.quote_id = v_quote), '[]'::jsonb),
    'quote_items', COALESCE((SELECT jsonb_agg(to_jsonb(qi))
                             FROM public.quote_items qi WHERE qi.quote_id = v_quote), '[]'::jsonb),
    'conversion_audit', COALESCE((SELECT jsonb_agg(to_jsonb(a) ORDER BY a.created_at)
                                   FROM public.quote_conversion_audit a
                                   WHERE a.quote_id = v_quote OR a.sale_id = v_sale), '[]'::jsonb),
    'sale_notifications', COALESCE((SELECT jsonb_agg(to_jsonb(n) ORDER BY n.created_at)
                                     FROM public.sale_notifications_audit n
                                     WHERE n.sale_id = v_sale), '[]'::jsonb),
    'follow_up_notifications', COALESCE((SELECT jsonb_agg(to_jsonb(f) ORDER BY f.created_at)
                                          FROM public.follow_up_notifications f
                                          WHERE f.sale_id = v_sale), '[]'::jsonb),
    'follow_up_audit_logs', COALESCE((SELECT jsonb_agg(to_jsonb(l) ORDER BY l.created_at)
                                       FROM public.follow_up_audit_logs l
                                       WHERE l.sale_id = v_sale), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END $$;

REVOKE ALL ON FUNCTION public.fn_admin_conversion_trail(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_admin_conversion_trail(UUID, UUID) TO authenticated, service_role;
