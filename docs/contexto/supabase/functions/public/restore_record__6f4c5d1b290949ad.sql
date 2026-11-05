CREATE OR REPLACE FUNCTION public.restore_record(table_name text, record_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() <> 'service_role'
     AND (auth.uid() IS NULL OR NOT public.is_admin_or_manager(auth.uid())) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF table_name NOT IN ('clients', 'activities', 'products', 'suppliers', 'teams') THEN
    RAISE EXCEPTION 'unsupported_soft_delete_table' USING ERRCODE = '22023';
  END IF;

  EXECUTE format(
    'UPDATE public.%I SET deleted_at = NULL, deleted_by = NULL, delete_reason = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
    table_name
  ) USING record_id;
END;
$function$
