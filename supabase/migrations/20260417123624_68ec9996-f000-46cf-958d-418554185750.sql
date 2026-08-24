-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Semantic index table
CREATE TABLE IF NOT EXISTS public.semantic_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('client','lead','deal','activity','call_recording')),
  entity_id UUID NOT NULL,
  salesperson_id UUID,
  content TEXT NOT NULL,
  embedding vector(768),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_semantic_index_entity ON public.semantic_index (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_semantic_index_salesperson ON public.semantic_index (salesperson_id);
CREATE INDEX IF NOT EXISTS idx_semantic_index_embedding ON public.semantic_index USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE public.semantic_index ENABLE ROW LEVEL SECURITY;

-- RLS: salesperson sees own; admin/manager see all
CREATE POLICY "semantic_index_select_own_or_admin"
ON public.semantic_index FOR SELECT
USING (
  public.is_admin_or_manager(auth.uid())
  OR salesperson_id = public.get_current_salesperson_id()
);

-- Only service_role / SECURITY DEFINER funcs write; block direct writes from clients
CREATE POLICY "semantic_index_no_client_writes"
ON public.semantic_index FOR ALL
USING (false)
WITH CHECK (false);

-- Upsert RPC
CREATE OR REPLACE FUNCTION public.upsert_semantic_entry(
  _entity_type TEXT,
  _entity_id UUID,
  _salesperson_id UUID,
  _content TEXT,
  _embedding vector(768),
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.semantic_index (entity_type, entity_id, salesperson_id, content, embedding, metadata, updated_at)
  VALUES (_entity_type, _entity_id, _salesperson_id, _content, _embedding, COALESCE(_metadata, '{}'::jsonb), now())
  ON CONFLICT (entity_type, entity_id) DO UPDATE
    SET content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        salesperson_id = EXCLUDED.salesperson_id,
        metadata = EXCLUDED.metadata,
        updated_at = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Match RPC: cosine similarity, respects ownership
CREATE OR REPLACE FUNCTION public.match_semantic(
  _query_embedding vector(768),
  _match_count INT DEFAULT 20,
  _entity_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  entity_type TEXT,
  entity_id UUID,
  content TEXT,
  metadata JSONB,
  similarity REAL
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_sp UUID;
BEGIN
  v_is_admin := public.is_admin_or_manager(auth.uid());
  v_sp := public.get_current_salesperson_id();

  RETURN QUERY
  SELECT
    si.id,
    si.entity_type,
    si.entity_id,
    si.content,
    si.metadata,
    (1 - (si.embedding <=> _query_embedding))::real AS similarity
  FROM public.semantic_index si
  WHERE si.embedding IS NOT NULL
    AND (_entity_types IS NULL OR si.entity_type = ANY(_entity_types))
    AND (v_is_admin OR si.salesperson_id = v_sp)
  ORDER BY si.embedding <=> _query_embedding
  LIMIT GREATEST(1, LEAST(_match_count, 50));
END;
$$;