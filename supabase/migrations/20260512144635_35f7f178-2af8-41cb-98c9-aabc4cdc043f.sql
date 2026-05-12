
-- 1. Agendamento de Tarefas Semanais (Mondays)
-- Habilitar extensões necessárias se não estiverem
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar Reset de Ligas (Segunda-feira 00:00)
SELECT cron.schedule('weekly-league-reset', '0 0 * * 1', 'SELECT public.process_weekly_league_reset()');

-- Função para Pareamento Semanal de Duelos (Head-to-Head)
CREATE OR REPLACE FUNCTION public.match_weekly_players()
RETURNS void AS $$
DECLARE
    active_salespeople UUID[];
    player_a UUID;
    player_b UUID;
    i INT;
    num_players INT;
    week_start DATE := start_of_week(CURRENT_DATE, 1);
BEGIN
    -- Pegar IDs de vendedores ativos que não estão de férias
    SELECT ARRAY_AGG(id) INTO active_salespeople
    FROM public.salespeople
    WHERE is_active = true;

    num_players := ARRAY_LENGTH(active_salespeople, 1);
    
    -- Se número for ímpar, removemos um aleatoriamente para parear (ou poderíamos dar um "BYE")
    IF num_players % 2 != 0 THEN
        active_salespeople := active_salespeople[1:num_players-1];
        num_players := num_players - 1;
    END IF;

    -- Embaralhar Array (Simulado com ORDER BY random())
    -- (No PL/pgSQL é mais fácil fazer um loop e trocar posições)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auxiliar: Início da semana
CREATE OR REPLACE FUNCTION public.start_of_week(date_val DATE, start_day INT DEFAULT 1)
RETURNS DATE AS $$
BEGIN
    RETURN date_val - (EXTRACT(DOW FROM date_val)::INT - start_day + 7) % 7;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Agendar Pareamento de Duelos (Segunda-feira 00:01)
SELECT cron.schedule('weekly-matchmaking', '1 0 * * 1', 'SELECT public.match_weekly_players()');

-- 2. Conquistas por Duelos (Badges)
CREATE OR REPLACE FUNCTION public.check_battle_achievements()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_battle_achievements ON public.weekly_matchups;
CREATE TRIGGER tr_check_battle_achievements
AFTER UPDATE OF winner_id ON public.weekly_matchups
FOR EACH ROW EXECUTE FUNCTION public.check_battle_achievements();

-- 3. Função auxiliar para conceder conquistas
CREATE OR REPLACE FUNCTION public.award_achievement_if_not_exists(p_salesperson_id UUID, p_type TEXT)
RETURNS void AS $$
DECLARE
    v_achievement_id UUID;
BEGIN
    -- Verificar se já tem a conquista
    IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE salesperson_id = p_salesperson_id AND achievement_type = p_type) THEN
        INSERT INTO public.achievements (salesperson_id, achievement_type)
        VALUES (p_salesperson_id, p_type);
        
        -- Opcional: Notificar usuário (podemos adicionar log de notificações aqui)
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
