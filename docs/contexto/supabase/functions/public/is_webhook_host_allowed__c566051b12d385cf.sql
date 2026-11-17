CREATE OR REPLACE FUNCTION public.is_webhook_host_allowed(p_host text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_host text;
  v_ip   inet;
BEGIN
  IF p_host IS NULL THEN RETURN false; END IF;

  -- normaliza: caixa baixa, sem espaco, sem ponto final, sem colchete de IPv6
  v_host := lower(btrim(p_host));
  v_host := regexp_replace(v_host, '\.$', '');
  v_host := regexp_replace(v_host, '^\[|\]$', '', 'g');

  IF v_host = '' OR v_host ~ '[\s/@:]' THEN
    -- host com separador de URL dentro nao foi parseado: recusa
    RETURN false;
  END IF;

  -- 1) BLOCKLIST por nome (codigo, nao dado)
  IF v_host IN ('localhost', 'metadata', 'metadata.google.internal',
                'instance-data', 'metadata.goog')
     OR v_host LIKE '%.localhost'
     OR v_host LIKE '%.internal'
     OR v_host LIKE '%.local'
  THEN
    RETURN false;
  END IF;

  -- 2) BLOCKLIST por faixa de rede, quando o host E um literal de IP
  BEGIN
    v_ip := v_host::inet;
  EXCEPTION WHEN others THEN
    v_ip := NULL;
  END;

  IF v_ip IS NOT NULL THEN
    -- IP literal como destino de webhook nunca e legitimo aqui
    RETURN false;
  END IF;

  -- 3) ALLOWLIST: host exato, ou sufixo de um pattern '*.dominio'
  RETURN EXISTS (
    SELECT 1
    FROM public.webhook_allowed_domains d
    WHERE d.pattern = v_host
       OR (d.pattern LIKE '*.%'
           AND v_host LIKE '%' || substring(d.pattern from 2)
           AND length(v_host) > length(d.pattern) - 2)
  );
END;
$function$
