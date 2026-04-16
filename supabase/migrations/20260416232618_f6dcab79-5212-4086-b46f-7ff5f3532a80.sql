-- =====================================================
-- CUSTOMER SUCCESS 360º — MIGRATION
-- =====================================================

-- ENUMS
DO $$ BEGIN
  CREATE TYPE public.support_ticket_status AS ENUM ('open','pending','resolved','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.support_ticket_priority AS ENUM ('low','normal','high','urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.renewal_status AS ENUM ('upcoming','at_risk','renewed','churned','lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.onboarding_status AS ENUM ('not_started','in_progress','completed','stalled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.expansion_type AS ENUM ('upsell','cross_sell','expansion');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.expansion_opp_status AS ENUM ('identified','qualified','proposed','won','lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cs_survey_type AS ENUM ('csat','ces');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.qbr_frequency AS ENUM ('monthly','quarterly','biannual','annual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  external_id text,
  source text NOT NULL DEFAULT 'internal',
  subject text NOT NULL,
  description text,
  status public.support_ticket_status NOT NULL DEFAULT 'open',
  priority public.support_ticket_priority NOT NULL DEFAULT 'normal',
  sentiment text,
  requester_email text,
  assignee_email text,
  tags text[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_account ON public.support_tickets(account_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_support_tickets_external ON public.support_tickets(source, external_id) WHERE external_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.renewals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  contract_value numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  renewal_date date NOT NULL,
  notice_period_days int NOT NULL DEFAULT 30,
  auto_renew boolean NOT NULL DEFAULT false,
  status public.renewal_status NOT NULL DEFAULT 'upcoming',
  owner_salesperson_id uuid REFERENCES public.salespeople(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_renewals_account ON public.renewals(account_id);
CREATE INDEX IF NOT EXISTS idx_renewals_date ON public.renewals(renewal_date);
CREATE INDEX IF NOT EXISTS idx_renewals_status ON public.renewals(status);

CREATE TABLE IF NOT EXISTS public.product_usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_email text,
  feature_key text NOT NULL,
  event_type text NOT NULL DEFAULT 'feature_use',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_pue_account_time ON public.product_usage_events(account_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_pue_feature ON public.product_usage_events(feature_key);

CREATE TABLE IF NOT EXISTS public.product_usage_summary (
  account_id uuid PRIMARY KEY REFERENCES public.accounts(id) ON DELETE CASCADE,
  dau int NOT NULL DEFAULT 0,
  wau int NOT NULL DEFAULT 0,
  mau int NOT NULL DEFAULT 0,
  last_login_at timestamptz,
  top_features jsonb NOT NULL DEFAULT '[]'::jsonb,
  adoption_score int NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.onboarding_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  template_key text NOT NULL DEFAULT 'standard',
  status public.onboarding_status NOT NULL DEFAULT 'not_started',
  current_step int NOT NULL DEFAULT 0,
  total_steps int NOT NULL DEFAULT 0,
  owner_salesperson_id uuid REFERENCES public.salespeople(id) ON DELETE SET NULL,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_onboarding_account ON public.onboarding_journeys(account_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON public.onboarding_journeys(status);

CREATE TABLE IF NOT EXISTS public.onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.onboarding_journeys(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_journey ON public.onboarding_steps(journey_id, order_index);

CREATE TABLE IF NOT EXISTS public.expansion_playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL DEFAULT 'usage_threshold',
  trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_action text,
  expansion_type public.expansion_type NOT NULL DEFAULT 'upsell',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expansion_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  playbook_id uuid REFERENCES public.expansion_playbooks(id) ON DELETE SET NULL,
  type public.expansion_type NOT NULL DEFAULT 'upsell',
  estimated_value numeric(14,2) NOT NULL DEFAULT 0,
  status public.expansion_opp_status NOT NULL DEFAULT 'identified',
  confidence_score int NOT NULL DEFAULT 50,
  notes text,
  owner_salesperson_id uuid REFERENCES public.salespeople(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_expansion_opp_account ON public.expansion_opportunities(account_id);
CREATE INDEX IF NOT EXISTS idx_expansion_opp_status ON public.expansion_opportunities(status);

CREATE TABLE IF NOT EXISTS public.csat_ces_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE,
  contact_email text,
  survey_type public.cs_survey_type NOT NULL DEFAULT 'csat',
  score int,
  comment text,
  trigger_event text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_csatces_account ON public.csat_ces_surveys(account_id);
CREATE INDEX IF NOT EXISTS idx_csatces_type ON public.csat_ces_surveys(survey_type);

CREATE TABLE IF NOT EXISTS public.qbr_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  frequency public.qbr_frequency NOT NULL DEFAULT 'quarterly',
  next_qbr_at date,
  last_qbr_at date,
  owner_salesperson_id uuid REFERENCES public.salespeople(id) ON DELETE SET NULL,
  auto_generate boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qbr_schedule_account ON public.qbr_schedule(account_id);
CREATE INDEX IF NOT EXISTS idx_qbr_schedule_next ON public.qbr_schedule(next_qbr_at);

-- =====================================================
-- TRIGGERS updated_at
-- =====================================================
DO $$ BEGIN
  CREATE TRIGGER trg_support_tickets_uat BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_renewals_uat BEFORE UPDATE ON public.renewals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_onb_journeys_uat BEFORE UPDATE ON public.onboarding_journeys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_exp_playbooks_uat BEFORE UPDATE ON public.expansion_playbooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_exp_opps_uat BEFORE UPDATE ON public.expansion_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_qbr_schedule_uat BEFORE UPDATE ON public.qbr_schedule FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_usage_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expansion_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expansion_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csat_ces_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qbr_schedule ENABLE ROW LEVEL SECURITY;

-- Helper inline: account ownership check
-- Admin/manager total; salesperson vê suas próprias contas (accounts.owner_id = sua salesperson_id)

-- support_tickets
CREATE POLICY "cs_st_select" ON public.support_tickets FOR SELECT
  USING (public.is_admin_or_manager(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_id = public.get_current_salesperson_id()
  ));
CREATE POLICY "cs_st_insert" ON public.support_tickets FOR INSERT
  WITH CHECK (public.is_admin_or_manager(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_id = public.get_current_salesperson_id()
  ));
CREATE POLICY "cs_st_update" ON public.support_tickets FOR UPDATE
  USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "cs_st_delete" ON public.support_tickets FOR DELETE
  USING (public.is_admin_or_manager(auth.uid()));

-- renewals
CREATE POLICY "cs_rn_select" ON public.renewals FOR SELECT
  USING (public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() OR EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_id = public.get_current_salesperson_id()
  ));
CREATE POLICY "cs_rn_modify" ON public.renewals FOR ALL
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- product_usage_events
CREATE POLICY "cs_pue_select" ON public.product_usage_events FOR SELECT
  USING (public.is_admin_or_manager(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_id = public.get_current_salesperson_id()
  ));
CREATE POLICY "cs_pue_insert" ON public.product_usage_events FOR INSERT
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- product_usage_summary
CREATE POLICY "cs_pus_select" ON public.product_usage_summary FOR SELECT
  USING (public.is_admin_or_manager(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_id = public.get_current_salesperson_id()
  ));
CREATE POLICY "cs_pus_modify" ON public.product_usage_summary FOR ALL
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- onboarding
CREATE POLICY "cs_oj_select" ON public.onboarding_journeys FOR SELECT
  USING (public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() OR EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_id = public.get_current_salesperson_id()
  ));
CREATE POLICY "cs_oj_modify" ON public.onboarding_journeys FOR ALL
  USING (public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id())
  WITH CHECK (public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "cs_os_select" ON public.onboarding_steps FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.onboarding_journeys j WHERE j.id = journey_id AND (
    public.is_admin_or_manager(auth.uid()) OR j.owner_salesperson_id = public.get_current_salesperson_id()
  )));
CREATE POLICY "cs_os_modify" ON public.onboarding_steps FOR ALL
  USING (EXISTS (SELECT 1 FROM public.onboarding_journeys j WHERE j.id = journey_id AND (
    public.is_admin_or_manager(auth.uid()) OR j.owner_salesperson_id = public.get_current_salesperson_id()
  )))
  WITH CHECK (EXISTS (SELECT 1 FROM public.onboarding_journeys j WHERE j.id = journey_id AND (
    public.is_admin_or_manager(auth.uid()) OR j.owner_salesperson_id = public.get_current_salesperson_id()
  )));

-- expansion
CREATE POLICY "cs_ep_select" ON public.expansion_playbooks FOR SELECT USING (true);
CREATE POLICY "cs_ep_modify" ON public.expansion_playbooks FOR ALL
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "cs_eo_select" ON public.expansion_opportunities FOR SELECT
  USING (public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() OR EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_id = public.get_current_salesperson_id()
  ));
CREATE POLICY "cs_eo_modify" ON public.expansion_opportunities FOR ALL
  USING (public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id())
  WITH CHECK (public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id());

-- csat/ces
CREATE POLICY "cs_sv_select" ON public.csat_ces_surveys FOR SELECT
  USING (public.is_admin_or_manager(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_id = public.get_current_salesperson_id()
  ));
CREATE POLICY "cs_sv_modify" ON public.csat_ces_surveys FOR ALL
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- qbr schedule
CREATE POLICY "cs_qbr_select" ON public.qbr_schedule FOR SELECT
  USING (public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() OR EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_id = public.get_current_salesperson_id()
  ));
CREATE POLICY "cs_qbr_modify" ON public.qbr_schedule FOR ALL
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- =====================================================
-- FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.compute_customer_health_v2(_account_id uuid)
RETURNS TABLE(
  account_id uuid,
  health_score int,
  ticket_factor int,
  nps_factor int,
  csat_factor int,
  usage_factor int,
  renewal_factor int,
  recommended_action text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _open_tickets int;
  _urgent_tickets int;
  _avg_nps numeric;
  _avg_csat numeric;
  _adoption int;
  _days_to_renewal int;
  _renewal_status public.renewal_status;
  _ticket int := 100;
  _nps int := 50;
  _csat int := 50;
  _usage int := 50;
  _renewal int := 70;
  _final int;
  _action text := 'Manter cadência regular';
BEGIN
  SELECT COUNT(*) FILTER (WHERE status IN ('open','pending')),
         COUNT(*) FILTER (WHERE priority = 'urgent' AND status IN ('open','pending'))
    INTO _open_tickets, _urgent_tickets
  FROM public.support_tickets WHERE account_id = _account_id;

  _ticket := GREATEST(0, 100 - (_open_tickets * 8) - (_urgent_tickets * 15));

  SELECT AVG(score)::numeric INTO _avg_nps
  FROM public.nps_surveys
  WHERE client_name IN (SELECT name FROM public.accounts WHERE id = _account_id)
    AND score IS NOT NULL;
  _nps := COALESCE((_avg_nps * 10)::int, 50);

  SELECT AVG(score)::numeric INTO _avg_csat
  FROM public.csat_ces_surveys
  WHERE account_id = _account_id AND survey_type = 'csat' AND score IS NOT NULL;
  _csat := COALESCE((_avg_csat * 20)::int, 50);

  SELECT adoption_score INTO _adoption FROM public.product_usage_summary WHERE account_id = _account_id;
  _usage := COALESCE(_adoption, 50);

  SELECT (renewal_date - CURRENT_DATE), status INTO _days_to_renewal, _renewal_status
  FROM public.renewals WHERE account_id = _account_id
  ORDER BY renewal_date ASC LIMIT 1;

  IF _renewal_status = 'at_risk' THEN _renewal := 30;
  ELSIF _renewal_status = 'churned' OR _renewal_status = 'lost' THEN _renewal := 0;
  ELSIF _days_to_renewal IS NOT NULL AND _days_to_renewal < 30 THEN _renewal := 50;
  ELSIF _days_to_renewal IS NOT NULL AND _days_to_renewal < 60 THEN _renewal := 65;
  ELSE _renewal := 80;
  END IF;

  _final := ROUND((_ticket * 0.2) + (_nps * 0.2) + (_csat * 0.15) + (_usage * 0.25) + (_renewal * 0.2));
  _final := GREATEST(0, LEAST(100, _final));

  IF _final < 30 THEN _action := '🚨 Reunião executiva urgente — risco de churn';
  ELSIF _final < 50 THEN _action := '📞 Call de retenção esta semana';
  ELSIF _usage < 40 THEN _action := '✉️ Workshop de adoção e re-engajamento';
  ELSIF _open_tickets > 5 THEN _action := '🎫 Resolver tickets abertos com prioridade';
  ELSIF _renewal < 60 THEN _action := '📅 Iniciar conversa de renovação';
  ELSIF _final > 80 THEN _action := '💎 Apresentar proposta de expansão (upsell)';
  END IF;

  RETURN QUERY SELECT _account_id, _final, _ticket, _nps, _csat, _usage, _renewal, _action;
END;
$$;

CREATE OR REPLACE FUNCTION public.detect_renewal_risks()
RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _updated int := 0;
BEGIN
  UPDATE public.renewals
  SET status = 'at_risk', updated_at = now()
  WHERE status = 'upcoming'
    AND renewal_date <= CURRENT_DATE + INTERVAL '60 days'
    AND account_id IN (
      SELECT a.id FROM public.accounts a
      WHERE a.health_status IN ('critical','at_risk')
    );
  GET DIAGNOSTICS _updated = ROW_COUNT;

  UPDATE public.renewals
  SET status = 'churned', updated_at = now()
  WHERE status IN ('upcoming','at_risk')
    AND renewal_date < CURRENT_DATE - INTERVAL '7 days'
    AND auto_renew = false;

  RETURN _updated;
END;
$$;

CREATE OR REPLACE FUNCTION public.schedule_next_qbrs()
RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _r RECORD;
  _interval interval;
  _count int := 0;
BEGIN
  FOR _r IN SELECT id, frequency, last_qbr_at FROM public.qbr_schedule WHERE is_active = true
  LOOP
    _interval := CASE _r.frequency
      WHEN 'monthly' THEN INTERVAL '30 days'
      WHEN 'quarterly' THEN INTERVAL '90 days'
      WHEN 'biannual' THEN INTERVAL '180 days'
      ELSE INTERVAL '365 days'
    END;
    UPDATE public.qbr_schedule
    SET next_qbr_at = COALESCE(_r.last_qbr_at, CURRENT_DATE) + _interval,
        updated_at = now()
    WHERE id = _r.id;
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$$;