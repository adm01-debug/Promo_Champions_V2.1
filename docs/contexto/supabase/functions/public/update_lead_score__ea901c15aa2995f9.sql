CREATE OR REPLACE FUNCTION public.update_lead_score(client_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  score INT;
BEGIN
  SELECT 
    (COALESCE(deal_count, 0) * 10) +
    (COALESCE(activity_count, 0) * 5) +
    (CASE WHEN last_contact > NOW() - INTERVAL '7 days' THEN 20 ELSE 0 END)
  INTO score
  FROM (
    SELECT 
      c.id,
      COUNT(DISTINCT d.id) as deal_count,
      COUNT(DISTINCT a.id) as activity_count,
      MAX(a.created_at) as last_contact
    FROM clients c
    LEFT JOIN deals d ON c.id = d.client_id
    LEFT JOIN activities a ON c.id = a.client_id
    WHERE c.id = client_id
    GROUP BY c.id
  ) stats;
  
  UPDATE clients SET lead_score = score WHERE id = client_id;
END;
$function$
