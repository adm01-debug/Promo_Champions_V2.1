
CREATE OR REPLACE FUNCTION public.fn_normalize_quotes_inbound()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.seller_email IS NOT NULL THEN
    NEW.seller_email := lower(trim(E'\t\n\r ' FROM NEW.seller_email));
  END IF;
  IF NEW.source IS NOT NULL THEN
    NEW.source := lower(trim(E'\t\n\r ' FROM NEW.source));
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_auto_map_inbound_seller()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_salesperson_id UUID;
BEGIN
  IF NEW.seller_email IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.external_seller_map
    WHERE lower(trim(E'\t\n\r ' FROM external_email)) = lower(NEW.seller_email)
      AND external_source = NEW.source
  ) THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_salesperson_id
  FROM public.salespeople
  WHERE lower(trim(E'\t\n\r ' FROM email)) = lower(NEW.seller_email)
    AND is_active = true
  LIMIT 1;

  IF v_salesperson_id IS NOT NULL THEN
    INSERT INTO public.external_seller_map (
      external_id, external_source, salesperson_id, external_email
    )
    VALUES (
      lower(NEW.seller_email),
      NEW.source,
      v_salesperson_id,
      lower(NEW.seller_email)
    )
    ON CONFLICT (external_id, external_source) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
