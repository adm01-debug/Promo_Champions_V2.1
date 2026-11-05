CREATE OR REPLACE FUNCTION public.calculate_deal_health(_sale_id uuid)
 RETURNS TABLE(health_score integer, health_label text, positive_factors jsonb, negative_factors jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _sale RECORD;
  _last_activity TIMESTAMPTZ;
  _activity_count INTEGER;
  _days_in_stage INTEGER;
  _interaction_count INTEGER;
  _score INTEGER := 50;
  _pos JSONB := '[]'::jsonb;
  _neg JSONB := '[]'::jsonb;
  _label TEXT;
BEGIN
  SELECT * INTO _sale FROM public.sales WHERE id = _sale_id;
  IF _sale.id IS NULL THEN RETURN; END IF;

  SELECT MAX(created_at), COUNT(*) INTO _last_activity, _activity_count
  FROM public.activities WHERE sale_id = _sale_id;

  SELECT COUNT(*) INTO _interaction_count
  FROM public.channel_interactions WHERE deal_id = _sale_id AND created_at > now() - interval '14 days';

  _days_in_stage := EXTRACT(DAY FROM (now() - _sale.updated_at))::INT;

  -- Recência de atividades
  IF _last_activity IS NOT NULL AND _last_activity > now() - interval '3 days' THEN
    _score := _score + 15;
    _pos := _pos || jsonb_build_object('factor','recent_activity','impact',15,'label','Atividade recente nos últimos 3 dias');
  ELSIF _last_activity IS NULL OR _last_activity < now() - interval '14 days' THEN
    _score := _score - 20;
    _neg := _neg || jsonb_build_object('factor','no_recent_activity','impact',-20,'label','Sem atividades há mais de 14 dias');
  END IF;

  -- Volume de atividades
  IF _activity_count >= 5 THEN
    _score := _score + 10;
    _pos := _pos || jsonb_build_object('factor','high_activity','impact',10,'label',_activity_count || ' atividades registradas');
  END IF;

  -- Engajamento via canais
  IF _interaction_count >= 3 THEN
    _score := _score + 15;
    _pos := _pos || jsonb_build_object('factor','engaged','impact',15,'label',_interaction_count || ' interações nos últimos 14 dias');
  ELSIF _interaction_count = 0 THEN
    _score := _score - 15;
    _neg := _neg || jsonb_build_object('factor','no_engagement','impact',-15,'label','Nenhuma interação multicanal recente');
  END IF;

  -- Tempo no estágio
  IF _days_in_stage > 30 THEN
    _score := _score - 25;
    _neg := _neg || jsonb_build_object('factor','stagnation','impact',-25,'label',_days_in_stage || ' dias parado no mesmo estágio');
  ELSIF _days_in_stage <= 7 THEN
    _score := _score + 10;
    _pos := _pos || jsonb_build_object('factor','fast_progress','impact',10,'label','Avanço rápido no funil');
  END IF;

  -- Estágio avançado
  IF _sale.stage IN ('proposal','negotiation') THEN
    _score := _score + 5;
    _pos := _pos || jsonb_build_object('factor','advanced_stage','impact',5,'label','Deal em estágio avançado');
  END IF;

  -- Clamp 0-100
  _score := GREATEST(0, LEAST(100, _score));

  _label := CASE
    WHEN _score >= 80 THEN 'excellent'
    WHEN _score >= 60 THEN 'healthy'
    WHEN _score >= 40 THEN 'at_risk'
    ELSE 'critical'
  END;

  RETURN QUERY SELECT _score, _label, _pos, _neg;
END;
$function$
