CREATE OR REPLACE FUNCTION private.notify_critical_winloss_pattern()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  fn_url text;
begin
  if NEW.confidence is not null and NEW.confidence > 0.85 then
    begin
      fn_url := current_setting('app.functions_url', true);
      if fn_url is not null and length(fn_url) > 0 then
        perform net.http_post(
          url := fn_url || '/notify-critical-pattern',
          headers := jsonb_build_object('content-type','application/json'),
          body := jsonb_build_object(
            'pattern_id', NEW.id,
            'name', NEW.name,
            'confidence', NEW.confidence
          )
        );
      end if;
    exception when others then
      -- Não bloqueia insert em caso de falha de rede / extensão indisponível
      null;
    end;
  end if;
  return NEW;
end;
$function$
