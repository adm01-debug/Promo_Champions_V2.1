-- Track which variant was assigned to each enrollment+step (for sticky AB)
CREATE TABLE IF NOT EXISTS public.sequence_step_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.sequence_enrollments(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES public.sequence_steps(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.sequence_step_variants(id) ON DELETE SET NULL,
  variant_label text,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, step_id)
);

CREATE INDEX IF NOT EXISTS idx_ssa_step ON public.sequence_step_assignments(step_id);
CREATE INDEX IF NOT EXISTS idx_ssa_variant ON public.sequence_step_assignments(variant_id);

ALTER TABLE public.sequence_step_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view assignments via sequence owner"
ON public.sequence_step_assignments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sequence_enrollments e
    JOIN public.sequences s ON s.id = e.sequence_id
    WHERE e.id = sequence_step_assignments.enrollment_id
      AND (s.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  )
);

CREATE POLICY "insert assignments service"
ON public.sequence_step_assignments FOR INSERT
TO authenticated
WITH CHECK (true);

-- RPC: auto-promote winners for an entire sequence (admin only)
CREATE OR REPLACE FUNCTION public.auto_promote_sequence_winners(_sequence_id uuid)
RETURNS TABLE(step_id uuid, promoted_label text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.auto_promote_sequence_winners(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auto_promote_sequence_winners(uuid) TO authenticated;