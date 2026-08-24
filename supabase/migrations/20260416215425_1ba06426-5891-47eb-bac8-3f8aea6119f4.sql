
-- Catálogo de materiais de Sales Enablement
CREATE TABLE public.sales_enablement_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  asset_type text NOT NULL DEFAULT 'document',
  file_url text,
  thumbnail_url text,
  tags text[] DEFAULT ARRAY[]::text[],
  funnel_stage text,
  is_active boolean NOT NULL DEFAULT true,
  view_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_enablement_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active assets"
ON public.sales_enablement_assets FOR SELECT
TO authenticated
USING (is_active = true OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Managers can manage assets"
ON public.sales_enablement_assets FOR ALL
TO authenticated
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE INDEX idx_sea_category ON public.sales_enablement_assets(category) WHERE is_active = true;
CREATE INDEX idx_sea_funnel_stage ON public.sales_enablement_assets(funnel_stage) WHERE is_active = true;

CREATE TRIGGER trg_sea_updated_at
BEFORE UPDATE ON public.sales_enablement_assets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Logs de uso de assets
CREATE TABLE public.asset_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.sales_enablement_assets(id) ON DELETE CASCADE,
  salesperson_id uuid,
  user_id uuid NOT NULL,
  action text NOT NULL DEFAULT 'view',
  deal_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.asset_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own usage logs"
ON public.asset_usage_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users see own logs, managers see all"
ON public.asset_usage_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_manager(auth.uid()));

CREATE INDEX idx_aul_asset ON public.asset_usage_logs(asset_id, created_at DESC);
CREATE INDEX idx_aul_user ON public.asset_usage_logs(user_id, created_at DESC);

-- Trigger para incrementar view_count
CREATE OR REPLACE FUNCTION public.increment_asset_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.action = 'view' THEN
    UPDATE public.sales_enablement_assets
    SET view_count = view_count + 1
    WHERE id = NEW.asset_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_asset_view_increment
AFTER INSERT ON public.asset_usage_logs
FOR EACH ROW EXECUTE FUNCTION public.increment_asset_view_count();
