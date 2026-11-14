CREATE OR REPLACE FUNCTION public.canonical_phone_key(p_phone text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE STRICT
 SET search_path TO 'public'
AS $function$
  SELECT right(
    CASE
      -- com DDI 55 e número nacional completo (10-11 dígitos após o DDI):
      -- remove o DDI para convergir com o mesmo número gravado sem DDI
      WHEN left(d.digits, 2) = '55' AND length(d.digits) - 2 BETWEEN 10 AND 11
        THEN substr(d.digits, 3)
      ELSE d.digits
    END, 11)
  FROM (SELECT regexp_replace(p_phone, '\D', '', 'g') AS digits) d;
$function$
