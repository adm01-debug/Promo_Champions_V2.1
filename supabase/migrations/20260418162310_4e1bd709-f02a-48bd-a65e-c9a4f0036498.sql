-- Função para finalizar uma temporada de corrida e premiar o campeão
CREATE OR REPLACE FUNCTION public.finalize_race_season(_season_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _winner_id uuid;
  _top_rows jsonb;
  _season_name text;
BEGIN
  -- Apenas admins podem finalizar
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Apenas administradores podem finalizar temporadas';
  END IF;

  SELECT name INTO _season_name FROM public.race_seasons WHERE id = _season_id;
  IF _season_name IS NULL THEN
    RAISE EXCEPTION 'Temporada não encontrada';
  END IF;

  -- Top 1 e top 5 do leaderboard
  SELECT salesperson_id INTO _winner_id
  FROM public.race_leaderboard_view
  WHERE season_id = _season_id
  ORDER BY progress DESC NULLS LAST, score DESC NULLS LAST, total_sales DESC NULLS LAST
  LIMIT 1;

  SELECT jsonb_agg(row_to_json(t)) INTO _top_rows
  FROM (
    SELECT salesperson_id, salesperson_name, progress, score, total_sales, deals_count
    FROM public.race_leaderboard_view
    WHERE season_id = _season_id
    ORDER BY progress DESC NULLS LAST, score DESC NULLS LAST
    LIMIT 5
  ) t;

  -- Atualiza temporada
  UPDATE public.race_seasons
  SET status = 'finished',
      winner_id = _winner_id,
      updated_at = now()
  WHERE id = _season_id;

  -- Insere evento de campeão do mês
  IF _winner_id IS NOT NULL THEN
    INSERT INTO public.race_events (season_id, salesperson_id, event_type, metadata)
    VALUES (
      _season_id,
      _winner_id,
      'monthly_champion',
      jsonb_build_object(
        'season_name', _season_name,
        'finalized_at', now(),
        'top5', COALESCE(_top_rows, '[]'::jsonb)
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'season_id', _season_id,
    'winner_id', _winner_id,
    'top5', COALESCE(_top_rows, '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.finalize_race_season(uuid) TO authenticated;