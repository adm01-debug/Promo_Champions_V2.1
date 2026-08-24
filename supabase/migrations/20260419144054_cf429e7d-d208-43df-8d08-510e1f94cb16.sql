CREATE UNIQUE INDEX IF NOT EXISTS race_seasons_one_active_per_role
ON public.race_seasons (role_type)
WHERE status = 'active';