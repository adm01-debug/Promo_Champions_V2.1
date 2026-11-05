CREATE OR REPLACE FUNCTION public.calculate_team_performance(p_team_id uuid, p_start_date timestamp without time zone, p_end_date timestamp without time zone)
 RETURNS TABLE(user_id uuid, user_email text, deals_count integer, revenue numeric, win_rate numeric, avg_deal_size numeric)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COUNT(DISTINCT d.id)::INTEGER,
    COALESCE(SUM(d.value) FILTER (WHERE d.status = 'won'), 0)::DECIMAL,
    CASE 
      WHEN COUNT(d.id) > 0 
      THEN (COUNT(d.id) FILTER (WHERE d.status = 'won')::DECIMAL / COUNT(d.id) * 100)
      ELSE 0 
    END::DECIMAL,
    COALESCE(AVG(d.value) FILTER (WHERE d.status = 'won'), 0)::DECIMAL
  FROM users u
  LEFT JOIN team_members tm ON tm.user_id = u.id
  LEFT JOIN deals d ON d.owner_id = u.id 
    AND d.created_at BETWEEN p_start_date AND p_end_date
  WHERE tm.team_id = p_team_id
  GROUP BY u.id, u.email
  ORDER BY revenue DESC;
END;
$function$
