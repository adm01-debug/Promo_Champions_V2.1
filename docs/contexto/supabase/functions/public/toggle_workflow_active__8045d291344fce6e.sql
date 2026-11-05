CREATE OR REPLACE FUNCTION public.toggle_workflow_active(p_workflow_id uuid, p_active boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE automation_workflows SET is_active = p_active, updated_at = now() WHERE id = p_workflow_id;
  RETURN FOUND;
END;
$function$
