-- Gamificação: XP só no servidor, claims de desafio, apuração de matchups,
-- rotação diária atômica e dedup de eventos derivados (auditoria).
--
-- 1. Revoga a escrita do cliente em xp_history, salesperson_xp,
--    challenge_progress e daily_challenge_progress — com as policies "own"
--    qualquer autenticado fabricava XP e progresso à vontade. Quem escreve
--    agora é só o servidor (service_role bypassa RLS; RPCs SECURITY
--    DEFINER abaixo). Os reads continuam intactos.
-- 2. public.claim_weekly_challenge_reward / claim_daily_challenge_reward:
--    claim atômico que lê xp_reward/target do catálogo server-side, exige
--    desafio concluído, marca xp_claimed + completed_at e grava xp_history
--    (tr_sync_total_xp atualiza salesperson_xp). Antes o claim semanal
--    aceitava xpReward do cliente e o claim diário marcava sem creditar.
-- 3. public.resolve_weekly_matchups + cron 'weekly-matchups-resolution':
--    apuração semanal — soma o XP ganho na semana por participante →
--    score_a/score_b → winner_id → xp_reward via xp_history. Matchups da
--    semana corrente só atualizam o placar ao vivo.
-- 4. daily_challenge_rotations: marca de rotação atômica (PK por data);
--    rotate-daily-challenges faz o claim antes de inserir — fecha o TOCTOU
--    do check-then-insert que duplicava os 3 desafios do dia.
-- 5. race_events_sale_dedup_idx ganha o discriminador dedup_key: uma venda
--    que gera 2+ eventos do mesmo tipo (2 overtake, 2 checkpoints) não
--    aborta mais o lote inteiro com 23505. Eventos sem dedup_key
--    (COALESCE → '') seguem deduplicados como antes (boost, powerup antigo).

-- ---------------------------------------------------------------------------
-- 1. XP e progresso de desafios: posse só no servidor.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own xp_history" ON public.xp_history;
DROP POLICY IF EXISTS "Authenticated users can insert xp_history" ON public.xp_history;
DROP POLICY IF EXISTS "Users can insert own salesperson_xp" ON public.salesperson_xp;
DROP POLICY IF EXISTS "Users can update own salesperson_xp" ON public.salesperson_xp;
DROP POLICY IF EXISTS "Authenticated users can insert salesperson_xp" ON public.salesperson_xp;
DROP POLICY IF EXISTS "Authenticated users can update salesperson_xp" ON public.salesperson_xp;
DROP POLICY IF EXISTS "Users can insert own challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can update own challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Authenticated users can insert challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Authenticated users can update challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can insert own daily_challenge_progress" ON public.daily_challenge_progress;
DROP POLICY IF EXISTS "Users can update own daily_challenge_progress" ON public.daily_challenge_progress;
DROP POLICY IF EXISTS "Authenticated users can insert daily_challenge_progress" ON public.daily_challenge_progress;
DROP POLICY IF EXISTS "Authenticated users can update daily_challenge_progress" ON public.daily_challenge_progress;
DROP POLICY IF EXISTS "Users can insert own daily_streak_achievements" ON public.daily_streak_achievements;
DROP POLICY IF EXISTS "Users can update own daily_streak_achievements" ON public.daily_streak_achievements;
DROP POLICY IF EXISTS "Authenticated users can insert daily_streak_achievements" ON public.daily_streak_achievements;
DROP POLICY IF EXISTS "Authenticated users can update daily_streak_achievements" ON public.daily_streak_achievements;

-- ---------------------------------------------------------------------------
-- 2. Claims de desafio no servidor (xp_reward lido do catálogo, nunca do
--    cliente). Claim atômico: o UPDATE com xp_claimed=false resolve a
--    corrida entre dois cliques.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_weekly_challenge_reward(p_challenge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sp uuid;
  v_challenge record;
  v_n bigint;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória para resgatar recompensa'
      USING ERRCODE = '28000';
  END IF;

  v_sp := public.get_current_salesperson_id();
  IF v_sp IS NULL THEN
    RAISE EXCEPTION 'Perfil comercial não encontrado para o usuário autenticado'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT id, title, xp_reward, target_value
    INTO v_challenge
    FROM public.weekly_challenges
   WHERE id = p_challenge_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Desafio não encontrado' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.challenge_progress
     SET xp_claimed = true,
         completed_at = COALESCE(completed_at, now()),
         current_value = GREATEST(current_value, v_challenge.target_value),
         updated_at = now()
   WHERE challenge_id = p_challenge_id
     AND salesperson_id = v_sp
     AND xp_claimed = false
     AND (completed_at IS NOT NULL OR current_value >= v_challenge.target_value);
  GET DIAGNOSTICS v_n = ROW_COUNT;

  IF v_n = 0 THEN
    RAISE EXCEPTION 'Desafio não concluído ou recompensa já resgatada'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
  VALUES (
    v_sp, v_challenge.xp_reward, 'weekly_challenge', p_challenge_id::text,
    'Desafio completado: ' || v_challenge.title
  );

  RETURN jsonb_build_object('xp_reward', v_challenge.xp_reward);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_weekly_challenge_reward(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_weekly_challenge_reward(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_daily_challenge_reward(p_challenge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sp uuid;
  v_challenge record;
  v_n bigint;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória para resgatar recompensa'
      USING ERRCODE = '28000';
  END IF;

  v_sp := public.get_current_salesperson_id();
  IF v_sp IS NULL THEN
    RAISE EXCEPTION 'Perfil comercial não encontrado para o usuário autenticado'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT id, title, xp_reward, target_value
    INTO v_challenge
    FROM public.daily_challenges
   WHERE id = p_challenge_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Desafio não encontrado' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.daily_challenge_progress
     SET xp_claimed = true,
         completed_at = COALESCE(completed_at, now()),
         current_value = GREATEST(current_value, v_challenge.target_value),
         updated_at = now()
   WHERE challenge_id = p_challenge_id
     AND salesperson_id = v_sp
     AND xp_claimed = false
     AND (completed_at IS NOT NULL OR current_value >= v_challenge.target_value);
  GET DIAGNOSTICS v_n = ROW_COUNT;

  IF v_n = 0 THEN
    RAISE EXCEPTION 'Desafio não concluído ou recompensa já resgatada'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
  VALUES (
    v_sp, v_challenge.xp_reward, 'daily_challenge', p_challenge_id::text,
    'Desafio completado: ' || v_challenge.title
  );

  RETURN jsonb_build_object('xp_reward', v_challenge.xp_reward);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_daily_challenge_reward(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_daily_challenge_reward(uuid) TO authenticated;

-- Milestones de streak: o catálogo (dias -> xp/título) vive aqui no servidor
-- — antes o cliente escolhia os valores e podia fabricar xp_awarded.
CREATE OR REPLACE FUNCTION public.claim_streak_achievements()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sp uuid;
  v_streak integer;
  v_milestone record;
  v_n bigint;
  v_claimed jsonb := '[]'::jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória para resgatar conquistas'
      USING ERRCODE = '28000';
  END IF;

  v_sp := public.get_current_salesperson_id();
  IF v_sp IS NULL THEN
    RAISE EXCEPTION 'Perfil comercial não encontrado para o usuário autenticado'
      USING ERRCODE = 'P0001';
  END IF;

  v_streak := public.calculate_daily_challenge_streak(v_sp);

  FOR v_milestone IN
    SELECT * FROM (VALUES
      ('streak_3',  3,  50,   'Iniciante Dedicado'),
      ('streak_7',  7,  150,  'Semana Perfeita'),
      ('streak_14', 14, 400,  'Duas Semanas de Fogo'),
      ('streak_30', 30, 1000, 'Mestre da Consistência')
    ) AS m(streak_type, days, xp, title)
    WHERE m.days <= v_streak
  LOOP
    -- UNIQUE(salesperson_id, streak_type) torna o claim exatamente-uma-vez;
    -- quem perde o conflito não credita XP de novo.
    INSERT INTO public.daily_streak_achievements (
      salesperson_id, streak_type, streak_count, xp_awarded
    ) VALUES (
      v_sp, v_milestone.streak_type, v_streak, v_milestone.xp
    )
    ON CONFLICT (salesperson_id, streak_type) DO NOTHING;
    GET DIAGNOSTICS v_n = ROW_COUNT;

    IF v_n > 0 THEN
      INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
      VALUES (
        v_sp, v_milestone.xp, 'streak_achievement', v_milestone.streak_type,
        'Conquista: ' || v_milestone.title || ' (' || v_milestone.days || ' dias)'
      );
      v_claimed := v_claimed || jsonb_build_object(
        'streak_type', v_milestone.streak_type,
        'xp_awarded', v_milestone.xp,
        'title', v_milestone.title
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('streak', v_streak, 'claimed', v_claimed);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_streak_achievements() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_streak_achievements() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Apuração semanal dos confrontos: placar = XP ganho na semana do
--    confronto; semana encerrada define winner_id e paga xp_reward.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_weekly_matchups()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matchup record;
  v_score_a numeric;
  v_score_b numeric;
  v_finished integer := 0;
  v_week_end date;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('resolve_weekly_matchups', 0));

  FOR v_matchup IN
    SELECT id, salesperson_a_id, salesperson_b_id, week_start, xp_reward
    FROM public.weekly_matchups
    WHERE status = 'active'
  LOOP
    v_week_end := v_matchup.week_start + 7;

    SELECT COALESCE(sum(xp_amount), 0) INTO v_score_a
      FROM public.xp_history
     WHERE salesperson_id = v_matchup.salesperson_a_id
       AND created_at >= v_matchup.week_start
       AND created_at < v_week_end;

    SELECT COALESCE(sum(xp_amount), 0) INTO v_score_b
      FROM public.xp_history
     WHERE salesperson_id = v_matchup.salesperson_b_id
       AND created_at >= v_matchup.week_start
       AND created_at < v_week_end;

    IF v_week_end <= current_date THEN
      UPDATE public.weekly_matchups
         SET score_a = v_score_a,
             score_b = v_score_b,
             winner_id = CASE
               WHEN v_score_a > v_score_b THEN v_matchup.salesperson_a_id
               WHEN v_score_b > v_score_a THEN v_matchup.salesperson_b_id
               ELSE NULL
             END,
             status = 'finished'
       WHERE id = v_matchup.id;

      -- Empate não paga prêmio e winner_id fica NULL.
      IF v_score_a <> v_score_b THEN
        INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
        VALUES (
          CASE WHEN v_score_a > v_score_b THEN v_matchup.salesperson_a_id
               ELSE v_matchup.salesperson_b_id END,
          v_matchup.xp_reward,
          'weekly_matchup',
          v_matchup.id::text,
          'Vitória no confronto semanal'
        );
      END IF;
      v_finished := v_finished + 1;
    ELSE
      -- Semana corrente: só atualiza o placar ao vivo do card.
      UPDATE public.weekly_matchups
         SET score_a = v_score_a, score_b = v_score_b
       WHERE id = v_matchup.id;
    END IF;
  END LOOP;

  RETURN v_finished;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_weekly_matchups()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_weekly_matchups()
  TO service_role;

COMMENT ON FUNCTION public.resolve_weekly_matchups() IS
  'Apuração semanal dos confrontos: placar por XP da semana, winner e prêmio.';

-- Apura logo após o pareamento de segunda ('weekly-matchmaking' = 1 0 * * 1);
-- resolve os confrontos da semana que terminou e atualiza os placares ativos.
DO $$
BEGIN
  PERFORM cron.unschedule('weekly-matchups-resolution')
  WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'weekly-matchups-resolution'
  );
  PERFORM cron.schedule(
    'weekly-matchups-resolution',
    '5 0 * * 1',
    'SELECT public.resolve_weekly_matchups()'
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Rotação diária atômica: quem insere a marca primeiro gera os desafios.
--    UNIQUE não vai em daily_challenges (o modelo é 3 linhas por dia).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_challenge_rotations (
  challenge_date date PRIMARY KEY,
  rotated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_challenge_rotations ENABLE ROW LEVEL SECURITY;
-- Sem policies: só o service_role escreve/lê a marca de rotação.

-- ---------------------------------------------------------------------------
-- 5. Dedup de eventos por venda com discriminador: cada tipo derivado pode
--    emitir um evento por ocorrência (overtake por ultrapassado, checkpoint
--    por marco) sem 23505 derrubar o lote.
-- ---------------------------------------------------------------------------
DROP INDEX IF EXISTS public.race_events_sale_dedup_idx;
CREATE UNIQUE INDEX race_events_sale_dedup_idx
  ON public.race_events (
    season_id,
    salesperson_id,
    event_type,
    ((metadata->>'sale_id')),
    (COALESCE(metadata->>'dedup_key', ''))
  )
  WHERE metadata->>'sale_id' IS NOT NULL;
