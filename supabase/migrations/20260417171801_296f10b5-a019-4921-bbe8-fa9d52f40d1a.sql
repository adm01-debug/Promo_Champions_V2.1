DROP POLICY IF EXISTS "insert assignments service" ON public.sequence_step_assignments;

CREATE POLICY "insert assignments via sequence owner"
ON public.sequence_step_assignments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sequence_enrollments e
    JOIN public.sequences s ON s.id = e.sequence_id
    WHERE e.id = sequence_step_assignments.enrollment_id
      AND (s.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  )
);