-- Every UPDATE on public.clients was failing, cascading through three
-- independent broken triggers in sequence (each masked the next until fixed
-- one at a time while debugging why Mapa de Clientes / geocoding never
-- persisted anything):
--
-- 1) audit_trigger_func(): inserted into audit_log using columns
--    old_values/new_values, which don't exist — the real columns are
--    old_data/new_data. Attached to clients and activities.
--
-- 2) log_data_access() (via trigger log_clients_access): inserted into
--    data_access_log.user_id (NOT NULL) using auth.uid(), which is NULL for
--    any service-role/system write (scripts, cron, edge functions without a
--    forwarded user JWT). Made the column nullable rather than dropping the
--    log, since "no user" is meaningful information for a system action.
--
-- 3) tr_log_lead_stage_transition -> private.log_lead_stage_transition():
--    referenced OLD.funnel_stage / NEW.funnel_stage, a column that does not
--    exist anywhere on public.clients (only on unrelated tables
--    prospect_cadences / sales_enablement_assets). This function is not
--    attached to any other table, so it's dead legacy cruft from a prior
--    schema shape — dropped rather than guessed at.

-- (1)
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  old_data JSONB;
  new_data JSONB;
  excluded_cols TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF TG_ARGV[0] IS NOT NULL THEN
    excluded_cols := TG_ARGV[0]::TEXT[];
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);

    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id::TEXT::uuid, old_data, new_data);

    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    old_data := to_jsonb(OLD);

    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id::TEXT::uuid, old_data);

    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    new_data := to_jsonb(NEW);

    INSERT INTO audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id::TEXT::uuid, new_data);

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$function$;

-- (2)
ALTER TABLE public.data_access_log ALTER COLUMN user_id DROP NOT NULL;

-- (3)
DROP TRIGGER IF EXISTS tr_log_lead_stage_transition ON public.clients;
