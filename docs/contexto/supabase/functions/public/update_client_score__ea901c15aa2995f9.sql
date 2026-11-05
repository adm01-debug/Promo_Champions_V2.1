CREATE OR REPLACE FUNCTION public.update_client_score(client_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  total_value NUMERIC;
  deal_count INTEGER;
  last_activity DATE;
  score NUMERIC;
BEGIN
  SELECT
    COALESCE(SUM(value), 0),
    COUNT(*),
    MAX(created_at)::DATE
  INTO total_value, deal_count, last_activity
  FROM deals
  WHERE deals.client_id = update_client_score.client_id
    AND status IN ('won', 'open');
  
  score := (total_value / 1000) + (deal_count * 10) + 
           (CASE WHEN last_activity > now() - INTERVAL '30 days' THEN 20 ELSE 0 END);
  
  UPDATE clients
  SET health_score = LEAST(100, score)
  WHERE id = client_id;
END;
$function$
