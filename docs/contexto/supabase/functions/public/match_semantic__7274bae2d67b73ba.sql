CREATE OR REPLACE FUNCTION public.match_semantic(_query_embedding vector, _match_count integer DEFAULT 20, _entity_types text[] DEFAULT NULL::text[])
 RETURNS TABLE(id uuid, entity_type text, entity_id uuid, content text, metadata jsonb, similarity real)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
