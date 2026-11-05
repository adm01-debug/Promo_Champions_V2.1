CREATE OR REPLACE FUNCTION private.check_quote_expirations()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.quotes
    SET status = 'expired',
        updated_at = now()
    WHERE status = 'sent'
      AND valid_until < now();
END;
$function$
