CREATE OR REPLACE FUNCTION public.create_activities_from_action_items(_recording_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_rec RECORD;
  v_caller_sp uuid;
  v_item jsonb;
  v_inserted int := 0;
  v_tag text;
  v_title text;
BEGIN
  SELECT id, salesperson_id, sale_id, action_items, title
    INTO v_rec
  FROM public.call_recordings
  WHERE id = _recording_id;

  IF v_rec.id IS NULL THEN
    RAISE EXCEPTION 'Recording not found';
  END IF;

  v_caller_sp := public.get_current_salesperson_id();
  IF v_rec.salesperson_id <> v_caller_sp AND NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  v_tag := '[ai-summary:' || _recording_id::text || ']';

  FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(v_rec.action_items, '[]'::jsonb))
  LOOP
    v_title := COALESCE(v_item->>'title', 'Follow-up da reunião');

    -- Idempotency: skip if note already contains tag for this item title
    IF EXISTS (
      SELECT 1 FROM public.activities
      WHERE salesperson_id = v_rec.salesperson_id
        AND notes LIKE '%' || v_tag || '%'
        AND notes LIKE '%' || v_title || '%'
    ) THEN
      CONTINUE;
    END IF;

    INSERT INTO public.activities (
      activity_type, outcome, sale_id, salesperson_id, notes, contact_name
    ) VALUES (
      'follow_up'::activity_type,
      'pending'::activity_outcome,
      v_rec.sale_id,
      v_rec.salesperson_id,
      v_tag || ' ' || v_title ||
        COALESCE(' | Prazo: ' || (v_item->>'due_hint'), '') ||
        COALESCE(' | Prioridade: ' || (v_item->>'priority'), '') ||
        COALESCE(' | Responsável: ' || (v_item->>'owner_hint'), ''),
      NULL
    );
    v_inserted := v_inserted + 1;
  END LOOP;

  RETURN v_inserted;
END;
$function$
