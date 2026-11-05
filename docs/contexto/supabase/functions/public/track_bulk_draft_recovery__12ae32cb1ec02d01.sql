CREATE OR REPLACE FUNCTION public.track_bulk_draft_recovery()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Preserva a última mensagem real de falha (marcadores operacionais são ignorados)
  IF NEW.error IS NOT NULL
     AND btrim(NEW.error) <> ''
     AND NEW.error NOT IN ('manual_retry_requested') THEN
    NEW.last_error_message := NEW.error;
  END IF;

  -- Marca recuperação quando um rascunho que já falhou passa a ser enviado
  IF NEW.sent_at IS NOT NULL
     AND OLD.sent_at IS NULL
     AND NEW.recovered_at IS NULL
     AND (OLD.retry_count > 0 OR OLD.error IS NOT NULL OR OLD.last_error_message IS NOT NULL) THEN
    NEW.recovered_at := NEW.sent_at;
  END IF;

  RETURN NEW;
END;
$function$
