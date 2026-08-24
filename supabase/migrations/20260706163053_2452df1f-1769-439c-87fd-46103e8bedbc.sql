
CREATE TABLE IF NOT EXISTS public.v4_callback_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  sent_ok integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  exhausted integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(day)
);

GRANT SELECT ON public.v4_callback_metrics TO authenticated;
GRANT ALL ON public.v4_callback_metrics TO service_role;

ALTER TABLE public.v4_callback_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read v4 callback metrics"
  ON public.v4_callback_metrics FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.increment_v4_callback_metric(
  _column text,
  _delta integer DEFAULT 1
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today date := (now() AT TIME ZONE 'utc')::date;
BEGIN
  IF _column NOT IN ('sent_ok', 'failed', 'exhausted') THEN
    RAISE EXCEPTION 'invalid metric column: %', _column;
  END IF;

  INSERT INTO public.v4_callback_metrics (day) VALUES (today)
  ON CONFLICT (day) DO NOTHING;

  EXECUTE format(
    'UPDATE public.v4_callback_metrics SET %I = %I + $1, updated_at = now() WHERE day = $2',
    _column, _column
  ) USING _delta, today;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_v4_callback_metric(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_v4_callback_metric(text, integer) TO service_role;

CREATE TRIGGER v4_callback_metrics_updated_at
  BEFORE UPDATE ON public.v4_callback_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.v4_callback_dead_letters;
