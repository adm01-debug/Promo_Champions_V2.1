CREATE OR REPLACE FUNCTION public.regenerate_backup_codes()
 RETURNS text[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_codes text[];
BEGIN
  v_codes := public.generate_mfa_backup_codes();
  UPDATE user_mfa_settings SET
    backup_codes = v_codes,
    backup_codes_generated_at = now(),
    updated_at = now()
  WHERE user_id = auth.uid();
  RETURN v_codes;
END;
$function$
