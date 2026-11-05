CREATE OR REPLACE FUNCTION public.soft_delete_record(p_table_name text, p_record_id uuid, p_user_id uuid, p_reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sql text;
  v_actor uuid := auth.uid();
  v_affected integer;
BEGIN
  IF auth.role() <> 'service_role'
     AND (v_actor IS NULL OR NOT public.is_admin_or_manager(v_actor)) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF auth.role() <> 'service_role' AND p_user_id IS DISTINCT FROM v_actor THEN
    RAISE EXCEPTION 'actor_mismatch' USING ERRCODE = '42501';
  END IF;
  IF p_table_name NOT IN ('clients', 'activities', 'products', 'suppliers', 'teams') THEN
    RAISE EXCEPTION 'unsupported_soft_delete_table' USING ERRCODE = '22023';
  END IF;

  v_sql := format(
    'UPDATE public.%I SET deleted_at = now(), deleted_by = $1, delete_reason = $2 WHERE id = $3 AND deleted_at IS NULL',
    p_table_name
  );
  EXECUTE v_sql USING COALESCE(v_actor, p_user_id), left(p_reason, 500), p_record_id;
  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN v_affected = 1;
END;
$function$
