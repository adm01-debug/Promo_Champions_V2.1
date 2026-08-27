-- Hardening compatível: não remove dados, colunas ou objetos existentes.
-- Idempotência de eventos inbound: registros antigos sem message_id continuam válidos.
CREATE UNIQUE INDEX IF NOT EXISTS uq_inbound_reply_events_provider_message_id
  ON public.inbound_reply_events (provider, message_id)
  WHERE message_id IS NOT NULL;

-- Bucket explícito de cooldown para tornar idempotente o alerta criado por
-- execuções concorrentes. Linhas históricas ficam com NULL e são preservadas.
ALTER TABLE public.campaign_health_alerts
  ADD COLUMN IF NOT EXISTS dedupe_bucket timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS uq_campaign_health_alerts_dedupe_bucket
  ON public.campaign_health_alerts (job_id, alert_type, dedupe_bucket)
  WHERE dedupe_bucket IS NOT NULL;

-- Somente a RPC controlada pode mudar status de carteira. Mantém leitura e
-- exclusão administrativa já existentes, sem reescrever dados históricos.
DROP POLICY IF EXISTS "Users can update own client_portfolio" ON public.client_portfolio;

CREATE OR REPLACE FUNCTION public.update_client_portfolio_status(
  p_portfolio_id uuid,
  p_status text,
  p_last_purchase_date date DEFAULT NULL
)
RETURNS public.client_portfolio
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.client_portfolio%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_row
  FROM public.client_portfolio
  WHERE id = p_portfolio_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'portfolio_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_row.salesperson_id IS DISTINCT FROM public.get_current_salesperson_id()
     AND NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.client_portfolio
  SET status = p_status,
      last_purchase_date = COALESCE(p_last_purchase_date, last_purchase_date)
  WHERE id = p_portfolio_id
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.update_client_portfolio_status(uuid, text, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_client_portfolio_status(uuid, text, date) TO authenticated;
