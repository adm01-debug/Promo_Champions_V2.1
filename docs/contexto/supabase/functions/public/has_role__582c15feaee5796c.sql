CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
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
       SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
     )
$function$
