CREATE OR REPLACE FUNCTION public.upsert_semantic_entry(_entity_type text, _entity_id uuid, _salesperson_id uuid, _content text, _embedding vector, _metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
