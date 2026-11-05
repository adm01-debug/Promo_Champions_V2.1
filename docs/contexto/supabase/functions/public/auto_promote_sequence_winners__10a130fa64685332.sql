CREATE OR REPLACE FUNCTION public.auto_promote_sequence_winners(_sequence_id uuid)
 RETURNS TABLE(step_id uuid, promoted_label text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
BEGIN
  RETURN QUERY
    SELECT * FROM private.auto_promote_sequence_winners(_sequence_id);
END;
$function$
