-- Add squad_id to salespeople
ALTER TABLE public.salespeople 
ADD COLUMN squad_id UUID REFERENCES public.squads(id);

-- Migration of existing data
UPDATE public.salespeople s
SET squad_id = sm.squad_id
FROM public.squad_members sm
WHERE s.auth_user_id = sm.user_id;
