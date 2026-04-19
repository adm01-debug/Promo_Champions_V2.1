CREATE OR REPLACE VIEW public.race_spectator_view
WITH (security_invoker = true)
AS
SELECT
  season_id,
  car_id,
  salesperson_id,
  salesperson_name,
  avatar_url,
  car_number,
  primary_color,
  secondary_color,
  car_style,
  nickname,
  role_type,
  total_sales,
  deals_count,
  score,
  progress
FROM public.race_leaderboard_view;

GRANT SELECT ON public.race_spectator_view TO anon, authenticated;