-- Update award_achievement_if_not_exists
CREATE OR REPLACE FUNCTION public.award_achievement_if_not_exists(p_salesperson_id uuid, p_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_achievement_id UUID;
BEGIN
    -- Verificar se já tem a conquista
    IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE salesperson_id = p_salesperson_id AND achievement_type = p_type) THEN
        INSERT INTO public.achievements (salesperson_id, achievement_type)
        VALUES (p_salesperson_id, p_type);
    END IF;
END;
$function$;

-- Update log_lead_stage_transition
CREATE OR REPLACE FUNCTION public.log_lead_stage_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.funnel_stage IS DISTINCT FROM NEW.funnel_stage THEN
    INSERT INTO public.lead_detailed_logs (client_id, event_type, action, details, created_by)
    VALUES (
      NEW.id, 
      'transition', 
      'Stage Change', 
      jsonb_build_object('from', OLD.funnel_stage, 'to', NEW.funnel_stage),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Update match_weekly_players
CREATE OR REPLACE FUNCTION public.match_weekly_players()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    active_salespeople UUID[];
    player_a UUID;
    player_b UUID;
    i INT;
    num_players INT;
    week_start DATE := public.start_of_week(CURRENT_DATE, 1);
BEGIN
    -- Pegar IDs de vendedores ativos
    SELECT ARRAY_AGG(id) INTO active_salespeople
    FROM public.salespeople
    WHERE is_active = true;

    num_players := ARRAY_LENGTH(active_salespeople, 1);
    
    -- Se número for ímpar, removemos um aleatoriamente para parear
    IF num_players % 2 != 0 THEN
        active_salespeople := active_salespeople[1:num_players-1];
        num_players := num_players - 1;
    END IF;

    FOR i IN 1..num_players LOOP
        -- Pegar dois jogadores e criar o matchup
        IF i % 2 != 0 AND i < num_players THEN
            player_a := active_salespeople[i];
            player_b := active_salespeople[i+1];
            
            INSERT INTO public.weekly_matchups (salesperson_a_id, salesperson_b_id, week_start, xp_reward, status)
            VALUES (player_a, player_b, week_start, 250, 'active')
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END;
$function$;

-- Update notify_asset_ai_status
CREATE OR REPLACE FUNCTION public.notify_asset_ai_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Se view_count atingir um limite (ex: 50) e for ativo, notifica como 'IA Ativa'
    IF NEW.view_count >= 50 AND OLD.view_count < 50 THEN
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            category,
            priority,
            action_url
        )
        SELECT 
            sp.id,
            '🚀 Novo Material IA Ativa: ' || NEW.title,
            'Este material atingiu o nível de Elite e agora possui suporte neural aprimorado.',
            'ai',
            'high',
            '/sales-enablement'
        FROM public.salespeople sp;
    END IF;
    RETURN NEW;
END;
$function$;

-- Update start_of_week
CREATE OR REPLACE FUNCTION public.start_of_week(date_val date, start_day integer DEFAULT 1)
 RETURNS date
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN date_val - (EXTRACT(DOW FROM date_val)::INT - start_day + 7) % 7;
END;
$function$;

-- Update trigger_refresh_monthly_summary
CREATE OR REPLACE FUNCTION public.trigger_refresh_monthly_summary()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM public.refresh_monthly_sales_summary(to_char(OLD.created_at, 'YYYY-MM'));
        RETURN OLD;
    ELSE
        PERFORM public.refresh_monthly_sales_summary(to_char(NEW.created_at, 'YYYY-MM'));
        RETURN NEW;
    END IF;
END;
$function$;

-- Update trigger_update_performance_bets
CREATE OR REPLACE FUNCTION public.trigger_update_performance_bets()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    PERFORM public.update_performance_bet_progress();
    RETURN NEW;
END;
$function$;

-- Update trigger_update_territories
CREATE OR REPLACE FUNCTION public.trigger_update_territories()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    PERFORM public.update_territory_conquests();
    RETURN NEW;
END;
$function$;

-- Update update_performance_bet_progress
CREATE OR REPLACE FUNCTION public.update_performance_bet_progress()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    bet_record RECORD;
    progress_val NUMERIC;
    xp_change INTEGER;
BEGIN
    FOR bet_record IN 
        SELECT * FROM public.performance_bets 
        WHERE status = 'active'
    LOOP
        progress_val := 0;
        
        -- Calculate progress based on bet type
        IF bet_record.bet_type = 'deals' THEN
            SELECT COUNT(*) INTO progress_val 
            FROM public.sales 
            WHERE salesperson_id = bet_record.salesperson_id 
              AND created_at >= bet_record.created_at 
              AND created_at <= bet_record.ends_at
              AND (status = 'won' OR status = 'completed');
              
        ELSIF bet_record.bet_type = 'revenue' THEN
            SELECT COALESCE(SUM(amount), 0) INTO progress_val 
            FROM public.sales 
            WHERE salesperson_id = bet_record.salesperson_id 
              AND created_at >= bet_record.created_at 
              AND created_at <= bet_record.ends_at
              AND (status = 'won' OR status = 'completed');
              
        ELSIF bet_record.bet_type = 'calls' THEN
            SELECT COUNT(*) INTO progress_val 
            FROM public.activities 
            WHERE salesperson_id = bet_record.salesperson_id 
              AND created_at >= bet_record.created_at 
              AND created_at <= bet_record.ends_at
              AND activity_type = 'call';
              
        ELSIF bet_record.bet_type = 'meetings' THEN
            SELECT COUNT(*) INTO progress_val 
            FROM public.activities 
            WHERE salesperson_id = bet_record.salesperson_id 
              AND created_at >= bet_record.created_at 
              AND created_at <= bet_record.ends_at
              AND activity_type = 'meeting';
              
        ELSIF bet_record.bet_type = 'activities' THEN
            SELECT COUNT(*) INTO progress_val 
            FROM public.activities 
            WHERE salesperson_id = bet_record.salesperson_id 
              AND created_at >= bet_record.created_at 
              AND created_at <= bet_record.ends_at;
        END IF;

        -- Update the current value
        UPDATE public.performance_bets 
        SET current_value = progress_val,
            updated_at = now()
        WHERE id = bet_record.id;
        
        -- Check if target reached (WON)
        IF progress_val >= bet_record.target_value THEN
            UPDATE public.performance_bets 
            SET status = 'won', resolved_at = now() 
            WHERE id = bet_record.id;
            
            xp_change := (bet_record.xp_wagered * bet_record.xp_multiplier)::INTEGER;
            
            -- Award XP
            UPDATE public.salesperson_xp 
            SET total_xp = total_xp + xp_change,
                updated_at = now()
            WHERE salesperson_id = bet_record.salesperson_id;
            
            -- Log history
            INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
            VALUES (bet_record.salesperson_id, xp_change, 'bet_won', bet_record.id, 'Ganhou aposta: ' || bet_record.description);
            
        -- Check if expired (LOST)
        ELSIF now() > bet_record.ends_at THEN
            UPDATE public.performance_bets 
            SET status = 'lost', resolved_at = now() 
            WHERE id = bet_record.id;
            
            UPDATE public.salesperson_xp 
            SET total_xp = GREATEST(0, total_xp - bet_record.xp_wagered),
                updated_at = now()
            WHERE salesperson_id = bet_record.salesperson_id;
        END IF;
    END LOOP;
END;
$function$;

-- Update update_territory_conquests
CREATE OR REPLACE FUNCTION public.update_territory_conquests()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    territory_rec RECORD;
    top_owner_id UUID;
    top_revenue NUMERIC;
    total_deals_val INTEGER;
    total_revenue_val NUMERIC;
BEGIN
    -- For each distinct territory name
    FOR territory_rec IN 
        SELECT DISTINCT COALESCE(product_name, category, 'Outros') as t_name FROM public.sales WHERE status IN ('won', 'completed')
    LOOP
        -- Find the top owner
        SELECT salesperson_id, SUM(amount) INTO top_owner_id, top_revenue
        FROM public.sales
        WHERE COALESCE(product_name, category, 'Outros') = territory_rec.t_name
          AND status IN ('won', 'completed')
        GROUP BY salesperson_id
        ORDER BY 2 DESC
        LIMIT 1;

        -- Get totals for the territory
        SELECT SUM(amount), COUNT(*) INTO total_revenue_val, total_deals_val
        FROM public.sales
        WHERE COALESCE(product_name, category, 'Outros') = territory_rec.t_name
          AND status IN ('won', 'completed');

        -- Upsert
        INSERT INTO public.territories (name, current_owner_id, total_revenue, total_deals, conquered_at)
        VALUES (territory_rec.t_name, top_owner_id, total_revenue_val, total_deals_val, now())
        ON CONFLICT (name) DO UPDATE 
        SET current_owner_id = EXCLUDED.current_owner_id,
            total_revenue = EXCLUDED.total_revenue,
            total_deals = EXCLUDED.total_deals,
            conquered_at = CASE WHEN territories.current_owner_id IS NULL OR territories.current_owner_id <> EXCLUDED.current_owner_id THEN now() ELSE territories.conquered_at END,
            updated_at = now();
            
        -- Log to history if owner changed
        IF EXISTS (SELECT 1 FROM public.territories t WHERE t.name = territory_rec.t_name AND (t.current_owner_id IS NULL OR t.current_owner_id <> top_owner_id)) THEN
             INSERT INTO public.territory_history (territory_id, salesperson_id, revenue_contribution, deals_count, conquered_at)
             SELECT id, top_owner_id, top_revenue, total_deals_val, now()
             FROM public.territories WHERE name = territory_rec.t_name;
        END IF;
    END LOOP;
END;
$function$;
