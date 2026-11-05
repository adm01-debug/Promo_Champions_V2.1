CREATE OR REPLACE FUNCTION public.manual_xp_adjustment(_user_id uuid, _amount integer, _reason text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _adjustment_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can adjust XP';
  END IF;

  IF _reason IS NULL OR length(trim(_reason)) < 3 THEN
    RAISE EXCEPTION 'Reason is required (min 3 chars)';
  END IF;

  INSERT INTO public.xp_adjustments(user_id, amount, reason, source, adjusted_by)
  VALUES (_user_id, _amount, _reason, 'manual', auth.uid())
  RETURNING id INTO _adjustment_id;

  RETURN _adjustment_id;
END;
$function$
