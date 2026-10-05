-- Restringe helpers de role: só o próprio usuário, admin/manager ou service_role
-- podem consultar cargo por UUID arbitrário (fecha leitura de cargos de terceiros).

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT CASE
    WHEN auth.role() = 'anon' THEN NULL
    WHEN _user_id IS DISTINCT FROM auth.uid()
         AND auth.role() <> 'service_role'
         AND NOT EXISTS (
           SELECT 1 FROM public.user_roles
           WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
         )
    THEN NULL
    ELSE (
      SELECT role FROM public.user_roles WHERE user_id = _user_id
      ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'manager' THEN 2 WHEN 'salesperson' THEN 3 END
      LIMIT 1
    )
  END
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
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
$function$;
