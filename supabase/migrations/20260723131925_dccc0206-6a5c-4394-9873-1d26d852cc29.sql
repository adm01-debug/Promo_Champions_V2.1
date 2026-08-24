
ALTER TABLE public.commission_bonus_awards REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commission_bonus_awards;
