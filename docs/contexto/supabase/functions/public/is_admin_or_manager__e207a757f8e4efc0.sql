CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(auth.role(), 'anon') <> 'anon'
     AND (
       _user_id = auth.uid()
       OR auth.role() = 'service_role'
       OR EXISTS (
         SELECT 1 FROM public.user_roles
         WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
       )
     )
     AND EXISTS (
       SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin', 'manager')
     )
$function$
