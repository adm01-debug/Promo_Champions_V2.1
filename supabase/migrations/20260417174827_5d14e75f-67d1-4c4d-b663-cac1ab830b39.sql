
-- 1. Extend accounts with ABE metrics
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS domain text,
  ADD COLUMN IF NOT EXISTS size_bucket text CHECK (size_bucket IN ('smb','mid','enterprise')),
  ADD COLUMN IF NOT EXISTS coverage numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engaged_contacts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS champion_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS decision_maker_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_aggregated_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS accounts_name_lower_uniq ON public.accounts (lower(name));

-- 2. Link account_contacts to sales
ALTER TABLE public.account_contacts
  ADD COLUMN IF NOT EXISTS sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS seniority text CHECK (seniority IN ('c_level','vp','director','manager','ic')),
  ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_account_contacts_sale_id ON public.account_contacts(sale_id);

-- 3. Link sales to accounts
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_sales_account_id ON public.sales(account_id);

-- 4. Trigger to auto-create accounts from sales.client_name
CREATE OR REPLACE FUNCTION public.auto_link_sale_to_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    INSERT INTO public.accounts (name, owner_id, tier)
    VALUES (trim(NEW.client_name), NEW.salesperson_id, 'mid_market')
    RETURNING id INTO v_account_id;
  END IF;

  NEW.account_id := v_account_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_link_sale_to_account ON public.sales;
CREATE TRIGGER trg_auto_link_sale_to_account
BEFORE INSERT OR UPDATE OF client_name ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.auto_link_sale_to_account();

-- 5. RPC: account engagement summary
CREATE OR REPLACE FUNCTION public.get_account_engagement_summary(_account_id uuid)
RETURNS TABLE (
  account_id uuid,
  account_name text,
  total_contacts integer,
  engaged_contacts integer,
  avg_score numeric,
  coverage numeric,
  dominant_tier text,
  interactions_30d integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH contacts AS (
    SELECT ac.sale_id, ees.score, ees.tier
    FROM public.account_contacts ac
    LEFT JOIN public.email_engagement_scores ees ON ees.sale_id = ac.sale_id
    WHERE ac.account_id = _account_id AND ac.sale_id IS NOT NULL
  ),
  tier_counts AS (
    SELECT tier, count(*)::int AS c
    FROM contacts WHERE tier IS NOT NULL
    GROUP BY tier ORDER BY c DESC LIMIT 1
  ),
  ix AS (
    SELECT count(*)::int AS n
    FROM public.channel_interactions ci
    JOIN public.account_contacts ac ON ac.sale_id = ci.sale_id
    WHERE ac.account_id = _account_id AND ci.created_at > now() - interval '30 days'
  )
  SELECT
    a.id,
    a.name,
    (SELECT count(*)::int FROM contacts),
    (SELECT count(*)::int FROM contacts WHERE tier IN ('warm','hot','champion')),
    COALESCE((SELECT avg(score) FROM contacts WHERE score IS NOT NULL), 0)::numeric,
    CASE WHEN (SELECT count(*) FROM contacts) > 0
      THEN (SELECT count(*)::numeric FROM contacts WHERE tier IN ('warm','hot','champion')) / (SELECT count(*)::numeric FROM contacts) * 100
      ELSE 0 END,
    (SELECT tier FROM tier_counts LIMIT 1),
    (SELECT n FROM ix)
  FROM public.accounts a WHERE a.id = _account_id;
END;
$$;

-- 6. RPC: top accounts
CREATE OR REPLACE FUNCTION public.get_top_accounts(_limit int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  name text,
  tier text,
  account_score integer,
  coverage numeric,
  engaged_contacts integer,
  champion_count integer,
  decision_maker_count integer,
  industry text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id, a.name, a.tier, a.account_score, a.coverage,
         a.engaged_contacts, a.champion_count, a.decision_maker_count, a.industry
  FROM public.accounts a
  ORDER BY a.account_score DESC NULLS LAST, a.coverage DESC NULLS LAST
  LIMIT COALESCE(_limit, 20);
$$;
