CREATE OR REPLACE FUNCTION public.process_weekly_league_reset()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    league_record RECORD;
    member_record RECORD;
    next_league_id UUID;
    prev_league_id UUID;
    total_members INT;
    top_slots INT;
    bottom_slots INT;
    current_rank INT;
BEGIN
    -- 1. Salvar histórico da semana anterior
    INSERT INTO public.league_history (salesperson_id, league_id, rank_achieved, xp_earned, season_date)
    SELECT salesperson_id, league_id, 0, weekly_xp, (CURRENT_DATE - INTERVAL '1 day')::DATE
    FROM public.league_members;

    -- 2. Processar Ligas Individualmente (Promoção/Rebaixamento)
    FOR league_record IN SELECT * FROM public.leagues ORDER BY tier DESC LOOP
        -- Pegar configurações da liga
        top_slots := league_record.promotion_slots;
        bottom_slots := league_record.demotion_slots;

        current_rank := 1;
        FOR member_record IN 
            SELECT * FROM public.league_members 
            WHERE league_id = league_record.id 
            ORDER BY weekly_xp DESC 
        LOOP
            -- Determinar Próxima Liga
            IF current_rank <= top_slots AND league_record.tier < 5 THEN
                SELECT id INTO next_league_id FROM public.leagues WHERE tier = league_record.tier + 1;
                IF next_league_id IS NOT NULL THEN
                    UPDATE public.league_members SET league_id = next_league_id, promoted_at = now() WHERE id = member_record.id;
                    UPDATE public.league_history SET promoted = true WHERE salesperson_id = member_record.salesperson_id AND season_date = (CURRENT_DATE - INTERVAL '1 day')::DATE;
                END IF;
            ELSIF current_rank > (SELECT count(*) FROM public.league_members WHERE league_id = league_record.id) - bottom_slots AND league_record.tier > 1 THEN
                SELECT id INTO prev_league_id FROM public.leagues WHERE tier = league_record.tier - 1;
                IF prev_league_id IS NOT NULL THEN
                    UPDATE public.league_members SET league_id = prev_league_id, demoted_at = now() WHERE id = member_record.id;
                    UPDATE public.league_history SET demoted = true WHERE salesperson_id = member_record.salesperson_id AND season_date = (CURRENT_DATE - INTERVAL '1 day')::DATE;
                END IF;
            END IF;

            UPDATE public.league_history SET rank_achieved = current_rank 
            WHERE salesperson_id = member_record.salesperson_id AND season_date = (CURRENT_DATE - INTERVAL '1 day')::DATE;
            
            current_rank := current_rank + 1;
        END LOOP;
    END LOOP;

    -- 3. Zerar XP Semanal
    UPDATE public.league_members SET weekly_xp = 0, last_reset_xp = weekly_xp, updated_at = now();
END;
$function$
