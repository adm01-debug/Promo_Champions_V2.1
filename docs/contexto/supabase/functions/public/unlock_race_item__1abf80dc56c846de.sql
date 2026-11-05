CREATE OR REPLACE FUNCTION public.unlock_race_item(_unlock_key text, _required_league text DEFAULT 'bronze'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE _user_id uuid := auth.uid(); _user_league text; _league_order int; _required_order int; BEGIN IF _user_id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'unauthenticated'); END IF; _user_league := 'bronze'; _league_order := CASE _user_league WHEN 'bronze' THEN 1 WHEN 'prata' THEN 2 WHEN 'ouro' THEN 3 WHEN 'platina' THEN 4 WHEN 'diamante' THEN 5 ELSE 1 END; _required_order := CASE _required_league WHEN 'bronze' THEN 1 WHEN 'prata' THEN 2 WHEN 'ouro' THEN 3 WHEN 'platina' THEN 4 WHEN 'diamante' THEN 5 ELSE 1 END; IF _league_order < _required_order THEN RETURN jsonb_build_object('success', false, 'error', 'league_required', 'current_league', _user_league, 'required_league', _required_league); END IF; INSERT INTO public.race_unlocks (user_id, unlock_key) VALUES (_user_id, _unlock_key) ON CONFLICT (user_id, unlock_key) DO NOTHING; RETURN jsonb_build_object('success', true, 'unlock_key', _unlock_key); END; $function$
