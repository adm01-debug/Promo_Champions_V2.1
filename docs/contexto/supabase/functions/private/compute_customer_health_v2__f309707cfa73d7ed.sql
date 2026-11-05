CREATE OR REPLACE FUNCTION private.compute_customer_health_v2(_account_id uuid)
 RETURNS TABLE(account_id uuid, health_score integer, ticket_factor integer, nps_factor integer, csat_factor integer, usage_factor integer, renewal_factor integer, recommended_action text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _open_tickets int;
  _urgent_tickets int;
  _avg_nps numeric;
  _avg_csat numeric;
  _adoption int;
  _days_to_renewal int;
  _renewal_status public.renewal_status;
  _ticket int := 100;
  _nps int := 50;
  _csat int := 50;
  _usage int := 50;
  _renewal int := 70;
  _final int;
  _action text := 'Manter cadência regular';
BEGIN
  SELECT COUNT(*) FILTER (WHERE status IN ('open','pending')),
         COUNT(*) FILTER (WHERE priority = 'urgent' AND status IN ('open','pending'))
    INTO _open_tickets, _urgent_tickets
  FROM public.support_tickets WHERE account_id = _account_id;

  _ticket := GREATEST(0, 100 - (_open_tickets * 8) - (_urgent_tickets * 15));

  SELECT AVG(score)::numeric INTO _avg_nps
  FROM public.nps_surveys
  WHERE client_name IN (SELECT name FROM public.accounts WHERE id = _account_id)
    AND score IS NOT NULL;
  _nps := COALESCE((_avg_nps * 10)::int, 50);

  SELECT AVG(score)::numeric INTO _avg_csat
  FROM public.csat_ces_surveys
  WHERE account_id = _account_id AND survey_type = 'csat' AND score IS NOT NULL;
  _csat := COALESCE((_avg_csat * 20)::int, 50);

  SELECT adoption_score INTO _adoption FROM public.product_usage_summary WHERE account_id = _account_id;
  _usage := COALESCE(_adoption, 50);

  SELECT (renewal_date - CURRENT_DATE), status INTO _days_to_renewal, _renewal_status
  FROM public.renewals WHERE account_id = _account_id
  ORDER BY renewal_date ASC LIMIT 1;

  IF _renewal_status = 'at_risk' THEN _renewal := 30;
  ELSIF _renewal_status = 'churned' OR _renewal_status = 'lost' THEN _renewal := 0;
  ELSIF _days_to_renewal IS NOT NULL AND _days_to_renewal < 30 THEN _renewal := 50;
  ELSIF _days_to_renewal IS NOT NULL AND _days_to_renewal < 60 THEN _renewal := 65;
  ELSE _renewal := 80;
  END IF;

  _final := ROUND((_ticket * 0.2) + (_nps * 0.2) + (_csat * 0.15) + (_usage * 0.25) + (_renewal * 0.2));
  _final := GREATEST(0, LEAST(100, _final));

  IF _final < 30 THEN _action := '🚨 Reunião executiva urgente — risco de churn';
  ELSIF _final < 50 THEN _action := '📞 Call de retenção esta semana';
  ELSIF _usage < 40 THEN _action := '✉️ Workshop de adoção e re-engajamento';
  ELSIF _open_tickets > 5 THEN _action := '🎫 Resolver tickets abertos com prioridade';
  ELSIF _renewal < 60 THEN _action := '📅 Iniciar conversa de renovação';
  ELSIF _final > 80 THEN _action := '💎 Apresentar proposta de expansão (upsell)';
  END IF;

  RETURN QUERY SELECT _account_id, _final, _ticket, _nps, _csat, _usage, _renewal, _action;
END;
$function$
