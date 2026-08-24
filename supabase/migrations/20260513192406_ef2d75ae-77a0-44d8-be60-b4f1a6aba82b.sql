-- Update sync_quote_to_sale_status
CREATE OR REPLACE FUNCTION public.sync_quote_to_sale_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_pipeline_status TEXT;
BEGIN
  -- Definir o status do pipeline com base no status do orçamento
  v_pipeline_status := CASE 
    WHEN NEW.status = 'draft' THEN 'lead'
    WHEN NEW.status = 'sent' THEN 'proposal'
    WHEN NEW.status = 'approved' THEN 'closed'
    WHEN NEW.status = 'rejected' THEN 'cancelled'
    WHEN NEW.status = 'expired' THEN 'cancelled'
    ELSE 'lead'
  END;

  -- Se o orçamento estiver vinculado a uma venda (pipeline)
  IF NEW.sale_id IS NOT NULL THEN
    UPDATE public.sales
    SET 
      status = v_pipeline_status,
      amount = NEW.total_value,
      updated_at = now()
    WHERE id = NEW.sale_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Update check_quote_expirations
CREATE OR REPLACE FUNCTION public.check_quote_expirations()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.quotes
    SET status = 'expired',
        updated_at = now()
    WHERE status = 'sent'
      AND valid_until < now();
END;
$function$;

-- Update trigger_recalculate_deal_health
CREATE OR REPLACE FUNCTION public.trigger_recalculate_deal_health()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sale_id UUID;
BEGIN
  -- Get sale_id from the recording
  SELECT sale_id INTO v_sale_id 
  FROM public.call_recordings 
  WHERE id = NEW.recording_id;

  IF v_sale_id IS NOT NULL THEN
    UPDATE public.deal_health_scores
    SET calculated_at = now() - interval '1 day' -- Mark as stale
    WHERE sale_id = v_sale_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update sync_total_xp
CREATE OR REPLACE FUNCTION public.sync_total_xp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.salesperson_xp (salesperson_id, total_xp, updated_at)
    VALUES (NEW.salesperson_id, NEW.xp_amount, now())
    ON CONFLICT (salesperson_id) 
    DO UPDATE SET 
        total_xp = salesperson_xp.total_xp + NEW.xp_amount,
        updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update maintain_sales_streaks
CREATE OR REPLACE FUNCTION public.maintain_sales_streaks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_last_activity TIMESTAMP;
    v_current_streak INTEGER;
BEGIN
    -- Obter a streak atual
    SELECT last_activity_at, current_streak INTO v_last_activity, v_current_streak
    FROM public.sales_streaks
    WHERE salesperson_id = NEW.salesperson_id;

    IF NOT FOUND THEN
        INSERT INTO public.sales_streaks (salesperson_id, current_streak, last_activity_at)
        VALUES (NEW.salesperson_id, 1, now());
    ELSE
        -- Se a última atividade foi ontem, incrementa
        IF v_last_activity::date = (now() - INTERVAL '1 day')::date THEN
            UPDATE public.sales_streaks
            SET current_streak = current_streak + 1,
                last_activity_at = now(),
                longest_streak = GREATEST(longest_streak, current_streak + 1)
            WHERE salesperson_id = NEW.salesperson_id;
            
            -- Ganha um giro a cada 7 dias de streak
            IF (v_current_streak + 1) % 7 = 0 THEN
                INSERT INTO public.available_spins (salesperson_id, spins_count, updated_at)
                VALUES (NEW.salesperson_id, 1, now())
                ON CONFLICT (salesperson_id) 
                DO UPDATE SET spins_count = available_spins.spins_count + 1, updated_at = now();
            END IF;
        -- Se a última atividade foi hoje, apenas atualiza o timestamp
        ELSIF v_last_activity::date = now()::date THEN
            UPDATE public.sales_streaks
            SET last_activity_at = now()
            WHERE salesperson_id = NEW.salesperson_id;
        -- Se falhou dias, reseta
        ELSE
            UPDATE public.sales_streaks
            SET current_streak = 1,
                last_activity_at = now()
            WHERE salesperson_id = NEW.salesperson_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

-- Update refresh_monthly_sales_summary
CREATE OR REPLACE FUNCTION public.refresh_monthly_sales_summary(p_month text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.monthly_sales_summary (month, revenue, deals, won_deals, updated_at)
    SELECT 
        to_char(created_at, 'YYYY-MM') as month,
        SUM(CASE WHEN deal_status::text IN ('won', 'completed') OR status IN ('won', 'completed') THEN amount ELSE 0 END)::NUMERIC as revenue,
        COUNT(*)::INT as deals,
        COUNT(CASE WHEN deal_status::text IN ('won', 'completed') OR status IN ('won', 'completed') THEN 1 END)::INT as won_deals,
        now()
    FROM public.sales
    WHERE to_char(created_at, 'YYYY-MM') = p_month
    GROUP BY 1
    ON CONFLICT (month) DO UPDATE 
    SET revenue = EXCLUDED.revenue,
        deals = EXCLUDED.deals,
        won_deals = EXCLUDED.won_deals,
        updated_at = EXCLUDED.updated_at;
END;
$function$;

-- Update manage_stock_on_sale
CREATE OR REPLACE FUNCTION public.manage_stock_on_sale()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') AND NEW.product_id IS NOT NULL AND NEW.stock_reduced = FALSE THEN
        UPDATE public.products
        SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - 1),
            sales_count = COALESCE(sales_count, 0) + 1,
            updated_at = now()
        WHERE id = NEW.product_id;
        
        NEW.stock_reduced := TRUE;
    END IF;
    RETURN NEW;
END;
$function$;

-- Update auto_enroll_in_cadence
CREATE OR REPLACE FUNCTION public.auto_enroll_in_cadence()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    matching_rule RECORD;
BEGIN
    SELECT r.id, r.cadence_id
    INTO matching_rule
    FROM public.cadence_enrollment_rules r
    WHERE r.is_active = true
      AND (r.trigger_stage IS NULL OR r.trigger_stage = NEW.status)
      AND (r.trigger_category IS NULL OR r.trigger_category = NEW.category)
      AND (r.trigger_source IS NULL OR r.trigger_source = NEW.source)
      AND (r.min_amount IS NULL OR NEW.total_amount >= r.min_amount)
      AND (r.max_amount IS NULL OR NEW.total_amount <= r.max_amount)
      -- Don't re-enroll if active cadence exists
      AND NOT EXISTS (
        SELECT 1 FROM public.prospect_cadences pc
        WHERE pc.sale_id = NEW.id
          AND pc.cadence_id = r.cadence_id
          AND pc.status IN ('active', 'paused')
      )
    ORDER BY r.priority ASC
    LIMIT 1;

    IF matching_rule.id IS NOT NULL THEN
        INSERT INTO public.prospect_cadences (
            sale_id,
            cadence_id,
            salesperson_id,
            status,
            next_action_date
        ) VALUES (
            NEW.id,
            matching_rule.cadence_id,
            NEW.salesperson_id,
            'active',
            CURRENT_DATE
        );
    END IF;

    RETURN NEW;
END;
$function$;

-- Update calculate_source_roi
CREATE OR REPLACE FUNCTION public.calculate_source_roi(_source text, _days integer DEFAULT 30)
 RETURNS TABLE(total_leads bigint, total_revenue numeric, roi_index numeric)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(s.id)::BIGINT as total_leads,
        COALESCE(SUM(s.amount), 0) as total_revenue,
        CASE 
            WHEN (SELECT monthly_budget FROM public.lead_source_configs WHERE source_name = _source) > 0 
            THEN (COALESCE(SUM(s.amount), 0) / (SELECT monthly_budget FROM public.lead_source_configs WHERE source_name = _source))
            ELSE 0 
        END as roi_index
    FROM public.sales s
    WHERE s.source = _source
    AND s.created_at >= (now() - (_days || ' days')::interval);
END;
$function$;

-- Update enrich_lead_data
CREATE OR REPLACE FUNCTION public.enrich_lead_data(lead_id uuid, new_data jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.sales
    SET 
        enrichment_data = enrichment_data || new_data,
        enrichment_status = 'completed',
        updated_at = now()
    WHERE id = lead_id;
END;
$function$;
