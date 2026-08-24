CREATE TABLE public.sequence_step_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES public.sequence_steps(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (label IN ('A','B')),
  subject text,
  body text,
  traffic_weight integer NOT NULL DEFAULT 50 CHECK (traffic_weight BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (step_id, label)
);
CREATE INDEX idx_sequence_step_variants_step ON public.sequence_step_variants(step_id);
ALTER TABLE public.sequence_step_variants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.user_owns_sequence_step(_step_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sequence_steps st
    JOIN public.sequences s ON s.id = st.sequence_id
    WHERE st.id = _step_id
      AND (s.owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
$$;

CREATE POLICY "view variants" ON public.sequence_step_variants FOR SELECT USING (public.user_owns_sequence_step(step_id));
CREATE POLICY "insert variants" ON public.sequence_step_variants FOR INSERT WITH CHECK (public.user_owns_sequence_step(step_id));
CREATE POLICY "update variants" ON public.sequence_step_variants FOR UPDATE USING (public.user_owns_sequence_step(step_id));
CREATE POLICY "delete variants" ON public.sequence_step_variants FOR DELETE USING (public.user_owns_sequence_step(step_id));

ALTER TABLE public.sequence_step_executions
  ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES public.sequence_step_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS replied_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_sequence_step_executions_variant ON public.sequence_step_executions(variant_id);

CREATE OR REPLACE VIEW public.sequence_variant_performance AS
SELECT v.step_id, v.id AS variant_id, v.label,
  COUNT(e.id)::int AS sent,
  COUNT(e.replied_at)::int AS replied,
  CASE WHEN COUNT(e.id) > 0
    THEN ROUND(100.0 * COUNT(e.replied_at)::numeric / COUNT(e.id)::numeric, 2)
    ELSE 0 END AS reply_rate
FROM public.sequence_step_variants v
LEFT JOIN public.sequence_step_executions e ON e.variant_id = v.id
GROUP BY v.step_id, v.id, v.label;

CREATE OR REPLACE FUNCTION public.pick_step_variant(_step_id uuid)
RETURNS TABLE (variant_id uuid, label text, subject text, body text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _total int; _r numeric; _cum int := 0; _row record;
BEGIN
  SELECT COALESCE(SUM(traffic_weight),0) INTO _total FROM public.sequence_step_variants WHERE step_id = _step_id;
  IF _total = 0 THEN RETURN; END IF;
  _r := random() * _total;
  FOR _row IN
    SELECT v.id, v.label, v.subject, v.body, v.traffic_weight
    FROM public.sequence_step_variants v WHERE v.step_id = _step_id ORDER BY v.label
  LOOP
    _cum := _cum + _row.traffic_weight;
    IF _r <= _cum THEN
      RETURN QUERY SELECT _row.id, _row.label, _row.subject, _row.body;
      RETURN;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.declare_step_winner(_step_id uuid, _variant_label text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _v record;
BEGIN
  IF NOT public.user_owns_sequence_step(_step_id) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT * INTO _v FROM public.sequence_step_variants WHERE step_id = _step_id AND label = _variant_label;
  IF NOT FOUND THEN RAISE EXCEPTION 'Variant not found'; END IF;
  UPDATE public.sequence_steps SET subject = _v.subject, body = _v.body WHERE id = _step_id;
  DELETE FROM public.sequence_step_variants WHERE step_id = _step_id;
  RETURN true;
END;
$$;