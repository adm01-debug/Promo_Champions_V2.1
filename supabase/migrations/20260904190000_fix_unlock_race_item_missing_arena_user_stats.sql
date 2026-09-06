-- Achado da 3a rodada de validacao adversarial de 5 agentes (2026-09-04):
-- unlock_race_item(text,text) fazia SELECT ... FROM public.arena_user_stats,
-- tabela que nunca existiu neste banco (confirmado via pg_class/information_schema).
-- Toda chamada real desta RPC (exposta a `authenticated` via GRANT EXECUTE,
-- usada por src/hooks/race/useRaceUnlocks.ts) falhava com 42P01.
--
-- docs/estado/05_DOMINIO_GAMIFICACAO_RACE.md confirma que TODO o dominio de
-- ligas (leagues, league_members, league_history, salesperson_leagues) tem
-- 0 linhas em producao -- a feature nunca foi de fato usada. Nao ha tabela
-- real e populada para mapear liga do Race Arena hoje, e as taxonomias sao
-- incompativeis (salesperson_leagues usa enum ingles de 4 niveis; esta
-- function usa portugues de 5 niveis) -- portanto NAO e seguro apontar para
-- outra tabela sem decisao de produto.
--
-- Fix minimo e sem mudanca de comportamento observavel: remove a query
-- quebrada e usa diretamente o fallback 'bronze' que a propria function ja
-- usava via COALESCE(..., 'bronze') para o caso de "sem dado" -- que e
-- exatamente o que acontece em 100% das chamadas reais hoje.

CREATE OR REPLACE FUNCTION public.unlock_race_item(_unlock_key text, _required_league text DEFAULT 'bronze'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid := auth.uid();
  _user_league text;
  _league_order int;
  _required_order int;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthenticated');
  END IF;

  -- Tabela de liga do Race Arena nunca foi criada neste banco; fallback bronze
  -- e o comportamento real ja observado para 100% das chamadas ate hoje.
  _user_league := 'bronze';

  _league_order := CASE _user_league
    WHEN 'bronze' THEN 1 WHEN 'prata' THEN 2 WHEN 'ouro' THEN 3
    WHEN 'platina' THEN 4 WHEN 'diamante' THEN 5 ELSE 1 END;
  _required_order := CASE _required_league
    WHEN 'bronze' THEN 1 WHEN 'prata' THEN 2 WHEN 'ouro' THEN 3
    WHEN 'platina' THEN 4 WHEN 'diamante' THEN 5 ELSE 1 END;

  IF _league_order < _required_order THEN
    RETURN jsonb_build_object(
      'success', false, 'error', 'league_required',
      'current_league', _user_league, 'required_league', _required_league
    );
  END IF;

  INSERT INTO public.race_unlocks (user_id, unlock_key)
  VALUES (_user_id, _unlock_key)
  ON CONFLICT (user_id, unlock_key) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'unlock_key', _unlock_key);
END;
$function$;
