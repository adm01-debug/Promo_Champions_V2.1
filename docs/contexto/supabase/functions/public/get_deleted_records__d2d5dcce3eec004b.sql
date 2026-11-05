CREATE OR REPLACE FUNCTION public.get_deleted_records(p_table_name text, p_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, deleted_at timestamp with time zone, deleted_by_email text, delete_reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sql text;
BEGIN
  IF auth.role() <> 'service_role'
     AND (auth.uid() IS NULL OR NOT public.is_admin_or_manager(auth.uid())) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF p_table_name NOT IN ('clients', 'activities', 'products', 'suppliers', 'teams') THEN
    RAISE EXCEPTION 'unsupported_soft_delete_table' USING ERRCODE = '22023';
  END IF;
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 200 THEN
    RAISE EXCEPTION 'limit_out_of_range' USING ERRCODE = '22023';
  END IF;

  v_sql := format(
    'SELECT t.id, t.deleted_at, u.email::text, t.delete_reason FROM public.%I AS t LEFT JOIN auth.users AS u ON u.id = t.deleted_by WHERE t.deleted_at IS NOT NULL ORDER BY t.deleted_at DESC LIMIT $1',
    p_table_name
  );
  RETURN QUERY EXECUTE v_sql USING p_limit;
END;
$function$
