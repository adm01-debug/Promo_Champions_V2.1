
CREATE TABLE public.ai_narrative_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  narrative_type TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  narrative TEXT NOT NULL,
  model TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  hit_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_narrative_cache_key ON public.ai_narrative_cache(cache_key);
CREATE INDEX idx_ai_narrative_cache_expires ON public.ai_narrative_cache(expires_at);
CREATE INDEX idx_ai_narrative_cache_type ON public.ai_narrative_cache(narrative_type);

GRANT SELECT ON public.ai_narrative_cache TO authenticated;
GRANT ALL ON public.ai_narrative_cache TO service_role;

ALTER TABLE public.ai_narrative_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cache"
  ON public.ai_narrative_cache
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages cache"
  ON public.ai_narrative_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER trg_ai_narrative_cache_updated_at
  BEFORE UPDATE ON public.ai_narrative_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_narrative_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.ai_narrative_cache
  WHERE expires_at < now();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
