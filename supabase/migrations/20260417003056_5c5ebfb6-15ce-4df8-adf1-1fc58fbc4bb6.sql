
-- ============== SEQUENCES ==============
CREATE TABLE public.sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  channel_mix TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  enabled BOOLEAN NOT NULL DEFAULT true,
  exit_on_reply BOOLEAN NOT NULL DEFAULT true,
  exit_on_meeting BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view their sequences"
  ON public.sequences FOR SELECT
  USING (
    auth.uid() = owner_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Authenticated users create sequences"
  ON public.sequences FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners update their sequences"
  ON public.sequences FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Owners delete their sequences"
  ON public.sequences FOR DELETE
  USING (
    auth.uid() = owner_id
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE INDEX idx_sequences_owner ON public.sequences(owner_id);
CREATE INDEX idx_sequences_enabled ON public.sequences(enabled) WHERE enabled = true;

-- ============== SEQUENCE STEPS ==============
CREATE TABLE public.sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES public.sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email','whatsapp','call','linkedin','task')),
  delay_days INTEGER NOT NULL DEFAULT 0,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  template_id UUID,
  subject TEXT,
  body TEXT,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sequence_id, step_order)
);

ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View steps of accessible sequences"
  ON public.sequence_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sequences s
      WHERE s.id = sequence_id
        AND (
          s.owner_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'manager')
        )
    )
  );

CREATE POLICY "Manage steps of own sequences"
  ON public.sequence_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sequences s
      WHERE s.id = sequence_id
        AND (
          s.owner_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'manager')
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sequences s
      WHERE s.id = sequence_id
        AND (
          s.owner_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'manager')
        )
    )
  );

CREATE INDEX idx_sequence_steps_seq ON public.sequence_steps(sequence_id, step_order);

-- ============== SEQUENCE ENROLLMENTS ==============
CREATE TABLE public.sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES public.sequences(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('lead','client','contact')),
  enrolled_by UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','exited','failed')),
  current_step INTEGER NOT NULL DEFAULT 0,
  next_action_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_executed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  exit_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sequence_id, contact_id, contact_type)
);

ALTER TABLE public.sequence_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View enrollments of accessible sequences"
  ON public.sequence_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sequences s
      WHERE s.id = sequence_id
        AND (
          s.owner_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'manager')
        )
    )
  );

CREATE POLICY "Insert enrollments to own sequences"
  ON public.sequence_enrollments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sequences s
      WHERE s.id = sequence_id
        AND (
          s.owner_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'manager')
        )
    )
  );

CREATE POLICY "Update enrollments of own sequences"
  ON public.sequence_enrollments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sequences s
      WHERE s.id = sequence_id
        AND (
          s.owner_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'manager')
        )
    )
  );

CREATE POLICY "Delete enrollments of own sequences"
  ON public.sequence_enrollments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sequences s
      WHERE s.id = sequence_id
        AND (
          s.owner_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin')
        )
    )
  );

CREATE INDEX idx_seq_enrollments_seq ON public.sequence_enrollments(sequence_id);
CREATE INDEX idx_seq_enrollments_contact ON public.sequence_enrollments(contact_id, contact_type);
CREATE INDEX idx_seq_enrollments_runner ON public.sequence_enrollments(status, next_action_at)
  WHERE status = 'active';

-- ============== SEQUENCE STEP EXECUTIONS ==============
CREATE TABLE public.sequence_step_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.sequence_enrollments(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.sequence_steps(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('sent','failed','skipped','queued')),
  channel TEXT,
  error_message TEXT,
  engagement JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sequence_step_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View executions of accessible sequences"
  ON public.sequence_step_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.sequence_enrollments e
      JOIN public.sequences s ON s.id = e.sequence_id
      WHERE e.id = enrollment_id
        AND (
          s.owner_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'manager')
        )
    )
  );

CREATE POLICY "System inserts executions"
  ON public.sequence_step_executions FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_step_executions_enrollment ON public.sequence_step_executions(enrollment_id, executed_at DESC);

-- ============== TIMESTAMPS TRIGGERS ==============
CREATE TRIGGER trg_sequences_updated_at
  BEFORE UPDATE ON public.sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_seq_enrollments_updated_at
  BEFORE UPDATE ON public.sequence_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
