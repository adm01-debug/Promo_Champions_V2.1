CREATE OR REPLACE FUNCTION public.audit_user_roles_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_actor_email text := COALESCE(auth.jwt() ->> 'email', '');
  v_target uuid := CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END;
  v_entity_id text := CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END;
  v_new_role text := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE NEW.role::text END;
  v_old_role text := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.role::text END;
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      actor_id, actor_email, action, entity_type, entity_id, changes, metadata
    ) VALUES (
      v_actor,
      NULLIF(v_actor_email, ''),
      'user_roles.' || lower(TG_OP),
      'user_roles',
      v_entity_id,
      jsonb_build_object(
        'old', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
        'new', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
      ),
      jsonb_build_object(
        'source', 'audit_user_roles_change',
        'target_user_id', v_target
      )
    );
  END IF;

  IF to_regclass('public.security_events') IS NOT NULL
     AND (v_new_role = 'admin' OR v_old_role = 'admin') THEN
    INSERT INTO public.security_events (
      event_type, user_id, severity, description, metadata
    ) VALUES (
      CASE
        WHEN TG_OP = 'INSERT'
          OR (TG_OP = 'UPDATE' AND v_new_role = 'admin' AND v_old_role IS DISTINCT FROM 'admin')
          THEN 'admin_role_granted'
        WHEN TG_OP = 'DELETE'
          OR (TG_OP = 'UPDATE' AND v_old_role = 'admin' AND v_new_role IS DISTINCT FROM 'admin')
          THEN 'admin_role_revoked'
        ELSE 'admin_role_changed'
      END,
      v_target,
      'high',
      format('user_roles %s por %s', lower(TG_OP), COALESCE(v_actor::text, 'service_role/anon')),
      jsonb_build_object(
        'actor_id', v_actor,
        'actor_email', NULLIF(v_actor_email, ''),
        'row_id', v_entity_id,
        'old_role', v_old_role,
        'new_role', v_new_role
      )
    );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$
