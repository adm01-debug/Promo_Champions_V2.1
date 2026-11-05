CREATE OR REPLACE FUNCTION private.match_weekly_players()
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
$function$
