-- activities: soft-delete seguro e apostas/placares que não travam nem contam atividade excluída.
--
-- Causa (snapshot do banco oficial + funções da branch `contexto`, 2026-11-12):
--   1) private.update_performance_bet_progress() (trigger update_bets_on_activity / update_bets_on_sale)
--      e private.handle_performance_update() (tr_performance_update_*) fazem
--      `UPDATE public.performance_bets SET ..., updated_at = now()`, mas performance_bets não tem a
--      coluna updated_at → basta 1 aposta 'active' (de qualquer vendedor) para TODO INSERT/UPDATE em
--      activities e sales falhar ("column updated_at of relation performance_bets does not exist").
--   2) handle_performance_update(), ao ganhar a aposta, insere em public.xp_transactions, tabela
--      inexistente → a atividade que completa a aposta não é salva.
--   3) tr_update_bets_on_activity → public.process_performance_bet_event() (SECURITY INVOKER) soma +1
--      por cima do recálculo já feito pelos outros 3 triggers de aposta (conta a atividade 2x) e chama
--      check_performance_bets_completion() como o vendedor, que insere em xp_history (RLS só SELECT)
--      → a atividade que "completa" a aposta pela contagem dobrada é rejeitada.
--   4) Soft-delete (deleted_at) não é respeitado no recálculo de apostas (handle_performance_update,
--      update_performance_bet_progress, sync_performance_bets), na batalha (sync_battle_score) nem no
--      placar da corrida (race_leaderboard_view): atividade excluída continua pontuando.
--   5) A policy UPDATE de activities não restringe deleted_at/deleted_by: o vendedor grava
--      deleted_by com o id de outro usuário e desfaz a exclusão (deleted_at = NULL).
--
-- Efeito:
--   - performance_bets ganha updated_at (+ trigger padrão) → as funções de aposta voltam a rodar.
--   - handle_performance_update credita o XP da aposta ganha via xp_history (sync_total_xp atualiza
--     salesperson_xp), sem tabela inexistente.
--   - Sai o trigger redundante tr_update_bets_on_activity de activities (sales não muda).
--   - Recálculos de aposta/batalha e o placar da corrida passam a ignorar atividade excluída.
--   - Trigger BEFORE UPDATE em activities: deleted_by = auth.uid() ao excluir, autoria imutável e
--     restauração só por admin/gestor (ou backend com service_role).
-- Idempotente (IF NOT EXISTS / IF EXISTS / OR REPLACE).

-- ============================================================================
-- 1) performance_bets.updated_at
-- ============================================================================
ALTER TABLE public.performance_bets
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_performance_bets_updated_at ON public.performance_bets;
CREATE TRIGGER update_performance_bets_updated_at
  BEFORE UPDATE ON public.performance_bets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 2) Trigger redundante que conta a atividade 2x e grava XP como o vendedor
-- ============================================================================
DROP TRIGGER IF EXISTS tr_update_bets_on_activity ON public.activities;

-- ============================================================================
-- 3) Recálculos ignoram atividade excluída (deleted_at IS NULL)
-- ============================================================================
CREATE OR REPLACE FUNCTION private.handle_performance_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_bet RECORD;
    v_xp_change INTEGER;
BEGIN
    -- Only process active bets for the salesperson involved
    FOR v_bet IN 
        SELECT * FROM public.performance_bets 
        WHERE status = 'active' 
        AND salesperson_id = NEW.salesperson_id
    LOOP
        -- Calculate current progress for this specific bet
        IF v_bet.bet_type = 'deals' THEN
            SELECT COUNT(*) INTO v_bet.current_value 
            FROM public.sales 
            WHERE salesperson_id = v_bet.salesperson_id 
              AND created_at >= v_bet.created_at 
              AND created_at <= v_bet.ends_at
              AND (status = 'won' OR status = 'completed');
              
        ELSIF v_bet.bet_type = 'revenue' THEN
            SELECT COALESCE(SUM(amount), 0) INTO v_bet.current_value 
            FROM public.sales 
            WHERE salesperson_id = v_bet.salesperson_id 
              AND created_at >= v_bet.created_at 
              AND created_at <= v_bet.ends_at
              AND (status = 'won' OR status = 'completed');
              
        ELSIF v_bet.bet_type = 'calls' THEN
            SELECT COUNT(*) INTO v_bet.current_value 
            FROM public.activities 
            WHERE salesperson_id = v_bet.salesperson_id 
              AND created_at >= v_bet.created_at 
              AND created_at <= v_bet.ends_at
              AND activity_type = 'call'
              AND deleted_at IS NULL;
              
        ELSIF v_bet.bet_type = 'meetings' THEN
            SELECT COUNT(*) INTO v_bet.current_value 
            FROM public.activities 
            WHERE salesperson_id = v_bet.salesperson_id 
              AND created_at >= v_bet.created_at 
              AND created_at <= v_bet.ends_at
              AND activity_type = 'meeting'
              AND deleted_at IS NULL;
              
        ELSIF v_bet.bet_type = 'activities' THEN
            SELECT COUNT(*) INTO v_bet.current_value 
            FROM public.activities 
            WHERE salesperson_id = v_bet.salesperson_id 
              AND created_at >= v_bet.created_at 
              AND created_at <= v_bet.ends_at
              AND deleted_at IS NULL;
        END IF;

        -- Update the current value and check status
        IF v_bet.current_value >= v_bet.target_value THEN
            -- Bet Won
            v_xp_change := (v_bet.xp_wagered * v_bet.xp_multiplier)::INTEGER;
            
            UPDATE public.performance_bets 
            SET current_value = v_bet.current_value,
                status = 'won', 
                resolved_at = now(),
                updated_at = now()
            WHERE id = v_bet.id;
            
            -- Award XP (xp_history → trigger sync_total_xp atualiza salesperson_xp)
            INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
            VALUES (v_bet.salesperson_id, v_xp_change, 'bet_won', v_bet.id::text, 'Vitória em Aposta: ' || COALESCE(v_bet.description, ''));
        ELSE
            UPDATE public.performance_bets 
            SET current_value = v_bet.current_value,
                updated_at = now()
            WHERE id = v_bet.id;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.update_performance_bet_progress()
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
              AND activity_type = 'call'
              AND deleted_at IS NULL;
              
        ELSIF bet_record.bet_type = 'meetings' THEN
            SELECT COUNT(*) INTO progress_val 
            FROM public.activities 
            WHERE salesperson_id = bet_record.salesperson_id 
              AND created_at >= bet_record.created_at 
              AND created_at <= bet_record.ends_at
              AND activity_type = 'meeting'
              AND deleted_at IS NULL;
              
        ELSIF bet_record.bet_type = 'activities' THEN
            SELECT COUNT(*) INTO progress_val 
            FROM public.activities 
            WHERE salesperson_id = bet_record.salesperson_id 
              AND created_at >= bet_record.created_at 
              AND created_at <= bet_record.ends_at
              AND deleted_at IS NULL;
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
$function$
;

CREATE OR REPLACE FUNCTION public.sync_performance_bets()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_salesperson_id UUID;
BEGIN
    v_salesperson_id := COALESCE(NEW.salesperson_id, OLD.salesperson_id);

    -- Update active bets for this salesperson
    UPDATE public.performance_bets b
    SET current_value = (
        CASE 
            WHEN b.bet_type = 'deals' THEN (
                SELECT COUNT(*) FROM public.sales 
                WHERE salesperson_id = v_salesperson_id AND deal_status = 'completed' AND created_at >= b.starts_at AND created_at <= b.ends_at
            )
            WHEN b.bet_type = 'revenue' THEN (
                SELECT COALESCE(SUM(amount), 0) FROM public.sales 
                WHERE salesperson_id = v_salesperson_id AND deal_status = 'completed' AND created_at >= b.starts_at AND created_at <= b.ends_at
            )
            WHEN b.bet_type = 'calls' THEN (
                SELECT COUNT(*) FROM public.activities 
                WHERE salesperson_id = v_salesperson_id AND activity_type = 'call' AND created_at >= b.starts_at AND created_at <= b.ends_at AND deleted_at IS NULL
            )
            WHEN b.bet_type = 'meetings' THEN (
                SELECT COUNT(*) FROM public.activities 
                WHERE salesperson_id = v_salesperson_id AND activity_type = 'meeting' AND created_at >= b.starts_at AND created_at <= b.ends_at AND deleted_at IS NULL
            )
            WHEN b.bet_type = 'activities' THEN (
                SELECT COUNT(*) FROM public.activities 
                WHERE salesperson_id = v_salesperson_id AND created_at >= b.starts_at AND created_at <= b.ends_at AND deleted_at IS NULL
            )
            ELSE b.current_value
        END
    )
    WHERE b.status = 'active' AND b.salesperson_id = v_salesperson_id;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_battle_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$ DECLARE v_battle_id UUID; v_metric TEXT; v_score NUMERIC; BEGIN FOR v_battle_id, v_metric IN SELECT b.id, b.metric FROM public.sales_battles b JOIN public.battle_participants p ON p.battle_id = b.id WHERE b.status = 'active' AND p.salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id) AND (b.starts_at <= NOW() AND b.ends_at >= NOW()) LOOP v_score := 0; IF v_metric = 'revenue' THEN SELECT COALESCE(SUM(amount), 0) INTO v_score FROM public.sales WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id) AND (status = 'won' OR status = 'completed') AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id); ELSIF v_metric = 'deals' THEN SELECT COUNT(*) INTO v_score FROM public.sales WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id) AND (status = 'won' OR status = 'completed') AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id); ELSIF v_metric = 'calls' THEN SELECT COUNT(*) INTO v_score FROM public.activities WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id) AND activity_type = 'call' AND deleted_at IS NULL AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id); ELSIF v_metric = 'meetings' THEN SELECT COUNT(*) INTO v_score FROM public.activities WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id) AND activity_type = 'meeting' AND deleted_at IS NULL AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id); END IF; UPDATE public.battle_participants SET current_score = v_score WHERE battle_id = v_battle_id AND salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id); END LOOP; RETURN NEW; END; $function$
;


-- Placar da corrida: mesma projeção (nomes, ordem e tipos) da view em produção
-- (20260830000000_fix_race_leaderboard_status), só com `a.deleted_at IS NULL` nas duas contagens de
-- atividades. CREATE OR REPLACE preserva grants e a race_spectator_view dependente.
CREATE OR REPLACE VIEW public.race_leaderboard_view
WITH (security_invoker = true)
AS
 WITH season_metrics AS (
         SELECT rs.id AS season_id,
            rs.role_type,
            rs.start_date,
            rs.end_date,
            rs.goal_amount,
            rc.id AS car_id,
            rc.salesperson_id,
            sp.name AS salesperson_name,
            sp.avatar_url,
            rc.car_number,
            rc.primary_color,
            rc.secondary_color,
            rc.car_style,
            rc.nickname,
            COALESCE(sum(s.amount) FILTER (WHERE s.status = ANY (ARRAY['won'::text, 'completed'::text])), 0::numeric) AS sales_value_raw,
            count(s.id) FILTER (WHERE s.status = ANY (ARRAY['won'::text, 'completed'::text]))::numeric AS deals_count_raw,
            count(DISTINCT s.client_name) FILTER (WHERE s.status = ANY (ARRAY['won'::text, 'completed'::text]))::numeric AS new_clients_raw,
            ( SELECT count(*)::numeric AS count
                   FROM activities a
                  WHERE a.salesperson_id = rc.salesperson_id AND a.created_at::date >= rs.start_date AND a.created_at::date <= rs.end_date AND a.deleted_at IS NULL) AS activities_raw,
            ( SELECT count(*)::numeric AS count
                   FROM activities a
                  WHERE a.salesperson_id = rc.salesperson_id AND a.created_at::date >= rs.start_date AND a.created_at::date <= rs.end_date AND a.deleted_at IS NULL AND (a.outcome = ANY (ARRAY['connected'::activity_outcome, 'qualified'::activity_outcome, 'scheduled'::activity_outcome, 'callback'::activity_outcome]))) AS conversations_raw
           FROM race_seasons rs
             CROSS JOIN race_cars rc
             JOIN salespeople sp ON sp.id = rc.salesperson_id
             LEFT JOIN sales s ON s.salesperson_id = rc.salesperson_id AND s.created_at::date >= rs.start_date AND s.created_at::date <= rs.end_date
          WHERE rs.status = 'active'::text AND (sp.role::text = rs.role_type OR sp.role::text = 'hybrid'::text)
          GROUP BY rs.id, rs.role_type, rs.start_date, rs.end_date, rs.goal_amount, rc.id, rc.salesperson_id, sp.name, sp.avatar_url, rc.car_number, rc.primary_color, rc.secondary_color, rc.car_style, rc.nickname
        ), scored AS (
         SELECT sm.season_id,
            sm.role_type,
            sm.start_date,
            sm.end_date,
            sm.goal_amount,
            sm.car_id,
            sm.salesperson_id,
            sm.salesperson_name,
            sm.avatar_url,
            sm.car_number,
            sm.primary_color,
            sm.secondary_color,
            sm.car_style,
            sm.nickname,
            sm.sales_value_raw,
            sm.deals_count_raw,
            sm.new_clients_raw,
            sm.activities_raw,
            sm.conversations_raw,
            COALESCE(( SELECT sum(
                        CASE rsr.metric_code
                            WHEN 'sales_value'::text THEN sm.sales_value_raw
                            WHEN 'sales_value_originated'::text THEN sm.sales_value_raw
                            WHEN 'new_clients_activated'::text THEN sm.new_clients_raw
                            WHEN 'stakeholders_captured'::text THEN sm.new_clients_raw
                            WHEN 'routine_compliance'::text THEN sm.activities_raw
                            WHEN 'conversations_initiated'::text THEN sm.conversations_raw
                            WHEN 'markup_pct'::text THEN sm.sales_value_raw * 0.3
                            ELSE 0::numeric
                        END * rsr.points_per_unit * rsr.weight) AS sum
                   FROM race_scoring_rules rsr
                  WHERE rsr.season_id = sm.season_id), sm.sales_value_raw) AS score_raw
           FROM season_metrics sm
        )
 SELECT season_id,
    car_id,
    salesperson_id,
    salesperson_name,
    avatar_url,
    car_number,
    primary_color,
    secondary_color,
    car_style,
    nickname,
    role_type,
    sales_value_raw AS total_sales,
    deals_count_raw::bigint AS deals_count,
    new_clients_raw AS new_clients_count,
    activities_raw AS activities_count,
    conversations_raw AS conversations_count,
    score_raw AS score,
        CASE
            WHEN goal_amount > 0::numeric THEN LEAST(1.0, score_raw / goal_amount)
            ELSE 0::numeric
        END AS progress
   FROM scored;

-- ============================================================================
-- 4) Soft-delete: autoria vem do servidor e só admin/gestor restaura
-- ============================================================================
CREATE OR REPLACE FUNCTION private.guard_activity_soft_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Sem mudança no estado de exclusão: a autoria registrada não pode ser reescrita.
  IF NEW.deleted_at IS NOT DISTINCT FROM OLD.deleted_at THEN
    NEW.deleted_by := OLD.deleted_by;
    RETURN NEW;
  END IF;

  -- Exclusão: o autor é quem está autenticado, nunca o valor enviado pelo client.
  IF OLD.deleted_at IS NULL THEN
    NEW.deleted_by := COALESCE(auth.uid(), NEW.deleted_by);
    RETURN NEW;
  END IF;

  -- Restaurar (deleted_at → NULL) ou mudar a data da exclusão: só admin/gestor ou backend.
  IF current_user IN ('authenticated', 'anon')
     AND NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Somente admin ou gestor pode restaurar uma atividade excluída'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.deleted_at IS NULL THEN
    NEW.deleted_by := NULL;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.guard_activity_soft_delete() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_activity_soft_delete ON public.activities;
CREATE TRIGGER guard_activity_soft_delete
  BEFORE UPDATE OF deleted_at, deleted_by ON public.activities
  FOR EACH ROW EXECUTE FUNCTION private.guard_activity_soft_delete();
