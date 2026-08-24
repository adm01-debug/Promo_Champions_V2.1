
CREATE OR REPLACE FUNCTION public.auto_add_client_to_portfolio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sp UUID;
BEGIN
  -- Tenta descobrir o salesperson do usuário atual
  BEGIN
    v_sp := get_current_salesperson_id();
  EXCEPTION WHEN OTHERS THEN
    v_sp := NULL;
  END;

  -- Se não há salesperson (webhook/integração), não cria portfólio agora
  IF v_sp IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.client_portfolio (client_id, salesperson_id, status)
  VALUES (NEW.id, v_sp, 'active')
  ON CONFLICT (client_id, salesperson_id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.auto_add_client_to_portfolio() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_add_client_to_portfolio() TO service_role;
