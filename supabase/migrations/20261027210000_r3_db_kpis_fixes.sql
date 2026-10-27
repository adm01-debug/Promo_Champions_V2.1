-- Correções R3 (domínio DB/KPIs) sobre a canonização de sales.status da
-- migration 20261027120000 — cada ponto reconfirmado no HEAD em 2026-10-27:
--
--   1) get_semantic_coverage: 'column reference entity_type is ambiguous'
--      (OUT param entity_type × coluna semantic_index.entity_type no
--      CTE/GROUP BY) — referências qualificadas com alias.
--   2) get_client_purchase_heatmap / get_purchase_intelligence_summary:
--      comparavam sales.salesperson_id (salespeople.id) com auth.uid() —
--      sempre falso, então is_current_user/share_me/top_competitor e o
--      access-check de não privilegiado nunca batiam. Agora resolvem o
--      salesperson do chamador via get_current_salesperson_id()
--      (salespeople.auth_user_id = auth.uid(), mesmo padrão de
--      award_bonus_if_eligible). auth.uid() continua sendo usado só nas
--      checagens de papel (has_role).
--   3) get_client_purchase_heatmap: bucket mensal date_trunc em UTC →
--      America/Sao_Paulo, consistente com _start (já no fuso de negócio).
--   4) client_purchase_seasonality (view): EXTRACT(MONTH/DOW) em UTC →
--      America/Sao_Paulo.
--   5) award_bonus_if_eligible: aceitava _computed_amount/_bonus_kind do
--      cliente → self-award de valor arbitrário por qualquer usuário
--      autenticado. Decisão: derivar valor e tipo da linha de
--      commission_bonuses no banco (equivale ao que useAutoAwardBonuses já
--      enviava — b.bonus_amount/b.bonus_kind — logo o hook continua
--      funcionando sem mudança de assinatura). Os argumentos seguem
--      aceitos por compatibilidade, mas são ignorados.
--   6) notify_sale_completion: era SECURITY INVOKER e insere em
--      notifications (linhas de outros usuários), sale_notifications_audit
--      (sem policy de INSERT) e competitive_chat_messages — UPDATE direto
--      de status→WON abortava. Passa a SECURITY DEFINER com search_path
--      fixo (é trigger de sistema, não ação do usuário). Guarda também
--      passa a ignorar venda WON sem dono (competitive_chat_messages.
--      salesperson_id é NOT NULL — inserir com NULL abortava a transação)
--      e a disparar quando a venda WON ganha dono depois.
--   7) broadcast_sale_completed / trg_broadcast_sale_completed: venda WON
--      sem dono e atribuída depois não disparava broadcast (trigger só
--      observava UPDATE OF status, deal_status). Trigger passa a observar
--      salesperson_id e a guarda deixa passar a transição NULL→dono;
--      broadcast_sent_at continua impedindo rebroadcast.
--   8) compute_scheduled_report_next_run: variável 'base' morta removida.
--   9) revenue_forecast_view: pipeline sem dono (salesperson_id NULL)
--      sumia porque is_salesperson_active(NULL)=false. NULL passa a ser
--      tratado como ativo — aparece agregado numa linha salesperson_id
--      NULL, em vez de o pipeline não atribuído desaparecer do forecast.

-- ════════════════════════════════════════════════════════════════════════
-- 1) get_semantic_coverage — qualifica entity_type do CTE idx
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_semantic_coverage()
RETURNS TABLE(
  entity_type text,
  total_rows bigint,
  indexed_rows bigint,
  coverage_pct numeric,
  last_indexed timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT 'client'::text AS et, (SELECT count(*) FROM public.clients) AS total
    UNION ALL SELECT 'lead', (SELECT count(*) FROM public.sales WHERE status IN ('lead','prospecting','qualified'))
    UNION ALL SELECT 'deal', (SELECT count(*) FROM public.sales WHERE status IN ('proposal','negotiation','pending','completed','won','closed','lost','cancelled'))
    UNION ALL SELECT 'activity', (SELECT count(*) FROM public.activities)
    UNION ALL SELECT 'call_recording', (SELECT count(*) FROM public.call_recordings)
  ),
  idx AS (
    SELECT si.entity_type AS et, count(*) AS indexed, max(si.updated_at) AS last_at
    FROM public.semantic_index si
    GROUP BY si.entity_type
  )
  SELECT
    b.et,
    b.total,
    COALESCE(i.indexed, 0),
    CASE WHEN b.total = 0 THEN 100::numeric
         ELSE ROUND((COALESCE(i.indexed,0)::numeric / b.total::numeric) * 100, 1)
    END,
    i.last_at
  FROM base b
  LEFT JOIN idx i ON i.et = b.et
  ORDER BY b.et;
END;
$$;

REVOKE ALL ON FUNCTION public.get_semantic_coverage() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_semantic_coverage() TO authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 2) get_client_purchase_heatmap — salesperson do chamador via
--    get_current_salesperson_id(); bucket de mês em America/Sao_Paulo.
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_client_purchase_heatmap(
  _client_id uuid DEFAULT NULL,
  _months int DEFAULT 24
)
RETURNS TABLE (
  client_id uuid,
  client_name text,
  month_start date,
  salesperson_id uuid,
  salesperson_name text,
  is_current_user boolean,
  deal_count bigint,
  revenue numeric,
  won_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _sp_id uuid := public.get_current_salesperson_id();
  _is_privileged boolean := public.has_role(_uid, 'admin') OR public.has_role(_uid, 'manager');
  _start date := (date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo') - (_months || ' months')::interval)::date;
BEGIN
  RETURN QUERY
  SELECT
    c.id AS client_id,
    c.name AS client_name,
    date_trunc('month', s.created_at AT TIME ZONE 'America/Sao_Paulo')::date AS month_start,
    s.salesperson_id,
    sp.name AS salesperson_name,
    (_sp_id IS NOT NULL AND s.salesperson_id = _sp_id) AS is_current_user,
    COUNT(*)::bigint AS deal_count,
    COALESCE(SUM(s.amount), 0)::numeric AS revenue,
    COUNT(*) FILTER (WHERE s.status IN ('completed', 'won', 'closed'))::bigint AS won_count
  FROM public.sales s
  JOIN public.clients c ON c.name = s.client_name
  LEFT JOIN public.salespeople sp ON sp.id = s.salesperson_id
  WHERE s.created_at >= _start
    AND (_client_id IS NULL OR c.id = _client_id)
    AND (
      _is_privileged
      OR EXISTS (
        SELECT 1 FROM public.sales s2
        WHERE s2.client_name = c.name AND s2.salesperson_id = _sp_id
      )
    )
  GROUP BY c.id, c.name, date_trunc('month', s.created_at AT TIME ZONE 'America/Sao_Paulo'), s.salesperson_id, sp.name
  ORDER BY month_start DESC, revenue DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_client_purchase_heatmap(uuid, int) TO authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 3) get_purchase_intelligence_summary — salesperson do chamador via
--    get_current_salesperson_id() nas comparações de posse.
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_purchase_intelligence_summary(
  _client_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _sp_id uuid := public.get_current_salesperson_id();
  _is_privileged boolean := public.has_role(_uid, 'admin') OR public.has_role(_uid, 'manager');
  _client_name text;
  _result jsonb;
  _total_purchases int;
  _total_revenue numeric;
  _avg_ticket numeric;
  _last_date timestamptz;
  _avg_cycle numeric;
  _share_me numeric;
  _share_others numeric;
  _top_competitor jsonb;
  _predicted_next date;
BEGIN
  SELECT name INTO _client_name FROM public.clients WHERE id = _client_id;
  IF _client_name IS NULL THEN
    RETURN jsonb_build_object('error', 'client_not_found');
  END IF;

  -- access check
  IF NOT _is_privileged THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.sales WHERE client_name = _client_name AND salesperson_id = _sp_id
    ) THEN
      RETURN jsonb_build_object('error', 'forbidden');
    END IF;
  END IF;

  SELECT
    COUNT(*)::int,
    COALESCE(SUM(amount), 0)::numeric,
    COALESCE(AVG(amount), 0)::numeric,
    MAX(created_at)
  INTO _total_purchases, _total_revenue, _avg_ticket, _last_date
  FROM public.sales
  WHERE client_name = _client_name AND status IN ('completed', 'won', 'closed');

  -- avg cycle (days between consecutive won purchases)
  WITH ordered AS (
    SELECT created_at,
           LAG(created_at) OVER (ORDER BY created_at) AS prev_dt
    FROM public.sales
    WHERE client_name = _client_name AND status IN ('completed', 'won', 'closed')
  )
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (created_at - prev_dt)) / 86400.0), 0)
  INTO _avg_cycle
  FROM ordered
  WHERE prev_dt IS NOT NULL;

  -- shares (IS DISTINCT FROM cobre salesperson_id NULL e _sp_id NULL)
  SELECT
    CASE WHEN _total_revenue > 0 THEN
      COALESCE(SUM(amount) FILTER (WHERE salesperson_id = _sp_id), 0) / _total_revenue * 100
    ELSE 0 END,
    CASE WHEN _total_revenue > 0 THEN
      COALESCE(SUM(amount) FILTER (WHERE salesperson_id IS DISTINCT FROM _sp_id), 0) / _total_revenue * 100
    ELSE 0 END
  INTO _share_me, _share_others
  FROM public.sales
  WHERE client_name = _client_name AND status IN ('completed', 'won', 'closed');

  -- top internal competitor (other salesperson with most revenue)
  SELECT jsonb_build_object(
    'salesperson_id', sp.id,
    'salesperson_name', sp.name,
    'revenue', SUM(s.amount)::numeric,
    'deal_count', COUNT(*)::int
  )
  INTO _top_competitor
  FROM public.sales s
  LEFT JOIN public.salespeople sp ON sp.id = s.salesperson_id
  WHERE s.client_name = _client_name
    AND s.status IN ('completed', 'won', 'closed')
    AND (s.salesperson_id IS DISTINCT FROM _sp_id)
  GROUP BY sp.id, sp.name
  ORDER BY SUM(s.amount) DESC NULLS LAST
  LIMIT 1;

  -- naive predicted next purchase = last + avg_cycle
  IF _last_date IS NOT NULL AND _avg_cycle > 0 THEN
    _predicted_next := (_last_date + (_avg_cycle || ' days')::interval)::date;
  END IF;

  _result := jsonb_build_object(
    'client_id', _client_id,
    'client_name', _client_name,
    'total_purchases', _total_purchases,
    'total_revenue', _total_revenue,
    'avg_ticket', _avg_ticket,
    'avg_cycle_days', ROUND(_avg_cycle, 1),
    'last_purchase_date', _last_date,
    'share_with_me_pct', ROUND(_share_me, 1),
    'share_with_others_pct', ROUND(_share_others, 1),
    'top_competitor_internal', _top_competitor,
    'predicted_next_purchase_date', _predicted_next,
    'days_since_last_purchase',
      CASE WHEN _last_date IS NOT NULL
        THEN EXTRACT(EPOCH FROM (now() - _last_date))::int / 86400
        ELSE NULL END,
    'computed_at', now()
  );

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_purchase_intelligence_summary(uuid) TO authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 4) client_purchase_seasonality — MONTH/DOW no fuso de negócio
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW public.client_purchase_seasonality
WITH (security_invoker = true)
AS
SELECT
  c.id AS client_id,
  c.name AS client_name,
  EXTRACT(MONTH FROM s.created_at AT TIME ZONE 'America/Sao_Paulo')::int AS month_of_year,
  EXTRACT(DOW FROM s.created_at AT TIME ZONE 'America/Sao_Paulo')::int AS day_of_week,
  COUNT(*)::int AS deal_count,
  COALESCE(AVG(s.amount), 0)::numeric AS avg_revenue,
  COALESCE(SUM(s.amount), 0)::numeric AS total_revenue
FROM public.sales s
JOIN public.clients c ON c.name = s.client_name
WHERE s.status IN ('completed', 'won', 'closed')
GROUP BY c.id, c.name,
         EXTRACT(MONTH FROM s.created_at AT TIME ZONE 'America/Sao_Paulo'),
         EXTRACT(DOW FROM s.created_at AT TIME ZONE 'America/Sao_Paulo');

GRANT SELECT ON public.client_purchase_seasonality TO authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 5) award_bonus_if_eligible — valor e tipo derivados da regra de bônus no
--    banco; argumentos _computed_amount/_bonus_kind ignorados (mantidos na
--    assinatura por compatibilidade com useAutoAwardBonuses).
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.award_bonus_if_eligible(
  _bonus_id uuid,
  _computed_amount numeric,
  _bonus_kind text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sp_id uuid;
  _bonus record;
  _period date := date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo')::date;
  _existing uuid;
  _new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Deriva salesperson_id do usuário autenticado (impossível forjar)
  SELECT id INTO _sp_id FROM public.salespeople WHERE auth_user_id = auth.uid() LIMIT 1;
  IF _sp_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Valida bônus ativo e elegibilidade de escopo (individual/global)
  SELECT * INTO _bonus FROM public.commission_bonuses WHERE id = _bonus_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Se o bônus tem alvo individual, precisa ser o próprio vendedor
  IF _bonus.salesperson_id IS NOT NULL AND _bonus.salesperson_id <> _sp_id THEN
    RETURN NULL;
  END IF;

  -- Idempotência: já registrado no mês?
  SELECT id INTO _existing
  FROM public.commission_bonus_awards
  WHERE bonus_id = _bonus_id
    AND salesperson_id = _sp_id
    AND period_month = _period
  LIMIT 1;

  IF _existing IS NOT NULL THEN
    RETURN _existing;
  END IF;

  -- Valor/tipo vêm da regra no banco — o cliente não pode forjar o prêmio.
  INSERT INTO public.commission_bonus_awards (
    bonus_id, salesperson_id, period_month, computed_amount, bonus_kind, status
  ) VALUES (
    _bonus_id, _sp_id, _period, _bonus.bonus_amount, _bonus.bonus_kind, 'pending'
  )
  ON CONFLICT (bonus_id, salesperson_id, period_month) DO NOTHING
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.award_bonus_if_eligible(uuid, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_bonus_if_eligible(uuid, numeric, text) TO authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 6) notify_sale_completion — SECURITY DEFINER (insere em notifications,
--    sale_notifications_audit e competitive_chat_messages em nome do
--    sistema) + dispara quando venda WON ganha dono depois + ignora WON
--    sem dono.
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.notify_sale_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_seller_name TEXT;
    v_sale_amount NUMERIC;
    v_seller_rank INT;
    v_recipient RECORD;
    v_recipient_rank INT;
    v_seller_id UUID;
    v_formatted_amount TEXT;
BEGIN
    -- Detect closure event (deal_status = 'completed' cobre o trio WON via
    -- coluna GENERATED — 'won'/'closed' também disparam o alerta).
    -- Dispara também quando uma venda já WON ganha dono depois
    -- (OLD.salesperson_id NULL → NEW preenchido) e ignora WON sem dono —
    -- competitive_chat_messages.salesperson_id é NOT NULL, inserir com
    -- NULL abortava a transação inteira.
    IF NEW.deal_status = 'completed'::deal_status
       AND NEW.salesperson_id IS NOT NULL
       AND (
         TG_OP = 'INSERT'
         OR OLD.deal_status IS DISTINCT FROM 'completed'::deal_status
         OR OLD.salesperson_id IS NULL
       ) THEN

        v_seller_id := NEW.salesperson_id;
        v_sale_amount := NEW.amount;
        v_formatted_amount := 'R$ ' || to_char(v_sale_amount, 'FM999G999G990D00');

        -- Get seller details
        SELECT name INTO v_seller_name FROM public.salespeople WHERE id = v_seller_id;

        -- Calculate seller rank at this exact moment
        SELECT pos INTO v_seller_rank
        FROM (
            SELECT salesperson_id, RANK() OVER (ORDER BY SUM(amount) DESC) as pos
            FROM public.sales
            WHERE deal_status = 'completed'::deal_status
              AND created_at >= date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
            GROUP BY salesperson_id
        ) snap WHERE salesperson_id = v_seller_id;

        IF v_seller_rank IS NULL THEN v_seller_rank := 1; END IF;

        -- Notify ALL other active salespeople
        FOR v_recipient IN
            SELECT sp.id, sp.auth_user_id, sp.name, COALESCE(r.pos, 0) as recipient_rank
            FROM public.salespeople sp
            LEFT JOIN (
                SELECT salesperson_id, RANK() OVER (ORDER BY SUM(amount) DESC) as pos
                FROM public.sales
                WHERE deal_status = 'completed'::deal_status
                  AND created_at >= date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
                GROUP BY salesperson_id
            ) r ON r.salesperson_id = sp.id
            WHERE sp.is_active = true
              AND sp.id != v_seller_id
              AND sp.auth_user_id IS NOT NULL
        LOOP
            v_recipient_rank := v_recipient.recipient_rank;

            -- 1. Insert individual notification
            INSERT INTO public.notifications (
                user_id,
                type,
                category,
                priority,
                title,
                message,
                icon,
                metadata
            ) VALUES (
                v_recipient.auth_user_id,
                'sale_alert',
                'gamification',
                'high',
                '🚀 ' || v_seller_name || ' vendeu!',
                'Fechou ' || v_formatted_amount || '! Rank dele: #' || v_seller_rank ||
                '. Seu rank: ' || CASE WHEN v_recipient_rank = 0 THEN 'S/R' ELSE '#' || v_recipient_rank END ||
                '. Vamos buscar!',
                'Zap',
                jsonb_build_object(
                    'sale_id', NEW.id,
                    'seller_id', v_seller_id,
                    'seller_name', v_seller_name,
                    'amount', v_sale_amount,
                    'seller_rank', v_seller_rank,
                    'recipient_rank', v_recipient_rank,
                    'is_competition_alert', true
                )
            );

            -- 2. Log audit history
            INSERT INTO public.sale_notifications_audit (
                sale_id,
                seller_id,
                seller_name,
                sale_amount,
                seller_rank_at_time,
                recipient_id,
                recipient_rank_at_time,
                notification_type
            ) VALUES (
                NEW.id,
                v_seller_id,
                v_seller_name,
                v_sale_amount,
                v_seller_rank,
                v_recipient.id,
                v_recipient_rank,
                'in-app'
            );
        END LOOP;

        -- Competitive Chat Post
        INSERT INTO public.competitive_chat_messages (
            salesperson_id,
            message,
            message_type
        ) VALUES (
            v_seller_id,
            'Acabei de fechar ' || v_formatted_amount || '! A meta tá logo ali! 🔥',
            'chat'
        );

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public;

REVOKE EXECUTE ON FUNCTION public.notify_sale_completion() FROM PUBLIC, anon, authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 7) broadcast_sale_completed — venda WON que ganha dono depois também
--    dispara; trigger passa a observar salesperson_id.
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.broadcast_sale_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_payload jsonb;
  v_base_url text;
  v_anon_key text;
  v_cron_secret text;
BEGIN
  IF NEW.deal_status IS DISTINCT FROM 'completed' THEN
    RETURN NEW;
  END IF;

  -- Dispara apenas na transição para venda ganha OU quando uma venda já
  -- WON ganha dono depois (OLD.salesperson_id NULL → NEW preenchido).
  -- Se o enqueue falhar, a venda fica com broadcast_sent_at nulo e
  -- o erro em edge_call_failures — sem re-tentar a cada update posterior.
  IF TG_OP = 'UPDATE'
     AND OLD.deal_status = 'completed'
     AND OLD.salesperson_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Evita rebroadcast da mesma venda já entregue.
  IF NEW.broadcast_sent_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- A edge function lê os dados da venda no banco; o corpo carrega só o id.
  v_payload := jsonb_build_object('sale_id', NEW.id);

  SELECT
    max(s.value) FILTER (WHERE s.key = 'functions_base_url'),
    max(s.value) FILTER (WHERE s.key = 'anon_key'),
    max(s.value) FILTER (WHERE s.key = 'coaching_cron_secret')
  INTO v_base_url, v_anon_key, v_cron_secret
  FROM public._internal_secrets AS s;

  IF v_base_url IS NULL OR v_anon_key IS NULL OR v_cron_secret IS NULL THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('broadcast_sale_completed', 'broadcast-sale-notification',
            jsonb_build_object('sale_id', NEW.id), 'internal_edge_secrets_missing');
    RETURN NEW;
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('broadcast_sale_completed', 'broadcast-sale-notification',
            jsonb_build_object('sale_id', NEW.id), 'internal_edge_base_url_must_be_https');
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := rtrim(v_base_url, '/') || '/broadcast-sale-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key,
      'X-Cron-Secret', v_cron_secret
    ),
    body := v_payload
  );

  -- Marca como enviada somente quando o enqueue foi aceito pelo pg_net.
  UPDATE public.sales
  SET broadcast_sent_at = now(), updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca quebrar a inserção da venda, mas deixar a falha visível.
  BEGIN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('broadcast_sale_completed', 'broadcast-sale-notification',
            jsonb_build_object('sale_id', NEW.id), SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RAISE WARNING 'broadcast_sale_completed failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.broadcast_sale_completed() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_broadcast_sale_completed ON public.sales;
CREATE TRIGGER trg_broadcast_sale_completed
  AFTER INSERT OR UPDATE OF status, deal_status, salesperson_id ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_sale_completed();

-- ════════════════════════════════════════════════════════════════════════
-- 8) compute_scheduled_report_next_run — remove variável 'base' morta
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.compute_scheduled_report_next_run()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  candidate TIMESTAMP; -- instante local America/Sao_Paulo; convertido no final
BEGIN
  IF NEW.frequency = 'daily' THEN
    candidate := date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') + (NEW.hour_of_day || ' hours')::interval;
    IF candidate <= now() AT TIME ZONE 'America/Sao_Paulo' THEN
      candidate := candidate + interval '1 day';
    END IF;
  ELSIF NEW.frequency = 'weekly' THEN
    candidate := date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') + (NEW.hour_of_day || ' hours')::interval;
    -- avança até bater no day_of_week (default 1 = segunda)
    WHILE EXTRACT(DOW FROM candidate)::INT <> COALESCE(NEW.day_of_week, 1) OR candidate <= now() AT TIME ZONE 'America/Sao_Paulo' LOOP
      candidate := candidate + interval '1 day';
    END LOOP;
  ELSE -- monthly
    candidate := date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo')
                 + ((COALESCE(NEW.day_of_month, 1) - 1) || ' days')::interval
                 + (NEW.hour_of_day || ' hours')::interval;
    IF candidate <= now() AT TIME ZONE 'America/Sao_Paulo' THEN
      candidate := candidate + interval '1 month';
    END IF;
  END IF;
  NEW.next_run_at := candidate AT TIME ZONE 'America/Sao_Paulo';
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.compute_scheduled_report_next_run() FROM PUBLIC, anon, authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- 9) revenue_forecast_view — pipeline sem dono (salesperson_id NULL)
--    tratado como ativo: aparece agregado em linha salesperson_id NULL
--    em vez de sumir do forecast.
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW public.revenue_forecast_view
WITH (security_invoker = true)
AS
WITH open_deals AS (
  SELECT
    s.id,
    s.salesperson_id,
    s.amount,
    s.status,
    s.forecast_category,
    s.created_at,
    s.updated_at,
    sp.probability AS stage_probability
  FROM public.sales s
  JOIN public.stage_probabilities sp ON sp.stage = s.status
  -- Pipeline aberto = probabilidade estritamente entre 0 e 1 na SSOT
  -- (ganhos =1.00 e perdidos =0.00 ficam de fora, assim como status sem
  -- mapeamento — antes 'won'/'closed'/'cancelled' inflavam o pipeline).
  WHERE sp.probability > 0 AND sp.probability < 1
),
category_agg AS (
  SELECT
    salesperson_id,
    SUM(amount) FILTER (WHERE forecast_category = 'commit') as commit_amount,
    SUM(amount) FILTER (WHERE forecast_category = 'best_case') as best_case_amount,
    SUM(amount) FILTER (WHERE forecast_category = 'pipeline') as pipeline_amount
  FROM open_deals
  GROUP BY salesperson_id
),
closed_recent AS (
  SELECT
    salesperson_id,
    count(*) AS won_count,
    avg(EXTRACT(EPOCH FROM (COALESCE(closed_at, updated_at) - created_at)) / 86400.0) AS avg_cycle_days,
    sum(amount) AS won_amount_90d
  FROM public.sales
  WHERE status IN ('completed', 'won', 'closed')
    AND COALESCE(closed_at, updated_at) >= (now() - interval '90 days')
  GROUP BY salesperson_id
),
goals_current AS (
  -- Meta vigente = linha MAIS RECENTE de sales_goals com month ≤ mês
  -- corrente no fuso de negócio (fallback: cobre vendedor sem meta lançada
  -- no mês corrente — antes o match exato zerava monthly_goal).
  SELECT DISTINCT ON (salesperson_id)
    salesperson_id,
    goal_amount
  FROM sales_goals
  WHERE month <= date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo')::date
  ORDER BY salesperson_id, month DESC
)
SELECT
  COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id) AS salesperson_id,
  COALESCE(SUM(od.amount), 0) AS total_open_pipeline,
  COALESCE(SUM(od.amount * od.stage_probability), 0) AS weighted_forecast,
  count(od.id) FILTER (WHERE od.id IS NOT NULL) AS open_deals_count,
  COALESCE(MAX(cr.avg_cycle_days), 45) AS avg_cycle_days,
  COALESCE(MAX(cr.won_amount_90d), 0) AS won_amount_90d,
  COALESCE(MAX(cr.won_count), 0) AS won_count_90d,
  COALESCE(MAX(gc.goal_amount), 0) AS monthly_goal,
  COALESCE(MAX(ca.commit_amount), 0) as commit_amount,
  COALESCE(MAX(ca.best_case_amount), 0) as best_case_amount,
  COALESCE(MAX(ca.pipeline_amount), 0) as pipeline_amount,
  -- Cenários: COALESCE por categoria — sem best_case/pipeline o cenário não
  -- zera mais, só desconsidera o componente ausente.
  COALESCE(MAX(COALESCE(ca.commit_amount, 0)), 0) AS pessimistic_30d,
  COALESCE(MAX(COALESCE(ca.commit_amount, 0) + COALESCE(ca.best_case_amount, 0) * 0.5), 0) AS realistic_30d,
  COALESCE(MAX(COALESCE(ca.commit_amount, 0) + COALESCE(ca.best_case_amount, 0) + COALESCE(ca.pipeline_amount, 0) * 0.3), 0) AS optimistic_30d
FROM open_deals od
FULL JOIN closed_recent cr ON cr.salesperson_id = od.salesperson_id
FULL JOIN goals_current gc ON gc.salesperson_id = COALESCE(od.salesperson_id, cr.salesperson_id)
LEFT JOIN category_agg ca ON ca.salesperson_id = COALESCE(od.salesperson_id, cr.salesperson_id)
-- Pipeline sem dono (salesperson_id NULL) conta como "ativo": antes
-- is_salesperson_active(NULL)=false o escondia do forecast.
WHERE COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id) IS NULL
   OR public.is_salesperson_active(COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id))
GROUP BY COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id);

GRANT SELECT ON public.revenue_forecast_view TO authenticated;
