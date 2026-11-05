CREATE OR REPLACE FUNCTION public.trg_sales_stamp_closed_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD.status IN ('completed', 'won', 'closed', 'lost', 'cancelled')
     AND NEW.status NOT IN ('completed', 'won', 'closed', 'lost', 'cancelled') THEN
    NEW.closed_at := NULL;
  END IF;

  IF NEW.status IN ('completed', 'won', 'closed')
     AND NEW.closed_at IS NULL
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    NEW.closed_at := now();
  END IF;
  RETURN NEW;
END;
$function$
