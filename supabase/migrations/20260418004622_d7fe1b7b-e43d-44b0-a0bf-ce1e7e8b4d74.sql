-- Tabela de stakeholders do comitê de compra (DMU)
CREATE TABLE public.deal_stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  name text NOT NULL,
  role_title text,
  dmu_role text NOT NULL DEFAULT 'unknown' CHECK (dmu_role IN ('decision_maker','economic_buyer','champion','influencer','user','blocker','unknown')),
  influence_level text NOT NULL DEFAULT 'medium' CHECK (influence_level IN ('low','medium','high')),
  engagement_score int NOT NULL DEFAULT 0 CHECK (engagement_score BETWEEN 0 AND 100),
  sentiment text NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive','neutral','negative')),
  email text,
  phone text,
  linkedin_url text,
  notes text,
  signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_interaction_at timestamptz,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','ai_extracted','email','call')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_deal_stakeholders_sale_role ON public.deal_stakeholders(sale_id, dmu_role);
CREATE INDEX idx_deal_stakeholders_owner ON public.deal_stakeholders(owner_id);
CREATE UNIQUE INDEX idx_deal_stakeholders_unique_name ON public.deal_stakeholders(sale_id, lower(name));

ALTER TABLE public.deal_stakeholders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own stakeholders"
  ON public.deal_stakeholders FOR SELECT
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Owners insert own stakeholders"
  ON public.deal_stakeholders FOR INSERT
  WITH CHECK (auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Owners update own stakeholders"
  ON public.deal_stakeholders FOR UPDATE
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Owners delete own stakeholders"
  ON public.deal_stakeholders FOR DELETE
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE TRIGGER update_deal_stakeholders_updated_at
  BEFORE UPDATE ON public.deal_stakeholders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de cobertura do comitê
CREATE TABLE public.deal_committee_coverage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL UNIQUE REFERENCES public.sales(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  coverage_score int NOT NULL DEFAULT 0 CHECK (coverage_score BETWEEN 0 AND 100),
  tier text NOT NULL DEFAULT 'weak' CHECK (tier IN ('weak','partial','strong','complete')),
  gaps jsonb NOT NULL DEFAULT '[]'::jsonb,
  risks jsonb NOT NULL DEFAULT '[]'::jsonb,
  stakeholder_count int NOT NULL DEFAULT 0,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_committee_coverage_owner_tier ON public.deal_committee_coverage(owner_id, tier);

ALTER TABLE public.deal_committee_coverage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own coverage"
  ON public.deal_committee_coverage FOR SELECT
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Service can upsert coverage"
  ON public.deal_committee_coverage FOR ALL
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE TRIGGER update_committee_coverage_updated_at
  BEFORE UPDATE ON public.deal_committee_coverage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.deal_stakeholders REPLICA IDENTITY FULL;
ALTER TABLE public.deal_committee_coverage REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_stakeholders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_committee_coverage;