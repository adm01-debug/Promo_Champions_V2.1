
-- API Integration Tokens table
CREATE TABLE public.api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  company_name text NOT NULL DEFAULT 'Default',
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage API tokens"
  ON public.api_tokens FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Score change logs table
CREATE TABLE public.score_change_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id uuid NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  changed_by text NOT NULL DEFAULT 'api',
  operation text NOT NULL CHECK (operation IN ('ADD', 'REM', 'SET')),
  field_name text NOT NULL DEFAULT 'total',
  old_value numeric NOT NULL DEFAULT 0,
  new_value numeric NOT NULL DEFAULT 0,
  change_value numeric NOT NULL DEFAULT 0,
  api_token_id uuid REFERENCES public.api_tokens(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.score_change_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view score logs"
  ON public.score_change_logs FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "System can insert score logs"
  ON public.score_change_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- Custom fields for teams
CREATE TABLE public.team_custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL DEFAULT 'number' CHECK (field_type IN ('number', 'text', 'boolean')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, field_key)
);

ALTER TABLE public.team_custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view custom fields"
  ON public.team_custom_fields FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage custom fields"
  ON public.team_custom_fields FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Custom field values per salesperson
CREATE TABLE public.salesperson_custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id uuid NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES public.team_custom_fields(id) ON DELETE CASCADE,
  numeric_value numeric DEFAULT 0,
  text_value text,
  boolean_value boolean DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(salesperson_id, field_id)
);

ALTER TABLE public.salesperson_custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view field values"
  ON public.salesperson_custom_field_values FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage field values"
  ON public.salesperson_custom_field_values FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- Token generation function
CREATE OR REPLACE FUNCTION public.generate_api_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN '$' || encode(sha256((gen_random_uuid()::text || now()::text || random()::text)::bytea), 'hex');
END;
$$;

-- Token validation function for edge functions
CREATE OR REPLACE FUNCTION public.validate_api_token(p_token text)
RETURNS TABLE(token_id uuid, team_id uuid, company_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.team_id, t.company_name
  FROM api_tokens t
  WHERE t.token = p_token
    AND t.is_active = true
    AND (t.expires_at IS NULL OR t.expires_at > now());
  
  -- Update usage stats
  UPDATE api_tokens SET last_used_at = now(), usage_count = usage_count + 1
  WHERE token = p_token;
END;
$$;

-- Add score_total to salespeople if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salespeople' AND column_name = 'score_total') THEN
    ALTER TABLE public.salespeople ADD COLUMN score_total numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Enable realtime for score changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.score_change_logs;
