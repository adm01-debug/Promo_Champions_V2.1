CREATE OR REPLACE FUNCTION public.purge_telemetry_retention()
 RETURNS TABLE(table_name text, deleted_rows bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_wv bigint := 0;
  v_qt bigint := 0;
  v_pa bigint := 0;
BEGIN
  DELETE FROM public.web_vitals_samples
   WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS v_wv = ROW_COUNT;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables AS ist
    WHERE ist.table_schema = 'public'
      AND ist.table_name = 'query_telemetry'
  ) THEN
    DELETE FROM public.query_telemetry
     WHERE created_at < now() - interval '60 days';
    GET DIAGNOSTICS v_qt = ROW_COUNT;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables AS ist
    WHERE ist.table_schema = 'public'
      AND ist.table_name = 'page_analytics'
  ) THEN
    DELETE FROM public.page_analytics
     WHERE created_at < now() - interval '90 days';
    GET DIAGNOSTICS v_pa = ROW_COUNT;
  END IF;

  RETURN QUERY VALUES
    ('web_vitals_samples'::text, v_wv),
    ('query_telemetry'::text, v_qt),
    ('page_analytics'::text, v_pa);
END;
$function$
