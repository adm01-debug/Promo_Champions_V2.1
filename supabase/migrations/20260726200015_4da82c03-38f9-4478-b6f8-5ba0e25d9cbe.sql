CREATE TABLE IF NOT EXISTS public.email_opt_outs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  reason text,
  source text NOT NULL DEFAULT 'unsubscribe_link',
  owner_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_email_opt_outs_email ON public.email_opt_outs (lower(email));

GRANT SELECT, DELETE ON public.email_opt_outs TO authenticated;
GRANT ALL ON public.email_opt_outs TO service_role;

ALTER TABLE public.email_opt_outs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view opt-outs" ON public.email_opt_outs;
CREATE POLICY "Admins can view opt-outs" ON public.email_opt_outs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete opt-outs" ON public.email_opt_outs;
CREATE POLICY "Admins can delete opt-outs" ON public.email_opt_outs
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.record_email_opt_out(
  _email text,
  _reason text DEFAULT NULL,
  _source text DEFAULT 'unsubscribe_link',
  _owner_id uuid DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(btrim(coalesce(_email, '')));
  v_id uuid;
BEGIN
  IF v_email = '' OR position('@' in v_email) = 0 THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;

  INSERT INTO public.email_opt_outs (email, reason, source, owner_id, metadata)
  VALUES (v_email, _reason, coalesce(_source, 'unsubscribe_link'), _owner_id, coalesce(_metadata, '{}'::jsonb))
  ON CONFLICT (lower(email)) DO UPDATE
    SET reason = coalesce(EXCLUDED.reason, public.email_opt_outs.reason),
        source = EXCLUDED.source
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_email_opted_out(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.email_opt_outs
    WHERE lower(email) = lower(btrim(coalesce(_email, '')))
  );
$$;

REVOKE ALL ON FUNCTION public.record_email_opt_out(text, text, text, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_email_opt_out(text, text, text, uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_email_opted_out(text) TO authenticated, service_role;