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
$function$
