CREATE OR REPLACE FUNCTION private.guard_activity_soft_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Sem mudança no estado de exclusão: a autoria registrada não pode ser reescrita.
  IF NEW.deleted_at IS NOT DISTINCT FROM OLD.deleted_at THEN
    NEW.deleted_by := OLD.deleted_by;
    RETURN NEW;
  END IF;

  -- Exclusão: o autor é quem está autenticado, nunca o valor enviado pelo client.
  IF OLD.deleted_at IS NULL THEN
    NEW.deleted_by := COALESCE(auth.uid(), NEW.deleted_by);
    RETURN NEW;
  END IF;

  -- Restaurar (deleted_at → NULL) ou mudar a data da exclusão: só admin/gestor ou backend.
  IF current_user IN ('authenticated', 'anon')
     AND NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Somente admin ou gestor pode restaurar uma atividade excluída'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.deleted_at IS NULL THEN
    NEW.deleted_by := NULL;
  END IF;
  RETURN NEW;
END;
$function$
