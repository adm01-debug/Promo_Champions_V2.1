CREATE OR REPLACE FUNCTION public.reindex_tables()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  REINDEX TABLE deals;
  REINDEX TABLE clients;
  REINDEX TABLE activities;
  REINDEX TABLE tasks;
  
  ANALYZE deals;
  ANALYZE clients;
  ANALYZE activities;
  ANALYZE tasks;
END;
$function$
