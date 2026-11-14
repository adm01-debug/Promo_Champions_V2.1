CREATE OR REPLACE FUNCTION public.compute_challenge_progress_value(p_salesperson_id uuid, p_challenge_type text, p_start date, p_end date)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_types activity_type[];
  v_val integer;
BEGIN
  IF p_challenge_type = 'sales' THEN
    -- WON canônico: ('completed','won','closed')
    SELECT count(*) INTO v_val
      FROM public.sales s
     WHERE s.salesperson_id = p_salesperson_id
       AND s.status = ANY (ARRAY['completed','won','closed'])
       AND s.created_at::date BETWEEN p_start AND p_end;
  ELSIF p_challenge_type = 'proposals' THEN
    SELECT count(*) INTO v_val
      FROM public.quotes q
     WHERE q.created_by = p_salesperson_id
       AND q.created_at::date BETWEEN p_start AND p_end;
  ELSIF p_challenge_type = 'follow_up' THEN
    SELECT count(*) INTO v_val
      FROM public.follow_up_audit_logs f
     WHERE f.user_id = (
             SELECT sp.auth_user_id FROM public.salespeople sp
              WHERE sp.id = p_salesperson_id
           )
       AND f.created_at::date BETWEEN p_start AND p_end;
  ELSE
    v_types := CASE p_challenge_type
      WHEN 'calls' THEN ARRAY['call'::activity_type]
      WHEN 'emails' THEN ARRAY['email'::activity_type]
      WHEN 'meetings' THEN ARRAY['meeting'::activity_type]
      WHEN 'demos' THEN ARRAY['meeting'::activity_type]
      WHEN 'linkedin' THEN ARRAY['linkedin'::activity_type]
      WHEN 'whatsapp' THEN ARRAY['whatsapp'::activity_type]
      ELSE NULL -- 'any'/'activity'/desconhecidos: qualquer tipo
    END;
    SELECT count(*) INTO v_val
      FROM public.activities a
     WHERE a.salesperson_id = p_salesperson_id
       AND a.created_at::date BETWEEN p_start AND p_end
       AND (v_types IS NULL OR a.activity_type = ANY (v_types));
  END IF;
  RETURN COALESCE(v_val, 0);
END;
$function$
