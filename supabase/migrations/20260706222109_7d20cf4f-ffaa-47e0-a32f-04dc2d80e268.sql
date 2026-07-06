CREATE OR REPLACE FUNCTION public.fn_normalize_quotes_inbound()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.seller_email IS NOT NULL THEN
    NEW.seller_email := lower(trim(NEW.seller_email));
  END IF;
  IF NEW.source IS NOT NULL THEN
    NEW.source := lower(trim(NEW.source));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_quotes_inbound ON public.quotes_inbound;
CREATE TRIGGER trg_normalize_quotes_inbound
  BEFORE INSERT OR UPDATE ON public.quotes_inbound
  FOR EACH ROW EXECUTE FUNCTION public.fn_normalize_quotes_inbound();

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
    WHERE lower(external_email) = lower(NEW.seller_email)
      AND external_source = NEW.source
  ) THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_salesperson_id
  FROM public.salespeople
  WHERE lower(email) = lower(NEW.seller_email)
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

DROP TRIGGER IF EXISTS trg_auto_map_inbound_seller ON public.quotes_inbound;
CREATE TRIGGER trg_auto_map_inbound_seller
  AFTER INSERT OR UPDATE OF seller_email ON public.quotes_inbound
  FOR EACH ROW EXECUTE FUNCTION public.fn_auto_map_inbound_seller();

UPDATE public.external_seller_map
SET
  external_id = lower(external_id),
  external_email = lower(external_email),
  updated_at = NOW()
WHERE external_id != lower(external_id) OR external_email != lower(external_email);

UPDATE public.salespeople
SET
  email = lower(email),
  updated_at = NOW()
WHERE email IS NOT NULL AND email != lower(email);