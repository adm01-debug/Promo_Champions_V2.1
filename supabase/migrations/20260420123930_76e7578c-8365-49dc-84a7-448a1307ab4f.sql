-- 1. Add cadence_type to cadences
DO $$ BEGIN
  CREATE TYPE public.cadence_type AS ENUM ('prospecting', 'quote_followup');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.cadences
  ADD COLUMN IF NOT EXISTS cadence_type public.cadence_type NOT NULL DEFAULT 'prospecting';

-- 2. Add quote_id to prospect_cadences
ALTER TABLE public.prospect_cadences
  ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES public.quotes(id) ON DELETE CASCADE;

ALTER TABLE public.prospect_cadences
  ALTER COLUMN sale_id DROP NOT NULL;

ALTER TABLE public.prospect_cadences
  DROP CONSTRAINT IF EXISTS prospect_cadences_target_check;

ALTER TABLE public.prospect_cadences
  ADD CONSTRAINT prospect_cadences_target_check
  CHECK ((sale_id IS NOT NULL) OR (quote_id IS NOT NULL));

CREATE INDEX IF NOT EXISTS idx_prospect_cadences_quote_id ON public.prospect_cadences(quote_id);
CREATE INDEX IF NOT EXISTS idx_cadences_type ON public.cadences(cadence_type);

-- 3. RLS: extend existing policies to allow quote-based access
DROP POLICY IF EXISTS "Salespeople view own quote cadences" ON public.prospect_cadences;
CREATE POLICY "Salespeople view own quote cadences"
ON public.prospect_cadences FOR SELECT
TO authenticated
USING (
  quote_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.salespeople sp ON sp.id = COALESCE(prospect_cadences.salesperson_id, sp.id)
    WHERE q.id = prospect_cadences.quote_id
      AND (q.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  )
);

-- 4. Manual enroll RPC
CREATE OR REPLACE FUNCTION public.enroll_quote_in_cadence(_quote_id uuid, _cadence_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enrollment_id uuid;
  v_salesperson_id uuid;
  v_first_day int;
  v_first_date date;
BEGIN
  SELECT sp.id INTO v_salesperson_id
  FROM public.quotes q
  LEFT JOIN public.salespeople sp ON sp.user_id = q.created_by
  WHERE q.id = _quote_id;

  SELECT COALESCE(MIN(day_number), 1) INTO v_first_day
  FROM public.cadence_steps WHERE cadence_id = _cadence_id;

  v_first_date := CURRENT_DATE + (v_first_day - 1);

  INSERT INTO public.prospect_cadences (
    quote_id, cadence_id, salesperson_id, enrollment_source, next_action_date
  ) VALUES (
    _quote_id, _cadence_id, v_salesperson_id, 'manual', v_first_date
  )
  RETURNING id INTO v_enrollment_id;

  INSERT INTO public.cadence_tasks (prospect_cadence_id, cadence_step_id, scheduled_date)
  SELECT v_enrollment_id, cs.id, CURRENT_DATE + (cs.day_number - 1)
  FROM public.cadence_steps cs
  WHERE cs.cadence_id = _cadence_id
  ORDER BY cs.step_order;

  RETURN v_enrollment_id;
END;
$$;

-- 5. Trigger: auto-enroll on quote sent
CREATE OR REPLACE FUNCTION public.auto_enroll_quote_cadence()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cadence_id uuid;
  v_existing uuid;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'sent')
     OR (TG_OP = 'INSERT' AND NEW.status = 'sent') THEN

    SELECT id INTO v_existing FROM public.prospect_cadences
    WHERE quote_id = NEW.id AND status IN ('active','paused') LIMIT 1;

    IF v_existing IS NOT NULL THEN RETURN NEW; END IF;

    SELECT id INTO v_cadence_id FROM public.cadences
    WHERE cadence_type = 'quote_followup' AND is_active = true
    ORDER BY created_at ASC LIMIT 1;

    IF v_cadence_id IS NOT NULL THEN
      PERFORM public.enroll_quote_in_cadence(NEW.id, v_cadence_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_enroll_quote_cadence ON public.quotes;
CREATE TRIGGER trg_auto_enroll_quote_cadence
AFTER INSERT OR UPDATE OF status ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.auto_enroll_quote_cadence();

-- 6. Seed default cadence
DO $$
DECLARE v_cadence_id uuid;
BEGIN
  SELECT id INTO v_cadence_id FROM public.cadences
  WHERE cadence_type = 'quote_followup' AND name = 'Follow-up de Orçamento' LIMIT 1;

  IF v_cadence_id IS NULL THEN
    INSERT INTO public.cadences (name, description, cadence_type, is_active)
    VALUES ('Follow-up de Orçamento', 'Sequência padrão de acompanhamento após envio de orçamento', 'quote_followup', true)
    RETURNING id INTO v_cadence_id;

    INSERT INTO public.cadence_steps (cadence_id, day_number, action_type, title, description, step_order) VALUES
      (v_cadence_id, 1, 'whatsapp', 'Confirmação de recebimento', 'Enviar WhatsApp confirmando recebimento do orçamento', 1),
      (v_cadence_id, 3, 'call', 'Ligação de feedback', 'Ligar para coletar feedback inicial sobre a proposta', 2),
      (v_cadence_id, 7, 'email', 'Email com case de sucesso', 'Enviar email com case relevante reforçando o valor', 3),
      (v_cadence_id, 14, 'call', 'Última tentativa + oferta', 'Ligação final com possível oferta de desconto', 4),
      (v_cadence_id, 21, 'other', 'Avaliar perda', 'Marcar como perdido caso não haja resposta', 5);
  END IF;
END $$;