CREATE OR REPLACE FUNCTION private.auto_link_sale_to_account()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_account_id uuid;
BEGIN
  IF NEW.client_name IS NULL OR length(trim(NEW.client_name)) = 0 THEN
    RETURN NEW;
  END IF;
  IF NEW.account_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_account_id
  FROM public.accounts
  WHERE lower(name) = lower(trim(NEW.client_name))
  LIMIT 1;

  IF v_account_id IS NULL THEN
    BEGIN
      INSERT INTO public.accounts (name, owner_id, tier)
      VALUES (trim(NEW.client_name), NEW.salesperson_id, 'mid_market')
      RETURNING id INTO v_account_id;
    EXCEPTION WHEN unique_violation THEN
      SELECT id INTO v_account_id
      FROM public.accounts
      WHERE lower(name) = lower(trim(NEW.client_name))
      LIMIT 1;
    END;
  END IF;

  NEW.account_id := v_account_id;
  RETURN NEW;
END;
$function$
