-- Add territory_id to sales
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS territory_id UUID REFERENCES public.territories(id);

-- Apply search_path to functions
ALTER FUNCTION public.handle_performance_update() SET search_path TO 'public';
ALTER FUNCTION public.handle_territory_conquest() SET search_path TO 'public';
