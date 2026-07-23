CREATE TABLE public.personal_assistant_nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  model TEXT,
  feedback TEXT NOT NULL DEFAULT 'pending' CHECK (feedback IN ('pending','accepted','dismissed')),
  feedback_at TIMESTAMPTZ,
  context_snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pa_nudges_sp_created ON public.personal_assistant_nudges (salesperson_id, created_at DESC);
CREATE INDEX idx_pa_nudges_feedback ON public.personal_assistant_nudges (feedback) WHERE feedback <> 'pending';

GRANT SELECT, INSERT, UPDATE ON public.personal_assistant_nudges TO authenticated;
GRANT ALL ON public.personal_assistant_nudges TO service_role;

ALTER TABLE public.personal_assistant_nudges ENABLE ROW LEVEL SECURITY;

-- Vendedor vê apenas seus próprios nudges
CREATE POLICY "Salesperson reads own nudges"
ON public.personal_assistant_nudges FOR SELECT
TO authenticated
USING (
  salesperson_id IN (
    SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()
  )
);

-- Vendedor insere apenas nudges para si
CREATE POLICY "Salesperson inserts own nudges"
ON public.personal_assistant_nudges FOR INSERT
TO authenticated
WITH CHECK (
  salesperson_id IN (
    SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()
  )
);

-- Vendedor atualiza feedback apenas dos seus (não altera conteúdo por policy separada de coluna? Simples: permite update, coluna content protegida por trigger)
CREATE POLICY "Salesperson updates own nudge feedback"
ON public.personal_assistant_nudges FOR UPDATE
TO authenticated
USING (
  salesperson_id IN (
    SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  salesperson_id IN (
    SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()
  )
);

-- Admin/manager leitura para dashboards agregados
CREATE POLICY "Admins and managers can read all nudges"
ON public.personal_assistant_nudges FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

-- Trigger updated_at
CREATE TRIGGER trg_pa_nudges_updated_at
BEFORE UPDATE ON public.personal_assistant_nudges
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: impede alteração de content depois de criado (só feedback pode mudar)
CREATE OR REPLACE FUNCTION public.protect_pa_nudge_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content THEN
    RAISE EXCEPTION 'nudge.content is immutable';
  END IF;
  IF NEW.salesperson_id IS DISTINCT FROM OLD.salesperson_id THEN
    RAISE EXCEPTION 'nudge.salesperson_id is immutable';
  END IF;
  -- Auto-preenche feedback_at quando feedback muda de pending -> accepted/dismissed
  IF OLD.feedback = 'pending' AND NEW.feedback IN ('accepted','dismissed') AND NEW.feedback_at IS NULL THEN
    NEW.feedback_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pa_nudges_protect
BEFORE UPDATE ON public.personal_assistant_nudges
FOR EACH ROW EXECUTE FUNCTION public.protect_pa_nudge_content();