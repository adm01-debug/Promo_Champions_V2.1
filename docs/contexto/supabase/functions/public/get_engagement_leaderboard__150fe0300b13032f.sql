CREATE OR REPLACE FUNCTION public.get_engagement_leaderboard(_limit integer DEFAULT 20)
 RETURNS TABLE(sale_id uuid, client_name text, score integer, tier text, open_rate numeric, click_rate numeric, reply_rate numeric, total_sent integer, recency_days integer, salesperson_id uuid)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    e.sale_id,
    s.client_name,
    e.score,
    e.tier,
    e.open_rate,
    e.click_rate,
    e.reply_rate,
    e.total_sent,
    e.recency_days,
    s.salesperson_id
  FROM public.email_engagement_scores e
  JOIN public.sales s ON s.id = e.sale_id
  LEFT JOIN public.salespeople sp ON sp.id = s.salesperson_id
  WHERE 
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR sp.auth_user_id = auth.uid()
  ORDER BY e.score DESC, e.last_calculated_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 100));
$function$
