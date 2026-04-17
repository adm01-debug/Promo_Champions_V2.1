CREATE TABLE public.send_time_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL UNIQUE REFERENCES public.sales(id) ON DELETE CASCADE,
  best_hour integer NOT NULL DEFAULT 10 CHECK (best_hour BETWEEN 0 AND 23),
  best_dow integer NOT NULL DEFAULT 2 CHECK (best_dow BETWEEN 0 AND 6),
  confidence numeric NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
  sample_size integer NOT NULL DEFAULT 0,
  tz text NOT NULL DEFAULT 'America/Sao_Paulo',
  hour_distribution jsonb NOT NULL DEFAULT '[]'::jsonb,
  dow_distribution jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.send_time_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners and managers read send_time_profiles" ON public.send_time_profiles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
    OR EXISTS (SELECT 1 FROM public.sales s JOIN public.salespeople sp ON sp.id = s.salesperson_id
               WHERE s.id = send_time_profiles.sale_id AND sp.auth_user_id = auth.uid())
  );
CREATE POLICY "service role manages send_time_profiles" ON public.send_time_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.scheduled_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email','whatsapp','linkedin','sms')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','cancelled')),
  optimization_source text NOT NULL DEFAULT 'manual' CHECK (optimization_source IN ('profile','global','manual')),
  sent_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_scheduled_sends_pending ON public.scheduled_sends(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_scheduled_sends_owner ON public.scheduled_sends(owner_id, created_at DESC);
ALTER TABLE public.scheduled_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners read own scheduled_sends" ON public.scheduled_sends FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "owners insert scheduled_sends" ON public.scheduled_sends FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owners update own scheduled_sends" ON public.scheduled_sends FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "service role manages scheduled_sends" ON public.scheduled_sends FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.get_global_send_time_stats()
RETURNS TABLE(best_hour integer, best_dow integer, sample_size bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH opens AS (
    SELECT EXTRACT(HOUR FROM tracked_at AT TIME ZONE 'America/Sao_Paulo')::int AS h,
           EXTRACT(DOW FROM tracked_at AT TIME ZONE 'America/Sao_Paulo')::int AS d
    FROM public.email_tracking_events
    WHERE event_type IN ('open','opened') AND tracked_at > now() - interval '90 days'
  ),
  hour_agg AS (SELECT h, COUNT(*) c FROM opens GROUP BY h ORDER BY COUNT(*) DESC LIMIT 1),
  dow_agg AS (SELECT d, COUNT(*) c FROM opens GROUP BY d ORDER BY COUNT(*) DESC LIMIT 1)
  SELECT COALESCE((SELECT h FROM hour_agg), 10)::int,
         COALESCE((SELECT d FROM dow_agg), 2)::int,
         (SELECT COUNT(*) FROM opens)::bigint;
$$;
GRANT EXECUTE ON FUNCTION public.get_global_send_time_stats() TO authenticated, service_role;