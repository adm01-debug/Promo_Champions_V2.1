-- Update auto_victory_post
CREATE OR REPLACE FUNCTION public.auto_victory_post()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Big Sale Victory (> 5000)
    IF TG_TABLE_NAME = 'sales' AND NEW.deal_status = 'won' AND (OLD.deal_status IS DISTINCT FROM NEW.deal_status) AND NEW.amount >= 5000 THEN
        INSERT INTO public.victory_feed (salesperson_id, title, description, value, event_type)
        VALUES (
            NEW.salesperson_id,
            'Fechamento Épico! 🚀',
            'Selou um deal de ' || COALESCE(NEW.product_name, 'Produto') || ' para ' || COALESCE(NEW.client_name, 'Cliente'),
            NEW.amount,
            'sale'
        );
        
        -- Award a Prize Wheel spin for big sales in the correct table
        INSERT INTO public.available_spins (salesperson_id, spins_count, updated_at)
        VALUES (NEW.salesperson_id, 1, now())
        ON CONFLICT (salesperson_id) 
        DO UPDATE SET spins_count = available_spins.spins_count + 1, updated_at = now();
    END IF;

    -- Battle Victory
    IF TG_TABLE_NAME = 'sales_battles' AND NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM NEW.status) AND NEW.winner_id IS NOT NULL THEN
        INSERT INTO public.victory_feed (salesperson_id, title, description, event_type)
        VALUES (
            NEW.winner_id,
            'Campeão da Arena! 🏆',
            'Venceu a batalha: ' || NEW.title,
            'achievement'
        );
        
        -- Award XP and Spin
        INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
        VALUES (NEW.winner_id, COALESCE(NEW.xp_reward, 100), 'battle', NEW.id, 'Vitória na Batalha: ' || NEW.title);

        INSERT INTO public.available_spins (salesperson_id, spins_count, updated_at)
        VALUES (NEW.winner_id, 2, now())
        ON CONFLICT (salesperson_id) 
        DO UPDATE SET spins_count = available_spins.spins_count + 2, updated_at = now();
    END IF;

    RETURN NEW;
END;
$function$;

-- Update calculate_asset_efficiency
CREATE OR REPLACE FUNCTION public.calculate_asset_efficiency(_asset_id uuid)
 RETURNS TABLE(total_views bigint, deals_influenced bigint, win_rate_influenced numeric, total_revenue_influenced numeric)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT l.id)::BIGINT as total_views,
        COUNT(DISTINCT s.id)::BIGINT as deals_influenced,
        CASE 
            WHEN COUNT(DISTINCT l.deal_id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END)::DECIMAL / COUNT(DISTINCT l.deal_id) * 100)
            ELSE 0 
        END as win_rate_influenced,
        COALESCE(SUM(CASE WHEN s.status = 'completed' THEN s.amount END), 0) as total_revenue_influenced
    FROM public.asset_usage_logs l
    LEFT JOIN public.sales s ON l.deal_id = s.id
    WHERE l.asset_id = _asset_id;
END;
$function$;

-- Update check_battle_achievements
CREATE OR REPLACE FUNCTION public.check_battle_achievements()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Badge: Primeiro Duelo Vencido
    IF NEW.winner_id IS NOT NULL AND OLD.winner_id IS NULL THEN
        PERFORM public.award_achievement_if_not_exists(NEW.winner_id, 'first_battle_win');
    END IF;
    
    -- Badge: Veterano de Guerra (10 vitórias)
    IF NEW.winner_id IS NOT NULL AND OLD.winner_id IS NULL THEN
      IF (SELECT count(*) FROM public.weekly_matchups WHERE winner_id = NEW.winner_id) >= 10 THEN
          PERFORM public.award_achievement_if_not_exists(NEW.winner_id, 'battle_veteran');
      END IF;
    END IF;

    RETURN NEW;
END;
$function$;

-- Update generate_cadence_tasks
CREATE OR REPLACE FUNCTION public.generate_cadence_tasks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    step_record RECORD;
BEGIN
    -- For each step in the assigned cadence, create a task
    FOR step_record IN 
        SELECT id, day_number, title, description, template_content, task_type 
        FROM public.cadence_steps 
        WHERE cadence_id = NEW.cadence_id
    LOOP
        INSERT INTO public.cadence_tasks (
            prospect_cadence_id,
            cadence_step_id,
            scheduled_date,
            status,
            priority,
            task_type
        ) VALUES (
            NEW.id,
            step_record.id,
            CURRENT_DATE + (step_record.day_number || ' days')::interval,
            'pending',
            'medium',
            step_record.task_type
        );
    END LOOP;

    RETURN NEW;
END;
$function$;

-- Update handle_template_versioning
CREATE OR REPLACE FUNCTION public.handle_template_versioning()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    next_version INTEGER;
BEGIN
    IF (OLD.whatsapp_template IS DISTINCT FROM NEW.whatsapp_template) THEN
        SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
        FROM public.whatsapp_template_versions
        WHERE template_id = NEW.id;

        INSERT INTO public.whatsapp_template_versions (template_id, body, version_number, created_by)
        VALUES (NEW.id, NEW.whatsapp_template, next_version, auth.uid());
    END IF;
    RETURN NEW;
END;
$function$;

-- Update reconcile_forecast_accuracy
CREATE OR REPLACE FUNCTION public.reconcile_forecast_accuracy(_days integer DEFAULT 30)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    v_target_date DATE := CURRENT_DATE - (_days || ' days')::interval;
BEGIN
    -- Atualiza os snapshots antigos com o valor real realizado no período
    UPDATE public.forecast_snapshots fs
    SET actual_realized_value = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.sales
        WHERE status = 'completed'
        AND created_at BETWEEN fs.snapshot_date AND (fs.snapshot_date + (fs.horizon_days || ' days')::interval)
    )
    WHERE fs.snapshot_date = v_target_date;

    -- Insere na tabela de precisão
    INSERT INTO public.forecast_accuracy (period_start, period_end, forecasted_value, actual_value, deviation_pct)
    SELECT 
        snapshot_date, 
        (snapshot_date + (horizon_days || ' days')::interval),
        realistic_value,
        actual_realized_value,
        CASE WHEN realistic_value > 0 THEN ABS(actual_realized_value - realistic_value) / realistic_value * 100 ELSE 0 END
    FROM public.forecast_snapshots
    WHERE snapshot_date = v_target_date;
END;
$function$;

-- Update sync_sales_statuses
CREATE OR REPLACE FUNCTION public.sync_sales_statuses()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status IS NOT NULL AND (NEW.deal_status IS NULL OR NEW.deal_status::text != NEW.status) THEN
    -- Try to cast status string to deal_status enum
    BEGIN
      NEW.deal_status := NEW.status::public.deal_status;
    EXCEPTION WHEN OTHERS THEN
      -- If cast fails, leave deal_status as is or handle error
    END;
  ELSIF NEW.deal_status IS NOT NULL AND (NEW.status IS NULL OR NEW.status != NEW.deal_status::text) THEN
    NEW.status := NEW.deal_status::text;
  END IF;
  RETURN NEW;
END;
$function$;

-- Update sync_weekly_xp
CREATE OR REPLACE FUNCTION public.sync_weekly_xp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.league_members (salesperson_id, weekly_xp, updated_at)
    VALUES (NEW.salesperson_id, NEW.xp_amount, now())
    ON CONFLICT (salesperson_id) 
    DO UPDATE SET 
        weekly_xp = league_members.weekly_xp + NEW.xp_amount,
        updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update trg_process_email_tracking_event
CREATE OR REPLACE FUNCTION public.trg_process_email_tracking_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    v_prospect_id UUID;
    v_intent_type TEXT;
BEGIN
    -- Map event types
    IF NEW.event_type = 'open' THEN
        v_intent_type := 'email_open';
    ELSIF NEW.event_type = 'click' THEN
        -- Check if it's a price click
        IF NEW.metadata->>'url' LIKE '%price%' OR NEW.metadata->>'url' LIKE '%preco%' THEN
            v_intent_type := 'price_click';
        ELSE
            v_intent_type := 'email_open';
        END IF;
    ELSE
        RETURN NEW;
    END IF;

    -- Find the active prospect cadence for this sale
    SELECT id INTO v_prospect_id
    FROM public.prospect_cadences
    WHERE sale_id = NEW.sale_id
      AND status = 'active'
    LIMIT 1;

    -- If found, process the intent
    IF v_prospect_id IS NOT NULL THEN
        PERFORM public.process_lead_intent_event(
            v_prospect_id,
            v_intent_type,
            jsonb_build_object(
                'source', 'email_tracking',
                'event_id', NEW.id,
                'metadata', NEW.metadata
            )
        );
    END IF;

    RETURN NEW;
END;
$function$;

-- Update update_client_total_value
CREATE OR REPLACE FUNCTION public.update_client_total_value()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') THEN
        UPDATE public.clients 
        SET total_value = COALESCE(total_value, 0) + NEW.amount
        WHERE id = NEW.client_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed') THEN
        UPDATE public.clients 
        SET total_value = GREATEST(0, COALESCE(total_value, 0) - OLD.amount)
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$function$;
