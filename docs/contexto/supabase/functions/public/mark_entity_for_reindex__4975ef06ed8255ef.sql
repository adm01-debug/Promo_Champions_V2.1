CREATE OR REPLACE FUNCTION public.mark_entity_for_reindex(_entity_type text, _entity_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  DELETE FROM public.semantic_index
  WHERE entity_type = _entity_type AND entity_id = _entity_id;

  RETURN true;
END;
$function$
