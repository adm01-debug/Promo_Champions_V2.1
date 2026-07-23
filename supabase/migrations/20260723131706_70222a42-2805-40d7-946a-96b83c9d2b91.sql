
CREATE OR REPLACE FUNCTION public.award_bonus_if_eligible(
  _bonus_id uuid,
  _computed_amount numeric,
  _bonus_kind text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sp_id uuid;
  _bonus record;
  _period date := date_trunc('month', now())::date;
  _existing uuid;
  _new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF _computed_amount IS NULL OR _computed_amount <= 0 THEN
    RETURN NULL;
  END IF;

  IF _bonus_kind NOT IN ('fixed','percentage') THEN
    RAISE EXCEPTION 'invalid bonus_kind';
  END IF;

  -- Deriva salesperson_id do usuário autenticado (impossível forjar)
  SELECT id INTO _sp_id FROM public.salespeople WHERE auth_user_id = auth.uid() LIMIT 1;
  IF _sp_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Valida bônus ativo e elegibilidade de escopo (individual/global)
  SELECT * INTO _bonus FROM public.commission_bonuses WHERE id = _bonus_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Se o bônus tem alvo individual, precisa ser o próprio vendedor
  IF _bonus.salesperson_id IS NOT NULL AND _bonus.salesperson_id <> _sp_id THEN
    RETURN NULL;
  END IF;

  -- Idempotência: já registrado no mês?
  SELECT id INTO _existing
  FROM public.commission_bonus_awards
  WHERE bonus_id = _bonus_id
    AND salesperson_id = _sp_id
    AND period_month = _period
  LIMIT 1;

  IF _existing IS NOT NULL THEN
    RETURN _existing;
  END IF;

  INSERT INTO public.commission_bonus_awards (
    bonus_id, salesperson_id, period_month, computed_amount, bonus_kind, status
  ) VALUES (
    _bonus_id, _sp_id, _period, _computed_amount, _bonus_kind, 'pending'
  )
  ON CONFLICT (bonus_id, salesperson_id, period_month) DO NOTHING
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.award_bonus_if_eligible(uuid, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_bonus_if_eligible(uuid, numeric, text) TO authenticated;
