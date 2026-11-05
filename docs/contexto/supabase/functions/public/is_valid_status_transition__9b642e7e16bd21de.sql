CREATE OR REPLACE FUNCTION public.is_valid_status_transition(p_entity text, p_origem text, p_destino text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE
    -- Sem origem (INSERT/primeira escrita) ou sem mudança: sempre válido.
    WHEN p_origem IS NULL OR p_origem = p_destino THEN true
    -- Origem fora do vocabulário conhecido: legacy passa (não temos semântica).
    WHEN NOT EXISTS (
      SELECT 1 FROM public.status_transitions
      WHERE entity = p_entity AND status_origem = p_origem
    ) THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.status_transitions
      WHERE entity = p_entity
        AND status_origem = p_origem
        AND status_destino = p_destino
    )
  END;
$function$
