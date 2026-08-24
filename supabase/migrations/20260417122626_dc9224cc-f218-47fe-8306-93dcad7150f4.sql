-- 1. Add summary columns to call_recordings
ALTER TABLE public.call_recordings
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS action_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS decisions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS objections_summary jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS next_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS key_topics text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS sentiment text,
  ADD COLUMN IF NOT EXISTS summarized_at timestamptz;

-- 2. RPC: update_call_recording_summary (ownership-checked)
CREATE OR REPLACE FUNCTION public.update_call_recording_summary(
  _recording_id uuid,
  _summary text,
  _action_items jsonb,
  _decisions jsonb,
  _objections jsonb,
  _next_steps jsonb,
  _key_topics text[],
  _sentiment text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_caller_sp uuid;
BEGIN
  SELECT salesperson_id INTO v_owner FROM public.call_recordings WHERE id = _recording_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Recording not found';
  END IF;

  v_caller_sp := public.get_current_salesperson_id();
  IF v_owner <> v_caller_sp AND NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF _sentiment IS NOT NULL AND _sentiment NOT IN ('positive','neutral','negative','mixed') THEN
    RAISE EXCEPTION 'Invalid sentiment value';
  END IF;

  UPDATE public.call_recordings SET
    summary = _summary,
    action_items = COALESCE(_action_items, '[]'::jsonb),
    decisions = COALESCE(_decisions, '[]'::jsonb),
    objections_summary = COALESCE(_objections, '[]'::jsonb),
    next_steps = COALESCE(_next_steps, '[]'::jsonb),
    key_topics = COALESCE(_key_topics, ARRAY[]::text[]),
    sentiment = _sentiment,
    summarized_at = now(),
    status = CASE WHEN status IN ('transcribed','analyzing') THEN 'ready' ELSE status END,
    updated_at = now()
  WHERE id = _recording_id;

  RETURN true;
END;
$$;

-- 3. RPC: create_activities_from_action_items (idempotent via notes tag)
CREATE OR REPLACE FUNCTION public.create_activities_from_action_items(_recording_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;