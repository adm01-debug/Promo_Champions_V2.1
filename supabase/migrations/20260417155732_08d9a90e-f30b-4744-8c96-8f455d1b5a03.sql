-- 1) Add freshness columns
ALTER TABLE public.semantic_index
  ADD COLUMN IF NOT EXISTS source_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS content_hash text;

CREATE INDEX IF NOT EXISTS idx_semantic_index_content_hash ON public.semantic_index(entity_type, entity_id, content_hash);

-- 2) Expand entity_type CHECK
ALTER TABLE public.semantic_index DROP CONSTRAINT IF EXISTS semantic_index_entity_type_check;
ALTER TABLE public.semantic_index ADD CONSTRAINT semantic_index_entity_type_check
  CHECK (entity_type = ANY (ARRAY[
    'client','lead','deal','activity','call_recording',
    'note','email_message','whatsapp_message','proposal','task','playbook'
  ]));

-- 3) RPC: coverage report (admin/manager only)
CREATE OR REPLACE FUNCTION public.get_semantic_coverage()
RETURNS TABLE(
  entity_type text,
  total_rows bigint,
  indexed_rows bigint,
  coverage_pct numeric,
  last_indexed timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT 'client'::text AS et, (SELECT count(*) FROM public.clients) AS total
    UNION ALL SELECT 'lead', (SELECT count(*) FROM public.sales WHERE status IN ('lead','prospecting','qualified'))
    UNION ALL SELECT 'deal', (SELECT count(*) FROM public.sales WHERE status IN ('proposal','negotiation','won','lost','closed'))
    UNION ALL SELECT 'activity', (SELECT count(*) FROM public.activities)
    UNION ALL SELECT 'call_recording', (SELECT count(*) FROM public.call_recordings)
  ),
  idx AS (
    SELECT entity_type AS et, count(*) AS indexed, max(updated_at) AS last_at
    FROM public.semantic_index
    GROUP BY entity_type
  )
  SELECT
    b.et,
    b.total,
    COALESCE(i.indexed, 0),
    CASE WHEN b.total = 0 THEN 100::numeric
         ELSE ROUND((COALESCE(i.indexed,0)::numeric / b.total::numeric) * 100, 1)
    END,
    i.last_at
  FROM base b
  LEFT JOIN idx i ON i.et = b.et
  ORDER BY b.et;
END;
$$;

REVOKE ALL ON FUNCTION public.get_semantic_coverage() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_semantic_coverage() TO authenticated;

-- 4) RPC: mark for reindex (delete entry to force re-embed)
CREATE OR REPLACE FUNCTION public.mark_entity_for_reindex(
  _entity_type text,
  _entity_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  DELETE FROM public.semantic_index
  WHERE entity_type = _entity_type AND entity_id = _entity_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_entity_for_reindex(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_entity_for_reindex(text, uuid) TO authenticated;