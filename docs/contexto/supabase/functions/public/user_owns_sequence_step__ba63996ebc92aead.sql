CREATE OR REPLACE FUNCTION public.user_owns_sequence_step(_step_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.sequence_steps st
    JOIN public.sequences s ON s.id = st.sequence_id
    WHERE st.id = _step_id
      AND (s.owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
$function$
