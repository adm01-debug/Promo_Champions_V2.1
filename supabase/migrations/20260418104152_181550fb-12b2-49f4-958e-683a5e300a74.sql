
DROP VIEW IF EXISTS public.race_leaderboard_view;
CREATE VIEW public.race_leaderboard_view
WITH (security_invoker = true) AS
SELECT
  rs.id AS season_id,
  rc.id AS car_id,
  rc.salesperson_id,
  sp.name AS salesperson_name,
  sp.avatar_url,
  rc.car_number,
  rc.primary_color,
  rc.secondary_color,
  rc.car_style,
  rc.nickname,
  COALESCE(SUM(s.amount), 0)::numeric AS total_sales,
  COUNT(s.id) AS deals_count,
  CASE WHEN rs.goal_amount > 0
    THEN LEAST(1, COALESCE(SUM(s.amount), 0) / rs.goal_amount)
    ELSE 0 END AS progress
FROM public.race_seasons rs
CROSS JOIN public.race_cars rc
JOIN public.salespeople sp ON sp.id = rc.salesperson_id
LEFT JOIN public.sales s
  ON s.salesperson_id = rc.salesperson_id
  AND s.status = 'completed'
  AND s.created_at::date BETWEEN rs.start_date AND rs.end_date
WHERE rs.status = 'active'
GROUP BY rs.id, rs.goal_amount, rc.id, sp.id;

DROP POLICY IF EXISTS "insert_race_events" ON public.race_events;
CREATE POLICY "insert_race_events_own_or_admin" ON public.race_events FOR INSERT TO authenticated
  WITH CHECK (
    salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "insert_race_badges" ON public.race_badges;
CREATE POLICY "insert_race_badges_admin" ON public.race_badges FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
