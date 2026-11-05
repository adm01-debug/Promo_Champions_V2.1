CREATE OR REPLACE FUNCTION public.get_user_permissions()
 RETURNS TABLE(permission_name text, resource text, action text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.name, p.resource, p.action
  FROM permissions p
  INNER JOIN role_permissions rp ON p.id = rp.permission_id
  INNER JOIN user_roles ur ON rp.role = ur.role
  WHERE ur.user_id = auth.uid()
$function$
