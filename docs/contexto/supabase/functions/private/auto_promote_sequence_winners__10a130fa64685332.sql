CREATE OR REPLACE FUNCTION private.auto_promote_sequence_winners(_sequence_id uuid)
 RETURNS TABLE(step_id uuid, promoted_label text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  s_step record;
  winner record;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  FOR s_step IN
    SELECT DISTINCT st.id
    FROM public.sequence_steps st
    JOIN public.sequence_step_variants v ON v.step_id = st.id
    WHERE st.sequence_id = _sequence_id
    GROUP BY st.id
    HAVING count(v.id) >= 2
  LOOP
    SELECT label, sent, replied,
           CASE WHEN sent > 0 THEN replied::numeric / sent ELSE 0 END AS rate
    INTO winner
    FROM public.sequence_variant_performance
    WHERE step_id = s_step.id AND sent >= 30
    ORDER BY (CASE WHEN sent > 0 THEN replied::numeric / sent ELSE 0 END) DESC
    LIMIT 1;

    IF winner.label IS NOT NULL THEN
      PERFORM public.declare_step_winner(s_step.id, winner.label::text);
      step_id := s_step.id;
      promoted_label := winner.label;
      RETURN NEXT;
    END IF;
  END LOOP;
  RETURN;
END;
$function$
