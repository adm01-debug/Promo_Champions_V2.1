
CREATE OR REPLACE FUNCTION public.notify_salesperson_on_bonus_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _auth_user uuid;
  _bonus_name text;
  _amount_txt text;
BEGIN
  IF NEW.status <> 'paid' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'paid' THEN
    RETURN NEW;
  END IF;

  SELECT auth_user_id INTO _auth_user
  FROM public.salespeople
  WHERE id = NEW.salesperson_id
  LIMIT 1;

  IF _auth_user IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT name INTO _bonus_name
  FROM public.commission_bonuses
  WHERE id = NEW.bonus_id
  LIMIT 1;

  _amount_txt := to_char(COALESCE(NEW.computed_amount, 0), 'FM"R$" 999G999G990D00');

  INSERT INTO public.notifications (
    user_id, type, category, priority, icon, title, message,
    action_label, action_url, metadata
  ) VALUES (
    _auth_user,
    'commission_paid',
    'commission',
    'high',
    'trophy',
    '🎉 Premiação paga!',
    'Sua premiação "' || COALESCE(_bonus_name, 'Bônus') || '" no valor de ' || _amount_txt || ' foi liberada.',
    'Ver detalhes',
    '/meu-assistente',
    jsonb_build_object(
      'award_id', NEW.id,
      'bonus_id', NEW.bonus_id,
      'amount', NEW.computed_amount,
      'period_month', NEW.period_month,
      'bonus_kind', NEW.bonus_kind
    )
  );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_salesperson_on_bonus_paid() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_notify_bonus_paid ON public.commission_bonus_awards;

CREATE TRIGGER trg_notify_bonus_paid
AFTER INSERT OR UPDATE OF status ON public.commission_bonus_awards
FOR EACH ROW
WHEN (NEW.status = 'paid')
EXECUTE FUNCTION public.notify_salesperson_on_bonus_paid();
