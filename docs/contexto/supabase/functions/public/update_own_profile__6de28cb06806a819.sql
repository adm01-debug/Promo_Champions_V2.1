CREATE OR REPLACE FUNCTION public.update_own_profile(p_name text DEFAULT NULL::text, p_avatar_url text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE salespeople
  SET
    name = COALESCE(p_name, name),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE auth_user_id = auth.uid();
END;
$function$
