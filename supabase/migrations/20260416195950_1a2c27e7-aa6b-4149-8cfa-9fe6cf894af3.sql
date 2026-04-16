-- ============ ACCOUNTS (parent companies) ============
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  industry TEXT,
  tier TEXT NOT NULL DEFAULT 'smb' CHECK (tier IN ('strategic','enterprise','mid_market','smb')),
  annual_revenue NUMERIC(15,2),
  employee_count INTEGER,
  website TEXT,
  country TEXT,
  account_score INTEGER NOT NULL DEFAULT 0 CHECK (account_score BETWEEN 0 AND 100),
  health_status TEXT NOT NULL DEFAULT 'unknown' CHECK (health_status IN ('healthy','at_risk','critical','unknown')),
  owner_id UUID REFERENCES public.salespeople(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounts_owner ON public.accounts(owner_id);
CREATE INDEX idx_accounts_parent ON public.accounts(parent_account_id);
CREATE INDEX idx_accounts_tier ON public.accounts(tier);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and managers can view accounts"
ON public.accounts FOR SELECT TO authenticated
USING (
  is_admin_or_manager(auth.uid())
  OR owner_id = get_current_salesperson_id()
);

CREATE POLICY "Owners and managers can manage accounts"
ON public.accounts FOR ALL TO authenticated
USING (
  is_admin_or_manager(auth.uid())
  OR owner_id = get_current_salesperson_id()
)
WITH CHECK (
  is_admin_or_manager(auth.uid())
  OR owner_id = get_current_salesperson_id()
);

CREATE TRIGGER trg_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ACCOUNT CONTACTS (buying committee) ============
CREATE TABLE public.account_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  job_title TEXT,
  department TEXT,
  buying_role TEXT NOT NULL DEFAULT 'user' CHECK (buying_role IN ('decision_maker','champion','influencer','blocker','user','technical')),
  influence_level INTEGER NOT NULL DEFAULT 3 CHECK (influence_level BETWEEN 1 AND 5),
  sentiment TEXT NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive','neutral','negative')),
  linkedin_url TEXT,
  last_contacted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_account_contacts_account ON public.account_contacts(account_id);
CREATE INDEX idx_account_contacts_role ON public.account_contacts(buying_role);

ALTER TABLE public.account_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View contacts of accessible accounts"
ON public.account_contacts FOR SELECT TO authenticated
USING (
  is_admin_or_manager(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = account_contacts.account_id
      AND a.owner_id = get_current_salesperson_id()
  )
);

CREATE POLICY "Manage contacts of accessible accounts"
ON public.account_contacts FOR ALL TO authenticated
USING (
  is_admin_or_manager(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = account_contacts.account_id
      AND a.owner_id = get_current_salesperson_id()
  )
)
WITH CHECK (
  is_admin_or_manager(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = account_contacts.account_id
      AND a.owner_id = get_current_salesperson_id()
  )
);

CREATE TRIGGER trg_account_contacts_updated_at
BEFORE UPDATE ON public.account_contacts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ACCOUNT ACTIVITIES (timeline) ============
CREATE TABLE public.account_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.account_contacts(id) ON DELETE SET NULL,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_account_activities_account ON public.account_activities(account_id, occurred_at DESC);

ALTER TABLE public.account_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View activities of accessible accounts"
ON public.account_activities FOR SELECT TO authenticated
USING (
  is_admin_or_manager(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = account_activities.account_id
      AND a.owner_id = get_current_salesperson_id()
  )
);

CREATE POLICY "Insert activities for accessible accounts"
ON public.account_activities FOR INSERT TO authenticated
WITH CHECK (
  is_admin_or_manager(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = account_activities.account_id
      AND a.owner_id = get_current_salesperson_id()
  )
);

-- ============ Account scoring RPC ============
CREATE OR REPLACE FUNCTION public.calculate_account_score(p_account_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_score INTEGER := 0;
  v_contacts INTEGER;
  v_decision_makers INTEGER;
  v_champions INTEGER;
  v_recent_activities INTEGER;
  v_tier TEXT;
BEGIN
  SELECT tier INTO v_tier FROM accounts WHERE id = p_account_id;

  -- Tier base
  v_score := v_score + CASE v_tier
    WHEN 'strategic' THEN 30
    WHEN 'enterprise' THEN 22
    WHEN 'mid_market' THEN 15
    ELSE 8
  END;

  -- Contacts coverage
  SELECT COUNT(*) INTO v_contacts FROM account_contacts WHERE account_id = p_account_id;
  v_score := v_score + LEAST(v_contacts * 3, 20);

  -- Buying committee strength
  SELECT
    COUNT(*) FILTER (WHERE buying_role = 'decision_maker'),
    COUNT(*) FILTER (WHERE buying_role = 'champion')
  INTO v_decision_makers, v_champions
  FROM account_contacts WHERE account_id = p_account_id;

  v_score := v_score + LEAST(v_decision_makers * 8, 16);
  v_score := v_score + LEAST(v_champions * 5, 10);

  -- Engagement (last 30 days)
  SELECT COUNT(*) INTO v_recent_activities
  FROM account_activities
  WHERE account_id = p_account_id
    AND occurred_at >= now() - INTERVAL '30 days';

  v_score := v_score + LEAST(v_recent_activities * 2, 24);

  v_score := LEAST(v_score, 100);

  UPDATE accounts SET
    account_score = v_score,
    health_status = CASE
      WHEN v_score >= 75 THEN 'healthy'
      WHEN v_score >= 45 THEN 'at_risk'
      WHEN v_score > 0 THEN 'critical'
      ELSE 'unknown'
    END,
    updated_at = now()
  WHERE id = p_account_id;

  RETURN v_score;
END;
$$;