
DROP VIEW IF EXISTS public.engagement_score_leaderboard;

CREATE VIEW public.engagement_score_leaderboard
WITH (security_invoker = true) AS
SELECT
  ces.id,
  ces.contact_id,
  ces.contact_type,
  ces.score,
  ces.tier,
  ces.total_opens,
  ces.total_clicks,
  ces.total_replies,
  ces.last_signal_at,
  ces.updated_at,
  CASE
    WHEN ces.contact_type = 'lead' THEN (SELECT client_name FROM public.sales WHERE id = ces.contact_id)
    WHEN ces.contact_type = 'client' THEN (SELECT name FROM public.clients WHERE id = ces.contact_id)
  END AS contact_name,
  CASE
    WHEN ces.contact_type = 'lead' THEN (SELECT salesperson_id FROM public.sales WHERE id = ces.contact_id)
    WHEN ces.contact_type = 'client' THEN (SELECT salesperson_id FROM public.client_portfolio WHERE client_id = ces.contact_id LIMIT 1)
  END AS owner_salesperson_id
FROM public.contact_engagement_score ces
WHERE ces.last_signal_at >= now() - interval '14 days';
