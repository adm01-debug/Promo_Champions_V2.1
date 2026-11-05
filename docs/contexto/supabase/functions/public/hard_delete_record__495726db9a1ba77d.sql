CREATE OR REPLACE FUNCTION public.hard_delete_record(p_table_name text, p_record_id uuid, p_admin_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sql text;
  v_affected integer;
BEGIN
  IF auth.role() <> 'service_role'
     AND (
       auth.uid() IS NULL
       OR p_admin_user_id IS DISTINCT FROM auth.uid()
       OR NOT public.has_role(auth.uid(), 'admin'::public.app_role)
     ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF p_table_name NOT IN ('clients', 'activities', 'products', 'suppliers', 'teams') THEN
    RAISE EXCEPTION 'unsupported_hard_delete_table' USING ERRCODE = '22023';
  END IF;

  v_sql := format(
    'DELETE FROM public.%I WHERE id = $1 AND deleted_at IS NOT NULL',
    p_table_name
  );
  EXECUTE v_sql USING p_record_id;
  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN v_affected = 1;
END;
$function$
