CREATE OR REPLACE FUNCTION public.normalize_bulk_failure_reason(_error text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN _error IS NULL OR btrim(_error) = '' THEN 'sem_erro'
    WHEN _error ~* 'opted_out|unsubscrib|suppress' THEN 'supressao'
    WHEN _error ~* 'missing_recipient_email' THEN 'destinatario_ausente'
    WHEN _error ~* 'invalid[_ -]?(recipient|email|address)|mailbox (does not exist|unavailable)|5\.1\.[0-9]+' THEN 'endereco_invalido'
    WHEN _error ~* 'hard[_ -]?bounce' THEN 'hard_bounce'
    WHEN _error ~* 'email_infra_missing|sender_not_configured' THEN 'infra_remetente'
    WHEN _error ~* 'rate|throttl|429|too many' THEN 'limite_de_vazao'
    WHEN _error ~* 'timeout|timed out|network|fetch failed|502|503|504' THEN 'rede_indisponivel'
    ELSE 'outro'
  END;
$function$
