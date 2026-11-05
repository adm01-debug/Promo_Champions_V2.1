CREATE OR REPLACE FUNCTION public.user_owns_engagement_contact(_contact_id uuid, _contact_type text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    public.is_admin_or_manager(auth.uid())
    OR (
      _contact_type = 'lead' AND EXISTS (
        SELECT 1 FROM public.sales s
        WHERE s.id = _contact_id
          AND s.salesperson_id = public.get_current_salesperson_id()
      )
    )
    OR (
      _contact_type = 'client' AND EXISTS (
        SELECT 1 FROM public.client_portfolio cp
        WHERE cp.client_id = _contact_id
          AND cp.salesperson_id = public.get_current_salesperson_id()
      )
    )
$function$
