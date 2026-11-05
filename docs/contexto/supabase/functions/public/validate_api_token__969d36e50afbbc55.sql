CREATE OR REPLACE FUNCTION public.validate_api_token(p_token text)
 RETURNS TABLE(token_id uuid, team_id uuid, company_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT t.id, t.team_id, t.company_name
  FROM api_tokens t
  WHERE t.token = p_token
    AND t.is_active = true
    AND (t.expires_at IS NULL OR t.expires_at > now());
  
  -- Update usage stats
  UPDATE api_tokens SET last_used_at = now(), usage_count = usage_count + 1
  WHERE token = p_token;
END;
$function$
