CREATE OR REPLACE FUNCTION public.increment_asset_view_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.action = 'view' THEN
    UPDATE public.sales_enablement_assets
    SET view_count = view_count + 1
    WHERE id = NEW.asset_id;
  END IF;
  RETURN NEW;
END;
$function$
