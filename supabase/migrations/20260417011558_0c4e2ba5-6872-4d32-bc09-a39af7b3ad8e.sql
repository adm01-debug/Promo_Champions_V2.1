
DROP VIEW IF EXISTS public.contact_best_send_window;

CREATE VIEW public.contact_best_send_window
WITH (security_invoker = true) AS
SELECT
  contact_id,
  contact_type,
  hour_of_day,
  day_of_week,
  opens,
  clicks,
  replies,
  score,
  rank
FROM (
  SELECT
    p.*,
    ROW_NUMBER() OVER (PARTITION BY contact_id, contact_type ORDER BY score DESC, updated_at DESC) AS rank
  FROM public.contact_send_time_profile p
  WHERE score > 0
) ranked
WHERE rank <= 3;
