CREATE TABLE public.report_embed_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.custom_reports(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  expires_at timestamptz,
  allowed_origins text[] NOT NULL DEFAULT '{}',
  view_count integer NOT NULL DEFAULT 0,
  last_viewed_at timestamptz,
  revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_report_embed_tokens_token ON public.report_embed_tokens(token);
CREATE INDEX idx_report_embed_tokens_report_id ON public.report_embed_tokens(report_id);

ALTER TABLE public.report_embed_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and managers can view embed tokens"
ON public.report_embed_tokens FOR SELECT
USING (
  created_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Owners can create embed tokens"
ON public.report_embed_tokens FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners and managers can update embed tokens"
ON public.report_embed_tokens FOR UPDATE
USING (
  created_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Owners and managers can delete embed tokens"
ON public.report_embed_tokens FOR DELETE
USING (
  created_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'manager'::app_role)
);