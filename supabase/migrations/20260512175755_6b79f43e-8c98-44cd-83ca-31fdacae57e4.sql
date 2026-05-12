-- Add description to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;

-- Create vector search RPC
CREATE OR REPLACE FUNCTION public.search_products_vector(_query_embedding vector(768), _limit integer DEFAULT 20)
 RETURNS TABLE(id uuid, name text, category text, price numeric, rating numeric, sales_count integer, status text, similarity_score real)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.category,
    p.price,
    p.rating,
    p.sales_count,
    p.status,
    (1 - (s.embedding <=> _query_embedding))::real AS similarity_score
  FROM public.semantic_index s
  JOIN public.products p ON s.entity_id = p.id
  WHERE s.entity_type = 'product'
  ORDER BY s.embedding <=> _query_embedding
  LIMIT _limit;
END;
$function$;
