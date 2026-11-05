CREATE OR REPLACE FUNCTION private.notify_critical_moment_created()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  manager_record RECORD;
BEGIN
  IF NEW.severity NOT IN ('high','critical') THEN
    RETURN NEW;
  END IF;

  -- Notifica o próprio vendedor (owner)
  INSERT INTO public.critical_moment_notifications (moment_id, recipient_user_id)
  VALUES (NEW.id, NEW.owner_id);

  -- Notifica todos os managers e admins ativos
  FOR manager_record IN
    SELECT DISTINCT ur.user_id
    FROM public.user_roles ur
    WHERE ur.role IN ('manager'::app_role, 'admin'::app_role)
      AND ur.user_id <> NEW.owner_id
  LOOP
    INSERT INTO public.critical_moment_notifications (moment_id, recipient_user_id)
    VALUES (NEW.id, manager_record.user_id);
  END LOOP;

  RETURN NEW;
END;
$function$
