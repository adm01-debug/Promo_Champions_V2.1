CREATE OR REPLACE FUNCTION public.bulk_approve_assignments(_ids uuid[], _xp_overrides jsonb DEFAULT '{}'::jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _id UUID;
  _xp INTEGER;
  _processed INTEGER := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can bulk approve';
  END IF;

  FOREACH _id IN ARRAY _ids LOOP
    SELECT COALESCE(
      NULLIF(_xp_overrides->>(_id::text), '')::INTEGER,
      (SELECT tc.xp_reward FROM public.task_assignments ta JOIN public.task_catalog tc ON tc.id = ta.catalog_id WHERE ta.id = _id)
    ) INTO _xp;

    PERFORM public.grant_task_xp(_id, _xp, 'Aprovação em lote');
    _processed := _processed + 1;
  END LOOP;

  RETURN _processed;
END;
$function$
