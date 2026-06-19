
-- 1) Atualiza callers para qualificar com private.* ANTES de mover (mantém compat se algo falhar a meio)
-- Como ainda estão em public no momento do CREATE OR REPLACE, qualificar com private. falharia.
-- Então: primeiro movemos as 8 para private, depois recriamos os callers.

ALTER FUNCTION public.add_salesperson_xp(uuid, integer, text) SET SCHEMA private;
ALTER FUNCTION public.refresh_competitive_ranking() SET SCHEMA private;
ALTER FUNCTION public.refresh_monthly_sales_summary(text) SET SCHEMA private;
ALTER FUNCTION public.snapshot_race_daily(uuid) SET SCHEMA private;
ALTER FUNCTION public.award_achievement_if_not_exists(uuid, text) SET SCHEMA private;
ALTER FUNCTION public.check_is_first_activation(uuid, uuid) SET SCHEMA private;
ALTER FUNCTION public.update_performance_bet_progress() SET SCHEMA private;
ALTER FUNCTION public.update_territory_conquests() SET SCHEMA private;

-- 2) Recria callers usando o schema qualificado private.*
CREATE OR REPLACE FUNCTION public.register_race_daily_checkin(_season_id uuid, _salesperson_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  today_br DATE := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  yesterday_br DATE := today_br - INTERVAL '1 day';
  prev_streak INTEGER := 0;
  new_streak INTEGER := 1;
  today_snap RECORD;
  prev_snap RECORD;
  result JSONB;
  already_checked_in BOOLEAN;
BEGIN
  PERFORM private.snapshot_race_daily(_season_id);

  SELECT EXISTS (
    SELECT 1 FROM public.race_user_daily_checkins
    WHERE user_id = auth.uid() AND season_id = _season_id AND checkin_date = today_br
  ) INTO already_checked_in;

  SELECT streak_days INTO prev_streak
  FROM public.race_user_daily_checkins
  WHERE user_id = auth.uid() AND season_id = _season_id AND checkin_date = yesterday_br
  LIMIT 1;

  IF prev_streak IS NULL THEN prev_streak := 0; END IF;
  new_streak := prev_streak + 1;

  INSERT INTO public.race_user_daily_checkins (user_id, season_id, streak_days)
  VALUES (auth.uid(), _season_id, new_streak)
  ON CONFLICT (user_id, season_id, checkin_date) DO UPDATE SET streak_days = EXCLUDED.streak_days;

  SELECT * INTO today_snap FROM public.race_daily_snapshots
  WHERE season_id = _season_id AND salesperson_id = _salesperson_id AND snapshot_date = today_br
  LIMIT 1;

  SELECT * INTO prev_snap FROM public.race_daily_snapshots
  WHERE season_id = _season_id AND salesperson_id = _salesperson_id AND snapshot_date < today_br
  ORDER BY snapshot_date DESC
  LIMIT 1;

  result := jsonb_build_object(
    'already_checked_in_today', already_checked_in,
    'streak_days', new_streak,
    'previous_streak', prev_streak,
    'today', CASE WHEN today_snap IS NOT NULL THEN jsonb_build_object(
      'rank', today_snap.rank,
      'progress', today_snap.progress,
      'total_sales', today_snap.total_sales,
      'deals_count', today_snap.deals_count
    ) ELSE NULL END,
    'previous', CASE WHEN prev_snap IS NOT NULL THEN jsonb_build_object(
      'date', prev_snap.snapshot_date,
      'rank', prev_snap.rank,
      'progress', prev_snap.progress,
      'total_sales', prev_snap.total_sales,
      'deals_count', prev_snap.deals_count
    ) ELSE NULL END,
    'delta', CASE WHEN today_snap IS NOT NULL AND prev_snap IS NOT NULL THEN jsonb_build_object(
      'rank', prev_snap.rank - today_snap.rank,
      'progress', today_snap.progress - prev_snap.progress,
      'total_sales', today_snap.total_sales - prev_snap.total_sales,
      'deals_count', today_snap.deals_count - prev_snap.deals_count
    ) ELSE NULL END
  );

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION private.award_xp_on_quote_approved_via_cadence()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_salesperson_id uuid;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved') THEN
    SELECT pc.salesperson_id
      INTO v_salesperson_id
      FROM public.prospect_cadences pc
     WHERE pc.quote_id = NEW.id
     ORDER BY pc.started_at DESC
     LIMIT 1;

    IF v_salesperson_id IS NOT NULL THEN
      PERFORM private.add_salesperson_xp(v_salesperson_id, 50, 'quote_approved_via_cadence');
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION private.award_xp_on_quote_cadence_task_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_salesperson_id uuid;
  v_quote_id uuid;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed') THEN
    SELECT pc.salesperson_id, pc.quote_id
      INTO v_salesperson_id, v_quote_id
      FROM public.prospect_cadences pc
     WHERE pc.id = NEW.prospect_cadence_id;

    IF v_quote_id IS NOT NULL AND v_salesperson_id IS NOT NULL THEN
      PERFORM private.add_salesperson_xp(v_salesperson_id, 15, 'quote_cadence_task');
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION private.handle_sale_commissions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_is_activation BOOLEAN;
    v_sdr_commission NUMERIC := 0;
    v_closer_commission NUMERIC := 0;
    v_rule_percentage NUMERIC;
    v_rule_id UUID;
    v_target_closer_id UUID;
BEGIN
    IF (
        (TG_OP = 'UPDATE' AND (NEW.status IN ('completed', 'won') OR NEW.deal_status = 'completed') AND (OLD.status NOT IN ('completed', 'won') AND OLD.deal_status != 'completed'))
        OR 
        (TG_OP = 'INSERT' AND (NEW.status IN ('completed', 'won') OR NEW.deal_status = 'completed'))
    ) THEN
        v_target_closer_id := COALESCE(NEW.closer_id, NEW.salesperson_id);

        IF v_target_closer_id IS NULL THEN
            RETURN NEW;
        END IF;

        IF NEW.is_first_sale IS NOT NULL THEN
            v_is_activation := NEW.is_first_sale;
        ELSE
            IF NEW.client_id IS NOT NULL THEN
                v_is_activation := private.check_is_first_activation(NEW.client_id, NEW.id);
            ELSE
                v_is_activation := TRUE;
            END IF;
        END IF;

        SELECT id, percentage INTO v_rule_id, v_rule_percentage 
        FROM public.commission_rules 
        WHERE is_active = true 
        AND (salesperson_id = v_target_closer_id OR salesperson_id IS NULL)
        ORDER BY priority DESC LIMIT 1;
        
        IF v_rule_percentage IS NULL THEN v_rule_percentage := 5.0; END IF;

        v_closer_commission := (NEW.amount * v_rule_percentage / 100);
        
        INSERT INTO public.commissions (
            sale_id, salesperson_id, rule_id, base_amount, percentage, commission_amount, status, is_first_sale
        ) VALUES (
            NEW.id, v_target_closer_id, v_rule_id, NEW.amount, v_rule_percentage, v_closer_commission, 'pending', v_is_activation
        );

        IF v_is_activation AND NEW.sdr_id IS NOT NULL AND NEW.sdr_id != v_target_closer_id THEN
            v_sdr_commission := (NEW.amount * v_rule_percentage / 100);
            
            INSERT INTO public.commissions (
                sale_id, salesperson_id, rule_id, base_amount, percentage, commission_amount, status, is_first_sale
            ) VALUES (
                NEW.id, NEW.sdr_id, v_rule_id, NEW.amount, v_rule_percentage, v_sdr_commission, 'pending', TRUE
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION private.trigger_refresh_monthly_summary()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM private.refresh_monthly_sales_summary(to_char(OLD.created_at, 'YYYY-MM'));
        RETURN OLD;
    ELSE
        PERFORM private.refresh_monthly_sales_summary(to_char(NEW.created_at, 'YYYY-MM'));
        RETURN NEW;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION private.trigger_update_performance_bets()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    PERFORM private.update_performance_bet_progress();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION private.trigger_update_territories()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    PERFORM private.update_territory_conquests();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_battle_achievements()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.winner_id IS NOT NULL AND OLD.winner_id IS NULL THEN
        PERFORM private.award_achievement_if_not_exists(NEW.winner_id, 'first_battle_win');
    END IF;
    
    IF NEW.winner_id IS NOT NULL AND OLD.winner_id IS NULL THEN
      IF (SELECT count(*) FROM public.weekly_matchups WHERE winner_id = NEW.winner_id) >= 10 THEN
          PERFORM private.award_achievement_if_not_exists(NEW.winner_id, 'battle_veteran');
      END IF;
    END IF;

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_refresh_ranking_on_sale()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    PERFORM private.refresh_competitive_ranking();
    RETURN NULL;
END;
$function$;

-- 3) Garante que privilégios em private permanecem restritos
REVOKE ALL ON FUNCTION private.add_salesperson_xp(uuid, integer, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.refresh_competitive_ranking() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.refresh_monthly_sales_summary(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.snapshot_race_daily(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.award_achievement_if_not_exists(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.check_is_first_activation(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.update_performance_bet_progress() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.update_territory_conquests() FROM PUBLIC, anon, authenticated;
