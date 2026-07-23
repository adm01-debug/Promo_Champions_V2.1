
CREATE TABLE IF NOT EXISTS public.personal_assistant_briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL,
  briefing_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  content TEXT NOT NULL,
  model TEXT,
  token_count INT,
  context_snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pab_salesperson_date
  ON public.personal_assistant_briefings (salesperson_id, briefing_date);

CREATE INDEX IF NOT EXISTS idx_pab_salesperson_date_desc
  ON public.personal_assistant_briefings (salesperson_id, briefing_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_assistant_briefings TO authenticated;
GRANT ALL ON public.personal_assistant_briefings TO service_role;

ALTER TABLE public.personal_assistant_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pab_owner_select"
ON public.personal_assistant_briefings
FOR SELECT
TO authenticated
USING (
  salesperson_id IN (SELECT s.id FROM public.salespeople s WHERE s.auth_user_id = auth.uid())
);

CREATE POLICY "pab_owner_insert"
ON public.personal_assistant_briefings
FOR INSERT
TO authenticated
WITH CHECK (
  salesperson_id IN (SELECT s.id FROM public.salespeople s WHERE s.auth_user_id = auth.uid())
);

CREATE POLICY "pab_owner_update"
ON public.personal_assistant_briefings
FOR UPDATE
TO authenticated
USING (
  salesperson_id IN (SELECT s.id FROM public.salespeople s WHERE s.auth_user_id = auth.uid())
)
WITH CHECK (
  salesperson_id IN (SELECT s.id FROM public.salespeople s WHERE s.auth_user_id = auth.uid())
);

CREATE POLICY "pab_admin_manager_select"
ON public.personal_assistant_briefings
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'manager'::app_role)
);

CREATE TRIGGER trg_pab_updated_at
BEFORE UPDATE ON public.personal_assistant_briefings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
